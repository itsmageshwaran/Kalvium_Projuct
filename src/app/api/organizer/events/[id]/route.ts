import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAuth } from "@/lib/auth";
import { invalidateApprovedEventsCache } from "@/lib/events-cache";

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

    if (user.role !== "CAMPUS_MANAGER" && eventData?.organizerId !== user.userId) {
      return NextResponse.json(
        { error: "You don't have permission to delete this event." },
        { status: 403 }
      );
    }

    // Clean up subcollection documents to avoid orphaned records
    const [analysesSnap, historySnap] = await Promise.all([
      eventRef.collection("analyses").get().catch(() => null),
      eventRef.collection("approvalHistory").get().catch(() => null),
    ]);
    const batch = adminDb.batch();
    if (analysesSnap && !analysesSnap.empty) {
      analysesSnap.docs.forEach((d: any) => batch.delete(d.ref));
    }
    if (historySnap && !historySnap.empty) {
      historySnap.docs.forEach((d: any) => batch.delete(d.ref));
    }
    batch.delete(eventRef);
    await batch.commit();

    invalidateApprovedEventsCache();

    return NextResponse.json({ success: true, message: "Event deleted successfully." });
  } catch (error) {
    console.error("Delete event error:", error);
    return NextResponse.json(
      { error: "Failed to delete event." },
      { status: 500 }
    );
  }
}
