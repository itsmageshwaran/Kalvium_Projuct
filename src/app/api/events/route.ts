import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { parseTimeToMinutes } from "@/lib/clash";
import { formatLocalDate, isEventPast } from "@/lib/time";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim().toLowerCase() || "";
    const category = searchParams.get("category")?.trim() || "";
    const venue = searchParams.get("venue")?.trim() || "";
    const dateFilter = searchParams.get("dateFilter")?.trim() || ""; // "ALL" | "TODAY" | "TOMORROW" | "THIS_WEEK" | "PAST"
    const sortBy = searchParams.get("sortBy") || "soonest"; // "soonest" | "latest" | "recently_added"

    // Reference date in local campus time
    const now = new Date();
    const todayStr = formatLocalDate(now);

    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const tomorrowStr = formatLocalDate(tomorrow);

    const nextWeek = new Date(now);
    nextWeek.setDate(now.getDate() + 7);
    const nextWeekStr = formatLocalDate(nextWeek);

    // Query Firestore for approved events (filter in-memory to prevent missing composite index errors)
    const snapshot = await adminDb.collection("events").where("status", "==", "APPROVED").get();
    
    let events: any[] = [];
    snapshot.forEach((doc: any) => {
      const data = doc.data();
      const isPast = isEventPast(data.date, data.endTime, now, data.startTime);
      events.push({ id: doc.id, ...data, isPast });
    });

    if (category && category !== "ALL") {
      events = events.filter((e: any) => e.category === category);
    }

    // Filter by date
    if (dateFilter === "PAST") {
      events = events.filter((e: any) => e.isPast);
    } else if (dateFilter === "UPCOMING") {
      events = events.filter((e: any) => !e.isPast);
    } else if (dateFilter === "TODAY") {
      events = events.filter((e: any) => e.date === todayStr && !e.isPast);
    } else if (dateFilter === "TOMORROW") {
      events = events.filter((e: any) => e.date === tomorrowStr && !e.isPast);
    } else if (dateFilter === "THIS_WEEK") {
      events = events.filter((e: any) => e.date >= todayStr && e.date <= nextWeekStr && !e.isPast);
    }
    // Note: If dateFilter is "ALL" or omitted, all approved events are included

    if (venue && venue !== "ALL") {
      events = events.filter((e: any) => e.venue.toLowerCase().includes(venue.toLowerCase()));
    }

    if (query) {
      events = events.filter((e: any) => {
        return (
          (e.title && e.title.toLowerCase().includes(query)) ||
          (e.organizerName && e.organizerName.toLowerCase().includes(query)) ||
          (e.organizer?.name && e.organizer.name.toLowerCase().includes(query)) ||
          (e.venue && e.venue.toLowerCase().includes(query)) ||
          (e.category && e.category.toLowerCase().includes(query)) ||
          (e.summary && e.summary.toLowerCase().includes(query)) ||
          (e.tags && e.tags.some((t: string) => t.toLowerCase().includes(query)))
        );
      });
    }

    // Sort
    if (sortBy === "recently_added") {
      events.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === "latest" || dateFilter === "PAST") {
      // For past events or latest sort, show the most recent first
      events.sort((a: any, b: any) => {
        if (a.date !== b.date) return b.date.localeCompare(a.date);
        const minA = parseTimeToMinutes(a.startTime);
        const minB = parseTimeToMinutes(b.startTime);
        const safeA = isNaN(minA) ? 0 : minA;
        const safeB = isNaN(minB) ? 0 : minB;
        return safeB - safeA;
      });
    } else { // soonest
      events.sort((a: any, b: any) => {
        // If sorting soonest and we have both upcoming and past events:
        // Upcoming events come first (sorted soonest to furthest),
        // followed by past events (sorted most recent past event first).
        if (a.isPast !== b.isPast) {
          return a.isPast ? 1 : -1;
        }
        if (a.isPast) {
          if (a.date !== b.date) return b.date.localeCompare(a.date);
          const minA = parseTimeToMinutes(a.startTime);
          const minB = parseTimeToMinutes(b.startTime);
          return (isNaN(minB) ? 0 : minB) - (isNaN(minA) ? 0 : minA);
        }
        if (a.date !== b.date) {
          return a.date.localeCompare(b.date);
        }
        const minA = parseTimeToMinutes(a.startTime);
        const minB = parseTimeToMinutes(b.startTime);
        const safeA = isNaN(minA) ? 9999 : minA;
        const safeB = isNaN(minB) ? 9999 : minB;
        return safeA - safeB;
      });
    }

    const pageParam = parseInt(searchParams.get("page") || "", 10);
    const limitParam = parseInt(searchParams.get("limit") || "", 10);
    const hasPagination = !isNaN(limitParam) && limitParam > 0;
    const page = !isNaN(pageParam) && pageParam > 0 ? pageParam : 1;
    const limit = hasPagination ? Math.min(100, Math.max(1, limitParam)) : 100;

    const totalCount = events.length;
    const paginatedEvents = hasPagination
      ? events.slice((page - 1) * limit, page * limit)
      : events;

    return NextResponse.json({
      success: true,
      count: paginatedEvents.length,
      totalCount,
      page: hasPagination ? page : 1,
      totalPages: hasPagination ? Math.ceil(totalCount / limit) : 1,
      events: paginatedEvents,
    });
  } catch (error) {
    console.error("Public events query error:", error);
    return NextResponse.json(
      { error: "Failed to fetch campus events." },
      { status: 500 }
    );
  }
}
