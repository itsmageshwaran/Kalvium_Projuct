import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAuth } from "@/lib/auth";
import { isStartingSoon, getEventDateCategory, getHumanCountdown, isEventPast } from "@/lib/time";
import { checkTwoEventsClash, parseTimeToMinutes } from "@/lib/clash";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if ("errorResponse" in authResult) return authResult.errorResponse;

    const { user } = authResult;

    // Fetch student's saved events from Firestore subcollection
    const savedSnapshot = await adminDb
      .collection("users")
      .doc(user.userId)
      .collection("savedEvents")
      .get();
      
    const savedEventIds = savedSnapshot.docs.map((doc: any) => doc.id);

    let events: any[] = [];
    if (savedEventIds.length > 0) {
      // Fetch the actual event documents
      // Firestore 'in' query supports max 30 items. If a user saves more than 30, chunk it.
      const chunks = [];
      for (let i = 0; i < savedEventIds.length; i += 30) {
        chunks.push(savedEventIds.slice(i, i + 30));
      }

      // Fetch all chunks in parallel
      const chunkSnapshots = await Promise.all(
        chunks.map((chunk) =>
          adminDb.collection("events").where("__name__", "in", chunk).get()
        )
      );

      for (const snap of chunkSnapshots) {
        snap.docs.forEach((doc: any) => {
          events.push({ id: doc.id, ...doc.data() });
        });
      }
    }

    const now = new Date();

    // Compute pairwise clashes inside student's saved list (only for active/upcoming events)
    const conflicts: Array<{
      eventAId: string;
      eventBId: string;
      eventATitle: string;
      eventBTitle: string;
      date: string;
      overlapStr: string;
    }> = [];

    const clashingEventIds = new Set<string>();

    for (let i = 0; i < events.length; i++) {
      const isPastA = isEventPast(events[i].date, events[i].endTime, now, events[i].startTime);
      if (isPastA) continue; // Don't flag clashes for historical past events

      for (let j = i + 1; j < events.length; j++) {
        const isPastB = isEventPast(events[j].date, events[j].endTime, now, events[j].startTime);
        if (isPastB) continue;

        const clash = checkTwoEventsClash(events[i], events[j]);
        if (clash.hasClash && clash.overlap) {
          conflicts.push({
            eventAId: events[i].id,
            eventBId: events[j].id,
            eventATitle: events[i].title,
            eventBTitle: events[j].title,
            date: events[i].date,
            overlapStr: clash.overlap.formatted,
          });
          clashingEventIds.add(events[i].id);
          clashingEventIds.add(events[j].id);
        }
      }
    }

    // Enrich each event with calculated state
    const enrichedEvents = events.map((event) => {
      const isPast = isEventPast(event.date, event.endTime, now, event.startTime);
      const startingSoon = !isPast && isStartingSoon(event.date, event.startTime, now, event.endTime);
      const dateCategory = isPast ? "PAST" : getEventDateCategory(event.date, now, event.endTime, event.startTime);
      const countdown = getHumanCountdown(event.date, event.startTime, now, event.endTime);
      const hasClash = !isPast && clashingEventIds.has(event.id);

      // Find specific conflicting event if any
      const relatedConflict = conflicts.find(
        (c) => c.eventAId === event.id || c.eventBId === event.id
      );

      return {
        ...event,
        isPast,
        isStartingSoon: startingSoon,
        dateCategory,
        countdown,
        hasClash,
        conflictDetails: relatedConflict
          ? {
              conflictingEventTitle:
                relatedConflict.eventAId === event.id
                  ? relatedConflict.eventBTitle
                  : relatedConflict.eventATitle,
              overlapStr: relatedConflict.overlapStr,
            }
          : null,
      };
    });

    // Sort chronologically by date and startTime
    enrichedEvents.sort((a: any, b: any) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      const minA = parseTimeToMinutes(a.startTime);
      const minB = parseTimeToMinutes(b.startTime);
      const safeA = isNaN(minA) ? 9999 : minA;
      const safeB = isNaN(minB) ? 9999 : minB;
      return safeA - safeB;
    });

    // Grouping for "My Schedule"
    const startingSoonEvents = enrichedEvents.filter((e: any) => e.isStartingSoon);
    const todayEvents = enrichedEvents.filter((e: any) => !e.isPast && e.dateCategory === "TODAY");
    const tomorrowEvents = enrichedEvents.filter((e: any) => !e.isPast && e.dateCategory === "TOMORROW");
    const upcomingEvents = enrichedEvents.filter(
      (e: any) => !e.isPast && (e.dateCategory === "THIS_WEEK" || e.dateCategory === "UPCOMING" || e.dateCategory === "TODAY" || e.dateCategory === "TOMORROW")
    );
    const pastEvents = enrichedEvents.filter((e: any) => e.isPast || e.dateCategory === "PAST");

    return NextResponse.json({
      success: true,
      count: enrichedEvents.length,
      upcomingCount: upcomingEvents.length,
      pastCount: pastEvents.length,
      conflictsCount: conflicts.length,
      conflicts,
      events: enrichedEvents,
      groups: {
        startingSoon: startingSoonEvents,
        today: todayEvents,
        tomorrow: tomorrowEvents,
        upcoming: upcomingEvents,
        past: pastEvents,
      },
    });
  } catch (error) {
    console.error("Saved events query error:", error);
    return NextResponse.json(
      { error: "Failed to fetch saved schedule." },
      { status: 500 }
    );
  }
}
