import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAuth } from "@/lib/auth";
import { invalidateApprovedEventsCache } from "@/lib/events-cache";

class VerificationError extends Error {
  status: number;
  constructor(message: string, status: number = 400) {
    super(message);
    this.status = status;
  }
}

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

    const eventRef = adminDb.collection("events").doc(eventId);
    const now = new Date().toISOString();

    const txResult = await adminDb.runTransaction(async (transaction) => {
      const eventDoc = await transaction.get(eventRef);

      if (!eventDoc.exists) {
        throw new VerificationError("Event not found.", 404);
      }

      const eventData = eventDoc.data();

      // State Machine Guard: Only events with PENDING status can be verified/declined
      if (eventData?.status !== "PENDING") {
        throw new VerificationError(
          `Event cannot be processed because its status is already '${eventData?.status}'. Only PENDING events can be reviewed.`,
          400
        );
      }

      const historyRef = eventRef.collection("approvalHistory").doc();

      if (action === "APPROVE") {
        const updateData: any = {
          status: "APPROVED",
          verifiedById: user.userId,
          verifiedAt: now,
          declineReason: null,
          declineCustomNotes: null,
          updatedAt: now,
          verifiedBy: {
            id: user.userId,
            name: user.name,
            role: user.role,
          },
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

        transaction.update(eventRef, updateData);
        transaction.set(historyRef, {
          managerId: user.userId,
          action: "APPROVED",
          notes: customNotes || "Verified against original event poster.",
          timestamp: now,
        });

        return { eventData, updateData };
      } else {
        const declineReasonText = reason || "Information doesn't match poster";
        const updateData: any = {
          status: "DECLINED",
          declineReason: declineReasonText,
          declineCustomNotes: customNotes || "Event information could not be verified.",
          verifiedById: user.userId,
          verifiedAt: now,
          updatedAt: now,
          verifiedBy: {
            id: user.userId,
            name: user.name,
            role: user.role,
          },
        };

        transaction.update(eventRef, updateData);
        transaction.set(historyRef, {
          managerId: user.userId,
          action: "DECLINED",
          reason: declineReasonText,
          notes: customNotes || "Declined by Campus Manager",
          timestamp: now,
        });

        return { eventData, updateData };
      }
    });

    invalidateApprovedEventsCache();

    if (action === "APPROVE") {
      return NextResponse.json({
        success: true,
        message: "Event approved successfully. Stamped with ✓ CAMPUS VERIFIED.",
        event: { id: eventId, ...txResult.eventData, ...txResult.updateData },
      });
    } else {
      return NextResponse.json({
        success: true,
        message: "Event has been declined.",
        event: { id: eventId, ...txResult.eventData, ...txResult.updateData },
      });
    }
  } catch (error: any) {
    if (error instanceof VerificationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Manager verify action error:", error);
    return NextResponse.json(
      { error: "Failed to process verification decision." },
      { status: 500 }
    );
  }
}
