import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAuth } from "@/lib/auth";

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

    // Delete the event document.
    // Note: To be clean, we should also delete subcollections (analyses, approvalHistory), 
    // but Firestore doesn't automatically cascade deletes. For now we just delete the document itself.
    // A cloud function or a batch process could clean up orphaned subcollections.
    await eventRef.delete();

    return NextResponse.json({ success: true, message: "Event deleted successfully." });
  } catch (error) {
    console.error("Delete event error:", error);
    return NextResponse.json(
      { error: "Failed to delete event." },
      { status: 500 }
    );
  }
}
