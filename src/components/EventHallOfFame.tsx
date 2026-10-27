"use client";

import React, { useState, useEffect } from "react";
import {
  Trophy,
  Award,
  Users,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Upload,
  CheckCircle2,
} from "lucide-react";

interface Teammate {
  name: string;
  email?: string;
  role?: string;
}

interface Participation {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  certificateUrl?: string;
  certificateType?: string;
  hasWonPrize?: boolean;
  awardTitle?: string;
  awardPhotoUrl?: string;
  isTeamEvent?: boolean;
  teamName?: string;
  teammates?: Teammate[];
  projectTitle?: string;
  projectUrl?: string;
  notes?: string;
  createdAt: string;
}

interface EventHallOfFameProps {
  eventId: string;
  eventTitle: string;
  onOpenUploadModal?: () => void;
  canUpload?: boolean;
  refreshTrigger?: number;
  compact?: boolean;
}

export default function EventHallOfFame({
  eventId,
  eventTitle,
  onOpenUploadModal,
  canUpload = true,
  refreshTrigger = 0,
  compact = false,
}: EventHallOfFameProps) {
  const [loading, setLoading] = useState(true);
  const [participations, setParticipations] = useState<Participation[]>([]);
  const [winners, setWinners] = useState<Participation[]>([]);
  const [participants, setParticipants] = useState<Participation[]>([]);

  useEffect(() => {
    if (!eventId) return;
    fetchParticipations();
  }, [eventId, refreshTrigger]);

  const fetchParticipations = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/participations`);
      if (res.ok) {
        const data = await res.json();
        setParticipations(data.all || []);
        setWinners(data.winners || []);
        setParticipants(data.participants || []);
      }
    } catch (err) {
      console.error("Error fetching event participations:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 rounded-3xl bg-kalvium-surface-alt/40 dark:bg-kalvium-dark-surface-alt/20 border border-kalvium-border dark:border-kalvium-dark-border animate-pulse space-y-4">
        <div className="h-6 w-48 bg-kalvium-border/40 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="h-24 bg-kalvium-border/30 rounded-2xl" />
          <div className="h-24 bg-kalvium-border/30 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (participations.length === 0) {
    return (
      <div className="p-6 rounded-3xl bg-kalvium-surface-alt/40 dark:bg-kalvium-dark-surface-alt/20 border border-kalvium-border dark:border-kalvium-dark-border text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-kalvium-coral/10 text-kalvium-coral flex items-center justify-center mx-auto border border-kalvium-coral/20">
          <Award className="w-6 h-6" />
        </div>
        <div className="max-w-md mx-auto">
          <h3 className="font-display font-bold text-sm text-kalvium-text dark:text-kalvium-dark-text">
            Participation & Awards Showcase
          </h3>
          <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted mt-1 leading-relaxed">
            Attended {eventTitle}? Upload your certificate of participation, winners podium photo, or hackathon project details.
          </p>
        </div>
        {canUpload && onOpenUploadModal && (
          <button
            type="button"
            onClick={onOpenUploadModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-kalvium-coral text-white hover:bg-kalvium-coral-hover transition active:scale-95 shadow-md shadow-kalvium-coral/20"
          >
            <Upload size={14} />
            <span>Upload Certificate & Achievements</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
            <Trophy size={18} />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-kalvium-text dark:text-kalvium-dark-text">
              Hall of Fame & Participants Showcase
            </h3>
            <p className="text-xs text-kalvium-muted">
              {participations.length} Verified Student{participations.length === 1 ? "" : "s"}
              {winners.length > 0 ? ` • ${winners.length} Award Winner${winners.length === 1 ? "" : "s"}` : ""}
            </p>
          </div>
        </div>

        {canUpload && onOpenUploadModal && (
          <button
            type="button"
            onClick={onOpenUploadModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-kalvium-coral text-white hover:bg-kalvium-coral-hover transition active:scale-95 shadow-sm"
          >
            <Upload size={13} />
            <span>Upload / Edit Certificate</span>
          </button>
        )}
      </div>

      {/* 1. Winners Section */}
      {winners.length > 0 && (
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
            <Sparkles size={14} />
            <span>Prize Winners & Placements</span>
          </span>

          <div className={`grid gap-4 ${compact ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"}`}>
            {winners.map((winner) => (
              <div
                key={winner.id}
                className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/5 via-white dark:via-kalvium-dark-surface to-kalvium-surface-alt dark:to-kalvium-dark-surface-alt border border-amber-500/20 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {winner.awardPhotoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={winner.awardPhotoUrl}
                        alt="Award Winner"
                        className="w-14 h-14 rounded-xl object-cover border border-amber-500/30 shadow-sm shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 border border-amber-500/20">
                        <Trophy size={22} />
                      </div>
                    )}
                    <div>
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white uppercase tracking-wider shadow-sm mb-1">
                        {winner.awardTitle || "Award Winner"}
                      </span>
                      <h4 className="font-display font-bold text-sm text-kalvium-text dark:text-kalvium-dark-text">
                        {winner.userName}
                      </h4>
                      {winner.teamName && (
                        <p className="text-[11px] font-semibold text-kalvium-coral">
                          Team: {winner.teamName}
                        </p>
                      )}
                    </div>
                  </div>

                  {winner.certificateUrl && (
                    <a
                      href={winner.certificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border text-kalvium-muted hover:text-kalvium-coral hover:border-kalvium-coral transition"
                      title="View Verified Certificate"
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>

                {/* Teammates List */}
                {winner.isTeamEvent && winner.teammates && winner.teammates.length > 0 && (
                  <div className="pt-2 border-t border-kalvium-border/60 dark:border-kalvium-dark-border/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-kalvium-muted block mb-1">
                      Teammates
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {winner.teammates.map((mate, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt text-[11px] text-kalvium-text dark:text-kalvium-dark-text border border-kalvium-border"
                        >
                          {mate.name} {mate.role ? `(${mate.role})` : ""}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Performance / Routine / Project Submission Link */}
                {winner.projectTitle && (
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-kalvium-muted text-[11px] truncate max-w-[200px]">
                      Entry / Routine: <strong className="text-kalvium-text dark:text-kalvium-dark-text">{winner.projectTitle}</strong>
                    </span>
                    {winner.projectUrl && (
                      <a
                        href={winner.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-semibold text-kalvium-coral hover:underline inline-flex items-center gap-1 shrink-0"
                      >
                        <span>Performance / Demo Link</span>
                        <ExternalLink size={11} />
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. All Participants Showcase */}
      {participants.length > 0 && (
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-kalvium-muted flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-kalvium-success" />
            <span>Verified Participants ({participants.length})</span>
          </span>

          <div className={`grid gap-3 ${compact ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}>
            {participants.map((p) => (
              <div
                key={p.id}
                className="p-3.5 rounded-2xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border shadow-kalvium-sm flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div className="w-8 h-8 rounded-full bg-kalvium-success/10 text-kalvium-success flex items-center justify-center shrink-0 border border-kalvium-success/20">
                    <ShieldCheck size={16} />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-kalvium-text dark:text-kalvium-dark-text truncate">
                      {p.userName}
                    </p>
                    <p className="text-[10px] text-kalvium-muted truncate">
                      {p.teamName ? `Team ${p.teamName}` : "Certificate on file"}
                    </p>
                  </div>
                </div>

                {p.certificateUrl && (
                  <a
                    href={p.certificateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-kalvium-muted hover:text-kalvium-coral hover:bg-kalvium-coral/10 transition shrink-0"
                    title="View Certificate"
                  >
                    <ExternalLink size={13} />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
