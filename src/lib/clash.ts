/**
 * Schedule Clash Detection Engine
 * 
 * Formal collision algorithm:
 * Two events clash IF AND ONLY IF:
 *   eventA.start < eventB.end AND eventB.start < eventA.end
 * 
 * Back-to-back events (e.g. 10:00 AM - 12:00 PM and 12:00 PM - 1:00 PM) DO NOT clash.
 * Accurately detects overnight collisions across midnight boundaries.
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
 * Converts a TimeSlot into absolute minute intervals since a reference epoch.
 * Enables clash detection across calendar days for overnight hackathons / events.
 */
function getSlotAbsoluteMinutes(slot: TimeSlot): { start: number; end: number } | null {
  const startMin = parseTimeToMinutes(slot.startTime);
  let endMin = parseTimeToMinutes(slot.endTime);
  if (isNaN(startMin) || isNaN(endMin)) return null;

  if (!slot.date || typeof slot.date !== "string") return null;
  const parts = slot.date.split("-").map(Number);
  if (parts.length < 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) return null;

  const baseDays = Math.floor(Date.UTC(parts[0], parts[1] - 1, parts[2]) / (1000 * 60 * 60 * 24));
  const startAbsolute = baseDays * 1440 + startMin;
  const isOvernight = endMin <= startMin;
  const endAbsolute = (baseDays + (isOvernight ? 1 : 0)) * 1440 + endMin;

  return { start: startAbsolute, end: endAbsolute };
}

/**
 * Checks if two events clash.
 * Accurately detects overlaps for same-day and overnight events.
 */
export function checkTwoEventsClash(a: TimeSlot, b: TimeSlot): ClashResult {
  const absA = getSlotAbsoluteMinutes(a);
  const absB = getSlotAbsoluteMinutes(b);

  if (!absA || !absB) {
    return { hasClash: false };
  }

  // Exact interval overlap formula:
  // startA < endB AND startB < endA
  const overlaps = absA.start < absB.end && absB.start < absA.end;

  if (!overlaps) {
    return { hasClash: false };
  }

  const overlapStart = Math.max(absA.start, absB.start);
  const overlapEnd = Math.min(absA.end, absB.end);
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
 * Compares two venue names to determine if they refer to the same physical campus space.
 * Prevents false positives where "Room 1" matches "Room 10", or "Lab A" matches "Lab AB".
 */
export function areVenuesMatching(venueA?: string | null, venueB?: string | null): boolean {
  if (!venueA || !venueB) return false;
  const cleanA = venueA.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  const cleanB = venueB.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  if (!cleanA || !cleanB || cleanA === "not specified" || cleanB === "not specified") return false;
  if (cleanA === cleanB) return true;

  const tokensA = cleanA.split(" ").filter(Boolean);
  const tokensB = cleanB.split(" ").filter(Boolean);

  // If different numeric room numbers exist, they are distinct (e.g. Room 1 vs Room 10)
  const numsA = tokensA.filter((t) => /^\d+$/.test(t));
  const numsB = tokensB.filter((t) => /^\d+$/.test(t));
  if (numsA.length > 0 && numsB.length > 0 && numsA.join(" ") !== numsB.join(" ")) {
    return false;
  }

  // If different single-letter room suffixes exist (e.g. Lab A vs Lab B)
  const lettersA = tokensA.filter((t) => /^[a-z]$/.test(t));
  const lettersB = tokensB.filter((t) => /^[a-z]$/.test(t));
  if (lettersA.length > 0 && lettersB.length > 0 && lettersA.join(" ") !== lettersB.join(" ")) {
    return false;
  }

  // Check if shorter venue name is an exact word subset of longer venue name (minimum 2 words)
  const [shorter, longer] = tokensA.length <= tokensB.length ? [tokensA, tokensB] : [tokensB, tokensA];
  if (shorter.length >= 2) {
    const longerSet = new Set(longer);
    return shorter.every((t) => longerSet.has(t));
  }

  return cleanA === cleanB;
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
 * Finds all clashes among a list of events.
 */
export function findAllClashesInList(
  events: TimeSlot[]
): Array<{ eventA: TimeSlot; eventB: TimeSlot; overlapStr: string }> {
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
