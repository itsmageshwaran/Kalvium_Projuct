"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  Flame,
  AlertTriangle,
  Compass,
  ArrowRight,
  ShieldCheck,
  Bookmark,
} from "lucide-react";
import CampusVerifiedBadge from "@/components/CampusVerifiedBadge";
import { useAuth } from "@/context/AuthContext";

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/saved", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <p className="text-kalvium-muted dark:text-kalvium-dark-muted mb-4">Please log in to view your student dashboard.</p>
        <Link href="/login" className="px-5 py-2.5 bg-kalvium-coral hover:bg-kalvium-coral-hover text-white rounded-full text-xs font-bold shadow-sm transition">
          Sign In
        </Link>
      </div>
    );
  }

  const conflictsCount = data?.conflictsCount || 0;
  const savedEvents = data?.events || [];
  const startingSoonEvent = savedEvents.find((e: any) => e.isStartingSoon);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Hero Welcome */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-sans uppercase tracking-widest text-kalvium-coral font-bold bg-kalvium-bg dark:bg-kalvium-dark-surface px-3 py-1 rounded-full border border-kalvium-border dark:border-kalvium-dark-border shadow-soft-xs">
            Student Portal
          </span>
          <CampusVerifiedBadge size="sm" />
        </div>
        <h1 className="text-3xl sm:text-5xl font-display font-bold text-kalvium-text dark:text-kalvium-dark-text tracking-tight">
          Good morning, {user.name.split(" ")[0]}
        </h1>
        <p className="text-base text-kalvium-muted dark:text-kalvium-dark-muted mt-2">
          Here's what's happening on your campus today.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
        <div className="p-5 rounded-2xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border shadow-kalvium-sm transition-all duration-300 hover:-translate-y-0.5 animate-slide-up stagger-1">
          <span className="text-[11px] font-sans text-kalvium-muted dark:text-kalvium-dark-muted uppercase tracking-wider font-semibold block mb-1">
            SAVED EVENTS
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-display font-bold text-kalvium-text dark:text-kalvium-dark-text">{savedEvents.length}</span>
            <span className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted">on personal schedule</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border shadow-kalvium-sm transition-all duration-300 hover:-translate-y-0.5 animate-slide-up stagger-2">
          <span className="text-[11px] font-sans text-kalvium-muted dark:text-kalvium-dark-muted uppercase tracking-wider font-semibold block mb-1">
            STARTING SOON
          </span>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-4xl font-display font-bold ${
                savedEvents.filter((e: any) => e.isStartingSoon).length > 0
                  ? "text-kalvium-coral"
                  : "text-kalvium-text dark:text-kalvium-dark-text"
              }`}
            >
              {savedEvents.filter((e: any) => e.isStartingSoon).length}
            </span>
            <span className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted">within 24 hours</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border hover:border-kalvium-coral/30 shadow-kalvium-sm transition-all duration-300 hover:-translate-y-0.5 animate-slide-up stagger-3">
          <span className="text-[11px] font-sans uppercase tracking-wider font-semibold block mb-1 text-kalvium-muted dark:text-kalvium-dark-muted">
            SCHEDULE CONFLICTS
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-display font-bold text-kalvium-text dark:text-kalvium-dark-text">
              {conflictsCount}
            </span>
            <span className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted">
              {conflictsCount === 1 ? "overlapping clash" : "overlapping clashes"}
            </span>
          </div>
          {conflictsCount > 0 && (
            <Link
              href="/schedule"
              className="inline-flex items-center gap-1 text-xs font-bold text-kalvium-coral hover:underline mt-2 transition-colors"
            >
              <span>Review your saved events →</span>
            </Link>
          )}
        </div>
      </div>

      {/* Starting Soon Spotlight Card if applicable */}
      {startingSoonEvent && (
        <div className="mb-10 p-6 rounded-3xl bg-kalvium-coral-tint dark:bg-kalvium-dark-surface border border-kalvium-coral/30 dark:border-kalvium-coral/40 shadow-kalvium-sm relative overflow-hidden animate-scale-in">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-kalvium-coral text-white flex items-center gap-1.5 shadow-sm">
              <Flame className="w-3.5 h-3.5 text-white" />
              <span>STARTING SOON SPOTLIGHT</span>
            </span>
            <CampusVerifiedBadge size="sm" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-2">
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-kalvium-text dark:text-kalvium-dark-text tracking-tight">
                {startingSoonEvent.title}
              </h2>
              <div className="flex items-center gap-4 text-xs text-kalvium-text dark:text-kalvium-dark-text font-medium flex-wrap">
                <span className="text-kalvium-coral font-bold">{startingSoonEvent.countdown}</span>
                <span>•</span>
                <span>{startingSoonEvent.startTime} – {startingSoonEvent.endTime}</span>
                <span>•</span>
                <span>{startingSoonEvent.venue}</span>
              </div>
              <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted line-clamp-2 mt-2">
                {startingSoonEvent.summary}
              </p>
            </div>

            <div className="lg:col-span-4 flex justify-start lg:justify-end">
              <Link
                href={`/events/${startingSoonEvent.id}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-kalvium-coral hover:bg-kalvium-coral-hover text-white text-xs font-bold shadow-sm transition-all duration-200 active:scale-95"
              >
                <span>View Event Details</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Two Column Layout: Upcoming Agenda vs Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Your Upcoming Events */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-display font-bold uppercase tracking-wider text-kalvium-text dark:text-kalvium-dark-text">
              Your Upcoming Saved Events
            </h2>
            <Link
              href="/schedule"
              className="text-xs font-bold text-kalvium-coral hover:underline"
            >
              Full Schedule View →
            </Link>
          </div>

          {savedEvents.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border text-center shadow-kalvium-sm">
              <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted mb-3">You haven't saved any events yet.</p>
              <Link
                href="/events"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-kalvium-coral hover:bg-kalvium-coral-hover text-white text-xs font-bold shadow-sm"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Explore Events</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {savedEvents.slice(0, 5).map((ev: any, idx: number) => (
                <div
                  key={ev.id}
                  className="group p-4 rounded-xl border border-kalvium-border dark:border-kalvium-dark-border bg-white dark:bg-kalvium-dark-surface hover:border-kalvium-coral/40 dark:hover:border-kalvium-coral/40 flex items-center justify-between gap-4 transition-all duration-200 hover:-translate-y-0.5 shadow-kalvium-sm animate-slide-up"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-[10px] font-sans uppercase bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt text-kalvium-coral px-2.5 py-0.5 rounded-full border border-kalvium-border dark:border-kalvium-dark-border font-semibold">
                        {ev.category}
                      </span>
                      {ev.hasClash && (
                        <span className="text-[10px] font-medium text-kalvium-muted dark:text-kalvium-dark-muted bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-kalvium-muted dark:text-kalvium-dark-muted" />
                          <span>Schedule Conflict</span>
                        </span>
                      )}
                    </div>
                    <Link href={`/events/${ev.id}`}>
                      <h4 className="text-sm font-bold text-kalvium-text dark:text-kalvium-dark-text group-hover:text-kalvium-coral transition-colors truncate">
                        {ev.title}
                      </h4>
                    </Link>
                    <div className="flex items-center gap-3 text-[11px] text-kalvium-muted dark:text-kalvium-dark-muted mt-1">
                      <span>{ev.countdown}</span>
                      <span>•</span>
                      <span>{ev.venue}</span>
                    </div>
                  </div>

                  <Link
                    href={`/events/${ev.id}`}
                    aria-label={`View ${ev.title}`}
                    className="p-2 rounded-full bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt hover:bg-kalvium-coral hover:text-white text-kalvium-text dark:text-kalvium-dark-text shrink-0 transition-all duration-200 active:scale-95 group-hover:translate-x-0.5"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Quick Discovery & Tips */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Actions & Navigation Shortcuts Widget */}
          <div className="p-5 rounded-2xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border space-y-4 shadow-kalvium-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-sans uppercase tracking-wider text-kalvium-text dark:text-kalvium-dark-text font-bold">
                Quick Actions
              </h3>
              <span className="text-[11px] text-kalvium-muted dark:text-kalvium-dark-muted">Shortcuts</span>
            </div>
            <div className="space-y-2">
              <Link
                href="/schedule"
                className="flex items-center justify-between p-3 rounded-xl bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt hover:border-kalvium-coral/40 border border-kalvium-border dark:border-kalvium-dark-border transition-all text-xs font-medium text-kalvium-text dark:text-kalvium-dark-text group"
              >
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-kalvium-coral" />
                  <span>My Calendar Schedule</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-kalvium-muted group-hover:text-kalvium-coral group-hover:translate-x-0.5 transition-all" />
              </Link>
              <Link
                href="/events"
                className="flex items-center justify-between p-3 rounded-xl bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt hover:border-kalvium-coral/40 border border-kalvium-border dark:border-kalvium-dark-border transition-all text-xs font-medium text-kalvium-text dark:text-kalvium-dark-text group"
              >
                <div className="flex items-center gap-2.5">
                  <Compass className="w-4 h-4 text-kalvium-coral" />
                  <span>Discover Verified Events</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-kalvium-muted group-hover:text-kalvium-coral group-hover:translate-x-0.5 transition-all" />
              </Link>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border space-y-3 shadow-kalvium-sm hover:border-kalvium-coral/30 dark:hover:border-kalvium-coral/30 transition-colors">
            <h3 className="text-xs font-bold text-kalvium-coral">Need to find more events?</h3>
            <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted leading-relaxed">
              Discover hackathons, workshops, music nights, and athletic tournaments happening this week.
            </p>
            <Link
              href="/events"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-kalvium-coral hover:underline"
            >
              <span>Browse All Events →</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
