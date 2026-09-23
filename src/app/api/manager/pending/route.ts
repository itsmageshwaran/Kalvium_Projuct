import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req, ["CAMPUS_MANAGER"]);
    if ("errorResponse" in authResult) return authResult.errorResponse;

    const eventsRef = adminDb.collection("events");

    // ✅ Run all 4 count queries IN PARALLEL — no sequential waiting
    const [pendingCountSnap, approvedCountSnap, declinedCountSnap, totalCountSnap, pendingSnapshot] =
      await Promise.all([
        eventsRef.where("status", "==", "PENDING").count().get(),
        eventsRef.where("status", "==", "APPROVED").count().get(),
        eventsRef.where("status", "==", "DECLINED").count().get(),
        eventsRef.count().get(),
        // ✅ Also fetch the actual pending events at the same time
        eventsRef.where("status", "==", "PENDING").get(),
      ]);

    const stats = {
      pending: pendingCountSnap.data().count || 0,
      approved: approvedCountSnap.data().count || 0,
      declined: declinedCountSnap.data().count || 0,
      total: totalCountSnap.data().count || 0,
    };

    // Sort pending events oldest-first (FIFO review queue)
    const pendingEventsData = pendingSnapshot.docs
      .map((doc: any) => ({ id: doc.id, ...doc.data() }))
      .sort((a: any, b: any) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeA - timeB;
      });

    // ✅ Fetch analyses for all pending events IN PARALLEL (already was Promise.all, kept as-is)
    const pendingEvents = await Promise.all(
      pendingEventsData.map(async (event: any) => {
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
