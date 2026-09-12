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
  ArrowUpRight,
  CalendarX2,
} from "lucide-react";
import CampusVerifiedBadge from "@/components/CampusVerifiedBadge";
import TiltCard from "@/components/TiltCard";
import StaggerGrid from "@/components/StaggerGrid";
import { useAuth } from "@/context/AuthContext";

export default function MySchedulePage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
        fetchSchedule();
      }
    } catch (err) {
      console.error("Unsave error:", err);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="bg-white dark:bg-kalvium-dark-surface p-8 rounded-3xl border border-kalvium-border dark:border-kalvium-dark-border shadow-kalvium-md">
          <Clock className="w-10 h-10 text-kalvium-coral mx-auto mb-3" />
          <h2 className="font-display text-xl font-bold text-kalvium-text dark:text-kalvium-dark-text mb-2">My Schedule</h2>
          <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted mb-6">
            Please sign in or select a demo role in the top evaluation bar to access your personal schedule and clash detector.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-kalvium-coral hover:bg-kalvium-coral-hover text-white text-xs font-semibold transition shadow-sm"
          >
            Sign In to Account
          </Link>
        </div>
      </div>
    );
  }

  const conflictsCount = data?.conflictsCount || 0;
  const groups = data?.groups || { startingSoon: [], today: [], tomorrow: [], upcoming: [] };
  const totalSaved = data?.count || 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <span className="text-xs font-sans uppercase tracking-widest text-kalvium-coral font-bold bg-kalvium-coral-tint dark:bg-kalvium-dark-coral-tint px-3 py-1 rounded-full border border-kalvium-coral/20">
            Personal Agenda
          </span>
          <h1 className="font-display text-display-lg font-bold text-kalvium-text dark:text-kalvium-dark-text tracking-tight mt-2">
            My schedule.
          </h1>
          <p className="text-sm text-kalvium-muted dark:text-kalvium-dark-muted mt-1">
            Chronological calendar of verified campus events with instant clash detection.
          </p>
        </div>

        <Link
          href="/events"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border hover:border-kalvium-coral text-xs font-semibold text-kalvium-text dark:text-kalvium-dark-text transition shrink-0 self-start sm:self-auto shadow-xs"
        >
          <Compass size={16} className="text-kalvium-coral" />
          <span>+ Add Events</span>
        </Link>
      </div>

      {/* Conflicts Alert Banner if any clashes exist */}
      {conflictsCount > 0 && (
        <div className="mb-10 p-5 rounded-3xl bg-kalvium-warning-tint dark:bg-kalvium-dark-warning-tint border border-kalvium-warning-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-kalvium-sm animate-scale-in">
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-kalvium-warning-tint text-kalvium-warning border border-kalvium-warning-border shrink-0">
              <AlertTriangle size={20} className="animate-pulse" />
            </div>
            <div>
              <h3 className="font-display text-sm font-bold text-kalvium-warning">
                {conflictsCount} Schedule {conflictsCount === 1 ? "Conflict" : "Conflicts"} Detected
              </h3>
              <p className="text-xs text-kalvium-text dark:text-kalvium-dark-text mt-1">
                You have saved multiple overlapping events. Check the clash indicators below to avoid double-booking.
              </p>
            </div>
          </div>
          <span className="font-sans text-xs font-bold uppercase tracking-wider text-kalvium-warning bg-kalvium-warning/15 px-3 py-1 rounded-full border border-kalvium-warning-border whitespace-nowrap self-start sm:self-auto">
            Action Recommended
          </span>
        </div>
      )}

      {loading ? (
        <div className="space-y-4 animate-fade-in">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border h-28 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : totalSaved === 0 ? (
        <div className="bg-white dark:bg-kalvium-dark-surface py-20 text-center rounded-3xl p-8 max-w-xl mx-auto border border-kalvium-border dark:border-kalvium-dark-border shadow-kalvium-sm animate-fade-in">
          <CalendarX2 className="w-10 h-10 text-kalvium-muted mx-auto mb-3" />
          <h3 className="font-display text-lg font-bold text-kalvium-text dark:text-kalvium-dark-text mb-1">Nothing saved yet</h3>
          <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted mb-6 max-w-sm mx-auto">
            Save an event from the discovery page and it will show up here, grouped chronologically with automatic clash warnings.
          </p>
          <Link
            href="/events"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-kalvium-coral hover:bg-kalvium-coral-hover text-white text-xs font-semibold transition shadow-sm"
          >
            Explore Verified Events
          </Link>
        </div>
      ) : (
        <div className="space-y-12">
          {/* SECTION 1: STARTING SOON (<24h) */}
          {groups.startingSoon.length > 0 && (
            <section className="space-y-4">
              <div className="sticky top-20 z-10 -mx-4 bg-kalvium-bg/90 dark:bg-kalvium-dark-bg/90 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8 border-b border-kalvium-border dark:border-kalvium-dark-border flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Flame size={16} className="text-kalvium-coral fill-kalvium-coral animate-pulse" />
                  <h2 className="font-display text-lg font-bold text-kalvium-text dark:text-kalvium-dark-text">Starting Soon</h2>
                </div>
                <span className="text-xs font-sans text-kalvium-coral font-bold uppercase tracking-wider">{groups.startingSoon.length} events</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groups.startingSoon.map((event: any) => (
                  <ScheduleItemCard key={event.id} event={event} onUnsave={handleUnsave} isHighlight />
                ))}
              </div>
            </section>
          )}

          {/* SECTION 2: TODAY */}
          {groups.today.length > 0 && (
            <section className="space-y-4">
              <div className="sticky top-20 z-10 -mx-4 bg-kalvium-bg/90 dark:bg-kalvium-dark-bg/90 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8 border-b border-kalvium-border dark:border-kalvium-dark-border flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-kalvium-coral" />
                  <h2 className="font-display text-lg font-bold text-kalvium-text dark:text-kalvium-dark-text">Today</h2>
                </div>
                <span className="text-xs font-sans text-kalvium-muted font-semibold">({groups.today.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groups.today.map((event: any) => (
                  <ScheduleItemCard key={event.id} event={event} onUnsave={handleUnsave} />
                ))}
              </div>
            </section>
          )}

          {/* SECTION 3: TOMORROW */}
          {groups.tomorrow.length > 0 && (
            <section className="space-y-4">
              <div className="sticky top-20 z-10 -mx-4 bg-kalvium-bg/90 dark:bg-kalvium-dark-bg/90 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8 border-b border-kalvium-border dark:border-kalvium-dark-border flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-kalvium-success" />
                  <h2 className="font-display text-lg font-bold text-kalvium-text dark:text-kalvium-dark-text">Tomorrow</h2>
                </div>
                <span className="text-xs font-sans text-kalvium-muted font-semibold">({groups.tomorrow.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groups.tomorrow.map((event: any) => (
                  <ScheduleItemCard key={event.id} event={event} onUnsave={handleUnsave} />
                ))}
              </div>
            </section>
          )}

          {/* SECTION 4: UPCOMING */}
          {groups.upcoming.length > 0 && (
            <section className="space-y-4">
              <div className="sticky top-20 z-10 -mx-4 bg-kalvium-bg/90 dark:bg-kalvium-dark-bg/90 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8 border-b border-kalvium-border dark:border-kalvium-dark-border flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-kalvium-muted" />
                  <h2 className="font-display text-lg font-bold text-kalvium-text dark:text-kalvium-dark-text">Later & Upcoming</h2>
                </div>
                <span className="text-xs font-sans text-kalvium-muted font-semibold">({groups.upcoming.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groups.upcoming.map((event: any) => (
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
    <TiltCard maxTilt={3} className="h-full">
      <div
        className={`p-5 rounded-3xl border transition-all duration-300 relative flex flex-col justify-between h-full group ${
          event.hasClash
            ? "border-kalvium-warning/40 bg-kalvium-warning-tint/20 dark:bg-kalvium-dark-warning-tint/20 shadow-kalvium-sm"
            : isHighlight
            ? "border-kalvium-coral/30 bg-white dark:bg-kalvium-dark-surface shadow-kalvium-sm"
            : "border-kalvium-border dark:border-kalvium-dark-border bg-white dark:bg-kalvium-dark-surface hover:border-kalvium-coral/40 shadow-kalvium-sm"
        }`}
      >
        <div>
          {/* Top Badges & Clash Alert */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-full bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt px-2.5 py-0.5 text-[10px] font-medium text-kalvium-text dark:text-kalvium-dark-text border border-kalvium-border dark:border-kalvium-dark-border">
                {event.category}
              </span>
              <CampusVerifiedBadge size="sm" />
            </div>

            <button
              onClick={() => onUnsave(event.id)}
              className="text-kalvium-muted hover:text-kalvium-coral p-1.5 rounded-full hover:bg-kalvium-surface-alt dark:hover:bg-kalvium-dark-surface-alt transition active:scale-90"
              title="Remove from schedule"
            >
              <BookmarkX size={16} />
            </button>
          </div>

          {/* Clash Banner if conflicting */}
          {event.hasClash && event.conflictDetails && (
            <div className="mb-3 p-3 rounded-2xl bg-kalvium-warning-tint dark:bg-kalvium-dark-warning-tint border border-kalvium-warning-border text-xs animate-scale-in">
              <div className="flex items-center gap-1.5 font-bold text-kalvium-warning mb-0.5">
                <AlertTriangle size={14} className="animate-pulse" />
                <span>SCHEDULE CLASH</span>
              </div>
              <p className="text-[11px] text-kalvium-text dark:text-kalvium-dark-text">
                Overlaps with: <span className="font-semibold">{event.conflictDetails.conflictingEventTitle}</span> ({event.conflictDetails.overlapStr})
              </p>
            </div>
          )}

          {/* Title */}
          <Link href={`/events/${event.id}`}>
            <h3 className="font-display text-base font-bold text-kalvium-text dark:text-kalvium-dark-text group-hover:text-kalvium-coral transition-colors line-clamp-1 mb-2">
              {event.title}
            </h3>
          </Link>

          {/* Date & Location */}
          <div className="space-y-1 text-xs text-kalvium-muted dark:text-kalvium-dark-muted mb-3">
            <div className="flex items-center gap-2 font-medium text-kalvium-text dark:text-kalvium-dark-text">
              <Calendar size={13} className="text-kalvium-coral shrink-0" />
              <span>{event.countdown}</span>
              <span className="text-kalvium-muted font-sans">({event.date})</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={13} className="text-kalvium-muted shrink-0" />
              <span>{event.startTime} – {event.endTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={13} className="text-kalvium-muted shrink-0" />
              <span className="truncate">{event.venue}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-kalvium-border dark:border-kalvium-dark-border flex items-center justify-between text-xs">
          <span className="text-[11px] text-kalvium-muted font-medium truncate max-w-[200px]">
            By {event.organizerName || event.organizer?.name || "Campus Club"}
          </span>
          <Link
            href={`/events/${event.id}`}
            className="inline-flex items-center gap-1 font-semibold text-kalvium-coral hover:text-kalvium-coral-hover"
          >
            <span>View</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </TiltCard>
  );
}
