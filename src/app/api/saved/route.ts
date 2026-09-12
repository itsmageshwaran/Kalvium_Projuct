import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { isStartingSoon, getEventDateCategory, getHumanCountdown } from "@/lib/time";
import { checkTwoEventsClash, parseTimeToMinutes } from "@/lib/clash";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if ("errorResponse" in authResult) return authResult.errorResponse;

    const { user } = authResult;

    // Fetch student's saved events
    const savedRecords = await prisma.savedEvent.findMany({
      where: { userId: user.userId },
      include: {
        event: {
          include: {
            organizer: {
              select: { name: true, email: true },
            },
            verifiedBy: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { event: { date: "asc" } },
    });

    const events = savedRecords.map((r) => r.event);

    // Compute pairwise clashes inside student's saved list
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
      for (let j = i + 1; j < events.length; j++) {
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

    const now = new Date();

    // Enrich each event with calculated state
    const enrichedEvents = events.map((event) => {
      const startingSoon = isStartingSoon(event.date, event.startTime, now);
      const dateCategory = getEventDateCategory(event.date, now);
      const countdown = getHumanCountdown(event.date, event.startTime, now);
      const hasClash = clashingEventIds.has(event.id);

      // Find specific conflicting event if any
      const relatedConflict = conflicts.find(
        (c) => c.eventAId === event.id || c.eventBId === event.id
      );

      return {
        ...event,
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
    enrichedEvents.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      const minA = parseTimeToMinutes(a.startTime);
      const minB = parseTimeToMinutes(b.startTime);
      const safeA = isNaN(minA) ? 9999 : minA;
      const safeB = isNaN(minB) ? 9999 : minB;
      return safeA - safeB;
    });

    // Grouping for "My Schedule"
    const startingSoonEvents = enrichedEvents.filter((e) => e.isStartingSoon);
    const todayEvents = enrichedEvents.filter((e) => e.dateCategory === "TODAY");
    const tomorrowEvents = enrichedEvents.filter((e) => e.dateCategory === "TOMORROW");
    const upcomingEvents = enrichedEvents.filter((e) => e.dateCategory === "THIS_WEEK" || e.dateCategory === "UPCOMING");
    const pastEvents = enrichedEvents.filter((e) => e.dateCategory === "PAST");

    return NextResponse.json({
      success: true,
      count: enrichedEvents.length,
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
