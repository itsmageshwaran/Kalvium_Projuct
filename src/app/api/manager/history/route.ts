import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req, ["CAMPUS_MANAGER"]);
    if ("errorResponse" in authResult) return authResult.errorResponse;

    // ✅ Fetch approvalHistory + approved events + declined events ALL IN PARALLEL
    let historyData: any[] = [];
    try {
      const [historySnapshot, approvedSnap, declinedSnap] = await Promise.all([
        adminDb.collectionGroup("approvalHistory").get(),
        adminDb.collection("events").where("status", "==", "APPROVED").get(),
        adminDb.collection("events").where("status", "==", "DECLINED").get(),
      ]);

      historyData = historySnapshot.docs.map((doc: any) => {
        const parentEventRef = doc.ref.parent.parent;
        return { id: doc.id, ...doc.data(), eventId: parentEventRef?.id };
      });

      const coveredEventIds = new Set(historyData.map((h: any) => h.eventId).filter(Boolean));

      approvedSnap.docs.forEach((doc: any) => {
        if (!coveredEventIds.has(doc.id)) {
          const data = doc.data() || {};
          historyData.push({
            id: `event_${doc.id}`,
            eventId: doc.id,
            action: "APPROVED",
            notes: "Verified and stamped by Campus Manager.",
            timestamp: data.verifiedAt || data.updatedAt || data.createdAt || new Date().toISOString(),
            managerId: data.verifiedById || (data.verifiedBy ? data.verifiedBy.id : null),
            _eventData: { id: doc.id, ...data },
            _managerData: data.verifiedBy || null,
          });
          coveredEventIds.add(doc.id);
        }
      });

      declinedSnap.docs.forEach((doc: any) => {
        if (!coveredEventIds.has(doc.id)) {
          const data = doc.data() || {};
          historyData.push({
            id: `event_${doc.id}`,
            eventId: doc.id,
            action: "DECLINED",
            notes: data.declineCustomNotes || data.declineReason || "Declined during verification.",
            timestamp: data.updatedAt || data.createdAt || new Date().toISOString(),
            managerId: data.verifiedById || (data.verifiedBy ? data.verifiedBy.id : null),
            _eventData: { id: doc.id, ...data },
            _managerData: data.verifiedBy || null,
          });
          coveredEventIds.add(doc.id);
        }
      });
    } catch (err) {
      console.warn("History fetch warning:", err);
    }

    // Sort descending by timestamp
    historyData.sort((a: any, b: any) => {
      const tA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const tB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return tB - tA;
    });

    const history = await Promise.all(
      historyData.map(async (h: any) => {
        // ✅ Fetch event doc + manager doc IN PARALLEL per item (if needed)
        const needsEventFetch = !h._eventData && h.eventId;
        const needsManagerFetch = !h._managerData && h.managerId;

        const [eventDoc, userDoc] = await Promise.all([
          needsEventFetch
            ? adminDb.collection("events").doc(h.eventId).get().catch(() => null)
            : Promise.resolve(null),
          needsManagerFetch
            ? adminDb.collection("users").doc(h.managerId).get().catch(() => null)
            : Promise.resolve(null),
        ]);

        let event = h._eventData || null;
        if (!event && eventDoc?.exists) {
          const data = eventDoc.data() || {};
          event = {
            id: eventDoc.id,
            title: data.title,
            posterUrl: data.posterUrl,
            category: data.category,
            date: data.date,
            venue: data.venue,
            status: data.status,
            submitterRole: data.submitterRole,
            organizer: data.organizer,
            organizerName: data.organizerName,
          };
        }

        let manager = h._managerData || null;
        if (!manager && userDoc?.exists) {
          manager = {
            name: userDoc.data()?.name,
            email: userDoc.data()?.email,
          };
        }
        if (!manager) {
          manager = { name: "Campus Manager", email: "manager@kalvium.community" };
        }

        const { _eventData, _managerData, ...rest } = h;
        return { ...rest, event, manager };
      })
    );

    return NextResponse.json({
      success: true,
      history,
    });
  } catch (error) {
    console.error("Manager history query error:", error);
    return NextResponse.json(
      { error: "Failed to fetch verification audit history." },
      { status: 500 }
    );
  }
}
