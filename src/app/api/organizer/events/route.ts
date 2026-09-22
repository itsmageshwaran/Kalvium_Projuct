import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req, ["STUDENT", "ORGANIZER", "CAMPUS_MANAGER"]);
    if ("errorResponse" in authResult) return authResult.errorResponse;

    const { user } = authResult;

    // Fetch organizer's submissions
    const snapshot = await adminDb
      .collection("events")
      .where("organizerId", "==", user.userId)
      .get();
      
    const eventsData = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

    // For each event, we need to fetch the approval history (or just the latest one)
    // to match Prisma behavior. But actually we can do it in a Promise.all
    const events = await Promise.all(
      eventsData.map(async (event: any) => {
        const historySnapshot = await adminDb
          .collection("events")
          .doc(event.id)
          .collection("approvalHistory")
          .orderBy("timestamp", "desc")
          .limit(1)
          .get();
          
        return {
          ...event,
          approvalHistory: historySnapshot.docs.map((h: any) => ({ id: h.id, ...h.data() }))
        };
      })
    );
    
    // Sort events by createdAt desc
    events.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const stats = {
      total: events.length,
      pending: events.filter((e: any) => e.status === "PENDING").length,
      approved: events.filter((e: any) => e.status === "APPROVED").length,
      declined: events.filter((e: any) => e.status === "DECLINED").length,
    };

    return NextResponse.json({
      success: true,
      stats,
      events,
    });
  } catch (error) {
    console.error("Organizer events query error:", error);
    return NextResponse.json(
      { error: "Failed to fetch organizer submissions." },
      { status: 500 }
    );
  }
}
