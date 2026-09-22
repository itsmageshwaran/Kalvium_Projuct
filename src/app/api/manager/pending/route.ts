import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req, ["CAMPUS_MANAGER"]);
    if ("errorResponse" in authResult) return authResult.errorResponse;

    const eventsRef = adminDb.collection("events");

    // Fetch counts using Firestore aggregation queries
    const pendingCountSnap = await eventsRef.where("status", "==", "PENDING").count().get();
    const approvedCountSnap = await eventsRef.where("status", "==", "APPROVED").count().get();
    const declinedCountSnap = await eventsRef.where("status", "==", "DECLINED").count().get();
    const totalCountSnap = await eventsRef.count().get();

    const stats = {
      pending: pendingCountSnap.data().count || 0,
      approved: approvedCountSnap.data().count || 0,
      declined: declinedCountSnap.data().count || 0,
      total: totalCountSnap.data().count || 0,
    };

    // Get pending events for review (sorted in memory to avoid requiring a composite index)
    const snapshot = await eventsRef
      .where("status", "==", "PENDING")
      .get();

    const pendingEventsData = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    pendingEventsData.sort((a: any, b: any) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeA - timeB;
    });

    const pendingEvents = await Promise.all(
      pendingEventsData.map(async (event: any) => {
        // Fetch analyses for each pending event
        const analysesSnap = await eventsRef
          .doc(event.id)
          .collection("analyses")
          .orderBy("analyzedAt", "desc")
          .limit(1)
          .get();

        return {
          ...event,
          analyses: analysesSnap.docs.map((a: any) => ({ id: a.id, ...a.data() })),
        };
      })
    );

    return NextResponse.json({
      success: true,
      stats,
      pendingEvents,
    });
  } catch (error) {
    console.error("Manager pending query error:", error);
    return NextResponse.json(
      { error: "Failed to fetch pending verification queue." },
      { status: 500 }
    );
  }
}
