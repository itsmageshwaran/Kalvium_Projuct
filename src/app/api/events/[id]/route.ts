import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const event = await prisma.event.findUnique({
      where: { id },
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
        analyses: {
          take: 1,
          orderBy: { analyzedAt: "desc" },
        },
        approvalHistory: {
          orderBy: { timestamp: "desc" },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    const auth = await getAuthUser(req);

    // Authorization rule:
    // If not APPROVED, only the event's organizer or a CAMPUS_MANAGER can view it.
    if (event.status !== "APPROVED") {
      if (!auth) {
        return NextResponse.json(
          { error: "Event is pending verification and cannot be accessed." },
          { status: 403 }
        );
      }
      const isOwner = auth.userId === event.organizerId;
      const isManager = auth.role === "CAMPUS_MANAGER";
      if (!isOwner && !isManager) {
        return NextResponse.json(
          { error: "Event is private and pending campus verification." },
          { status: 403 }
        );
      }
    }

    // Strip internal moderation data (analyses and approvalHistory) for public callers
    const isPrivileged = !!(auth && (auth.userId === event.organizerId || auth.role === "CAMPUS_MANAGER"));
    const sanitizedEvent = isPrivileged
      ? event
      : {
          ...event,
          analyses: [],
          approvalHistory: [],
        };

    return NextResponse.json({ success: true, event: sanitizedEvent });
  } catch (error) {
    console.error("Get event by ID error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve event details." },
      { status: 500 }
    );
  }
}
