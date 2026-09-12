import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseTimeToMinutes } from "@/lib/clash";
import { formatLocalDate } from "@/lib/time";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim().toLowerCase() || "";
    const category = searchParams.get("category")?.trim() || "";
    const venue = searchParams.get("venue")?.trim() || "";
    const dateFilter = searchParams.get("dateFilter")?.trim() || ""; // "TODAY" | "TOMORROW" | "THIS_WEEK" | "UPCOMING"
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

    // Build Prisma query condition
    const where: any = {
      status: "APPROVED", // Mandatory security rule: ONLY APPROVED events are public
    };

    if (category && category !== "ALL") {
      where.category = { equals: category };
    }

    if (venue && venue !== "ALL") {
      where.venue = { contains: venue };
    }

    if (dateFilter === "TODAY") {
      where.date = todayStr;
    } else if (dateFilter === "TOMORROW") {
      where.date = tomorrowStr;
    } else if (dateFilter === "THIS_WEEK") {
      where.date = {
        gte: todayStr,
        lte: nextWeekStr,
      };
    } else if (dateFilter === "UPCOMING") {
      where.date = {
        gte: todayStr,
      };
    }

    const pageParam = parseInt(searchParams.get("page") || "", 10);
    const limitParam = parseInt(searchParams.get("limit") || "", 10);
    const hasPagination = !isNaN(limitParam) && limitParam > 0;
    const page = !isNaN(pageParam) && pageParam > 0 ? pageParam : 1;
    const limit = hasPagination ? Math.min(100, Math.max(1, limitParam)) : 100;

    // Push text search down to SQL if query parameter exists
    if (query) {
      where.OR = [
        { title: { contains: query } },
        { organizerName: { contains: query } },
        { venue: { contains: query } },
        { category: { contains: query } },
        { summary: { contains: query } },
        { tags: { contains: query } },
      ];
    }

    // Fetch matching approved events
    let events = await prisma.event.findMany({
      where,
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        verifiedBy: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy:
        sortBy === "recently_added"
          ? { createdAt: "desc" }
          : sortBy === "latest"
          ? { date: "desc" }
          : { date: "asc" },
    });

    // Secondary in-memory search for organizer email/name matches if needed
    if (query) {
      events = events.filter((e) => {
        return (
          e.title.toLowerCase().includes(query) ||
          (e.organizerName && e.organizerName.toLowerCase().includes(query)) ||
          e.organizer.name.toLowerCase().includes(query) ||
          e.venue.toLowerCase().includes(query) ||
          e.category.toLowerCase().includes(query) ||
          e.summary.toLowerCase().includes(query)
        );
      });
    }

    // Sort by soonest (date + startTime)
    if (sortBy === "soonest") {
      events.sort((a, b) => {
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
