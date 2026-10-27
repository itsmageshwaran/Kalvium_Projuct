import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAuth } from "@/lib/auth";
import { isEventPast } from "@/lib/time";

export const dynamic = "force-dynamic";

/**
 * GET: Retrieve all events the current student has enrolled into.
 */
export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req, ["STUDENT", "ORGANIZER", "CAMPUS_MANAGER"]);
    if ("errorResponse" in authResult) return authResult.errorResponse;

    const { user } = authResult;

    const userEnrolledSnapshot = await adminDb
      .collection("users")
      .doc(user.userId)
      .collection("enrolledEvents")
      .orderBy("enrolledAt", "desc")
      .get();

    const enrolledList = userEnrolledSnapshot.docs.map((doc: any) => ({
      eventId: doc.id,
      ...doc.data(),
    }));

    if (enrolledList.length === 0) {
      return NextResponse.json({
        success: true,
        enrolledEvents: [],
        totalCount: 0,
      });
    }

    // Fetch full active event docs for fresh data and accurate timestamps
    const eventIds = enrolledList.map((e) => e.eventId);
    const eventDocs = await Promise.all(
      eventIds.map((id) => adminDb.collection("events").doc(id).get())
    );

    const now = new Date();

    const fullEvents = eventDocs
      .filter((doc) => doc.exists)
      .map((doc) => {
        const data = doc.data()!;
        const isPast = isEventPast(data.date, data.endTime, now, data.startTime);
        const enrolledMeta = enrolledList.find((e) => e.eventId === doc.id);
        return {
          id: doc.id,
          ...data,
          isPast,
          enrolledAt: enrolledMeta?.enrolledAt,
          enrollmentStatus: enrolledMeta?.status || "ENROLLED",
        };
      });

    return NextResponse.json({
      success: true,
      enrolledEvents: fullEvents,
      totalCount: fullEvents.length,
    });
  } catch (error: any) {
    console.error("Fetch student enrolled events error:", error);
    return NextResponse.json(
      { error: "Failed to load your enrolled events." },
      { status: 500 }
    );
  }
}
