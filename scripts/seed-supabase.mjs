/**
 * Supabase REST API Seed Script
 * Uses HTTPS (port 443) instead of PostgreSQL (port 5432/6543)
 * Works even when college WiFi blocks database ports.
 *
 * Usage: node scripts/seed-supabase.mjs
 */

import bcrypt from "bcryptjs";

// ── Config ──────────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://lnojvosxoeakjywzvaiu.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "❌  Missing SUPABASE_SERVICE_ROLE_KEY env var.\n" +
      "   Run: $env:SUPABASE_SERVICE_ROLE_KEY='your_service_role_key'; node scripts/seed-supabase.mjs\n" +
      "   Get the key from: Supabase Dashboard → Project Settings → API → service_role (secret)"
  );
  process.exit(1);
}

const headers = {
  apikey: SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
};

// ── Helpers ──────────────────────────────────────────────────────────────────
async function rest(method, table, body) {
  const url = `${SUPABASE_URL}/rest/v1/${table}`;
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`${method} /${table} failed (${res.status}): ${err}`);
  }
  return res.status === 204 ? null : res.json();
}

function dateOffset(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function cuid() {
  // Simple cuid-compatible ID for seeding
  return (
    "c" +
    Math.random().toString(36).slice(2, 10) +
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 6)
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🌱 Seeding Campus Event Hub (via Supabase REST API)...\n");

  // ── Clean existing data ────────────────────────────────────────────────────
  console.log("🧹 Cleaning existing tables...");
  await rest("DELETE", "ApprovalHistory?id=neq.00000000", null);
  await rest("DELETE", "EventAnalysis?id=neq.00000000", null);
  await rest("DELETE", "SavedEvent?id=neq.00000000", null);
  await rest("DELETE", 'Event?id=neq.00000000', null);
  await rest("DELETE", 'User?id=neq.00000000', null);

  const passwordHash = await bcrypt.hash("demo12345", 10);

  // ── Create Users ───────────────────────────────────────────────────────────
  console.log("👤 Creating users...");

  const managerId = cuid();
  const orgRoboticsId = cuid();
  const orgDSCId = cuid();
  const orgCulturalId = cuid();
  const orgSportsId = cuid();
  const studentAlexId = cuid();
  const studentPriyaId = cuid();

  await rest("POST", "User", [
    {
      id: managerId,
      name: "Dr. Alistair Sharma",
      email: "manager@campus.edu",
      password: passwordHash,
      role: "CAMPUS_MANAGER",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    },
    {
      id: orgRoboticsId,
      name: "Robotics & AI Society",
      email: "robotics@campus.edu",
      password: passwordHash,
      role: "ORGANIZER",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    },
    {
      id: orgDSCId,
      name: "Developer Student Club",
      email: "gdsc@campus.edu",
      password: passwordHash,
      role: "ORGANIZER",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    },
    {
      id: orgCulturalId,
      name: "Campus Cultural & Arts Board",
      email: "tedx@campus.edu",
      password: passwordHash,
      role: "ORGANIZER",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
    {
      id: orgSportsId,
      name: "Varsity Athletics Council",
      email: "sports@campus.edu",
      password: passwordHash,
      role: "ORGANIZER",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    },
    {
      id: studentAlexId,
      name: "Alex Johnson",
      email: "alex@campus.edu",
      password: passwordHash,
      role: "STUDENT",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    },
    {
      id: studentPriyaId,
      name: "Priya Patel",
      email: "priya@campus.edu",
      password: passwordHash,
      role: "STUDENT",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    },
  ]);
  console.log("  ✅ 7 users created");

  // ── Create Approved Events ─────────────────────────────────────────────────
  console.log("📅 Creating approved events...");

  const now = new Date();
  const verifiedAt1 = new Date(now - 3600000 * 24).toISOString();
  const verifiedAt2 = new Date(now - 3600000 * 18).toISOString();
  const verifiedAt3 = new Date(now - 3600000 * 12).toISOString();
  const verifiedAt4 = new Date(now - 3600000 * 10).toISOString();
  const verifiedAt5 = new Date(now - 3600000 * 8).toISOString();
  const verifiedAt6 = new Date(now - 3600000 * 6).toISOString();
  const verifiedAt7 = new Date(now - 3600000 * 4).toISOString();
  const verifiedAt8 = new Date(now - 3600000 * 2).toISOString();

  const e1Id = cuid(), e2Id = cuid(), e3Id = cuid(), e4Id = cuid();
  const e5Id = cuid(), e6Id = cuid(), e7Id = cuid(), e8Id = cuid();

  await rest("POST", "Event", [
    {
      id: e1Id,
      title: "AI & Autonomous Robotics Workshop",
      description: "A fast-paced hands-on workshop guiding students through the fundamentals of embedded computer vision and micro-ROS robotic control. Bring your laptops. Hardware kits provided.",
      summary: "Hands-on robotics workshop with embedded vision and micro-ROS kits.",
      date: dateOffset(0),
      startTime: "10:00 AM",
      endTime: "01:00 PM",
      venue: "Innovation Lab (Room 304, Tech Tower)",
      organizerName: "Robotics & AI Society",
      posterUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80",
      category: "Workshop",
      tags: "AI, Robotics, Hardware, Computer Vision",
      registrationUrl: "https://campus-hub.edu/events/robotics-2026",
      contactInfo: "robotics@campus.edu",
      status: "APPROVED",
      organizerId: orgRoboticsId,
      verifiedById: managerId,
      verifiedAt: verifiedAt1,
      updatedAt: verifiedAt1,
    },
    {
      id: e2Id,
      title: "Full-Stack Next.js & AI Agent Sprint",
      description: "Learn how to build production-grade full-stack web applications with Next.js 14, streaming AI responses, and Postgres vector stores. Live pair coding exercises included.",
      summary: "Intensive 3-hour build sprint building Next.js apps with streaming AI agents.",
      date: dateOffset(1),
      startTime: "10:00 AM",
      endTime: "01:00 PM",
      venue: "Turing Hall, Computer Science Building",
      organizerName: "Developer Student Club",
      posterUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80",
      category: "Technical",
      tags: "Next.js, Web Development, Full Stack, TypeScript",
      registrationUrl: "https://gdsc-campus.dev/nextjs-agent-sprint",
      contactInfo: "gdsc@campus.edu",
      status: "APPROVED",
      organizerId: orgDSCId,
      verifiedById: managerId,
      verifiedAt: verifiedAt2,
      updatedAt: verifiedAt2,
    },
    {
      id: e3Id,
      title: "Campus Hackathon 2026: 24h Build Sprint",
      description: "The biggest annual hackathon on campus! 24 hours of non-stop innovation, developer mentorship from top tech companies, lightning talks, pizza, and $5,000 in student bounties.",
      summary: "Flagship 24-hour university hackathon focused on AI agents and student startups.",
      date: dateOffset(1),
      startTime: "11:30 AM",
      endTime: "03:00 PM",
      venue: "Main Campus Auditorium & Innovation Foyer",
      organizerName: "Developer Student Club",
      posterUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80",
      category: "Hackathon",
      tags: "Hackathon, Coding, Startups, Innovation, Prizes",
      registrationUrl: "https://campushack2026.dev",
      contactInfo: "hackathon-team@campus.edu",
      status: "APPROVED",
      organizerId: orgDSCId,
      verifiedById: managerId,
      verifiedAt: verifiedAt3,
      updatedAt: verifiedAt3,
    },
    {
      id: e4Id,
      title: "Tech Career & Open-Source Office Hours",
      description: "Informal drop-in session with senior students and alumni working in tech. Bring your resumes, portfolio links, and questions about open source contributions.",
      summary: "Casual career AMA and resume reviews with alumni engineers.",
      date: dateOffset(1),
      startTime: "01:00 PM",
      endTime: "02:30 PM",
      venue: "Student Lounge, 2nd Floor Library",
      organizerName: "Developer Student Club",
      posterUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80",
      category: "Seminar",
      tags: "Careers, Resume Review, Networking, Open Source",
      registrationUrl: "Not specified",
      contactInfo: "gdsc-mentors@campus.edu",
      status: "APPROVED",
      organizerId: orgDSCId,
      verifiedById: managerId,
      verifiedAt: verifiedAt4,
      updatedAt: verifiedAt4,
    },
    {
      id: e5Id,
      title: "Harmony 2026: Campus Music & Arts Showcase",
      description: "Experience the rhythm of our vibrant student community. Featuring 8 student indie bands, classical instrumental performances, acoustic sets, and an open mic poetry slam.",
      summary: "Annual university music night with student rock bands and acoustic showcases.",
      date: dateOffset(2),
      startTime: "05:00 PM",
      endTime: "10:00 PM",
      venue: "University Open-Air Amphitheatre",
      organizerName: "Campus Cultural & Arts Board",
      posterUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80",
      category: "Cultural",
      tags: "Music, Live Band, Festival, Arts, Open Mic",
      registrationUrl: "Not specified",
      contactInfo: "cultural@campus.edu",
      status: "APPROVED",
      organizerId: orgCulturalId,
      verifiedById: managerId,
      verifiedAt: verifiedAt5,
      updatedAt: verifiedAt5,
    },
    {
      id: e6Id,
      title: "Inter-Department Badminton Championship",
      description: "Annual smash tournament! Singles and doubles brackets across all engineering, science, and humanities departments. Trophies and departmental points awarded.",
      summary: "Competitive badminton singles & doubles knockout tournament.",
      date: dateOffset(3),
      startTime: "09:00 AM",
      endTime: "04:00 PM",
      venue: "Indoor Sports Complex (Courts 1-4)",
      organizerName: "Varsity Athletics Council",
      posterUrl: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=80",
      category: "Sports",
      tags: "Badminton, Tournament, Athletics, Fitness",
      registrationUrl: "https://campus-hub.edu/sports/badminton-2026",
      contactInfo: "athletics@campus.edu",
      status: "APPROVED",
      organizerId: orgSportsId,
      verifiedById: managerId,
      verifiedAt: verifiedAt6,
      updatedAt: verifiedAt6,
    },
    {
      id: e7Id,
      title: "UI/UX Product Design Masterclass: Modern Typography & Micro-Interactions",
      description: "An intensive masterclass on craft and taste in product design. Learn how to design editorial-grade digital interfaces with strong hierarchy, token systems, and motion.",
      summary: "Editorial UI design masterclass exploring typography and micro-interactions.",
      date: dateOffset(5),
      startTime: "02:00 PM",
      endTime: "05:00 PM",
      venue: "Design Studio Room 402, Architecture Wing",
      organizerName: "Campus Cultural & Arts Board",
      posterUrl: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=80",
      category: "Technical",
      tags: "UI/UX, Product Design, Figma, Typography",
      registrationUrl: "https://campus-hub.edu/design-sprint",
      contactInfo: "design-guild@campus.edu",
      status: "APPROVED",
      organizerId: orgCulturalId,
      verifiedById: managerId,
      verifiedAt: verifiedAt7,
      updatedAt: verifiedAt7,
    },
    {
      id: e8Id,
      title: "Genesis 2026: Campus Tech & Innovation Fest",
      description: "Three days of robotics exhibitions, drone racing, gaming arenas, tech expos, and guest speakers from Silicon Valley and leading research labs.",
      summary: "Flagship annual inter-university technical festival with drone races and expos.",
      date: dateOffset(7),
      startTime: "09:00 AM",
      endTime: "08:00 PM",
      venue: "Central Quad & Convention Center",
      organizerName: "Robotics & AI Society",
      posterUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80",
      category: "Fest",
      tags: "TechFest, Robotics, Drone Racing, Exhibits",
      registrationUrl: "https://genesis-fest.campus.edu",
      contactInfo: "genesis-core@campus.edu",
      status: "APPROVED",
      organizerId: orgRoboticsId,
      verifiedById: managerId,
      verifiedAt: verifiedAt8,
      updatedAt: verifiedAt8,
    },
  ]);
  console.log("  ✅ 8 approved events created");

  // ── Create Approval History ────────────────────────────────────────────────
  console.log("📋 Creating approval history...");
  const approvedIds = [
    [e1Id, verifiedAt1], [e2Id, verifiedAt2], [e3Id, verifiedAt3],
    [e4Id, verifiedAt4], [e5Id, verifiedAt5], [e6Id, verifiedAt6],
    [e7Id, verifiedAt7], [e8Id, verifiedAt8],
  ];
  await rest("POST", "ApprovalHistory", approvedIds.map(([eventId, ts]) => ({
    id: cuid(),
    eventId,
    managerId,
    action: "APPROVED",
    notes: "Verified against original poster artwork. Approved for student discovery.",
    timestamp: ts,
  })));
  console.log("  ✅ 8 approval records created");

  // ── Create Pending Events ──────────────────────────────────────────────────
  console.log("⏳ Creating pending events...");
  const p1Id = cuid(), p2Id = cuid();
  await rest("POST", "Event", [
    {
      id: p1Id,
      title: "Inter-College Autonomous Drone League",
      description: "First person view (FPV) obstacle course racing and autonomous gate navigation competition. Teams must navigate custom indoor courses under 90 seconds.",
      summary: "FPV and autonomous indoor drone obstacle course race with cash prizes.",
      date: dateOffset(4),
      startTime: "02:00 PM",
      endTime: "06:00 PM",
      venue: "Multi-Purpose Indoor Arena",
      organizerName: "Robotics & AI Society",
      posterUrl: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80",
      category: "Competition",
      tags: "Drones, Robotics, Competition, FPV",
      registrationUrl: "https://campusdrone.org/register",
      contactInfo: "drone-society@campus.edu",
      status: "PENDING",
      organizerId: orgRoboticsId,
      updatedAt: now.toISOString(),
    },
    {
      id: p2Id,
      title: "Venture Pitch Night: Student Startup Showcase",
      description: "7 student teams pitch their early-stage software and hardware startups to a panel of 4 venture capital partners and alumni angel investors.",
      summary: "Student startup demo day with pitches to alumni angel investors.",
      date: dateOffset(6),
      startTime: "06:30 PM",
      endTime: "09:30 PM",
      venue: "Auditorium Annex, Business School",
      organizerName: "Developer Student Club",
      posterUrl: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=80",
      category: "Seminar",
      tags: "Startups, Venture Capital, Pitch, Entrepreneurship",
      registrationUrl: "Not specified",
      contactInfo: "ventures@campus.edu",
      status: "PENDING",
      organizerId: orgDSCId,
      updatedAt: now.toISOString(),
    },
  ]);

  await rest("POST", "EventAnalysis", [
    {
      id: cuid(),
      eventId: p1Id,
      rawExtractedData: JSON.stringify({ title: "Inter-College Autonomous Drone League", date: dateOffset(4), startTime: "02:00 PM", endTime: "06:00 PM", venue: "Multi-Purpose Indoor Arena", organizer: "Robotics & AI Society", category: "Competition" }),
      confidenceData: JSON.stringify({ title: "HIGH", date: "HIGH", startTime: "MEDIUM", endTime: "MEDIUM", venue: "HIGH", organizerName: "HIGH" }),
    },
    {
      id: cuid(),
      eventId: p2Id,
      rawExtractedData: JSON.stringify({ title: "Venture Pitch Night: Student Startup Showcase", date: dateOffset(6), startTime: "06:30 PM", endTime: "09:30 PM", venue: "Auditorium Annex, Business School" }),
      confidenceData: JSON.stringify({ title: "HIGH", date: "HIGH", startTime: "HIGH", endTime: "LOW", venue: "MEDIUM", organizerName: "LOW" }),
    },
  ]);
  console.log("  ✅ 2 pending events + analyses created");

  // ── Create Declined Event ──────────────────────────────────────────────────
  console.log("❌ Creating declined event...");
  const declinedTs = new Date(now - 3600000 * 48).toISOString();
  const d1Id = cuid();
  await rest("POST", "Event", [{
    id: d1Id,
    title: "Late Night Rooftop Laser Rave",
    description: "Unofficial late night music gathering on the Science building rooftop.",
    summary: "Unauthorized rooftop electronic music event.",
    date: dateOffset(2),
    startTime: "11:00 PM",
    endTime: "03:00 AM",
    venue: "Science Building Rooftop",
    organizerName: "Anonymous Student Group",
    posterUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80",
    category: "Cultural",
    tags: "Music, Unofficial",
    registrationUrl: "Not specified",
    contactInfo: "Not specified",
    status: "DECLINED",
    declineReason: "Unauthorized organizer",
    declineCustomNotes: "Rooftops are restricted zones. Campus facility regulations prohibit unpermitted gatherings after 10 PM.",
    organizerId: orgCulturalId,
    verifiedById: managerId,
    verifiedAt: declinedTs,
    updatedAt: declinedTs,
  }]);
  await rest("POST", "ApprovalHistory", [{
    id: cuid(),
    eventId: d1Id,
    managerId,
    action: "DECLINED",
    reason: "Unauthorized organizer",
    notes: "Rooftops are restricted zones. Campus safety rules prohibit unpermitted gatherings after 10 PM.",
    timestamp: declinedTs,
  }]);
  console.log("  ✅ 1 declined event created");

  // ── Save Events for Student Alex ───────────────────────────────────────────
  console.log("🔖 Saving events for Alex (includes intentional clash)...");
  await rest("POST", "SavedEvent", [
    { id: cuid(), userId: studentAlexId, eventId: e1Id },
    { id: cuid(), userId: studentAlexId, eventId: e2Id },
    { id: cuid(), userId: studentAlexId, eventId: e3Id }, // intentional clash with e2!
  ]);
  console.log("  ✅ 3 saved events (with clash demo pair)");

  console.log(`
✅ Seed completed successfully!

Demo Credentials (password: demo12345):
  🎓 Student:        alex@campus.edu
  🏗️  Organizer:     robotics@campus.edu
  🏛️  Campus Manager: manager@campus.edu
`);
}

main().catch((e) => {
  console.error("❌ Seed failed:", e.message);
  process.exit(1);
});
