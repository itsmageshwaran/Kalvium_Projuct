function parseTimeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== "string") return NaN;
  const clean = timeStr.trim().toUpperCase();
  if (
    clean === "" ||
    clean === "NOT SPECIFIED" ||
    clean === "NEEDS VERIFICATION" ||
    clean === "TBD"
  ) {
    return NaN;
  }

  const is12Hour = clean.includes("AM") || clean.includes("PM");

  if (is12Hour) {
    const isPM = clean.includes("PM");
    const numPart = clean.replace(/AM|PM/g, "").trim();
    const parts = numPart.split(":");
    const hoursRaw = parseInt(parts[0], 10);
    const minutesRaw = parts.length > 1 ? parseInt(parts[1], 10) : 0;

    if (isNaN(hoursRaw)) return NaN;
    let hours = hoursRaw;
    const minutes = isNaN(minutesRaw) ? 0 : minutesRaw;

    if (isPM && hours < 12) hours += 12;
    if (!isPM && hours === 12) hours = 0;

    return hours * 60 + minutes;
  } else {
    const parts = clean.split(":");
    const hours = parseInt(parts[0], 10);
    const minutes = parts.length > 1 ? parseInt(parts[1], 10) : 0;

    if (isNaN(hours)) return NaN;
    return hours * 60 + (isNaN(minutes) ? 0 : minutes);
  }
}

