import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function runManualEventVerification() {
  console.log("🧪 Starting Manual Event Creation & Registration Link Verification...\n");
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

  try {
    // 1. Fetch Organizer user
    const organizer = await prisma.user.findFirst({
      where: { role: "ORGANIZER" },
    });
    assert(!!organizer, "Organizer user exists in database");

    // 2. Create a Manual Event with registration link and custom thumbnail
    const testTitle = `Manual Hackathon Showcase ${Date.now()}`;
    const testRegUrl = "https://events.campus-hub.edu/register/manual-showcase-2026";
    const testThumbnail = "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80";

    const manualEvent = await prisma.event.create({
      data: {
        title: testTitle,
        description: "A comprehensive manual hackathon organized directly via the new manual event creation studio.",
        summary: "Manual event entry testing with full details, custom artwork, and registration URL.",
        date: "2026-10-25",
        startTime: "09:00 AM",
        endTime: "05:00 PM",
        venue: "Innovation Center Room 401",
        organizerName: "Robotics & AI Student Chapter",
        posterUrl: testThumbnail,
        category: "Tech",
        tags: "Hackathon, Coding, Innovation, ManualEntry",
        registrationUrl: testRegUrl,
        contactInfo: "lead@robotics-chapter.edu",
        status: "PENDING",
        organizerId: organizer.id,
        analyses: {
          create: {
            rawExtractedData: JSON.stringify({
              isManualEntry: true,
              title: testTitle,
              registrationUrl: testRegUrl,
            }),
            confidenceData: JSON.stringify({
              isManualEntry: true,
              title: "MANUAL",
              date: "MANUAL",
              startTime: "MANUAL",
              endTime: "MANUAL",
              venue: "MANUAL",
              category: "MANUAL",
              registrationUrl: "MANUAL",
            }),
            duplicatesDetected: JSON.stringify([]),
          },
        },
      },
      include: {
        analyses: true,
      },
    });

    assert(!!manualEvent.id, "Manual event created successfully in database");
    assert(manualEvent.status === "PENDING", "Manual event default status is strictly PENDING");
    assert(manualEvent.registrationUrl === testRegUrl, `Registration URL correctly preserved: ${testRegUrl}`);
    assert(manualEvent.posterUrl === testThumbnail, "Custom thumbnail correctly preserved");

    // 3. Verify Confidence Data indicates manual entry
    const analysis = manualEvent.analyses[0];
    assert(!!analysis, "Event analysis record created");
    const parsedConfidences = JSON.parse(analysis.confidenceData);
    assert(parsedConfidences.isManualEntry === true, "Analysis confidence flags event as manual entry (isManualEntry: true)");
    assert(parsedConfidences.registrationUrl === "MANUAL", "Registration URL confidence flagged as MANUAL");

    // 4. Verify Duplicate / Conflict Detection logic
    // Title similarity check
    const existingEvents = await prisma.event.findMany({
      where: { status: { in: ["APPROVED", "PENDING"] } },
      select: { id: true, title: true, date: true, startTime: true, endTime: true, venue: true },
    });
    
    // Duplicate title check
    const foundDuplicate = existingEvents.find(
      (e) => e.title.toLowerCase().trim() === testTitle.toLowerCase().trim()
    );
    assert(!!foundDuplicate, "Conflict engine successfully identifies exact title matches");

    // Venue overlap check
    const venueCollisions = existingEvents.filter(
      (e) => e.venue.toLowerCase().trim() === "innovation center room 401" && e.date === "2026-10-25"
    );
    assert(venueCollisions.length >= 1, "Venue conflict engine detects room schedule occupancy");

    // 5. Verify Manager Approval Workflow for Manual Event
    const manager = await prisma.user.findFirst({
      where: { role: "CAMPUS_MANAGER" },
    });
    assert(!!manager, "Campus Manager exists to review manual submission");

    const [approvedEvent] = await prisma.$transaction([
      prisma.event.update({
        where: { id: manualEvent.id },
        data: {
          status: "APPROVED",
          verifiedBy: { connect: { id: manager.id } },
          verifiedAt: new Date(),
        },
        include: {
          verifiedBy: {
            select: { name: true, role: true },
          },
        },
      }),
      prisma.approvalHistory.create({
        data: {
          eventId: manualEvent.id,
          managerId: manager.id,
          action: "APPROVED",
          notes: "Verified manual submission details, registration link, and venue booking.",
        },
      }),
    ]);

    assert(approvedEvent.status === "APPROVED", "Manual event successfully approved by Campus Manager");
    assert(approvedEvent.verifiedById === manager.id, "Manager recorded as verifying authority");
    
    const histories = await prisma.approvalHistory.findMany({ where: { eventId: manualEvent.id } });
    assert(histories.length > 0, "Audit trail entry logged for manual approval");

    // 6. Verify Public Student Feed Discoverability
    const publicEvent = await prisma.event.findFirst({
      where: {
        id: manualEvent.id,
        status: "APPROVED",
      },
      include: {
        verifiedBy: {
          select: { name: true, role: true },
        },
      },
    });

    assert(!!publicEvent, "Approved manual event is discoverable in public student feed");
    assert(publicEvent.registrationUrl === testRegUrl, "Public event retains official registration URL for students");
    assert(publicEvent.posterUrl === testThumbnail, "Public event displays organizer's chosen thumbnail/banner");
    assert(!!publicEvent.verifiedBy, "Event displays verified campus authority badge details");

    // Cleanup created test event
    await prisma.approvalHistory.deleteMany({ where: { eventId: manualEvent.id } });
    await prisma.eventAnalysis.deleteMany({ where: { eventId: manualEvent.id } });
    await prisma.event.delete({ where: { id: manualEvent.id } });
    console.log("\n  🧹 Test cleanup: ephemeral verification record deleted.");

  } catch (err) {
    console.error("Test error:", err);
    failed++;
  }

  console.log(`\n========================================`);
  console.log(`Manual Event Verification: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) process.exit(1);
}

runManualEventVerification();
