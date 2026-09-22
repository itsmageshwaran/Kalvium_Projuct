import fs from "fs";
import { checkTwoEventsClash } from "../src/lib/clash.ts";

// 1. Preload .env into process.env before importing Firebase modules
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

// 2. Now dynamically import Firebase Admin and AI analyzer
const { adminAuth, adminDb } = await import("../src/lib/firebase/admin.ts");
const { analyzeEventPoster, detectDuplicateEvent } = await import("../src/lib/ai-poster-analyzer.ts");

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

async function runE2E() {
  console.log("==================================================");
  console.log("🚀 CAMPUS EVENT HUB - E2E FIREBASE INTEGRATION TEST");
  console.log("==================================================\n");

  let testEventId = null;
  let organizerUid = null;
  let managerUid = null;
  let studentUid = null;

  try {
    // ------------------------------------------------------------------------
    // Step 1: Verify Seed Users & Roles
    // ------------------------------------------------------------------------
    let managerAuth;
    try {
      managerAuth = await adminAuth.getUserByEmail("manager@kalvium.com");
    } catch {
      managerAuth = await adminAuth.getUserByEmail("manager@kalvium.community");
    }
    const organizerAuth = await adminAuth.getUserByEmail("organizer@kalvium.community");
    const studentAuth = await adminAuth.getUserByEmail("student@kalvium.community");

    managerUid = managerAuth.uid;
    organizerUid = organizerAuth.uid;
    studentUid = studentAuth.uid;

    assert(managerAuth.customClaims?.role === "CAMPUS_MANAGER", "Campus Manager has CAMPUS_MANAGER custom claim");
    assert(organizerAuth.customClaims?.role === "ORGANIZER", "Organizer has ORGANIZER custom claim");
    assert(studentAuth.customClaims?.role === "STUDENT", "Student has STUDENT custom claim");

    const managerDoc = await adminDb.collection("users").doc(managerUid).get();
    const organizerDoc = await adminDb.collection("users").doc(organizerUid).get();
    const studentDoc = await adminDb.collection("users").doc(studentUid).get();

    assert(managerDoc.exists && managerDoc.data()?.role === "CAMPUS_MANAGER", "Campus Manager profile in Firestore matches");
    assert(organizerDoc.exists && organizerDoc.data()?.role === "ORGANIZER", "Organizer profile in Firestore matches");
    assert(studentDoc.exists && studentDoc.data()?.role === "STUDENT", "Student profile in Firestore matches");

    // ------------------------------------------------------------------------
    // Step 2: AI Poster Extraction & Duplicate Detection
    // ------------------------------------------------------------------------
    console.log("\n[Test 2] Testing AI Poster Extraction & Pre-Submission Duplicate Detection...");
    const sampleExtraction = await analyzeEventPoster("", "image/png", "sample-ai-robotics");
    assert(sampleExtraction.title.length > 0, "AI extracts event title correctly");
    assert(sampleExtraction.confidences.title === "HIGH", "Title has HIGH extraction confidence badge");
    assert(sampleExtraction.disclaimer.includes("Campus Manager"), "Strict disclaimer enforces human verification");

    const dupCheck = await detectDuplicateEvent(sampleExtraction.title, sampleExtraction.date, sampleExtraction.startTime, sampleExtraction.venue);
    assert(typeof dupCheck.hasPotentialDuplicate === "boolean", "Duplicate detector runs without errors");

    // ------------------------------------------------------------------------
    // Step 3: Organizer Event Submission (Must be PENDING)
    // ------------------------------------------------------------------------
    console.log("\n[Test 3] Organizer Submits Event for Verification...");
    const eventRef = adminDb.collection("events").doc();
    testEventId = eventRef.id;

    const eventPayload = {
      title: "Autonomous Drone Grand Prix 2026",
      description: "First-person view indoor drone obstacle racing in the main sports pavilion.",
      summary: "FPV indoor drone obstacle racing tournament.",
      date: "2026-09-25",
      startTime: "02:00 PM",
      endTime: "05:00 PM",
      venue: "Sports Complex Court B",
      organizerName: "Robotics & AI Society",
      posterUrl: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800",
      originalPosterUrl: null,
      category: "Competition",
      tags: "Drones, Robotics, Competition",
      registrationUrl: "https://campusdrone.org/register",
      contactInfo: "organizer@kalvium.community",
      status: "PENDING", // Strict constraint: Organizers cannot publish directly
      organizerId: organizerUid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      organizer: {
        id: organizerUid,
        name: "Robotics & AI Society",
        email: "organizer@kalvium.community",
        avatar: null,
      },
    };

    const batch = adminDb.batch();
    batch.set(eventRef, eventPayload);
    const analysisRef = eventRef.collection("analyses").doc();
    batch.set(analysisRef, {
      rawExtractedData: JSON.stringify(sampleExtraction),
      confidenceData: JSON.stringify(sampleExtraction.confidences),
      duplicatesDetected: null,
      analyzedAt: new Date().toISOString(),
    });
    await batch.commit();

    assert(testEventId !== null, "Event document successfully created in Firestore");

    // Verify it is NOT returned in public approved query
    const publicSnapshot = await adminDb.collection("events")
      .where("status", "==", "APPROVED")
      .get();
    const isPubliclyVisible = publicSnapshot.docs.some((doc) => doc.id === testEventId);
    assert(!isPubliclyVisible, "Pending event is strictly HIDDEN from public student feed");

    // ------------------------------------------------------------------------
    // Step 4: Campus Manager Verification & Approval
    // ------------------------------------------------------------------------
    console.log("\n[Test 4] Campus Manager Reviews & Approves Event...");
    const pendingSnapshot = await adminDb.collection("events")
      .where("status", "==", "PENDING")
      .get();
    const isInPendingQueue = pendingSnapshot.docs.some((doc) => doc.id === testEventId);
    assert(isInPendingQueue, "Submitted event appears in Manager pending queue");

    // Manager makes in-place venue correction and approves
    const approvedAt = new Date().toISOString();
    const updateBatch = adminDb.batch();
    updateBatch.update(eventRef, {
      venue: "Sports Complex Court B (West Wing)",
      status: "APPROVED",
      verifiedById: managerUid,
      verifiedAt: approvedAt,
      verifiedBy: {
        id: managerUid,
        name: "Dr. Alistair Sharma",
        role: "CAMPUS_MANAGER",
      },
      updatedAt: approvedAt,
    });

    const historyRef = eventRef.collection("approvalHistory").doc();
    updateBatch.set(historyRef, {
      managerId: managerUid,
      action: "APPROVED",
      notes: "Verified against original poster art; venue updated to West Wing.",
      timestamp: approvedAt,
    });
    await updateBatch.commit();

    const verifiedDoc = await eventRef.get();
    assert(verifiedDoc.data()?.status === "APPROVED", "Event status transitioned to APPROVED");
    assert(verifiedDoc.data()?.venue.includes("West Wing"), "Manager in-place corrections persisted");

    const historySnap = await eventRef.collection("approvalHistory").get();
    assert(historySnap.docs.length > 0, "Manager decision recorded in approvalHistory subcollection");

    // ------------------------------------------------------------------------
    // Step 5: Public Discovery & Clash Detection
    // ------------------------------------------------------------------------
    console.log("\n[Test 5] Public Discovery & Real-Time Schedule Clash Detection...");
    const approvedSnapshotAfter = await adminDb.collection("events")
      .where("status", "==", "APPROVED")
      .get();
    const isNowVisible = approvedSnapshotAfter.docs.some((doc) => doc.id === testEventId);
    assert(isNowVisible, "Approved event is now LIVE in the public student discovery feed");

    // Test clash collision algorithm with an overlapping event
    const conflictingEvent = {
      title: "RoboCup Drone Workshop",
      date: "2026-09-25",
      startTime: "04:00 PM", // Overlaps with 02:00 PM - 05:00 PM
      endTime: "06:30 PM",
    };
    const clashResult = checkTwoEventsClash(eventPayload, conflictingEvent);
    assert(clashResult.hasClash === true, "Schedule clash correctly detected for overlapping timeframe");
    assert(clashResult.overlap?.formatted === "4:00 PM – 5:00 PM", `Exact overlap window: ${clashResult.overlap?.formatted}`);

    // ------------------------------------------------------------------------
    // Step 6: Student Saves Event to Personal Agenda
    // ------------------------------------------------------------------------
    console.log("\n[Test 6] Student Saves Event to Schedule & Unsave...");
    const savedEventRef = adminDb.collection("users").doc(studentUid).collection("savedEvents").doc(testEventId);
    await savedEventRef.set({ savedAt: new Date().toISOString() });

    const savedDoc = await savedEventRef.get();
    assert(savedDoc.exists, "Event saved into student's personal savedEvents subcollection");

    // Unsave event
    await savedEventRef.delete();
    const unsavedDoc = await savedEventRef.get();
    assert(!unsavedDoc.exists, "Event successfully removed from student agenda");

  } catch (err) {
    console.error("❌ E2E Test Error:", err);
    failed++;
  } finally {
    // Clean up test event
    if (testEventId) {
      console.log("\n[Cleanup] Removing temporary test event...");
      const eventDocRef = adminDb.collection("events").doc(testEventId);
      const analyses = await eventDocRef.collection("analyses").get();
      for (const d of analyses.docs) await d.ref.delete();
      const history = await eventDocRef.collection("approvalHistory").get();
      for (const d of history.docs) await d.ref.delete();
      await eventDocRef.delete();
      console.log("✓ Temporary test event cleaned up.");
    }
  }

  console.log(`\n==================================================`);
  console.log(`🏁 E2E RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`==================================================\n`);

  if (failed > 0) process.exit(1);
}

runE2E();