function formatMinutesToTime(minutes) {
  if (isNaN(minutes)) return "TBD";
  const normalized = ((Math.floor(minutes) % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const mins = normalized % 60;
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const displayMins = mins.toString().padStart(2, "0");
  return `${displayHours}:${displayMins} ${period}`;
}

function checkTwoEventsClash(a, b) {
  if (a.date !== b.date) {
    return { hasClash: false };
  }

  const rawStartA = parseTimeToMinutes(a.startTime);
  let rawEndA = parseTimeToMinutes(a.endTime);
  const rawStartB = parseTimeToMinutes(b.startTime);
  let rawEndB = parseTimeToMinutes(b.endTime);

  // If any time is unspecified or invalid, cannot confirm a clash
  if (isNaN(rawStartA) || isNaN(rawEndA) || isNaN(rawStartB) || isNaN(rawEndB)) {
    return { hasClash: false };
  }

  // Support overnight events where end time wraps past midnight (e.g. 10:00 PM to 02:00 AM)
  if (rawEndA <= rawStartA) {
    rawEndA += 1440;
  }
  if (rawEndB <= rawStartB) {
    rawEndB += 1440;
  }

  // Exact collision formula:
  // startA < endB AND startB < endA
  const overlaps = rawStartA < rawEndB && rawStartB < rawEndA;

  if (!overlaps) {
    return { hasClash: false };
  }

  const overlapStart = Math.max(rawStartA, rawStartB);
  const overlapEnd = Math.min(rawEndA, rawEndB);
  const duration = Math.max(0, overlapEnd - overlapStart);

  if (duration === 0) {
    return { hasClash: false };
  }

  return {
    hasClash: true,
    conflictingEvent: b,
    overlap: {
      startMinutes: overlapStart % 1440,
      endMinutes: overlapEnd % 1440,
      formatted: `${formatMinutesToTime(overlapStart)} – ${formatMinutesToTime(overlapEnd)}`,
      durationMinutes: duration,
    },
  };
}

console.log("🔍 Verifying Schedule Clash Detection Logic...\n");

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

// Test 1: Exact Overlap
const eventA = {
  id: "1",
  title: "AI Workshop",
  date: "2026-09-15",
  startTime: "10:00 AM",
  endTime: "12:00 PM",
};
const eventB = {
  id: "2",
  title: "Hackathon Intro",
  date: "2026-09-15",
  startTime: "11:30 AM",
  endTime: "01:00 PM",
};

const result1 = checkTwoEventsClash(eventA, eventB);
assert(result1.hasClash === true, "Overlapping events (10:00-12:00 vs 11:30-1:00) detected as CLASH");
assert(
  result1.overlap?.formatted === "11:30 AM – 12:00 PM",
  `Correct calculated overlap window: ${result1.overlap?.formatted}`
);

// Test 2: Back-to-Back (MUST NOT CLASH)
const eventC = {
  id: "3",
  title: "Robotics Build",
  date: "2026-09-15",
  startTime: "12:00 PM",
  endTime: "01:00 PM",
};

const result2 = checkTwoEventsClash(eventA, eventC);
assert(result2.hasClash === false, "Back-to-back events (10:00-12:00 and 12:00-1:00) are NOT a clash");

// Test 3: Completely Separate Times on Same Day
const eventD = {
  id: "4",
  title: "Evening Concert",
  date: "2026-09-15",
  startTime: "05:00 PM",
  endTime: "08:00 PM",
};
const result3 = checkTwoEventsClash(eventA, eventD);
assert(result3.hasClash === false, "Separate time slots on same day are NOT a clash");

// Test 4: Different Dates
const eventE = {
  id: "5",
  title: "Next Day Talk",
  date: "2026-09-16",
  startTime: "10:30 AM",
  endTime: "11:30 AM",
};
const result4 = checkTwoEventsClash(eventA, eventE);
assert(result4.hasClash === false, "Events on different dates are NOT a clash");

// Test 5: Fully Enclosed Overlap
const eventF = {
  id: "6",
  title: "Mini Lightning Talk",
  date: "2026-09-15",
  startTime: "10:15 AM",
  endTime: "10:45 AM",
};
const result5 = checkTwoEventsClash(eventA, eventF);
assert(result5.hasClash === true, "Enclosed event detected as CLASH");
assert(
  result5.overlap?.formatted === "10:15 AM – 10:45 AM",
  `Enclosed overlap correctly matches: ${result5.overlap?.formatted}`
);

// Test 6: Overnight Event Overlap (10:00 PM - 02:00 AM vs 11:30 PM - 01:00 AM)
const overnightA = {
  id: "7",
  title: "Overnight Hackathon",
  date: "2026-09-20",
  startTime: "10:00 PM",
  endTime: "02:00 AM",
};
const overnightB = {
  id: "8",
  title: "Midnight Gaming Tournament",
  date: "2026-09-20",
  startTime: "11:30 PM",
  endTime: "01:00 AM",
};
const result6 = checkTwoEventsClash(overnightA, overnightB);
assert(result6.hasClash === true, "Overnight overlapping events detected as CLASH");
assert(
  result6.overlap?.formatted === "11:30 PM – 1:00 AM",
  `Overnight overlap window: ${result6.overlap?.formatted}`
);
assert(result6.overlap?.durationMinutes === 90, `Overnight duration is positive 90 mins: ${result6.overlap?.durationMinutes}`);

// Test 7: Overnight Back-to-Back (10:00 PM - 01:00 AM and 01:00 AM - 03:00 AM)
const overnightC = {
  id: "9",
  title: "Late DJ Set",
  date: "2026-09-20",
  startTime: "01:00 AM",
  endTime: "03:00 AM",
};
const result7 = checkTwoEventsClash(overnightB, overnightC);
assert(result7.hasClash === false, "Overnight back-to-back events (11:30-1:00 and 1:00-3:00) are NOT a clash");

// Test 8: Unspecified / Missing Time Graceful Handling
const unspecifiedEvent = {
  id: "10",
  title: "TBD Workshop",
  date: "2026-09-15",
  startTime: "Not specified",
  endTime: "Not specified",
};
const result8 = checkTwoEventsClash(eventA, unspecifiedEvent);
assert(result8.hasClash === false, "Unspecified times safely return no clash without error");

console.log(`\nResults: ${passed} passed, ${failed} failed.\n`);
if (failed > 0) process.exit(1);
