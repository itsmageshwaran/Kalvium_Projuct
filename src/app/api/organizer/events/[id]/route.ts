import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAuth } from "@/lib/auth";
import { invalidateApprovedEventsCache } from "@/lib/events-cache";
import { logSecurityEvent } from "@/lib/audit-logger";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuth(req, ["STUDENT", "ORGANIZER", "CAMPUS_MANAGER"]);
    if ("errorResponse" in authResult) return authResult.errorResponse;

    const { user } = authResult;
    const eventId = params.id;

    // Verify the event belongs to this user (unless they are a manager)
    const eventRef = adminDb.collection("events").doc(eventId);
    const existingEvent = await eventRef.get();

    if (!existingEvent.exists) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    const eventData = existingEvent.data();

    // 1. Campus Manager can delete ANY event directly (active, past, pending, or finished)
    if (user.role === "CAMPUS_MANAGER") {
      // Proceed to delete
    } else if (eventData?.organizerId === user.userId) {
      // 2. Organizers & Students can only directly delete unapproved PENDING proposals
      if (eventData?.status === "APPROVED") {
        return NextResponse.json(
          {
            error: "Approved events cannot be directly deleted by organizers. Please submit a Deletion Request for Campus Manager review.",
            requiresRequest: true,
          },
          { status: 403 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "You don't have permission to delete this event." },
        { status: 403 }
      );
    }

    // Clean up subcollection documents to avoid orphaned records
    const [analysesSnap, historySnap, enrollmentsSnap, participationsSnap] = await Promise.all([
      eventRef.collection("analyses").get().catch(() => null),
      eventRef.collection("approvalHistory").get().catch(() => null),
      eventRef.collection("enrollments").get().catch(() => null),
      eventRef.collection("participations").get().catch(() => null),
    ]);

    const batch = adminDb.batch();
    if (analysesSnap && !analysesSnap.empty) {
      analysesSnap.docs.forEach((d: any) => batch.delete(d.ref));
    }
    if (historySnap && !historySnap.empty) {
      historySnap.docs.forEach((d: any) => batch.delete(d.ref));
    }
    if (enrollmentsSnap && !enrollmentsSnap.empty) {
      enrollmentsSnap.docs.forEach((d: any) => batch.delete(d.ref));
    }
    if (participationsSnap && !participationsSnap.empty) {
      participationsSnap.docs.forEach((d: any) => batch.delete(d.ref));
    }
    batch.delete(eventRef);
    await batch.commit();

    invalidateApprovedEventsCache();

    logSecurityEvent({
      action: "EVENT_DELETED",
      actorId: user.userId,
      actorRole: user.role,
      targetId: eventId,
      details: {
        eventTitle: eventData?.title,
        deletedBy: user.email,
        wasApproved: eventData?.status === "APPROVED",
      },
    });

    return NextResponse.json({
      success: true,
      message: user.role === "CAMPUS_MANAGER"
        ? "Event permanently deleted by Campus Manager."
        : "Event proposal deleted successfully.",
    });
  } catch (error) {
    console.error("Delete event error:", error);
    return NextResponse.json(
      { error: "Failed to delete event." },
      { status: 500 }
    );
  }
}
