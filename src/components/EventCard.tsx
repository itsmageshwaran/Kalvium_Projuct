"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Calendar, Clock, MapPin, Bookmark, BookmarkCheck, ArrowUpRight, Flame } from "lucide-react";
import CampusVerifiedBadge from "./CampusVerifiedBadge";
import ClashWarningModal from "./ClashWarningModal";
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
      <div className="card-bauhaus group relative flex flex-col h-full overflow-hidden border-4 border-black hover:shadow-[8px_8px_0px_0px_#E5391F] hover:-translate-y-1 transition-all duration-300">
        {/* Geometric Corner Decoration */}
        <div className="absolute top-2 right-2 z-20 flex gap-1">
          <div className="w-4 h-4 rounded-full bg-[#E5391F] border-2 border-black group-hover:scale-125 transition-transform" />
          <div className="w-4 h-4 rounded-none bg-black border-2 border-black" />
          <div className="w-4 h-4 bg-white border-2 border-black" style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }} />
        </div>

        {/* Poster Box */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-black border-b-4 border-black">
          <img
            src={event.posterUrl}
            alt={event.title}
            className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />

          {/* Category & Status Pills */}
          <div className="absolute top-3 left-3 flex flex-col items-start gap-2 z-10">
            <span className="badge-bauhaus px-2 py-1 bg-white text-black text-xs font-bold uppercase tracking-widest border-2 border-black">
              {event.category}
            </span>

            {startingSoon && (
              <span className="badge-bauhaus px-2 py-1 bg-[#E5391F] text-white text-xs font-bold uppercase tracking-widest border-2 border-black flex items-center">
                <Flame size={14} className="mr-1" strokeWidth={3} />
                SOON
              </span>
            )}
          </div>

          {/* Verified Badge on Poster */}
          {event.status === "APPROVED" && (
            <div className="absolute bottom-3 left-3 z-10">
              <CampusVerifiedBadge size="sm" />
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-6 flex-1 flex flex-col justify-between bg-white group-hover:bg-[#F7F7F5] transition-colors duration-300">
          <div>
            {/* Quick Bookmark Save Button */}
            <div className="flex justify-between items-start gap-4 mb-4">
              {onSelectEvent ? (
                <button
                  type="button"
                  onClick={() => onSelectEvent(event)}
                  className="text-left flex-1 focus:outline-none"
                >
                  <h3 className="font-display text-2xl font-black text-black leading-none uppercase tracking-tighter hover:text-[#E5391F] transition-colors">
                    {event.title}
                  </h3>
                </button>
              ) : (
                <Link href={`/events/${event.id}`} className="flex-1">
                  <h3 className="font-display text-2xl font-black text-black leading-none uppercase tracking-tighter hover:text-[#E5391F] transition-colors">
                    {event.title}
                  </h3>
                </Link>
              )}

              <button
                onClick={handleSaveClick}
                disabled={saving}
                className={`flex-shrink-0 p-2 border-2 border-black rounded-none transition-all active:translate-x-1 active:translate-y-1 ${isSaved
                    ? "bg-[#E5391F] text-white shadow-[2px_2px_0px_0px_black]"
                    : "bg-white text-black hover:bg-[#E5391F] hover:text-white shadow-[2px_2px_0px_0px_black]"
                  }`}
                title={isSaved ? "Remove from Schedule" : "Save to Schedule"}
              >
                {isSaved ? (
                  <BookmarkCheck size={20} strokeWidth={3} />
                ) : (
                  <Bookmark size={20} strokeWidth={3} />
                )}
              </button>
            </div>

            {/* Metadata */}
            <div className="space-y-2 mb-4 text-sm font-bold uppercase tracking-wider text-black border-l-4 border-[#E5391F] pl-3 py-1">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-[#E5391F] stroke-[3]" />
                <span>{countdownText}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-black stroke-[3]" />
                <span>{event.startTime} – {event.endTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-black stroke-[3]" />
                <span className="truncate">{event.venue}</span>
              </div>
            </div>

            <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed mb-6 font-medium">
              {event.summary}
            </p>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t-4 border-black flex items-center justify-between">
            <div className="truncate max-w-[170px]">
              <span className="text-[10px] text-[#E5391F] block uppercase tracking-widest font-black">Organized by</span>
              <span className="text-black text-sm font-bold uppercase truncate block">
                {event.organizerName || event.organizer?.name || "Campus Club"}
              </span>
            </div>

            {onSelectEvent ? (
              <button
                type="button"
                onClick={() => onSelectEvent(event)}
                className="bg-black text-white px-3 py-2 text-xs font-bold uppercase flex items-center gap-1 hover:bg-[#E5391F] transition-colors"
              >
                <span>Details</span>
                <ArrowUpRight size={16} strokeWidth={3} />
              </button>
            ) : (
              <Link
                href={`/events/${event.id}`}
                className="bg-black text-white px-3 py-2 text-xs font-bold uppercase flex items-center gap-1 hover:bg-[#E5391F] transition-colors"
              >
                <span>Details</span>
                <ArrowUpRight size={16} strokeWidth={3} />
              </Link>
            )}
          </div>
        </div>
      </div>

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
