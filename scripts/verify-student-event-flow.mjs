import fs from "fs";

// 1. Load .env
if (fs.existsSync(".env")) {
  const envFile = fs.readFileSync(".env", "utf-8");
  envFile.split("\n").forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let key = match[1];
      let value = match[2] || "";
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  });
}

const { adminAuth, adminDb } = await import("../src/lib/firebase/admin.ts");

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function runStudentEventVerification() {
  console.log("================================================================================");
  console.log("🎓 STUDENT EVENT PROPOSAL & CAMPUS MANAGER VERIFICATION FLOW TEST");
  console.log("================================================================================\n");

  let studentEventId = null;
  let studentUser = null;
  let managerUser = null;

  try {
    // ------------------------------------------------------------------------
    // Step 1: Verify Student & Campus Manager Accounts
    // ------------------------------------------------------------------------
    console.log("[Step 1] Loading Student & Manager accounts...");
    const studentAuth = await adminAuth.getUserByEmail("student@kalvium.community");
    let managerAuth;
    try {
      managerAuth = await adminAuth.getUserByEmail("manager@kalvium.com");
    } catch {
      managerAuth = await adminAuth.getUserByEmail("manager@kalvium.community");
    }

    assert(studentAuth.customClaims?.role === "STUDENT", "Student user has role 'STUDENT'");
    assert(managerAuth.customClaims?.role === "CAMPUS_MANAGER", "Campus Manager user has role 'CAMPUS_MANAGER'");

    const studentDoc = await adminDb.collection("users").doc(studentAuth.uid).get();
    studentUser = { id: studentAuth.uid, ...studentDoc.data() };
    const managerDoc = await adminDb.collection("users").doc(managerAuth.uid).get();
    managerUser = { id: managerAuth.uid, ...managerDoc.data() };

    // ------------------------------------------------------------------------
    // Step 2: Simulate Student Event Request Submission
    // ------------------------------------------------------------------------
    console.log("\n[Step 2] Student submitting event request...");
    const testTitle = `Student AI Robotics Hack Session ${Date.now()}`;
    const studentEventData = {
      title: testTitle,
      description: "A collaborative student-led robotics coding jam exploring micro-controllers and vision sensors.",
      summary: "Student-organized weekend hackathon for hardware and robotics enthusiasts.",
      date: "2026-11-15",
      startTime: "10:00 AM",
      endTime: "03:00 PM",
      venue: "Student Innovation Lab (Room 204)",
      organizerName: studentUser.name || "Aarav Sharma",
      posterUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80",
      originalPosterUrl: null,
      category: "Technical",
      tags: ["Robotics", "StudentInitiative", "Coding"],
      registrationUrl: "https://campus-hub.edu/student-hack-2026",
      contactInfo: studentAuth.email,
      status: "PENDING", // MUST enforce pending state
      organizerId: studentAuth.uid,
      submitterRole: "STUDENT",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      organizer: {
        id: studentAuth.uid,
        name: studentUser.name || "Aarav Sharma",
        email: studentAuth.email,
        role: "STUDENT",
      },
    };

    const eventRef = await adminDb.collection("events").add(studentEventData);
    studentEventId = eventRef.id;

    assert(!!studentEventId, `Student event proposal created with ID: ${studentEventId}`);

    // Verify properties
    const createdDoc = await eventRef.get();
    const createdData = createdDoc.data();
    assert(createdData.status === "PENDING", "Student event proposal status is strictly 'PENDING'");
    assert(createdData.submitterRole === "STUDENT", "Event document preserves submitterRole as 'STUDENT'");
    assert(createdData.organizer.role === "STUDENT", "Organizer metadata reflects STUDENT role");

    // ------------------------------------------------------------------------
    // Step 3: Verify Student Submissions Retrieval
    // ------------------------------------------------------------------------
    console.log("\n[Step 3] Student querying submission history...");
    const studentSubmissionsSnap = await adminDb
      .collection("events")
      .where("organizerId", "==", studentAuth.uid)
      .get();

    const studentEvents = studentSubmissionsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const foundEvent = studentEvents.find(e => e.id === studentEventId);
    assert(!!foundEvent, "Student can retrieve their own submitted event proposals");
    assert(foundEvent?.title === testTitle, "Retrieved submission title matches");

    // ------------------------------------------------------------------------
    // Step 4: Campus Manager Queue Identification
    // ------------------------------------------------------------------------
    console.log("\n[Step 4] Campus Manager Queue inspection...");
    const pendingSnap = await adminDb
      .collection("events")
      .where("status", "==", "PENDING")
      .get();

    const pendingList = pendingSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const managerQueueItem = pendingList.find(e => e.id === studentEventId);

    assert(!!managerQueueItem, "Student proposal appears in Campus Manager Pending Queue");
    assert(
      managerQueueItem?.submitterRole === "STUDENT" || managerQueueItem?.organizer?.role === "STUDENT",
      "Manager queue correctly identifies submission as a 'STUDENT' proposal"
    );

    // ------------------------------------------------------------------------
    // Step 5: Campus Manager Verification & Approval
    // ------------------------------------------------------------------------
    console.log("\n[Step 5] Campus Manager Approving Proposal...");
    const verificationTime = new Date().toISOString();
    const batch = adminDb.batch();

    batch.update(eventRef, {
      status: "APPROVED",
      verifiedById: managerAuth.uid,
      verifiedAt: verificationTime,
      verifiedBy: {
        id: managerAuth.uid,
        name: managerUser.name || "Campus Manager",
        role: "CAMPUS_MANAGER",
      },
      updatedAt: verificationTime,
    });

    const historyRef = eventRef.collection("approvalHistory").doc();
    batch.set(historyRef, {
      managerId: managerAuth.uid,
      action: "APPROVED",
      notes: "Student event proposal verified. Venue confirmed available.",
      timestamp: verificationTime,
    });

    await batch.commit();

    const approvedDoc = await eventRef.get();
    assert(approvedDoc.data()?.status === "APPROVED", "Event status updated to 'APPROVED'");
    assert(approvedDoc.data()?.verifiedBy.role === "CAMPUS_MANAGER", "Certified by Campus Manager");

    // Check public discovery
    const publicEventsSnap = await adminDb
      .collection("events")
      .where("status", "==", "APPROVED")
      .get();
    const isPublic = publicEventsSnap.docs.some(d => d.id === studentEventId);
    assert(isPublic, "Student proposal is now live on the public campus calendar");

    // ------------------------------------------------------------------------
    // Step 6: Test Student Proposal Withdrawal / Deletion
    // ------------------------------------------------------------------------
    console.log("\n[Step 6] Testing Student Proposal Withdrawal...");
    const historySubSnap = await eventRef.collection("approvalHistory").get();
    for (const h of historySubSnap.docs) await h.ref.delete();
    await eventRef.delete();

    const deletedDoc = await eventRef.get();
    assert(!deletedDoc.exists, "Student event request successfully withdrawn/deleted");
    studentEventId = null;

  } catch (err) {
    console.error("❌ Test error:", err);
    failed++;
  } finally {
    if (studentEventId) {
      try {
        const cleanupRef = adminDb.collection("events").doc(studentEventId);
        const hist = await cleanupRef.collection("approvalHistory").get();
        for (const h of hist.docs) await h.ref.delete();
        await cleanupRef.delete();
      } catch {}
    }
  }

  console.log(`\n================================================================================`);
  console.log(`🏁 STUDENT EVENT FLOW TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`================================================================================\n`);

  if (failed > 0) process.exit(1);
}

runStudentEventVerification();
