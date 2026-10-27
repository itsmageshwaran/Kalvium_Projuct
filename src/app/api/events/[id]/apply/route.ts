import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { getAuthUser, requireAuth } from "@/lib/auth";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { invalidateApprovedEventsCache } from "@/lib/events-cache";
import { logSecurityEvent } from "@/lib/audit-logger";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET: Check whether the current user is enrolled in this event and get the live enrolled count.
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const eventId = params.id;
    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required." }, { status: 400 });
    }

    const eventDoc = await adminDb.collection("events").doc(eventId).get();
    if (!eventDoc.exists) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    const eventData = eventDoc.data();
    const enrolledCount = typeof eventData?.enrolledCount === "number" ? eventData.enrolledCount : 0;

    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({
        isEnrolled: false,
        enrolledCount,
      });
    }

    const enrollmentDoc = await adminDb
      .collection("events")
      .doc(eventId)
      .collection("enrollments")
      .doc(user.userId)
      .get();

    const isEnrolled = enrollmentDoc.exists && enrollmentDoc.data()?.status === "ENROLLED";

    return NextResponse.json({
      isEnrolled,
      enrolledCount,
      enrollment: isEnrolled ? enrollmentDoc.data() : null,
    });
  } catch (error: any) {
    console.error("Fetch enrollment status error:", error);
    return NextResponse.json(
      { error: "Failed to fetch enrollment status." },
      { status: 500 }
    );
  }
}

/**
 * POST: Enroll the current authenticated student in the event.
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

    const rateLimit = checkRateLimit(
      req,
      "events:apply",
      { maxRequests: 20, windowMs: 60 * 1000 },
      user.userId
    );

    if (!rateLimit.success) {
      return rateLimitResponse(
        rateLimit.limit,
        rateLimit.remaining,
        rateLimit.reset,
        "Too many enrollment requests. Please slow down."
      );
    }

    const eventRef = adminDb.collection("events").doc(eventId);
    const enrollmentRef = eventRef.collection("enrollments").doc(user.userId);
    const userEnrolledRef = adminDb.collection("users").doc(user.userId).collection("enrolledEvents").doc(eventId);

    const now = new Date().toISOString();

    const result = await adminDb.runTransaction(async (transaction) => {
      const eventSnap = await transaction.get(eventRef);
      if (!eventSnap.exists) {
        throw new Error("Event not found.");
      }

      const eventData = eventSnap.data();
      if (eventData?.status !== "APPROVED") {
        throw new Error("Only manager-approved events accept student applications.");
      }

      const existingEnrollment = await transaction.get(enrollmentRef);
      if (existingEnrollment.exists && existingEnrollment.data()?.status === "ENROLLED") {
        return {
          alreadyEnrolled: true,
          enrolledCount: eventData.enrolledCount || 0,
        };
      }

      const newEnrolledCount = (eventData.enrolledCount || 0) + 1;

      // 1. Record enrollment in event subcollection
      transaction.set(enrollmentRef, {
        userId: user.userId,
        studentName: user.name || "Campus Student",
        studentEmail: user.email,
        studentAvatar: (user as any).avatar || `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(user.email)}`,
        studentRole: user.role,
        enrolledAt: now,
        status: "ENROLLED",
      });

      // 2. Record pointer in user's profile subcollection for fast agenda lookup
      transaction.set(userEnrolledRef, {
        eventId,
        title: eventData.title,
        date: eventData.date,
        startTime: eventData.startTime,
        endTime: eventData.endTime,
        venue: eventData.venue,
        posterUrl: eventData.posterUrl,
        category: eventData.category,
        enrolledAt: now,
        status: "ENROLLED",
      });

      // 3. Atomically update event's enrolledCount
      transaction.update(eventRef, {
        enrolledCount: FieldValue.increment(1),
        updatedAt: now,
      });

      return {
        alreadyEnrolled: false,
        enrolledCount: newEnrolledCount,
      };
    });

    invalidateApprovedEventsCache();

    logSecurityEvent({
      action: "EVENT_ENROLLED",
      actorId: user.userId,
      actorRole: user.role,
      targetId: eventId,
      details: {
        enrolledCount: result.enrolledCount,
      },
    });

    return NextResponse.json({
      success: true,
      isEnrolled: true,
      enrolledCount: result.enrolledCount,
      message: result.alreadyEnrolled
        ? "You are already enrolled in this event."
        : "Successfully enrolled! You will receive updates about this event.",
    });
  } catch (error: any) {
    console.error("Apply to event error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to submit enrollment application." },
      { status: 400 }
    );
  }
}

/**
 * DELETE: Withdraw from an enrolled event.
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
    const enrollmentRef = eventRef.collection("enrollments").doc(user.userId);
    const userEnrolledRef = adminDb.collection("users").doc(user.userId).collection("enrolledEvents").doc(eventId);

    const now = new Date().toISOString();

    const result = await adminDb.runTransaction(async (transaction) => {
      const eventSnap = await transaction.get(eventRef);
      if (!eventSnap.exists) {
        throw new Error("Event not found.");
      }

      const existingEnrollment = await transaction.get(enrollmentRef);
      if (!existingEnrollment.exists || existingEnrollment.data()?.status !== "ENROLLED") {
        return {
          wasEnrolled: false,
          enrolledCount: eventSnap.data()?.enrolledCount || 0,
        };
      }

      const currentCount = eventSnap.data()?.enrolledCount || 1;
      const newCount = Math.max(0, currentCount - 1);

      // Remove / mark as withdrawn
      transaction.delete(enrollmentRef);
      transaction.delete(userEnrolledRef);

      transaction.update(eventRef, {
        enrolledCount: Math.max(0, newCount),
        updatedAt: now,
      });

      return {
        wasEnrolled: true,
        enrolledCount: newCount,
      };
    });

    invalidateApprovedEventsCache();

    logSecurityEvent({
      action: "EVENT_ENROLLMENT_CANCELLED",
      actorId: user.userId,
      actorRole: user.role,
      targetId: eventId,
      details: {
        enrolledCount: result.enrolledCount,
      },
    });

    return NextResponse.json({
      success: true,
      isEnrolled: false,
      enrolledCount: result.enrolledCount,
      message: "Your application has been withdrawn.",
    });
  } catch (error: any) {
    console.error("Withdraw enrollment error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to withdraw enrollment." },
      { status: 400 }
    );
  }
}
