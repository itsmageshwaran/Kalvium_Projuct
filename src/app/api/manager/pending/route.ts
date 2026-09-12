import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req, ["CAMPUS_MANAGER"]);
    if ("errorResponse" in authResult) return authResult.errorResponse;

    // Compute event counts using database aggregation instead of full table scan
    const statusGroups = await prisma.event.groupBy({
      by: ["status"],
      _count: { _all: true },
    });

    const statusCounts: Record<string, number> = {};
    let total = 0;
    for (const group of statusGroups) {
      statusCounts[group.status] = group._count._all;
      total += group._count._all;
    }

    const stats = {
      pending: statusCounts["PENDING"] || 0,
      approved: statusCounts["APPROVED"] || 0,
      declined: statusCounts["DECLINED"] || 0,
      total,
    };

    // Get pending events for review
    const pendingEvents = await prisma.event.findMany({
      where: { status: "PENDING" },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        analyses: {
          take: 1,
          orderBy: { analyzedAt: "desc" },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      success: true,
      stats,
      pendingEvents,
    });
  } catch (error) {
    console.error("Manager pending query error:", error);
    return NextResponse.json(
      { error: "Failed to fetch pending verification queue." },
      { status: 500 }
    );
  }
}
