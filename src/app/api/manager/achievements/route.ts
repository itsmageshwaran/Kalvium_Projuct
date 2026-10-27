import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/manager/achievements
 * Fetches all student participation credentials, awards, certificates, and project demos
 * across all APPROVED campus events for the Campus Manager's unified oversight dashboard.
 * Unapproved, pending, or declined events are strictly excluded.
 */
export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req, ["CAMPUS_MANAGER"]);
    if ("errorResponse" in authResult) return authResult.errorResponse;

    // Fetch all participations across all events via collectionGroup
    const snapshot = await adminDb.collectionGroup("participations").get();

    // Deduplicate by eventId_userId (since records exist in both events/{id}/participations and users/{id}/participations)
    const map = new Map<string, any>();
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const eventId = data.eventId || doc.ref.parent.parent?.id;
      const userId = data.userId || doc.id;
      if (!eventId || !userId) return;

      const key = `${eventId}_${userId}`;
      if (!map.has(key)) {
        map.set(key, {
          id: key,
          participationId: doc.id,
          ...data,
          eventId,
          userId,
        });
      }
    });

    const rawAchievements = Array.from(map.values());
    const uniqueEventIds = Array.from(new Set(rawAchievements.map((a) => a.eventId).filter(Boolean)));

    // Fetch and verify event status - strictly only APPROVED events are valid for achievements
    const approvedEventsMap = new Map<string, any>();
    for (let i = 0; i < uniqueEventIds.length; i += 30) {
      const chunk = uniqueEventIds.slice(i, i + 30);
      const eventsSnap = await adminDb
        .collection("events")
        .where("__name__", "in", chunk)
        .get();

      eventsSnap.docs.forEach((d) => {
        const evData = d.data();
        if (evData.status === "APPROVED") {
          approvedEventsMap.set(d.id, evData);
        }
      });
    }

    // Filter achievements to only those belonging to APPROVED campus events
    const achievements = rawAchievements
      .filter((a) => approvedEventsMap.has(a.eventId))
      .map((a) => {
        const ev = approvedEventsMap.get(a.eventId);
        return {
          ...a,
          eventTitle: ev.title || a.eventTitle,
          eventDate: ev.date || a.eventDate,
          eventVenue: ev.venue || a.eventVenue,
          eventCategory: ev.category || a.eventCategory,
        };
      })
      .sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return dateB - dateA;
      });

    const totalAwards = achievements.filter((a) => a.hasWonPrize).length;
    const totalTeams = achievements.filter((a) => a.isTeamEvent).length;
    const uniqueStudents = new Set(achievements.map((a) => a.userId)).size;
    const uniqueEvents = new Set(achievements.map((a) => a.eventId)).size;

    return NextResponse.json({
      success: true,
      stats: {
        totalSubmissions: achievements.length,
        totalAwards,
        totalTeams,
        uniqueStudents,
        uniqueEvents,
      },
      achievements,
    });
  } catch (error) {
    console.error("Manager achievements fetch error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve campus student achievements." },
      { status: 500 }
    );
  }
}
