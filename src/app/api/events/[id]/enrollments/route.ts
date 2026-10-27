import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET: Retrieve all enrolled students for a specific event.
 * Restricted to CAMPUS_MANAGER or the event organizer.
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth(req, ["CAMPUS_MANAGER", "ORGANIZER"]);
    if ("errorResponse" in authResult) return authResult.errorResponse;

    const { user } = authResult;
    const eventId = params.id;

    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required." }, { status: 400 });
    }

    const eventDoc = await adminDb.collection("events").doc(eventId).get();
    if (!eventDoc.exists) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    const eventData = eventDoc.data();

    // If caller is an ORGANIZER, verify they are the owner of this event
    if (user.role === "ORGANIZER" && eventData?.organizerId !== user.userId) {
      return NextResponse.json(
        { error: "Access denied. Only the event organizer or a Campus Manager can view attendee rosters." },
        { status: 403 }
      );
    }

    const enrollmentsSnapshot = await adminDb
      .collection("events")
      .doc(eventId)
      .collection("enrollments")
      .orderBy("enrolledAt", "desc")
      .get();

    const enrollments = enrollmentsSnapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId || doc.id,
        studentName: data.studentName || "Campus Student",
        studentEmail: data.studentEmail || "",
        studentAvatar: data.studentAvatar || null,
        studentRole: data.studentRole || "STUDENT",
        enrolledAt: data.enrolledAt,
        status: data.status || "ENROLLED",
      };
    });

    const activeEnrollments = enrollments.filter((e) => e.status === "ENROLLED");

    return NextResponse.json({
      success: true,
      event: {
        id: eventDoc.id,
        title: eventData?.title,
        date: eventData?.date,
        startTime: eventData?.startTime,
        endTime: eventData?.endTime,
        venue: eventData?.venue,
        category: eventData?.category,
        enrolledCount: eventData?.enrolledCount || activeEnrollments.length,
      },
      enrollments: activeEnrollments,
      totalCount: activeEnrollments.length,
    });
  } catch (error: any) {
    console.error("Fetch event attendees error:", error);
    return NextResponse.json(
      { error: "Failed to load attendee roster." },
      { status: 500 }
    );
  }
}
