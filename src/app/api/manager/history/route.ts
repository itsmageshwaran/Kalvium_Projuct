import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req, ["CAMPUS_MANAGER"]);
    if ("errorResponse" in authResult) return authResult.errorResponse;

    let historyData: any[] = [];

    // Query approvalHistory subcollections without ordering to avoid Firestore missing index error
    try {
      const historySnapshot = await adminDb
        .collectionGroup("approvalHistory")
        .get();

      historyData = historySnapshot.docs.map((doc: any) => {
        const parentEventRef = doc.ref.parent.parent;
        return {
          id: doc.id,
          ...doc.data(),
          eventId: parentEventRef?.id,
        };
      });
    } catch (cgErr) {
      console.warn("approvalHistory collectionGroup query warning:", cgErr);
    }

    // Keep track of event IDs already accounted for in approvalHistory
    const coveredEventIds = new Set(historyData.map((h: any) => h.eventId).filter(Boolean));

    // Also fetch all approved and declined events directly to ensure verified events are always visible
    try {
      const approvedSnap = await adminDb.collection("events").where("status", "==", "APPROVED").get();
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

      const declinedSnap = await adminDb.collection("events").where("status", "==", "DECLINED").get();
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
    } catch (eventsErr) {
      console.warn("Direct events fetch warning:", eventsErr);
    }

    // Sort in memory descending by timestamp
    historyData.sort((a: any, b: any) => {
      const tA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const tB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return tB - tA;
    });

    const history = await Promise.all(
      historyData.map(async (h: any) => {
        let event = h._eventData || null;
        if (!event && h.eventId) {
          try {
            const eventDoc = await adminDb.collection("events").doc(h.eventId).get();
            if (eventDoc.exists) {
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
          } catch {
            // ignore
          }
        }
        
        let manager = h._managerData || null;
        if (!manager && h.managerId) {
          try {
            const userDoc = await adminDb.collection("users").doc(h.managerId).get();
            if (userDoc.exists) {
              manager = {
                name: userDoc.data()?.name,
                email: userDoc.data()?.email,
              };
            }
          } catch {
            // ignore
          }
        }

        if (!manager) {
          manager = {
            name: "Campus Manager",
            email: "manager@kalvium.community",
          };
        }

        const { _eventData, _managerData, ...rest } = h;
        return {
          ...rest,
          event,
          manager,
        };
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
