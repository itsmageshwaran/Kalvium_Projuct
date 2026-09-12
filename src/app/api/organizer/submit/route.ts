import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, sanitizeUrl } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req, ["ORGANIZER", "CAMPUS_MANAGER"]);
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

    // Clean audit snapshot so multi-megabyte base64 strings aren't duplicated into SQLite text columns
    const auditSnapshot = { ...body };
    if (
      auditSnapshot.posterUrl &&
      typeof auditSnapshot.posterUrl === "string" &&
      auditSnapshot.posterUrl.startsWith("data:")
    ) {
      auditSnapshot.posterUrl = `[base64-image-data-length-${auditSnapshot.posterUrl.length}]`;
    }

    // Atomically create event and analysis record
    const event = await prisma.event.create({
      data: {
        title: title.trim(),
        description: safeDescription,
        summary: resolvedSummary,
        date: date.trim(),
        startTime: startTime.trim(),
        endTime: endTime.trim(),
        venue: venue.trim(),
        organizerName: organizerName ? organizerName.trim() : user.name,
        posterUrl: resolvedPoster,
        category: category.trim(),
        tags: formattedTags,
        registrationUrl: safeRegistrationUrl,
        contactInfo: contactInfo ? contactInfo.trim() : user.email,
        status: "PENDING", // Enforce pending status
        organizerId: user.userId,
        analyses: {
          create: {
            rawExtractedData: JSON.stringify(auditSnapshot),
            confidenceData: JSON.stringify(confidences || {}),
            duplicatesDetected: duplicatesDetected ? JSON.stringify(duplicatesDetected) : null,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Event submitted successfully for Campus Manager verification.",
      event,
    });
  } catch (error) {
    console.error("Submit event error:", error);
    return NextResponse.json(
      { error: "Failed to submit event. Please check your data and try again." },
      { status: 500 }
    );
  }
}
