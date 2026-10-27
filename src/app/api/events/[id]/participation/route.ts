import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb, adminStorage } from "@/lib/firebase/admin";
import { requireAuth } from "@/lib/auth";
import { invalidateApprovedEventsCache } from "@/lib/events-cache";
import { logSecurityEvent } from "@/lib/audit-logger";

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * Helper to upload base64 file to Firebase Storage
 */
async function uploadBase64File(
  base64String: string,
  destinationPath: string
): Promise<string> {
  const match = base64String.match(/^data:([a-zA-Z0-9\/\-+.]+);base64,(.+)$/);
  if (!match) {
    // If it's already an http URL or doesn't have data URI header
    if (base64String.startsWith("http://") || base64String.startsWith("https://")) {
      return base64String;
    }
    return base64String;
  }

  const mimeType = match[1];
  const base64Data = match[2];
  const buffer = Buffer.from(base64Data, "base64");

  try {
    const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    const bucket = bucketName ? adminStorage.bucket(bucketName) : adminStorage.bucket();
    const file = bucket.file(destinationPath);

    await file.save(buffer, {
      metadata: { contentType: mimeType },
    });

    try {
      await file.makePublic();
    } catch {
      // Ignore if uniform bucket-level access is enabled
    }

    return `https://storage.googleapis.com/${bucket.name}/${destinationPath}`;
  } catch (err) {
    console.warn("Storage upload fallback:", err);
    // If upload fails, retain data URL if small, or return warning
    if (base64String.length < 500 * 1024) {
      return base64String;
    }
    throw new Error("Failed to upload file to cloud storage. Please try a smaller file (<5MB).");
  }
}

