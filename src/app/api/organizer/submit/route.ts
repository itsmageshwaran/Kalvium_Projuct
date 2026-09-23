import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminStorage } from "@/lib/firebase/admin";
import { requireAuth, sanitizeUrl } from "@/lib/auth";
import { parseTimeToMinutes } from "@/lib/clash";
import { invalidateApprovedEventsCache } from "@/lib/events-cache";

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req, ["STUDENT", "ORGANIZER", "CAMPUS_MANAGER"]);
    if ("errorResponse" in authResult) return authResult.errorResponse;

    const { user } = authResult;
    const body = await req.json();

    const {
      title,
      description,
      summary,
      date,
      startTime,
      endTime,
      venue,
      organizerName,
      posterUrl,
      originalPosterUrl,
      category,
      tags,
      registrationUrl,
      contactInfo,
      confidences,
      duplicatesDetected,
    } = body;

    // Strict validation
    if (!title || !date || !startTime || !endTime || !venue || !category) {
      return NextResponse.json(
        { error: "Missing required fields: Title, Date, Start Time, End Time, Venue, and Category are mandatory." },
        { status: 400 }
      );
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(String(date).trim())) {
      return NextResponse.json(
        { error: "Invalid date format. Expected YYYY-MM-DD." },
        { status: 400 }
      );
    }

    const startMin = parseTimeToMinutes(startTime);
    const endMin = parseTimeToMinutes(endTime);
    if (isNaN(startMin) || isNaN(endMin)) {
      return NextResponse.json(
        { error: "Invalid time format. Please provide valid start and end times (e.g., 09:00 AM or 14:00)." },
        { status: 400 }
      );
    }

    // Check payload size on posterUrl to prevent database bloat
    if (posterUrl && typeof posterUrl === "string" && posterUrl.length > 8 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Poster image is too large (maximum 6MB). Please upload a smaller image." },
        { status: 413 }
      );
    }

    // Default fallback poster if none provided, and sanitize against dangerous protocols
    const defaultPoster = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80";
    const resolvedPoster = sanitizeUrl(posterUrl, defaultPoster);

    const safeDescription = (description || "").trim();
    const resolvedSummary =
      summary && summary.trim().length > 0
        ? summary.trim()
        : safeDescription.substring(0, 150) + "...";

    const formattedTags = Array.isArray(tags)
      ? tags.join(", ")
      : typeof tags === "string"
      ? tags
      : "Campus Event";

    const safeRegistrationUrl = sanitizeUrl(registrationUrl, "Not specified");

    // Handle Firebase Storage Upload for Base64 Images
    const eventRef = adminDb.collection("events").doc();
    const analysisRef = eventRef.collection("analyses").doc();
    let finalPosterUrl = resolvedPoster;

    if (finalPosterUrl.startsWith("data:image")) {
      const match = finalPosterUrl.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
      if (match) {
        try {
          const extension = match[1] === "jpeg" ? "jpg" : match[1];
          const base64Data = match[2];
          const buffer = Buffer.from(base64Data, "base64");
          const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
          const bucket = bucketName ? adminStorage.bucket(bucketName) : adminStorage.bucket();
          const fileName = `event-posters/${eventRef.id}/original.${extension}`;
          const file = bucket.file(fileName);
          
          await file.save(buffer, {
            metadata: { contentType: `image/${match[1]}` }
          });
          
          await file.makePublic();
          finalPosterUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
        } catch (storageErr) {
          console.warn("Storage upload warning, retaining inline image preview:", storageErr);
        }
      }
    }

    if (finalPosterUrl.startsWith("data:") && finalPosterUrl.length > 700 * 1024) {
      return NextResponse.json(
        { error: "Image data is too large for database storage. Please use a compressed image under 500KB or host it on an external URL." },
        { status: 413 }
      );
    }

    // Clean audit snapshot so multi-megabyte base64 strings aren't duplicated into SQLite/Firestore text columns
    const auditSnapshot = { ...body };
    if (
      auditSnapshot.posterUrl &&
      typeof auditSnapshot.posterUrl === "string" &&
      auditSnapshot.posterUrl.startsWith("data:")
    ) {
      auditSnapshot.posterUrl = `[base64-image-data-length-${auditSnapshot.posterUrl.length}]`;
    }
    
    if (
      auditSnapshot.originalPosterUrl &&
      typeof auditSnapshot.originalPosterUrl === "string" &&
      auditSnapshot.originalPosterUrl.startsWith("data:")
    ) {
      auditSnapshot.originalPosterUrl = `[base64-image-data-length-${auditSnapshot.originalPosterUrl.length}]`;
    }

    // Enforce zero persistence: Ensure API keys are never stored in Firestore database
    delete (auditSnapshot as any).apiKey;
    delete (auditSnapshot as any).geminiKey;
    delete (auditSnapshot as any).key;

    // Firestore batch for atomic write
    const batch = adminDb.batch();

    const eventData = {
      title: title.trim(),
      description: safeDescription,
      summary: resolvedSummary,
      date: date.trim(),
      startTime: startTime.trim(),
      endTime: endTime.trim(),
      venue: venue.trim(),
      organizerName: organizerName ? organizerName.trim() : user.name,
      posterUrl: finalPosterUrl,
      originalPosterUrl: originalPosterUrl || null,
      category: category.trim(),
      tags: formattedTags,
      registrationUrl: safeRegistrationUrl,
      contactInfo: contactInfo ? contactInfo.trim() : user.email,
      status: "PENDING", // Always PENDING so it enters the Verification Studio for manager review
      organizerId: user.userId,
      submitterRole: user.role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      organizer: {
        id: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: (user as any).avatar || null
      }
    };

    batch.set(eventRef, eventData);

    const analysisData = {
      rawExtractedData: JSON.stringify(auditSnapshot),
      confidenceData: JSON.stringify(confidences || {}),
      duplicatesDetected: duplicatesDetected ? JSON.stringify(duplicatesDetected) : null,
      analyzedAt: new Date().toISOString(),
    };

    batch.set(analysisRef, analysisData);

    await batch.commit();
    invalidateApprovedEventsCache();

    const successMessage = user.role === "CAMPUS_MANAGER"
      ? "Event submitted to verification queue. Review and approve it in your Verification Studio."
      : user.role === "STUDENT"
      ? "Event request submitted successfully for Campus Manager verification."
      : "Event submitted successfully for Campus Manager verification.";

    return NextResponse.json({
      success: true,
      message: successMessage,
      event: { id: eventRef.id, ...eventData },
    });
  } catch (error) {
    console.error("Submit event error:", error);
    return NextResponse.json(
      { error: "Failed to submit event. Please check your data and try again." },
      { status: 500 }
    );
  }
}
