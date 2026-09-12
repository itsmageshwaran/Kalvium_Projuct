import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { checkTwoEventsClash } from "@/lib/clash";

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) {
      return NextResponse.json({ hasClash: false });
    }

    const { eventId } = await req.json();
    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required." }, { status: 400 });
    }

    // Fetch the target event to be saved
    const targetEvent = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!targetEvent) {
      return NextResponse.json({ error: "Target event not found." }, { status: 404 });
    }

    // Check if target event is already saved
    const existingSave = await prisma.savedEvent.findUnique({
      where: {
        userId_eventId: {
          userId: auth.userId,
          eventId,
        },
      },
    });
    const isAlreadySaved = !!existingSave;

    // Fetch only saved events on the exact same date for this user
    const sameDateSaved = await prisma.savedEvent.findMany({
      where: {
        userId: auth.userId,
        event: {
          date: targetEvent.date,
        },
      },
      include: {
        event: true,
      },
    });

    // Look for clashes among existing saved events on this date
    for (const record of sameDateSaved) {
      if (record.eventId === eventId) continue;
      const existing = record.event;
      const clash = checkTwoEventsClash(targetEvent, existing);

      if (clash.hasClash && clash.overlap) {
        return NextResponse.json({
          hasClash: true,
          isAlreadySaved,
          conflictingEvent: {
            id: existing.id,
            title: existing.title,
            date: existing.date,
            startTime: existing.startTime,
            endTime: existing.endTime,
            venue: existing.venue,
          },
          targetEvent: {
            id: targetEvent.id,
            title: targetEvent.title,
            date: targetEvent.date,
            startTime: targetEvent.startTime,
            endTime: targetEvent.endTime,
            venue: targetEvent.venue,
          },
          overlap: clash.overlap,
        });
      }
    }

    return NextResponse.json({
      hasClash: false,
      isAlreadySaved,
    });
  } catch (error) {
    console.error("Check clash error:", error);
    return NextResponse.json(
      { error: "Failed to evaluate schedule conflicts. Please try again." },
      { status: 500 }
    );
  }
}
