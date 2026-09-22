import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { getAuthUser } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const eventDoc = await adminDb.collection("events").doc(id).get();

    if (!eventDoc.exists) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    const eventData = eventDoc.data();
    const event = { id: eventDoc.id, ...eventData };

    // Fetch analyses if needed (subcollection)
    const analysesSnapshot = await adminDb
      .collection("events")
      .doc(id)
      .collection("analyses")
      .orderBy("analyzedAt", "desc")
      .limit(1)
      .get();
      
    const analyses = analysesSnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

    // Fetch approval history if needed (subcollection)
    const historySnapshot = await adminDb
      .collection("events")
      .doc(id)
      .collection("approvalHistory")
      .orderBy("timestamp", "desc")
      .get();
      
    const approvalHistory = historySnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

    const fullEvent: any = {
      ...event,
      analyses,
      approvalHistory
    };

    const auth = await getAuthUser(req);

    // Authorization rule:
    // If not APPROVED, only the event's organizer or a CAMPUS_MANAGER can view it.
    if (fullEvent.status !== "APPROVED") {
      if (!auth) {
        return NextResponse.json(
          { error: "Event is pending verification and cannot be accessed." },
          { status: 403 }
        );
      }
      const isOwner = auth.userId === fullEvent.organizerId;
      const isManager = auth.role === "CAMPUS_MANAGER";
      if (!isOwner && !isManager) {
        return NextResponse.json(
          { error: "Event is private and pending campus verification." },
          { status: 403 }
        );
      }
    }

    // Strip internal moderation data (analyses and approvalHistory) for public callers
    const isPrivileged = !!(auth && (auth.userId === fullEvent.organizerId || auth.role === "CAMPUS_MANAGER"));
    const sanitizedEvent = isPrivileged
      ? fullEvent
      : {
          ...fullEvent,
          analyses: [],
          approvalHistory: [],
        };

    return NextResponse.json({ success: true, event: sanitizedEvent });
  } catch (error) {
    console.error("Get event by ID error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve event details." },
      { status: 500 }
    );
  }
}
