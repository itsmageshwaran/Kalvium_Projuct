import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAuth } from "@/lib/auth";
import { detectDuplicateEvent } from "@/lib/ai-poster-analyzer";
import { checkTwoEventsClash, areVenuesMatching } from "@/lib/clash";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req, ["STUDENT", "ORGANIZER", "CAMPUS_MANAGER"]);
    if ("errorResponse" in authResult) return authResult.errorResponse;

    const { user } = authResult;

    const rateLimit = checkRateLimit(
      req,
      "organizer:conflict-check",
      { maxRequests: 60, windowMs: 60 * 1000 },
      user.userId
    );

    if (!rateLimit.success) {
      return rateLimitResponse(
        rateLimit.limit,
        rateLimit.remaining,
        rateLimit.reset,
        "Too many conflict checks. Please slow down."
      );
    }

    const body = await req.json();
    const { title = "", date = "", startTime = "", endTime = "", venue = "" } = body;

    if (!date) {
      return NextResponse.json({ hasConflict: false });
    }

    // Check 1: Duplicate title or exact same start time at venue
    const duplicateCheck = await detectDuplicateEvent(title, date, startTime, venue);
    if (duplicateCheck.hasPotentialDuplicate) {
      return NextResponse.json({
        hasConflict: true,
        type: "DUPLICATE",
        reason: duplicateCheck.reason,
        matchedEvent: duplicateCheck.matchedEvent,
      });
    }

    // Check 2: Venue schedule collision (overlapping time slots at same venue)
    if (venue && venue.trim() !== "Not specified" && startTime && endTime) {
      const eventsSnapshot = await adminDb.collection("events")
        .where("date", "==", date)
        .where("status", "in", ["APPROVED", "PENDING"])
        .get();

      const sameDateVenueEvents = eventsSnapshot.docs.map((doc: any) => ({
        id: doc.id,
        title: doc.data().title || "",
        date: doc.data().date,
        startTime: doc.data().startTime || "",
        endTime: doc.data().endTime || "",
        venue: doc.data().venue || "",
      }));

      const targetSlot = {
        title: title || "New Event",
        date,
        startTime,
        endTime,
        venue,
      };

      for (const existing of sameDateVenueEvents) {
        // Compare venue similarity with token-aware matching
        const sameVenue = areVenuesMatching(venue, existing.venue);

        if (sameVenue) {
          const clash = checkTwoEventsClash(targetSlot, existing);
          if (clash.hasClash && clash.overlap) {
            return NextResponse.json({
              hasConflict: true,
              type: "VENUE_CLASH",
              reason: `Venue collision: '${existing.title}' is already scheduled at '${existing.venue}' during ${clash.overlap.formatted}.`,
              overlap: clash.overlap,
              matchedEvent: existing,
            });
          }
        }
      }
    }

    return NextResponse.json({
      hasConflict: false,
    });
  } catch (error) {
    console.error("Organizer check-conflicts error:", error);
    return NextResponse.json({ hasConflict: false });
  }
}
