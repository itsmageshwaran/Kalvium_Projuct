"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Calendar, Clock, MapPin, Bookmark, BookmarkCheck, ArrowUpRight, Flame } from "lucide-react";
import CampusVerifiedBadge from "./CampusVerifiedBadge";
import ClashWarningModal from "./ClashWarningModal";
import TiltCard from "./TiltCard";
import { useAuth } from "@/context/AuthContext";
import { isStartingSoon, getHumanCountdown } from "@/lib/time";

export interface EventCardData {
  id: string;
  title: string;
  summary: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  organizerName?: string | null;
  posterUrl: string;
  category: string;
  status: string;
  isSaved?: boolean;
  description?: string;
  tags?: string;
  registrationUrl?: string | null;
  contactInfo?: string | null;
  organizer?: {
    name: string;
    avatar?: string | null;
  };
}

interface EventCardProps {
  event: EventCardData;
  onSaveToggle?: (eventId: string, saved: boolean) => void;
  onSelectEvent?: (event: EventCardData) => void;
  index?: number;
}

export default function EventCard({
  event,
  onSaveToggle,
  onSelectEvent,
  index = 0,
}: EventCardProps) {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(event.isSaved || false);
  const [saving, setSaving] = useState(false);
  const [clashModalOpen, setClashModalOpen] = useState(false);
  const [clashData, setClashData] = useState<any>(null);

  const startingSoon = isStartingSoon(event.date, event.startTime);
  const countdownText = getHumanCountdown(event.date, event.startTime);

  const handleSaveClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      alert("Please sign in or select a demo role in the top bar to save events.");
      return;
    }

    if (isSaved) {
      executeToggle(false);
      return;
    }

    // Pre-check for clash before saving
    setSaving(true);
    try {
      const clashRes = await fetch("/api/saved/check-clash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: event.id }),
      });

      if (clashRes.ok) {
        const data = await clashRes.json();
        if (data.hasClash && data.conflictingEvent) {
          setClashData(data);
          setClashModalOpen(true);
          setSaving(false);
          return;
        }
      }

      await executeToggle(true);
    } catch (err) {
      console.error("Save error:", err);
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
      <TiltCard maxTilt={3} className="h-full">
        <div className="group relative flex flex-col h-full rounded-2xl sm:rounded-3xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border shadow-kalvium hover:shadow-kalvium-md transition-all duration-300 overflow-hidden">
          {/* Poster Box */}
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt">
            <img
              src={event.posterUrl}
              alt={event.title}
              className="w-full h-full object-cover object-center transition-transform duration-500 ease-editorial group-hover:scale-105 will-change-transform"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70" />

            {/* Category & Status Pills */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap z-10">
              <span className="rounded-full bg-white/95 dark:bg-kalvium-dark-surface/95 px-3 py-0.5 text-[11px] font-medium text-kalvium-text dark:text-kalvium-dark-text backdrop-blur-sm border border-kalvium-border dark:border-kalvium-dark-border shadow-xs">
                {event.category}
              </span>

              {startingSoon && (
                <span className="rounded-full bg-kalvium-coral px-2.5 py-0.5 text-[11px] font-semibold text-white flex items-center gap-1 shadow-xs">
                  <Flame size={12} className="text-white fill-white" />
                  <span>Starting soon</span>
                </span>
              )}
            </div>

            {/* Quick Bookmark Save Button */}
            <button
              onClick={handleSaveClick}
              disabled={saving}
              className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all duration-200 active:scale-90 hover:scale-105 z-10 ${
                isSaved
                  ? "bg-kalvium-coral text-white shadow-md shadow-kalvium-coral/30"
                  : "bg-white/90 dark:bg-kalvium-dark-surface/90 text-kalvium-text dark:text-kalvium-dark-text hover:text-kalvium-coral border border-kalvium-border dark:border-kalvium-dark-border shadow-xs"
              }`}
              title={isSaved ? "Remove from Schedule" : "Save to Schedule"}
            >
              {isSaved ? (
                <BookmarkCheck size={16} className="fill-white" />
              ) : (
                <Bookmark size={16} />
              )}
            </button>

            {/* Verified Badge on Poster */}
            {event.status === "APPROVED" && (
              <div className="absolute bottom-3 left-3 z-10">
                <CampusVerifiedBadge size="sm" />
              </div>
            )}
          </div>

          {/* Body */}
          <div className="p-5 flex-1 flex flex-col justify-between">
            <div>
              {onSelectEvent ? (
                <button
                  type="button"
                  onClick={() => onSelectEvent(event)}
                  className="text-left w-full focus:outline-none"
                >
                  <h3 className="font-display text-lg font-bold text-kalvium-text dark:text-kalvium-dark-text leading-snug group-hover:text-kalvium-coral transition-colors duration-200 line-clamp-1 mb-2.5 tracking-tight">
                    {event.title}
                  </h3>
                </button>
              ) : (
                <Link href={`/events/${event.id}`}>
                  <h3 className="font-display text-lg font-bold text-kalvium-text dark:text-kalvium-dark-text leading-snug group-hover:text-kalvium-coral transition-colors duration-200 line-clamp-1 mb-2.5 tracking-tight">
                    {event.title}
                  </h3>
                </Link>
              )}

              {/* Metadata */}
              <div className="space-y-1.5 mb-3 text-xs text-kalvium-muted dark:text-kalvium-dark-muted">
                <div className="flex items-center gap-2 font-medium text-kalvium-text dark:text-kalvium-dark-text">
                  <Calendar size={13} className="text-kalvium-coral shrink-0" />
                  <span>{countdownText}</span>
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

              <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted line-clamp-2 leading-relaxed mb-4 font-normal">
                {event.summary}
              </p>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-kalvium-border dark:border-kalvium-dark-border flex items-center justify-between text-xs">
              <div className="truncate max-w-[170px]">
                <span className="text-[10px] text-kalvium-muted dark:text-kalvium-dark-muted block uppercase tracking-wider font-semibold">Organized by</span>
                <span className="text-kalvium-text dark:text-kalvium-dark-text text-xs font-medium truncate block">
                  {event.organizerName || event.organizer?.name || "Campus Club"}
                </span>
              </div>

              {onSelectEvent ? (
                <button
                  type="button"
                  onClick={() => onSelectEvent(event)}
                  className="inline-flex items-center gap-1 font-semibold text-kalvium-coral hover:text-kalvium-coral-hover py-1 px-3 rounded-full hover:bg-kalvium-coral-tint dark:hover:bg-kalvium-dark-coral-tint transition active:scale-95"
                >
                  <span>Details</span>
                  <ArrowUpRight size={14} />
                </button>
              ) : (
                <Link
                  href={`/events/${event.id}`}
                  className="inline-flex items-center gap-1 font-semibold text-kalvium-coral hover:text-kalvium-coral-hover py-1 px-3 rounded-full hover:bg-kalvium-coral-tint dark:hover:bg-kalvium-dark-coral-tint transition active:scale-95"
                >
                  <span>Details</span>
                  <ArrowUpRight size={14} />
                </Link>
              )}
            </div>
          </div>
        </div>
      </TiltCard>

      {/* Clash Warning Dialog */}
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
