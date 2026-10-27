import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAuth } from "@/lib/auth";

interface RouteParams {
  params: {
    id: string;
  };
}

export const dynamic = "force-dynamic";

/**
 * GET /api/events/[id]/participations
 * Retrieve all confirmed participant showcases, certificates, and award winners for this event.
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth(req, ["STUDENT", "ORGANIZER", "CAMPUS_MANAGER"]);
    if ("errorResponse" in authResult) return authResult.errorResponse;

    const eventId = params.id;
    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required." }, { status: 400 });
    }

    const snapshot = await adminDb
      .collection("events")
      .doc(eventId)
      .collection("participations")
      .orderBy("createdAt", "desc")
      .get();

    const participations = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Split into winners and participants for quick display
    const winners = participations.filter((p: any) => p.hasWonPrize);
    const regularParticipants = participations.filter((p: any) => !p.hasWonPrize);

    return NextResponse.json({
      success: true,
      total: participations.length,
      winnersCount: winners.length,
      winners,
      participants: regularParticipants,
      all: participations,
    });
  } catch (error) {
    console.error("Fetch event participations error:", error);
    return NextResponse.json(
      { error: "Failed to fetch event participations." },
      { status: 500 }
    );
  }
}
