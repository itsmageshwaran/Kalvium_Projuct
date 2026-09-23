import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req, ["CAMPUS_MANAGER"]);
    if ("errorResponse" in authResult) return authResult.errorResponse;

    let historyData: any[] = [];
    try {
      // Bounded queries with .limit() to prevent unbounded full-table scans
      let historySnapshot;
      try {
        historySnapshot = await adminDb
          .collectionGroup("approvalHistory")
          .orderBy("timestamp", "desc")
          .limit(60)
          .get();
      } catch {
        // Fallback if composite index is still creating
        historySnapshot = await adminDb
          .collectionGroup("approvalHistory")
          .limit(60)
          .get();
      }

      const [approvedSnap, declinedSnap] = await Promise.all([
        adminDb.collection("events").where("status", "==", "APPROVED").limit(50).get(),
        adminDb.collection("events").where("status", "==", "DECLINED").limit(50).get(),
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

    // Sort descending by timestamp and take top 50
    historyData.sort((a: any, b: any) => {
      const tA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const tB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return tB - tA;
    });

    const topHistory = historyData.slice(0, 50);

    // ✅ BATCH RESOLVE missing events and managers: eliminates the N+1 query explosion
    const missingEventIds: string[] = Array.from(
      new Set(topHistory.filter((h) => !h._eventData && h.eventId).map((h) => h.eventId as string))
    );
    const missingManagerIds: string[] = Array.from(
      new Set(topHistory.filter((h) => !h._managerData && h.managerId).map((h) => h.managerId as string))
    );

    const eventMap = new Map<string, any>();
    if (missingEventIds.length > 0) {
      for (let i = 0; i < missingEventIds.length; i += 30) {
        const chunk = missingEventIds.slice(i, i + 30);
        try {
          const snap = await adminDb.collection("events").where("__name__", "in", chunk).get();
          snap.docs.forEach((d) => eventMap.set(d.id, d.data()));
        } catch (chunkErr) {
          console.warn("Event batch fetch chunk warning:", chunkErr);
        }
      }
    }

    const userMap = new Map<string, any>();
    if (missingManagerIds.length > 0) {
      for (let i = 0; i < missingManagerIds.length; i += 30) {
        const chunk = missingManagerIds.slice(i, i + 30);
        try {
          const snap = await adminDb.collection("users").where("__name__", "in", chunk).get();
          snap.docs.forEach((d) => userMap.set(d.id, d.data()));
        } catch (chunkErr) {
          console.warn("User batch fetch chunk warning:", chunkErr);
        }
      }
    }

    // Stitch resolved records synchronously in-memory
    const history = topHistory.map((h: any) => {
      let event = h._eventData || null;
      if (!event && h.eventId && eventMap.has(h.eventId)) {
        const data = eventMap.get(h.eventId) || {};
        event = {
          id: h.eventId,
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
      if (!manager && h.managerId && userMap.has(h.managerId)) {
        const userData = userMap.get(h.managerId);
        manager = {
          name: userData?.name,
          email: userData?.email,
        };
      }
      if (!manager) {
        manager = { name: "Campus Manager", email: "manager@kalvium.community" };
      }

      const { _eventData, _managerData, ...rest } = h;
      return { ...rest, event, manager };
    });

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
