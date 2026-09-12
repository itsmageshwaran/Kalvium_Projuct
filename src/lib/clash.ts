/**
 * Schedule Clash Detection Engine
 * 
 * Formal collision algorithm:
 * Two events clash on the same date IF AND ONLY IF:
 *   eventA.start < eventB.end AND eventB.start < eventA.end
 * 
 * Back-to-back events (e.g. 10:00 AM - 12:00 PM and 12:00 PM - 1:00 PM) DO NOT clash.
 */

export interface TimeSlot {
  id?: string;
  title: string;
  date: string;       // YYYY-MM-DD
  startTime: string;  // e.g. "10:00 AM" or "10:00"
  endTime: string;    // e.g. "12:00 PM" or "12:00"
  venue?: string;
}

export interface ClashResult {
  hasClash: boolean;
  conflictingEvent?: TimeSlot;
  overlap?: {
    startMinutes: number;
    endMinutes: number;
    formatted: string;
    durationMinutes: number;
  };
}

/**
 * Parses time strings in 12-hour or 24-hour formats into minutes from midnight (0 - 1439).
 * Returns NaN if the time string is invalid or unspecified.
 * Examples:
 *  "10:00 AM" -> 600
 *  "12:00 PM" -> 720
 *  "01:30 PM" -> 810
 *  "14:00"    -> 840
 */
export function parseTimeToMinutes(timeStr: string | null | undefined): number {
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

/**
 * Formats minutes from midnight back to readable 12-hour format ("10:00 AM").
 * Handles minutes >= 1440 by wrapping around 24 hours.
 */
export function formatMinutesToTime(minutes: number): string {
  if (isNaN(minutes)) return "TBD";
  const normalized = ((Math.floor(minutes) % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const mins = normalized % 60;
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const displayMins = mins.toString().padStart(2, "0");
  return `${displayHours}:${displayMins} ${period}`;
}

/**
 * Checks if two events clash.
 * Supports overnight events spanning past midnight.
 */
export function checkTwoEventsClash(a: TimeSlot, b: TimeSlot): ClashResult {
  // Must be on the exact same date
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

  // Calculate the exact overlap window
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

/**
 * Checks if a target event clashes with ANY already-saved event in a list.
 */
export function findClashInList(target: TimeSlot, existingList: TimeSlot[]): ClashResult {
  for (const existing of existingList) {
    if (existing.id && target.id && existing.id === target.id) continue;
    const clash = checkTwoEventsClash(target, existing);
    if (clash.hasClash) {
      return clash;
    }
  }
  return { hasClash: false };
}

/**
 * Finds all clashes among a list of events (e.g. for student dashboard "Schedule Conflicts" count).
 */
export function findAllClashesInList(events: TimeSlot[]): Array<{ eventA: TimeSlot; eventB: TimeSlot; overlapStr: string }> {
  const clashes: Array<{ eventA: TimeSlot; eventB: TimeSlot; overlapStr: string }> = [];

  for (let i = 0; i < events.length; i++) {
    for (let j = i + 1; j < events.length; j++) {
      const clash = checkTwoEventsClash(events[i], events[j]);
      if (clash.hasClash && clash.overlap) {
        clashes.push({
          eventA: events[i],
          eventB: events[j],
          overlapStr: clash.overlap.formatted,
        });
      }
    }
  }

  return clashes;
}
