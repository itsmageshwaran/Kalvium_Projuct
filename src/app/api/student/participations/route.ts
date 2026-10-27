import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/student/participations
 * Retrieve all participation records, certificates, and awards for the logged-in student.
 */
export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req, ["STUDENT", "ORGANIZER", "CAMPUS_MANAGER"]);
    if ("errorResponse" in authResult) return authResult.errorResponse;

    const { user } = authResult;

    const snapshot = await adminDb
      .collection("users")
      .doc(user.userId)
      .collection("participations")
      .orderBy("updatedAt", "desc")
      .get();

    const participations = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const awardsCount = participations.filter((p: any) => p.hasWonPrize).length;
    const teamProjectsCount = participations.filter((p: any) => p.isTeamEvent).length;

    return NextResponse.json({
      success: true,
      stats: {
        totalCertificates: participations.length,
        awardsCount,
        teamProjectsCount,
      },
      participations,
    });
  } catch (error) {
    console.error("Fetch student participations error:", error);
    return NextResponse.json(
      { error: "Failed to fetch student participation records." },
      { status: 500 }
    );
  }
}
