"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  X,
  Calendar,
  Clock,
  MapPin,
  User,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Flame,
  CheckCircle2,
} from "lucide-react";
import CampusVerifiedBadge from "./CampusVerifiedBadge";
import ClashWarningModal from "./ClashWarningModal";
import { useAuth } from "@/context/AuthContext";
import { isStartingSoon, getHumanCountdown } from "@/lib/time";
import { EventCardData } from "./EventCard";

interface EventDetailDrawerProps {
  event: EventCardData | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveToggle?: (eventId: string, isSaved: boolean) => void;
}

export default function EventDetailDrawer({
  event,
  isOpen,
  onClose,
  onSaveToggle,
}: EventDetailDrawerProps) {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [clashModalOpen, setClashModalOpen] = useState(false);
  const [clashData, setClashData] = useState<any>(null);

  useEffect(() => {
    if (event) {
      setIsSaved(Boolean(event.isSaved));
    }
  }, [event]);

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !clashModalOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, clashModalOpen, onClose]);

  if (!isOpen || !event) return null;

  const startingSoon = isStartingSoon(event.date, event.startTime);
  const countdownText = getHumanCountdown(event.date, event.startTime);

  const handleSaveClick = async () => {
    if (!user) {
      alert("Please sign in or select a demo user in the top bar to save events.");
      return;
    }

    if (isSaved) {
      executeToggle(false);
      return;
    }

    // Pre-check for clash
    setSaving(true);
    try {
      const res = await fetch("/api/saved/check-clash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: event.id }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.hasClash && data.conflictingEvent) {
          setClashData(data);
          setClashModalOpen(true);
          setSaving(false);
          return;
        }
      }

      await executeToggle(true);
    } catch (err) {
      console.error("Clash pre-check error:", err);
      await executeToggle(true);
    } finally {
      setSaving(false);
    }
  };

  const executeToggle = async (targetState: boolean) => {
    setSaving(true);
    try {
      const res = await fetch("/api/saved/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: event.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setIsSaved(data.saved);
        if (onSaveToggle) onSaveToggle(event.id, data.saved);
      }
    } catch (err) {
      console.error("Save toggle error:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/40 backdrop-blur-sm animate-fade-in">
        {/* Backdrop click to close */}
        <div className="absolute inset-0" onClick={onClose} />

        {/* Slide-over Drawer Panel */}
        <div className="relative w-full max-w-xl bg-white dark:bg-kalvium-dark-surface border-l border-kalvium-border dark:border-kalvium-dark-border shadow-2xl h-full flex flex-col z-10 animate-slide-left overflow-y-auto">
          {/* Top Bar */}
          <div className="sticky top-0 z-20 bg-white/95 dark:bg-kalvium-dark-surface/95 backdrop-blur-md px-6 py-4 border-b border-kalvium-border dark:border-kalvium-dark-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt text-kalvium-text dark:text-kalvium-dark-text border border-kalvium-border dark:border-kalvium-dark-border">
                {event.category}
              </span>
              <CampusVerifiedBadge size="sm" />
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-kalvium-muted hover:text-kalvium-text dark:hover:text-kalvium-dark-text hover:bg-kalvium-surface-alt dark:hover:bg-kalvium-dark-surface-alt transition-colors active:scale-90"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="p-6 space-y-6 flex-1">
            {/* Poster Media Box */}
            <div className="relative rounded-2xl overflow-hidden bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border shadow-sm group">
              <img
                src={event.posterUrl}
                alt={event.title}
                className="w-full h-auto object-cover max-h-[380px] transition-transform duration-500 ease-editorial group-hover:scale-[1.015]"
              />
              {startingSoon && (
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-kalvium-coral text-white flex items-center gap-1.5 shadow-md">
                    <Flame className="w-3.5 h-3.5 text-white fill-white" />
                    <span>Starting soon</span>
                  </span>
                </div>
              )}
            </div>

            {/* Event Title */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-kalvium-text dark:text-kalvium-dark-text tracking-tight leading-tight">
                {event.title}
              </h2>
              {event.summary && (
                <p className="text-sm text-kalvium-muted dark:text-kalvium-dark-muted mt-2 leading-relaxed font-normal">
                  {event.summary}
                </p>
              )}
            </div>

            {/* Core Metadata Grid */}
            <div className="space-y-3 py-4 border-y border-kalvium-border dark:border-kalvium-dark-border text-xs">
              <div className="flex items-start gap-3 text-kalvium-text dark:text-kalvium-dark-text">
                <Calendar className="w-4 h-4 text-kalvium-coral shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-kalvium-text dark:text-kalvium-dark-text">{countdownText}</p>
                  <p className="text-[11px] text-kalvium-muted dark:text-kalvium-dark-muted">Date: {event.date}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-kalvium-text dark:text-kalvium-dark-text">
                <Clock className="w-4 h-4 text-kalvium-muted shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-kalvium-text dark:text-kalvium-dark-text">{event.startTime} – {event.endTime}</p>
                  <p className="text-[11px] text-kalvium-muted dark:text-kalvium-dark-muted">Scheduled campus time</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-kalvium-text dark:text-kalvium-dark-text">
                <MapPin className="w-4 h-4 text-kalvium-muted shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-kalvium-text dark:text-kalvium-dark-text">{event.venue}</p>
                  <p className="text-[11px] text-kalvium-muted dark:text-kalvium-dark-muted">Campus location</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-kalvium-text dark:text-kalvium-dark-text">
                <User className="w-4 h-4 text-kalvium-muted shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-kalvium-text dark:text-kalvium-dark-text">
                    {event.organizerName || (event as any).organizer?.name || "Campus Host"}
                  </p>
                  <p className="text-[11px] text-kalvium-muted dark:text-kalvium-dark-muted">Official host</p>
                </div>
              </div>
            </div>

            {/* Primary Action Button: Save to Schedule */}
            <div>
              <button
                onClick={handleSaveClick}
                disabled={saving}
                className={`w-full py-3.5 px-5 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] shadow-xs ${
                  isSaved
                    ? "bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt text-kalvium-coral border border-kalvium-coral/30 hover:bg-kalvium-coral-tint"
                    : "bg-kalvium-coral hover:bg-kalvium-coral-hover text-white shadow-md shadow-kalvium-coral/25"
                }`}
              >
                {isSaved ? (
                  <>
                    <BookmarkCheck className="w-4 h-4 fill-kalvium-coral" />
                    <span>Saved to My Schedule (Click to Remove)</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4" />
                    <span>Save to My Schedule</span>
                  </>
                )}
              </button>
            </div>

            {/* Secondary Registration Link if available */}
            {event.registrationUrl &&
              event.registrationUrl !== "Not specified" &&
              (event.registrationUrl.startsWith("http://") ||
                event.registrationUrl.startsWith("https://")) && (
              <div>
                <a
                  href={event.registrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border hover:border-kalvium-coral/50 text-kalvium-text dark:text-kalvium-dark-text font-medium transition-all duration-200 active:scale-[0.99] group text-xs"
                >
                  <span className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-kalvium-coral" />
                    <span>Official Registration Portal</span>
                  </span>
                  <span className="text-xs text-kalvium-coral font-semibold">
                    Open link →
                  </span>
                </a>
              </div>
            )}

            {/* Human Verification Stamp Notice */}
            <div className="p-4 rounded-2xl bg-kalvium-success-tint dark:bg-kalvium-dark-success-tint border border-kalvium-success-border dark:border-emerald-900/40 text-xs text-kalvium-text dark:text-kalvium-dark-text space-y-1">
              <span className="text-xs font-semibold text-kalvium-success flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-kalvium-success" />
                Human Certified by Campus Leadership
              </span>
              <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted leading-relaxed">
                Extracted with AI and authenticated against original poster artwork by the campus manager.
              </p>
            </div>

            {/* Full Description */}
            {event.description && (
              <div className="space-y-2 pt-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-kalvium-muted dark:text-kalvium-dark-muted">
                  About this event
                </h3>
                <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted leading-relaxed whitespace-pre-line">
                  {event.description}
                </p>
              </div>
            )}

            {/* Tags */}
            {event.tags && (
              <div className="pt-2">
                <div className="flex flex-wrap gap-1.5">
                  {event.tags.split(",").map((t: string) => (
                    <span
                      key={t}
                      className="px-3 py-1 rounded-full text-xs bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt text-kalvium-muted dark:text-kalvium-dark-muted border border-kalvium-border dark:border-kalvium-dark-border font-medium"
                    >
                      #{t.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Deep link fallback */}
            <div className="pt-4 border-t border-kalvium-border dark:border-kalvium-dark-border text-center">
              <Link
                href={`/events/${event.id}`}
                className="text-xs text-kalvium-muted hover:text-kalvium-coral transition-colors font-medium"
              >
                Open dedicated permalink page ↗
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* In-drawer Clash Warning Dialog */}
      {clashData && (
        <ClashWarningModal
          isOpen={clashModalOpen}
          onClose={() => setClashModalOpen(false)}
          onConfirmSave={() => executeToggle(true)}
          conflictingEvent={clashData.conflictingEvent}
          currentEvent={{
            title: event.title,
            startTime: event.startTime,
            endTime: event.endTime,
            venue: event.venue,
            date: event.date,
          }}
          overlapStr={clashData.overlap?.formatted || "Direct Overlap"}
        />
      )}
    </>
  );
}
