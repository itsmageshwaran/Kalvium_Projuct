import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { requireAuth } from "@/lib/auth";
import { invalidateApprovedEventsCache } from "@/lib/events-cache";

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * POST /api/organizer/events/[id]/request-delete
 * Organizers request event deletion with a justification for the Campus Manager.
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth(req, ["ORGANIZER", "CAMPUS_MANAGER", "STUDENT"]);
    if ("errorResponse" in authResult) return authResult.errorResponse;

    const { user } = authResult;
    const eventId = params.id;

    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required." }, { status: 400 });
    }

    const eventRef = adminDb.collection("events").doc(eventId);
    const eventDoc = await eventRef.get();

    if (!eventDoc.exists) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    const eventData = eventDoc.data();

    // Verify permissions: Verified Organizers, Campus Manager, or event creator can request deletion
    const isManager = user.role?.toUpperCase() === "CAMPUS_MANAGER";
    const isOrganizer = user.role?.toUpperCase() === "ORGANIZER";
    const isOwner = eventData?.organizerId === user.userId;

    if (!isManager && !isOrganizer && !isOwner) {
      return NextResponse.json(
        { error: "Access denied. Only campus organizers or managers can request deletion." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const reason = typeof body.reason === "string" ? body.reason.trim() : "";
    const notes = typeof body.notes === "string" ? body.notes.trim() : "";

    if (!reason) {
      return NextResponse.json(
        { error: "Please provide a reason for requesting event deletion." },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    await eventRef.update({
      deletionRequested: true,
      deletionReason: reason,
      deletionNotes: notes,
      deletionRequestedAt: now,
      deletionRequestedBy: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      updatedAt: now,
    });

    invalidateApprovedEventsCache();

    return NextResponse.json({
      success: true,
      message: "Deletion request submitted. The Campus Manager has been notified for review.",
      deletionRequested: true,
      deletionReason: reason,
    });
  } catch (error) {
    console.error("Request event deletion error:", error);
    return NextResponse.json(
      { error: "Failed to submit event deletion request." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/organizer/events/[id]/request-delete
 * Cancels or dismisses an existing deletion request (by organizer or Campus Manager).
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth(req, ["ORGANIZER", "CAMPUS_MANAGER", "STUDENT"]);
    if ("errorResponse" in authResult) return authResult.errorResponse;

    const { user } = authResult;
    const eventId = params.id;

    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required." }, { status: 400 });
    }

    const eventRef = adminDb.collection("events").doc(eventId);
    const eventDoc = await eventRef.get();

    if (!eventDoc.exists) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    const eventData = eventDoc.data();

    // Verify permissions: Campus Manager, any verified Organizer, or the requester / creator can cancel
    const isManager = user.role?.toUpperCase() === "CAMPUS_MANAGER";
    const isOrganizer = user.role?.toUpperCase() === "ORGANIZER";
    const isRequester = eventData?.deletionRequestedBy?.userId === user.userId;
    const isOwner = eventData?.organizerId === user.userId;

    if (!isManager && !isOrganizer && !isRequester && !isOwner) {
      return NextResponse.json(
        { error: "Access denied. Only the requester, an organizer, or Campus Manager can cancel this request." },
        { status: 403 }
      );
    }

    await eventRef.update({
      deletionRequested: false,
      deletionReason: FieldValue.delete(),
      deletionNotes: FieldValue.delete(),
      deletionRequestedAt: FieldValue.delete(),
      deletionRequestedBy: FieldValue.delete(),
      updatedAt: new Date().toISOString(),
    });

    invalidateApprovedEventsCache();

    return NextResponse.json({
      success: true,
      message: user.role === "CAMPUS_MANAGER"
        ? "Deletion request dismissed. Event remains active."
        : "Your deletion request has been withdrawn.",
      deletionRequested: false,
    });
  } catch (error) {
    console.error("Cancel event deletion request error:", error);
    return NextResponse.json(
      { error: "Failed to cancel event deletion request." },
      { status: 500 }
    );
  }
}
