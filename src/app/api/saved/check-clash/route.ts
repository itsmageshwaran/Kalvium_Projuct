import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { getAuthUser } from "@/lib/auth";
import { checkTwoEventsClash } from "@/lib/clash";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) {
      return NextResponse.json({ hasClash: false });
    }

    const rateLimit = checkRateLimit(
      req,
      "saved:check-clash",
      { maxRequests: 60, windowMs: 60 * 1000 },
      auth.userId
    );

    if (!rateLimit.success) {
      return rateLimitResponse(
        rateLimit.limit,
        rateLimit.remaining,
        rateLimit.reset,
        "Too many clash check requests. Please slow down."
      );
    }

    const { eventId } = await req.json();
    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required." }, { status: 400 });
    }

    // Fetch target event and user's saved events in parallel
    const [targetEventDoc, savedEventsSnapshot] = await Promise.all([
      adminDb.collection("events").doc(eventId).get(),
      adminDb.collection("users").doc(auth.userId).collection("savedEvents").get(),
    ]);

    if (!targetEventDoc.exists) {
      return NextResponse.json({ error: "Target event not found." }, { status: 404 });
    }

    const targetEvent = {
      id: targetEventDoc.id,
      ...targetEventDoc.data()
    } as any;

    const savedEventIds = savedEventsSnapshot.docs.map((doc: any) => doc.id);
    const isAlreadySaved = savedEventIds.includes(eventId);

    // Fetch events on the same date
    const sameDateEventsSnapshot = await adminDb.collection("events")
      .where("date", "==", targetEvent.date)
      .get();
    
    const sameDateSaved = sameDateEventsSnapshot.docs
      .filter((doc: any) => savedEventIds.includes(doc.id))
      .map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      })) as any[];

    // Look for clashes among existing saved events on this date
    for (const existing of sameDateSaved) {
      if (existing.id === eventId) continue;
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
