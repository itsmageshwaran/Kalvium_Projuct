import { parseTimeToMinutes } from "./clash";

export const CAMPUS_TIMEZONE = "Asia/Kolkata";

/**
 * Formats a Date instance as YYYY-MM-DD in campus time (Asia/Kolkata / IST = UTC+5:30),
 * preventing serverless UTC runtimes from shifting dates to yesterday.
 */
export function formatLocalDate(d: Date = new Date(), timeZone: string = CAMPUS_TIMEZONE): string {
  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatter.format(d); // "en-CA" outputs YYYY-MM-DD
  } catch {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
}

/**
 * Builds a valid JS Date object from an event's date (YYYY-MM-DD) and startTime ("10:00 AM" or "10:00").
 * Grounded in campus time (IST = UTC+5:30) so countdowns and starting-soon checks are universally accurate.
 */
export function getEventDateTime(dateStr: string, timeStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  const minutes = parseTimeToMinutes(timeStr);
  const validMinutes = isNaN(minutes) ? 0 : minutes;
  const hours = Math.floor(validMinutes / 60);
  const mins = validMinutes % 60;
  
  // Convert IST (UTC+5:30) to epoch timestamp
  const istOffsetMinutes = 330;
  const totalUtcMinutes = hours * 60 + mins - istOffsetMinutes;
  const utcHours = Math.floor(totalUtcMinutes / 60);
  const utcMins = ((totalUtcMinutes % 60) + 60) % 60;
  return new Date(Date.UTC(year, month - 1, day, utcHours, utcMins, 0));
}

/**
 * Returns current minutes from midnight in campus timezone.
 */
function getCampusMinutesNow(referenceTime: Date = new Date()): number {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: CAMPUS_TIMEZONE,
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    }).formatToParts(referenceTime);
    const h = parseInt(parts.find((p) => p.type === "hour")?.value || "0", 10);
    const m = parseInt(parts.find((p) => p.type === "minute")?.value || "0", 10);
    return (h % 24) * 60 + m;
  } catch {
    return referenceTime.getHours() * 60 + referenceTime.getMinutes();
  }
}

/**
 * Checks if an event has already concluded based on its date and optional endTime.
 * If date < today, it's past.
 * If date == today, checks if current time > endTime (or > startTime + 3 hours if endTime is missing).
 */
export function isEventPast(
  dateStr: string,
  endTimeStr?: string | null,
  referenceTime: Date = new Date(),
  startTimeStr?: string | null
): boolean {
  try {
    const todayStr = formatLocalDate(referenceTime);
    if (dateStr < todayStr) return true;
    if (dateStr > todayStr) return false;

    // Same day: check end time in campus timezone
    const nowMinutes = getCampusMinutesNow(referenceTime);
    if (endTimeStr) {
      const endMinutes = parseTimeToMinutes(endTimeStr);
      if (!isNaN(endMinutes)) {
        return nowMinutes > endMinutes;
      }
    } else if (startTimeStr) {
      const startMinutes = parseTimeToMinutes(startTimeStr);
      if (!isNaN(startMinutes)) {
        return nowMinutes > startMinutes + 180;
      }
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Checks if an event starts within 24 hours from reference time (now).
 * Returns true if 0 <= (eventStart - now) <= 24 hours and the event has not concluded.
 */
export function isStartingSoon(
  dateStr: string,
  timeStr: string,
  referenceTime: Date = new Date(),
  endTimeStr?: string | null
): boolean {
  try {
    if (isEventPast(dateStr, endTimeStr, referenceTime, timeStr)) {
      return false;
    }

    const eventTime = getEventDateTime(dateStr, timeStr);
    const diffMs = eventTime.getTime() - referenceTime.getTime();
    const twentyFourHoursMs = 24 * 60 * 60 * 1000;
    // Starting within 24 hours, or happening right now (within 2 hours after start)
    return diffMs >= -2 * 60 * 60 * 1000 && diffMs <= twentyFourHoursMs;
  } catch {
    return false;
  }
}

/**
 * Categorizes an event's date relative to a reference time.
 * Returns: "TODAY" | "TOMORROW" | "THIS_WEEK" | "UPCOMING" | "PAST"
 */
export function getEventDateCategory(
  dateStr: string,
  referenceTime: Date = new Date(),
  endTimeStr?: string | null,
  startTimeStr?: string | null
): "TODAY" | "TOMORROW" | "THIS_WEEK" | "UPCOMING" | "PAST" {
  try {
    if (isEventPast(dateStr, endTimeStr, referenceTime, startTimeStr)) {
      return "PAST";
    }

    const [year, month, day] = dateStr.split("-").map(Number);
    const eventDate = new Date(year, month - 1, day);
    eventDate.setHours(0, 0, 0, 0);

    const today = new Date(referenceTime);
    today.setHours(0, 0, 0, 0);

    const diffDays = Math.round((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "PAST";
    if (diffDays === 0) return "TODAY";
    if (diffDays === 1) return "TOMORROW";
    if (diffDays <= 7) return "THIS_WEEK";
    return "UPCOMING";
  } catch {
    return "UPCOMING";
  }
}

/**
 * Generates an intuitive human-readable countdown string.
 * e.g., "Starting in 3 hours", "Starting in 45 mins", "Today · 10:00 AM", "Tomorrow · 2:00 PM", "Past event · Sep 4"
 */
export function getHumanCountdown(
  dateStr: string,
  timeStr: string,
  referenceTime: Date = new Date(),
  endTimeStr?: string | null
): string {
  try {
    if (isEventPast(dateStr, endTimeStr, referenceTime, timeStr)) {
      const [year, month, day] = dateStr.split("-").map(Number);
      const d = new Date(year, month - 1, day);
      const monthName = d.toLocaleString("en-US", { month: "short" });
      return `Past event · ${monthName} ${day}`;
    }

    const eventTime = getEventDateTime(dateStr, timeStr);
    const diffMs = eventTime.getTime() - referenceTime.getTime();

    if (diffMs < 0 && diffMs > -2 * 60 * 60 * 1000) {
      return "Happening now";
    }

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours >= 0 && diffHours < 1) {
      return `Starts in ${Math.max(1, diffMinutes)} mins`;
    }
    if (diffHours >= 1 && diffHours < 24) {
      return `Starts in ${diffHours} ${diffHours === 1 ? "hour" : "hours"}`;
    }

    const cat = getEventDateCategory(dateStr, referenceTime, endTimeStr, timeStr);
    if (cat === "TODAY") return `Today · ${timeStr}`;
    if (cat === "TOMORROW") return `Tomorrow · ${timeStr}`;

    const [year, month, day] = dateStr.split("-").map(Number);
    const d = new Date(year, month - 1, day);
    const monthName = d.toLocaleString("en-US", { month: "short" });
    return `${monthName} ${day} · ${timeStr}`;
  } catch {
    return `${dateStr} · ${timeStr}`;
  }
}

/**
 * Returns a friendly time-of-day greeting (e.g. "Good morning", "Good afternoon", "Good evening").
 */
export function getTimeGreeting(now: Date = new Date()): string {
  const hour = now.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
