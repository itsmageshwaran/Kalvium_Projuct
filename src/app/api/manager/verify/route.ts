import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req, ["CAMPUS_MANAGER"]);
    if ("errorResponse" in authResult) return authResult.errorResponse;

    const { user } = authResult;
    const body = await req.json();

    const {
      eventId,
      action, // "APPROVE" | "DECLINE"
      corrections, // Optional edits made by manager
      reason,      // Decline reason
      customNotes, // Custom feedback notes
    } = body;

    if (!eventId || !action || !["APPROVE", "DECLINE"].includes(action)) {
      return NextResponse.json(
        { error: "Event ID and a valid action ('APPROVE' or 'DECLINE') are required." },
        { status: 400 }
      );
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    // State Machine Guard: Only events with PENDING status can be verified/declined
    if (event.status !== "PENDING") {
      return NextResponse.json(
        {
          error: `Event cannot be processed because its status is already '${event.status}'. Only PENDING events can be reviewed.`,
        },
        { status: 400 }
      );
    }

    const now = new Date();

    if (action === "APPROVE") {
      // Apply manager corrections if any
      const updateData: any = {
        status: "APPROVED",
        verifiedById: user.userId,
        verifiedAt: now,
        declineReason: null,
        declineCustomNotes: null,
      };

      if (corrections) {
        if (corrections.title) updateData.title = corrections.title.trim();
        if (corrections.date) updateData.date = corrections.date.trim();
        if (corrections.startTime) updateData.startTime = corrections.startTime.trim();
        if (corrections.endTime) updateData.endTime = corrections.endTime.trim();
        if (corrections.venue) updateData.venue = corrections.venue.trim();
        if (corrections.organizerName) updateData.organizerName = corrections.organizerName.trim();
        if (corrections.category) updateData.category = corrections.category.trim();
        if (corrections.description) updateData.description = corrections.description.trim();
        if (corrections.summary) updateData.summary = corrections.summary.trim();
      }

      const [updated] = await prisma.$transaction([
        prisma.event.update({
          where: { id: eventId },
          data: updateData,
        }),
        prisma.approvalHistory.create({
          data: {
            eventId,
            managerId: user.userId,
            action: "APPROVED",
            notes: customNotes || "Verified against original event poster.",
            timestamp: now,
          },
        }),
      ]);

      return NextResponse.json({
        success: true,
        message: "Event approved successfully. Stamped with ✓ CAMPUS VERIFIED.",
        event: updated,
      });
    } else {
      // DECLINE action
      const declineReasonText = reason || "Information doesn't match poster";

      const [updated] = await prisma.$transaction([
        prisma.event.update({
          where: { id: eventId },
          data: {
            status: "DECLINED",
            declineReason: declineReasonText,
            declineCustomNotes: customNotes || "Event information could not be verified.",
            verifiedById: user.userId,
            verifiedAt: now,
          },
        }),
        prisma.approvalHistory.create({
          data: {
            eventId,
            managerId: user.userId,
            action: "DECLINED",
            reason: declineReasonText,
            notes: customNotes || "Declined by Campus Manager",
            timestamp: now,
          },
        }),
      ]);

      return NextResponse.json({
        success: true,
        message: "Event has been declined.",
        event: updated,
      });
    }
  } catch (error) {
    console.error("Manager verify action error:", error);
    return NextResponse.json(
      { error: "Failed to process verification decision." },
      { status: 500 }
    );
  }
}
