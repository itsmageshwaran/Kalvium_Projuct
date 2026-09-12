import { parseTimeToMinutes } from "./clash";

/**
 * Formats a Date instance as YYYY-MM-DD in local time, avoiding UTC date shifts.
 */
export function formatLocalDate(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Builds a valid JS Date object from an event's date (YYYY-MM-DD) and startTime ("10:00 AM" or "10:00").
 */
export function getEventDateTime(dateStr: string, timeStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  const minutes = parseTimeToMinutes(timeStr);
  const validMinutes = isNaN(minutes) ? 0 : minutes;
  const hours = Math.floor(validMinutes / 60);
  const mins = validMinutes % 60;
  return new Date(year, month - 1, day, hours, mins, 0);
}

/**
 * Checks if an event starts within 24 hours from reference time (now).
 * Returns true if 0 <= (eventStart - now) <= 24 hours.
 */
export function isStartingSoon(dateStr: string, timeStr: string, referenceTime: Date = new Date()): boolean {
  try {
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
export function getEventDateCategory(dateStr: string, referenceTime: Date = new Date()): "TODAY" | "TOMORROW" | "THIS_WEEK" | "UPCOMING" | "PAST" {
  try {
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
 * e.g., "Starting in 3 hours", "Starting in 45 mins", "Today · 10:00 AM", "Tomorrow · 2:00 PM"
 */
export function getHumanCountdown(dateStr: string, timeStr: string, referenceTime: Date = new Date()): string {
  try {
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

    const cat = getEventDateCategory(dateStr, referenceTime);
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
