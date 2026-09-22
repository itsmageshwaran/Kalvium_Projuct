import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req, ["STUDENT", "ORGANIZER", "CAMPUS_MANAGER"]);
    if ("errorResponse" in authResult) return authResult.errorResponse;

    const { user } = authResult;
    const { eventId } = await req.json();

    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required." }, { status: 400 });
    }

    // Verify event exists and is APPROVED
    const eventRef = adminDb.collection("events").doc(eventId);
    const eventDoc = await eventRef.get();

    if (!eventDoc.exists) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    if (eventDoc.data()?.status !== "APPROVED") {
      return NextResponse.json(
        { error: "Only approved campus events can be saved to schedule." },
        { status: 400 }
      );
    }

    // Check if already saved
    const savedEventRef = adminDb
      .collection("users")
      .doc(user.userId)
      .collection("savedEvents")
      .doc(eventId);

    const existing = await savedEventRef.get();

    if (existing.exists) {
      // Unsave
      await savedEventRef.delete();
      
      return NextResponse.json({
        success: true,
        saved: false,
        message: "Event removed from your schedule.",
      });
    } else {
      // Save
      await savedEventRef.set({
        savedAt: new Date().toISOString()
      });
      
      return NextResponse.json({
        success: true,
        saved: true,
        message: "Event added to your personal schedule.",
      });
    }
  } catch (error) {
    console.error("Toggle saved event error:", error);
    return NextResponse.json(
      { error: "Failed to update saved event." },
      { status: 500 }
    );
  }
}
