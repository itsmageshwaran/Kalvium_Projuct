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

    // Same day: check end time
    if (endTimeStr) {
      const endMinutes = parseTimeToMinutes(endTimeStr);
      if (!isNaN(endMinutes)) {
        const nowMinutes = referenceTime.getHours() * 60 + referenceTime.getMinutes();
        return nowMinutes > endMinutes;
      }
    } else if (startTimeStr) {
      const startMinutes = parseTimeToMinutes(startTimeStr);
      if (!isNaN(startMinutes)) {
        const nowMinutes = referenceTime.getHours() * 60 + referenceTime.getMinutes();
        // Fallback: 3 hours after start time
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
