"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Clock,
  Calendar,
  MapPin,
  Flame,
  AlertTriangle,
  BookmarkX,
  Compass,
  ArrowRight,
  CalendarX2,
  Sparkles,
} from "lucide-react";
import CampusVerifiedBadge from "@/components/CampusVerifiedBadge";
import { useRouter } from "next/navigation";
import { useAuth, getDashboardRoute } from "@/context/AuthContext";
import { useToast } from "@/components/Toast";

export default function MySchedulePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { success } = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user && user.role?.toUpperCase() !== "STUDENT") {
      router.replace(getDashboardRoute(user.role));
    }
  }, [user, authLoading, router]);

  const fetchSchedule = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/saved", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to load schedule:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [user]);

  const handleUnsave = async (eventId: string) => {
    try {
      const res = await fetch("/api/saved/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });
      if (res.ok) {
        success("Event removed from your schedule.");
        fetchSchedule();
      }
    } catch (err) {
      console.error("Unsave error:", err);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-kalvium-coral border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="bg-white dark:bg-kalvium-dark-surface p-8 rounded-3xl border border-kalvium-border dark:border-kalvium-dark-border shadow-soft-sm">
          <Clock className="w-10 h-10 text-kalvium-coral mx-auto mb-3" />
          <h2 className="font-sans text-xl font-bold text-kalvium-text dark:text-kalvium-dark-text mb-2">My Schedule</h2>
          <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted mb-6">
            Please sign in to access your personal schedule and clash detector.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-kalvium-coral hover:bg-kalvium-coral-hover text-white text-xs font-semibold transition shadow-soft-xs"
          >
            Sign In to Account
          </Link>
        </div>
      </div>
    );
  }

  const conflictsCount = data?.conflictsCount || 0;
  const groups = data?.groups || { startingSoon: [], today: [], tomorrow: [], upcoming: [], past: [] };
  const totalSaved = data?.count || 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-kalvium-border dark:border-kalvium-dark-border">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-sans uppercase tracking-widest text-kalvium-text dark:text-kalvium-dark-text font-bold bg-kalvium-bg dark:bg-kalvium-dark-surface px-3 py-1 rounded-full border border-kalvium-border dark:border-kalvium-dark-border shadow-soft-xs">
              Personal Agenda
            </span>
            <span className="text-xs font-semibold text-kalvium-muted dark:text-kalvium-dark-muted">
              {totalSaved} {totalSaved === 1 ? "event saved" : "events saved"}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-kalvium-text dark:text-kalvium-dark-text tracking-tight">
            My Schedule
          </h1>
          <p className="text-xs sm:text-sm text-kalvium-muted dark:text-kalvium-dark-muted mt-1">
            Chronological calendar of verified campus events with automated clash detection.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-kalvium-coral hover:bg-kalvium-coral-hover text-white text-xs font-bold transition shadow-soft-xs active:scale-95"
          >
            <Compass size={15} />
            <span>Explore Events</span>
          </Link>
        </div>
      </div>

      {/* Conflicts Alert Banner if any clashes exist */}
      {conflictsCount > 0 && (
        <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border shadow-soft-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt text-kalvium-muted dark:text-kalvium-dark-muted border border-kalvium-border dark:border-kalvium-dark-border shrink-0">
              <AlertTriangle size={16} />
            </div>
            <div>
              <h3 className="font-sans text-sm font-bold text-kalvium-text dark:text-kalvium-dark-text">
                {conflictsCount} Schedule {conflictsCount === 1 ? "Conflict" : "Conflicts"} Detected
              </h3>
              <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted mt-0.5 leading-relaxed">
                You have saved events scheduled at overlapping times. Check the conflict notes on your cards below to avoid double-booking.
              </p>
            </div>
          </div>
          <span className="font-sans text-[10px] font-semibold uppercase tracking-wider text-kalvium-muted dark:text-kalvium-dark-muted bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt px-3 py-1 rounded-full border border-kalvium-border dark:border-kalvium-dark-border whitespace-nowrap self-start sm:self-auto">
            Action Recommended
          </span>
        </div>
      )}

      {loading ? (
        <div className="space-y-4 animate-fade-in py-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border h-28 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : totalSaved === 0 ? (
        <div className="bg-white dark:bg-kalvium-dark-surface py-16 text-center rounded-3xl p-8 max-w-xl mx-auto border border-kalvium-border dark:border-kalvium-dark-border shadow-soft-sm animate-fade-in">
          <CalendarX2 className="w-10 h-10 text-kalvium-muted dark:text-kalvium-dark-muted mx-auto mb-3" />
          <h3 className="font-sans text-base font-bold text-kalvium-text dark:text-kalvium-dark-text mb-1">Your schedule is clear</h3>
          <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted mb-6 max-w-sm mx-auto leading-relaxed">
            Save events from the discovery feed and they will appear here automatically, organized chronologically with instant clash detection.
          </p>
          <Link
            href="/events"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-kalvium-coral hover:bg-kalvium-coral-hover text-white text-xs font-bold transition shadow-soft-xs"
          >
            Explore Verified Events
          </Link>
        </div>
      ) : (
        <div className="space-y-10">
          {/* SECTION 1: STARTING SOON (<24h) */}
          {groups.startingSoon && groups.startingSoon.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-kalvium-border dark:border-kalvium-dark-border">
                <div className="flex items-center gap-2">
                  <Flame size={14} className="text-kalvium-muted dark:text-kalvium-dark-muted" />
                  <h2 className="font-sans text-xs font-bold uppercase tracking-widest text-kalvium-text dark:text-kalvium-dark-text">
                    Starting Soon
                  </h2>
                  <span className="text-[10px] font-semibold text-kalvium-muted dark:text-kalvium-dark-muted bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt px-2 py-0.5 rounded-full border border-kalvium-border dark:border-kalvium-dark-border">
                    {groups.startingSoon.length}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groups.startingSoon.map((event: any) => (
                  <ScheduleItemCard key={event.id} event={event} onUnsave={handleUnsave} isHighlight />
                ))}
              </div>
            </section>
          )}

          {/* SECTION 2: TODAY */}
          {groups.today && groups.today.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-kalvium-border dark:border-kalvium-dark-border">
                <div className="flex items-center gap-2">
                  <h2 className="font-sans text-xs font-bold uppercase tracking-widest text-kalvium-text dark:text-kalvium-dark-text">
                    Today
                  </h2>
                  <span className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted font-normal">
                    • {groups.today.length} {groups.today.length === 1 ? "event" : "events"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groups.today.map((event: any) => (
                  <ScheduleItemCard key={event.id} event={event} onUnsave={handleUnsave} />
                ))}
              </div>
            </section>
          )}

          {/* SECTION 3: TOMORROW */}
          {groups.tomorrow && groups.tomorrow.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-kalvium-border dark:border-kalvium-dark-border">
                <div className="flex items-center gap-2">
                  <h2 className="font-sans text-xs font-bold uppercase tracking-widest text-kalvium-text dark:text-kalvium-dark-text">
                    Tomorrow
                  </h2>
                  <span className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted font-normal">
                    • {groups.tomorrow.length} {groups.tomorrow.length === 1 ? "event" : "events"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groups.tomorrow.map((event: any) => (
                  <ScheduleItemCard key={event.id} event={event} onUnsave={handleUnsave} />
                ))}
              </div>
            </section>
          )}

          {/* SECTION 4: UPCOMING */}
          {groups.upcoming && groups.upcoming.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-kalvium-border dark:border-kalvium-dark-border">
                <div className="flex items-center gap-2">
                  <h2 className="font-sans text-xs font-bold uppercase tracking-widest text-kalvium-text dark:text-kalvium-dark-text">
                    Later &amp; Upcoming
                  </h2>
                  <span className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted font-normal">
                    • {groups.upcoming.length} {groups.upcoming.length === 1 ? "event" : "events"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groups.upcoming.map((event: any) => (
                  <ScheduleItemCard key={event.id} event={event} onUnsave={handleUnsave} />
                ))}
              </div>
            </section>
          )}

          {/* SECTION 5: PAST */}
          {groups.past && groups.past.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-kalvium-border dark:border-kalvium-dark-border">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-kalvium-muted dark:text-kalvium-dark-muted" />
                  <h2 className="font-sans text-xs font-bold uppercase tracking-widest text-kalvium-muted dark:text-kalvium-dark-muted">
                    Past Events
                  </h2>
                  <span className="text-[10px] font-semibold text-kalvium-muted dark:text-kalvium-dark-muted bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt px-2 py-0.5 rounded-full border border-kalvium-border dark:border-kalvium-dark-border">
                    {groups.past.length}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-60">
                {groups.past.map((event: any) => (
                  <ScheduleItemCard key={event.id} event={event} onUnsave={handleUnsave} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function ScheduleItemCard({
  event,
  onUnsave,
  isHighlight = false,
}: {
  event: any;
  onUnsave: (id: string) => void;
  isHighlight?: boolean;
}) {
  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl border bg-white dark:bg-kalvium-dark-surface border-kalvium-border dark:border-kalvium-dark-border transition-all duration-200 hover:-translate-y-0.5 shadow-soft-xs flex flex-col justify-between h-full group ${
        isHighlight
          ? "border-kalvium-border dark:border-kalvium-dark-border"
          : "hover:border-kalvium-border-hover dark:hover:border-kalvium-dark-muted/40"
      }`}
    >
      <div>
        {/* Top Badges & Remove Bookmark Button */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="rounded-full bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt px-2.5 py-0.5 text-[10px] font-medium text-kalvium-muted dark:text-kalvium-dark-muted border border-kalvium-border dark:border-kalvium-dark-border uppercase tracking-wider">
              {event.category}
            </span>
            {(event.isPast || event.dateCategory === "PAST") && (
              <span className="rounded-full bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt px-2 py-0.5 text-[10px] font-semibold text-kalvium-muted border border-kalvium-border dark:border-kalvium-dark-border uppercase tracking-wider">
                Past Event
              </span>
            )}
            <CampusVerifiedBadge size="sm" />
          </div>

          <button
            onClick={() => onUnsave(event.id)}
            className="flex items-center gap-1.5 text-kalvium-muted hover:text-kalvium-coral px-2.5 py-1 rounded-full hover:bg-kalvium-surface-alt dark:hover:bg-kalvium-dark-surface-alt transition active:scale-90"
            title="Remove from schedule"
            aria-label="Remove from schedule"
          >
            <BookmarkX size={14} />
            <span className="text-[10px] font-semibold uppercase tracking-wider">Remove</span>
          </button>
        </div>

        {/* Subtle Clash Alert Note */}
        {event.hasClash && event.conflictDetails && (
          <div className="mb-3 px-3 py-1.5 rounded-xl bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-kalvium-muted dark:text-kalvium-dark-muted min-w-0">
              <AlertTriangle size={12} className="text-kalvium-muted dark:text-kalvium-dark-muted shrink-0" />
              <span className="text-[11px] truncate">
                Overlaps with <span className="text-kalvium-text dark:text-kalvium-dark-text font-medium">{event.conflictDetails.conflictingEventTitle}</span> ({event.conflictDetails.overlapStr})
              </span>
            </div>
          </div>
        )}

        {/* Card Main: Content with Poster Thumbnail */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0 flex-1">
            <Link href={`/events/${event.id}`}>
              <h3 className="font-sans text-sm sm:text-base font-bold text-kalvium-text dark:text-kalvium-dark-text group-hover:text-kalvium-coral transition-colors line-clamp-2 leading-snug">
                {event.title}
              </h3>
            </Link>

            {/* Time badge */}
            <div className="flex items-center gap-1.5 text-xs text-kalvium-text dark:text-kalvium-dark-text font-medium mt-2">
              <Clock size={13} className="text-kalvium-muted dark:text-kalvium-dark-muted shrink-0" />
              <span>{event.startTime} – {event.endTime}</span>
              <span className="text-[11px] text-kalvium-muted dark:text-kalvium-dark-muted font-normal">
                • {event.countdown}
              </span>
            </div>

            {/* Location */}
            <div className="flex items-center gap-1.5 text-xs text-kalvium-muted dark:text-kalvium-dark-muted mt-1 truncate">
              <MapPin size={13} className="shrink-0" />
              <span className="truncate">{event.venue}</span>
            </div>
          </div>

          {/* Event Poster Thumbnail */}
          {event.posterUrl && (
            <Link href={`/events/${event.id}`} className="shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-kalvium-border dark:border-kalvium-dark-border bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt shadow-soft-xs">
                <img
                  src={event.posterUrl}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-kalvium-border dark:border-kalvium-dark-border flex items-center justify-between text-xs">
        <span className="text-[11px] text-kalvium-muted dark:text-kalvium-dark-muted truncate max-w-[200px]">
          Hosted by {event.organizerName || event.organizer?.name || "Campus Host"}
        </span>
        <Link
          href={`/events/${event.id}`}
          className="inline-flex items-center gap-1 font-semibold text-kalvium-text dark:text-kalvium-dark-text hover:text-kalvium-coral text-xs transition-colors"
        >
          <span>View Details</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}