/**
 * GET /api/events/[id]/participation
 * Retrieve the current authenticated user's participation record for this event.
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth(req, ["STUDENT", "ORGANIZER", "CAMPUS_MANAGER"]);
    if ("errorResponse" in authResult) return authResult.errorResponse;

    const { user } = authResult;
    const eventId = params.id;

    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required." }, { status: 400 });
    }

    const docRef = adminDb
      .collection("events")
      .doc(eventId)
      .collection("participations")
      .doc(user.userId);

    const doc = await docRef.get();
    if (!doc.exists) {
      return NextResponse.json({ participation: null, hasSubmitted: false });
    }

    return NextResponse.json({
      participation: { id: doc.id, ...doc.data() },
      hasSubmitted: true,
    });
  } catch (error) {
    console.error("Fetch user participation error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve participation record." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/events/[id]/participation
 * Submit or update Certificate of Participation, Awards, Teammates, and Project info.
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth(req, ["STUDENT", "ORGANIZER", "CAMPUS_MANAGER"]);
    if ("errorResponse" in authResult) return authResult.errorResponse;

    const { user } = authResult;
    const eventId = params.id;

    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required." }, { status: 400 });
    }

    // Verify event exists
    const eventRef = adminDb.collection("events").doc(eventId);
    const eventDoc = await eventRef.get();
    if (!eventDoc.exists) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    const eventData = eventDoc.data();
    const body = await req.json().catch(() => ({}));

    const certificateFile = typeof body.certificateFile === "string" ? body.certificateFile.trim() : "";
    const certificateType = typeof body.certificateType === "string" ? body.certificateType.trim() : "PARTICIPATION";
    const hasWonPrize = Boolean(body.hasWonPrize);
    const awardTitle = typeof body.awardTitle === "string" ? body.awardTitle.trim() : "";
    const awardPhoto = typeof body.awardPhoto === "string" ? body.awardPhoto.trim() : "";
    const isTeamEvent = Boolean(body.isTeamEvent);
    const teamName = typeof body.teamName === "string" ? body.teamName.trim() : "";
    const teammates = Array.isArray(body.teammates) ? body.teammates : [];
    const projectTitle = typeof body.projectTitle === "string" ? body.projectTitle.trim() : "";
    const projectUrl = typeof body.projectUrl === "string" ? body.projectUrl.trim() : "";
    const notes = typeof body.notes === "string" ? body.notes.trim() : "";

    if (!certificateFile && !awardPhoto && !hasWonPrize) {
      return NextResponse.json(
        { error: "Please upload your certificate or award proof to submit." },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    // 1. Process Certificate File Upload
    let resolvedCertUrl = certificateFile;
    if (certificateFile.startsWith("data:")) {
      const ext = certificateFile.includes("pdf") ? "pdf" : "png";
      const certPath = `certificates/${eventId}/${user.userId}/certificate_${Date.now()}.${ext}`;
      resolvedCertUrl = await uploadBase64File(certificateFile, certPath);
    }

    // 2. Process Award Photo Upload
    let resolvedAwardPhotoUrl = awardPhoto;
    if (awardPhoto.startsWith("data:")) {
      const photoPath = `achievements/${eventId}/${user.userId}/award_${Date.now()}.png`;
      resolvedAwardPhotoUrl = await uploadBase64File(awardPhoto, photoPath);
    }

    const participationPayload = {
      eventId,
      eventTitle: eventData?.title || "Campus Event",
      eventDate: eventData?.date || "",
      eventVenue: eventData?.venue || "",
      userId: user.userId,
      userName: user.name || "Student Participant",
      userEmail: user.email,
      certificateUrl: resolvedCertUrl,
      certificateType,
      hasWonPrize,
      awardTitle: hasWonPrize ? awardTitle || "Award Winner" : "",
      awardPhotoUrl: hasWonPrize ? resolvedAwardPhotoUrl : "",
      isTeamEvent,
      teamName: isTeamEvent ? teamName : "",
      teammates: isTeamEvent ? teammates : [],
      projectTitle: isTeamEvent ? projectTitle : "",
      projectUrl: isTeamEvent ? projectUrl : "",
      notes,
      verified: true, // Institution verified through university email login
      updatedAt: now,
    };

    const eventPartRef = eventRef.collection("participations").doc(user.userId);
    const userPartRef = adminDb.collection("users").doc(user.userId).collection("participations").doc(eventId);

    const existingDoc = await eventPartRef.get();
    const isNew = !existingDoc.exists;

    const batch = adminDb.batch();
    batch.set(
      eventPartRef,
      {
        ...participationPayload,
        createdAt: isNew ? now : existingDoc.data()?.createdAt || now,
      },
      { merge: true }
    );

    batch.set(
      userPartRef,
      {
        ...participationPayload,
        createdAt: isNew ? now : existingDoc.data()?.createdAt || now,
      },
      { merge: true }
    );

    if (isNew) {
      batch.update(eventRef, {
        participationsCount: FieldValue.increment(1),
        hasAwards: hasWonPrize ? true : Boolean(eventData?.hasAwards),
      });
    } else if (hasWonPrize && !eventData?.hasAwards) {
      batch.update(eventRef, { hasAwards: true });
    }

    await batch.commit();
    invalidateApprovedEventsCache();

    logSecurityEvent({
      action: "PARTICIPATION_CERTIFICATE_UPLOADED",
      actorId: user.userId,
      actorRole: user.role,
      targetId: eventId,
      details: {
        eventTitle: eventData?.title,
        hasWonPrize,
        awardTitle,
        isTeamEvent,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Participation and certificate credentials uploaded successfully!",
      participation: {
        id: user.userId,
        ...participationPayload,
      },
    });
  } catch (error: any) {
    console.error("Submit participation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit certificate and participation credentials." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/events/[id]/participation
 * Remove user's participation record and certificate.
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth(req, ["STUDENT", "ORGANIZER", "CAMPUS_MANAGER"]);
    if ("errorResponse" in authResult) return authResult.errorResponse;

    const { user } = authResult;
    const eventId = params.id;

    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required." }, { status: 400 });
    }

    const eventRef = adminDb.collection("events").doc(eventId);
    const eventPartRef = eventRef.collection("participations").doc(user.userId);
    const userPartRef = adminDb.collection("users").doc(user.userId).collection("participations").doc(eventId);

    const doc = await eventPartRef.get();
    if (!doc.exists) {
      return NextResponse.json({ error: "No participation submission found." }, { status: 404 });
    }

    const batch = adminDb.batch();
    batch.delete(eventPartRef);
    batch.delete(userPartRef);
    batch.update(eventRef, {
      participationsCount: FieldValue.increment(-1),
    });
    await batch.commit();

    invalidateApprovedEventsCache();

    return NextResponse.json({
      success: true,
      message: "Participation record removed.",
    });
  } catch (error) {
    console.error("Delete participation error:", error);
    return NextResponse.json(
      { error: "Failed to remove participation record." },
      { status: 500 }
    );
  }
}
