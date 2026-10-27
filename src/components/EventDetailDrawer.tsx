"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
  ShieldCheck,
  Sparkles,
  Users,
  Trash2,
  AlertTriangle,
  Award,
} from "lucide-react";
import CampusVerifiedBadge from "./CampusVerifiedBadge";
import dynamic from "next/dynamic";
const ClashWarningModal = dynamic(() => import("./ClashWarningModal"), { ssr: false });
const EventAttendeesModal = dynamic(() => import("./EventAttendeesModal"), { ssr: false });
const RequestDeleteModal = dynamic(() => import("./RequestDeleteModal"), { ssr: false });
const UploadCertificateModal = dynamic(() => import("./UploadCertificateModal"), { ssr: false });
const EventHallOfFame = dynamic(() => import("./EventHallOfFame"), { ssr: false });
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/Toast";
import { useRouter } from "next/navigation";
import { isStartingSoon, getHumanCountdown, isEventPast } from "@/lib/time";

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
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Enrollment states
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolledCount, setEnrolledCount] = useState<number>(0);
  const [enrolling, setEnrolling] = useState(false);
  const [attendeesModalOpen, setAttendeesModalOpen] = useState(false);

  // Deletion states
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [requestDeleteModalOpen, setRequestDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Certificate & Hall of Fame states (Part 2)
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [refreshHallOfFame, setRefreshHallOfFame] = useState(0);
  const [userParticipation, setUserParticipation] = useState<any>(null);

  const [clashModalOpen, setClashModalOpen] = useState(false);
  const [clashData, setClashData] = useState<any>(null);

  const fetchEnrollmentStatus = async (eventId: string) => {
    try {
      const res = await fetch(`/api/events/${eventId}/apply`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setIsEnrolled(Boolean(data.isEnrolled));
        if (typeof data.enrolledCount === "number") {
          setEnrolledCount(data.enrolledCount);
        }
      }
    } catch {
      // ignore
    }
  };

  const fetchUserParticipation = async (eventId: string) => {
    if (!user) {
      setUserParticipation(null);
      return;
    }
    try {
      const res = await fetch(`/api/events/${eventId}/participation`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.hasSubmitted && data.participation) {
          setUserParticipation(data.participation);
        } else {
          setUserParticipation(null);
        }
      }
    } catch {
      setUserParticipation(null);
    }
  };

  const handleOpenCertModal = () => {
    if (!user) {
      router.push(`/login?redirect=/events/${event?.id || ""}`);
      onClose();
      return;
    }
    setCertModalOpen(true);
  };

  useEffect(() => {
    if (event) {
      setIsSaved(Boolean(event.isSaved));
      setIsEnrolled(Boolean(event.isEnrolled));
      setEnrolledCount(typeof event.enrolledCount === "number" ? event.enrolledCount : 0);
      fetchEnrollmentStatus(event.id);
      fetchUserParticipation(event.id);
    }
  }, [event, user]);

  // Close child modals or drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        if (certModalOpen) {
          setCertModalOpen(false);
          return;
        }
        if (attendeesModalOpen) {
          setAttendeesModalOpen(false);
          return;
        }
        if (requestDeleteModalOpen) {
          setRequestDeleteModalOpen(false);
          return;
        }
        if (!clashModalOpen) {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, certModalOpen, attendeesModalOpen, requestDeleteModalOpen, clashModalOpen, onClose]);

  // Lock body scroll when drawer is open to prevent background scroll interference
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen || !event) return null;

  const isPast = Boolean(event.isPast) || isEventPast(event.date, event.endTime, undefined, event.startTime);
  const startingSoon = !isPast && isStartingSoon(event.date, event.startTime);
  const countdownText = getHumanCountdown(event.date, event.startTime);

  const isManager = user?.role?.toUpperCase() === "CAMPUS_MANAGER";
  const isOrganizer = user?.role?.toUpperCase() === "ORGANIZER";
  const isStaffOrManager = isManager || isOrganizer;

  const handleSaveClick = async () => {
    if (isStaffOrManager) return;

    if (!user) {
      // Redirect to login with the current event page as redirect target
      router.push(`/login?redirect=/events/${event.id}`);
      onClose();
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

  const handleApplyClick = async () => {
    if (!user) {
      router.push(`/login?redirect=/events/${event.id}`);
      onClose();
      return;
    }

    setEnrolling(true);
    try {
      const method = isEnrolled ? "DELETE" : "POST";
      const res = await fetch(`/api/events/${event.id}/apply`, {
        method,
      });

      if (res.ok) {
        const data = await res.json();
        setIsEnrolled(Boolean(data.isEnrolled));
        if (typeof data.enrolledCount === "number") {
          setEnrolledCount(data.enrolledCount);
        }
        if (data.isEnrolled) {
          success("✓ Application confirmed! You are officially enrolled in this event.");
        } else {
          success("Your enrollment has been withdrawn.");
        }
      } else {
        const err = await res.json();
        toastError(err.error || "Failed to update enrollment.");
      }
    } catch {
      toastError("Enrollment request failed.");
    } finally {
      setEnrolling(false);
    }
  };

  const handleManagerDelete = async () => {
    if (!event) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/organizer/events/${event.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        success("Event permanently deleted by Manager.");
        onClose();
        router.refresh();
      } else {
        const data = await res.json();
        toastError(data.error || "Failed to delete event.");
      }
    } catch {
      toastError("Network error while deleting event.");
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/40 backdrop-blur-sm animate-fade-in"
        data-lenis-prevent="true"
      >
        {/* Backdrop click to close */}
        <div className="absolute inset-0" onClick={onClose} />

        {/* Slide-over Drawer Panel */}
        <div
          className="relative w-full max-w-xl bg-white dark:bg-kalvium-dark-surface border-l border-kalvium-border dark:border-kalvium-dark-border shadow-2xl h-full max-h-screen flex flex-col z-10 animate-slide-left overflow-hidden"
          data-lenis-prevent="true"
        >
          {/* Top Bar - pinned and non-scrolling */}
          <div className="shrink-0 bg-white/95 dark:bg-kalvium-dark-surface/95 backdrop-blur-md px-6 py-4 border-b border-kalvium-border dark:border-kalvium-dark-border flex items-center justify-between z-20">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt text-kalvium-text dark:text-kalvium-dark-text border border-kalvium-border dark:border-kalvium-dark-border">
                {event.category}
              </span>
              {isPast && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt text-kalvium-muted border border-kalvium-border dark:border-kalvium-dark-border">
                  Past Event
                </span>
              )}
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

          {/* Drawer Body - smooth native scrolling */}
          <div
            className="p-6 space-y-6 flex-1 min-h-0 overflow-y-auto overscroll-contain pb-8 focus:outline-none"
            data-lenis-prevent="true"
          >
            {/* Poster Media Box */}
            <div className="relative rounded-2xl overflow-hidden bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border shadow-sm group">
              <Image
                src={event.posterUrl}
                alt={event.title}
                width={800}
                height={800}
                className="w-full h-auto object-contain max-h-[500px] transition-transform duration-500 ease-editorial group-hover:scale-[1.015]"
              />
              {isPast ? (
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-kalvium-surface-alt/90 dark:bg-kalvium-dark-surface/90 text-kalvium-muted border border-kalvium-border dark:border-kalvium-dark-border backdrop-blur flex items-center gap-1.5 shadow-xs">
                    <span>Past Event • Concluded</span>
                  </span>
                </div>
              ) : startingSoon ? (
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-kalvium-coral text-white flex items-center gap-1.5 shadow-md">
                    <Flame className="w-3.5 h-3.5 text-white fill-white" />
                    <span>Starting soon</span>
                  </span>
                </div>
              ) : null}
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

              <div className="flex items-start justify-between gap-3 text-kalvium-text dark:text-kalvium-dark-text pt-1">
                <div className="flex items-start gap-3">
                  <Users className="w-4 h-4 text-kalvium-coral shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-kalvium-text dark:text-kalvium-dark-text">
                      {enrolledCount} Student{enrolledCount === 1 ? "" : "s"} Enrolled
                    </p>
                    <p className="text-[11px] text-kalvium-muted dark:text-kalvium-dark-muted">
                      {isEnrolled ? "✓ You are enrolled in this event" : "Open for student applications"}
                    </p>
                  </div>
                </div>
                {(isManager || isOrganizer) && (
                  <button
                    type="button"
                    onClick={() => setAttendeesModalOpen(true)}
                    className="px-3 py-1 rounded-full text-xs font-bold text-kalvium-coral bg-kalvium-coral-tint dark:bg-kalvium-dark-coral-tint hover:bg-kalvium-coral hover:text-white transition shrink-0"
                  >
                    View Roster ({enrolledCount})
                  </button>
                )}
              </div>
            </div>

            {/* Certificate & Awards Quick Action Banner / Verified Card (Part 2) */}
            {userParticipation ? (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-kalvium-success/10 to-emerald-500/5 border border-emerald-500/30 shadow-soft-xs space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-kalvium-success text-white flex items-center justify-center shrink-0 shadow-sm">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-kalvium-text dark:text-kalvium-dark-text">
                          ✓ Certificate &amp; Credentials on File
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-kalvium-success/20 text-kalvium-success uppercase tracking-wider">
                          Verified
                        </span>
                      </div>
                      <p className="text-[11px] text-kalvium-muted mt-0.5">
                        {userParticipation.hasWonPrize
                          ? `🏆 ${userParticipation.awardTitle || "Prize Winner"}`
                          : `Verified ${userParticipation.certificateType || "Participation"} Certificate`}
                        {userParticipation.teamName ? ` • Team: ${userParticipation.teamName}` : ""}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleOpenCertModal}
                    className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-white dark:bg-kalvium-dark-surface text-kalvium-text dark:text-kalvium-dark-text border border-kalvium-border hover:border-kalvium-coral hover:text-kalvium-coral transition active:scale-95 shadow-xs shrink-0"
                  >
                    Edit / Update
                  </button>
                </div>

                {userParticipation.certificateUrl && (
                  <div className="flex items-center justify-between pt-2 border-t border-emerald-500/20 text-xs">
                    <span className="text-[11px] text-kalvium-muted truncate">
                      Document verified in student campus portfolio
                    </span>
                    <a
                      href={userParticipation.certificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-kalvium-coral hover:underline shrink-0"
                    >
                      <span>View Certificate</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                )}
              </div>
            ) : null}


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
            <div className="p-4 rounded-2xl bg-kalvium-surface-alt dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border text-xs text-kalvium-text dark:text-kalvium-dark-text space-y-1">
              <span className="text-xs font-semibold text-kalvium-text dark:text-kalvium-dark-text flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-kalvium-success" />
                Human Certified by Campus Leadership
              </span>
              <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted leading-relaxed">
                Extracted with AI and authenticated against original poster artwork by campus administration under the{" "}
                <Link href="/guidelines" className="text-kalvium-coral font-semibold hover:underline">
                  Campus Verification Standard
                </Link>
                .
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

            {/* Hall of Fame & Participants Showcase (Part 2) */}
            <div className="pt-2">
              <EventHallOfFame
                eventId={event.id}
                eventTitle={event.title}
                canUpload={Boolean(user)}
                onOpenUploadModal={handleOpenCertModal}
                refreshTrigger={refreshHallOfFame}
                compact={true}
              />
            </div>

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

          {/* Sticky Frosted-Glass Bottom Bar */}
          {isManager ? (
            <div className="shrink-0 sticky bottom-0 bg-white/95 dark:bg-kalvium-dark-surface/95 backdrop-blur-md px-6 py-4 border-t border-kalvium-border dark:border-kalvium-dark-border z-30 space-y-2">
              <button
                type="button"
                onClick={() => setAttendeesModalOpen(true)}
                className="w-full py-3 px-5 rounded-full text-xs font-bold flex items-center justify-center gap-2 bg-kalvium-coral text-white hover:bg-kalvium-coral-hover transition shadow-soft-xs active:scale-[0.98]"
              >
                <Users className="w-4 h-4" />
                <span>View Enrolled Students ({enrolledCount})</span>
              </button>
              <Link
                href="/dashboard/manager"
                className="w-full py-2.5 px-5 rounded-full text-xs font-semibold flex items-center justify-center gap-2 bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt text-kalvium-text dark:text-kalvium-dark-text border border-kalvium-border dark:border-kalvium-dark-border hover:border-kalvium-coral transition active:scale-[0.98]"
              >
                <ShieldCheck className="w-4 h-4 text-kalvium-success" />
                <span>Manager Verification Queue</span>
              </Link>
              {confirmDelete ? (
                <div className="flex items-center gap-2 p-2 rounded-2xl bg-kalvium-coral/10 border border-kalvium-coral/30">
                  <span className="text-xs font-semibold text-kalvium-coral flex-1">Delete permanently?</span>
                  <button
                    onClick={handleManagerDelete}
                    disabled={deleting}
                    className="px-3 py-1.5 rounded-full text-xs font-bold bg-kalvium-coral text-white hover:bg-kalvium-coral-hover transition shadow-sm"
                  >
                    {deleting ? "Deleting…" : "Yes, Delete"}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="px-3 py-1.5 rounded-full text-xs font-bold bg-white dark:bg-kalvium-dark-surface text-kalvium-muted border border-kalvium-border transition"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="w-full py-2 px-5 rounded-full text-xs font-medium flex items-center justify-center gap-2 text-kalvium-muted hover:text-kalvium-coral border border-kalvium-border dark:border-kalvium-dark-border hover:border-kalvium-coral/50 transition active:scale-[0.98]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Event (Manager Action)</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleOpenCertModal}
                className="w-full py-2.5 px-5 rounded-full text-xs font-bold flex items-center justify-center gap-2 border border-kalvium-coral/30 bg-kalvium-coral/10 hover:bg-kalvium-coral text-kalvium-coral hover:text-white transition active:scale-[0.98]"
              >
                <Award className="w-3.5 h-3.5" />
                <span>{userParticipation ? "Edit Certificate / Record" : "Upload Certificate / Record"}</span>
              </button>
            </div>
          ) : isOrganizer ? (
            <div className="shrink-0 sticky bottom-0 bg-white/95 dark:bg-kalvium-dark-surface/95 backdrop-blur-md px-6 py-4 border-t border-kalvium-border dark:border-kalvium-dark-border z-30 space-y-2">
              <button
                type="button"
                onClick={() => setAttendeesModalOpen(true)}
                className="w-full py-3 px-5 rounded-full text-xs font-bold flex items-center justify-center gap-2 bg-kalvium-coral text-white hover:bg-kalvium-coral-hover transition shadow-soft-xs active:scale-[0.98]"
              >
                <Users className="w-4 h-4" />
                <span>View Enrolled Students ({enrolledCount})</span>
              </button>
              <Link
                href="/dashboard/organizer"
                className="w-full py-2.5 px-5 rounded-full text-xs font-semibold flex items-center justify-center gap-2 bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt text-kalvium-text dark:text-kalvium-dark-text border border-kalvium-border dark:border-kalvium-dark-border hover:border-kalvium-coral transition active:scale-[0.98]"
              >
                <Sparkles className="w-4 h-4 text-kalvium-coral" />
                <span>Organizer Dashboard</span>
              </Link>
              {(event as any).deletionRequested ? (
                <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center justify-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Deletion Request Pending Review</span>
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setRequestDeleteModalOpen(true)}
                  className="w-full py-2 px-5 rounded-full text-xs font-medium flex items-center justify-center gap-1.5 text-kalvium-muted hover:text-kalvium-coral border border-kalvium-border dark:border-kalvium-dark-border hover:border-kalvium-coral/50 transition active:scale-[0.98]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Request Deletion from Manager</span>
                </button>
              )}
            </div>
          ) : (
            <div className="shrink-0 sticky bottom-0 bg-white/95 dark:bg-kalvium-dark-surface/95 backdrop-blur-md px-6 py-4 border-t border-kalvium-border dark:border-kalvium-dark-border z-30 space-y-2">
              {isPast ? (
                /* Concluded Event: Single primary action to upload or edit certificate */
                <button
                  type="button"
                  onClick={handleOpenCertModal}
                  className="w-full py-3.5 px-5 rounded-full text-sm font-bold flex items-center justify-center gap-2 bg-kalvium-coral hover:bg-kalvium-coral-hover text-white shadow-md shadow-kalvium-coral/25 transition-all duration-200 active:scale-[0.98]"
                >
                  <Award className="w-4 h-4" />
                  <span>
                    {userParticipation
                      ? "✓ Certificate Uploaded • Edit Details"
                      : "Upload Event Certificate & Achievements"}
                  </span>
                </button>
              ) : (
                /* Upcoming Event: Apply / Enroll and Save to Schedule */
                <>
                  <button
                    onClick={handleApplyClick}
                    disabled={enrolling}
                    className={`w-full py-3.5 px-5 rounded-full text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] shadow-soft-xs disabled:opacity-60 disabled:cursor-not-allowed ${
                      isEnrolled
                        ? "bg-kalvium-success-tint dark:bg-kalvium-dark-success-tint text-kalvium-success border border-kalvium-success/40 hover:bg-kalvium-success hover:text-white"
                        : "bg-kalvium-coral hover:bg-kalvium-coral-hover text-white shadow-md shadow-kalvium-coral/25"
                    }`}
                  >
                    {enrolling ? (
                      <>
                        <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin shrink-0" />
                        <span>Processing Application…</span>
                      </>
                    ) : isEnrolled ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>✓ Enrolled • Click to Withdraw Application</span>
                      </>
                    ) : (
                      <>
                        <Users className="w-4 h-4" />
                        <span>Apply / Enroll for this Event</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleSaveClick}
                    disabled={saving}
                    className={`w-full py-2.5 px-5 rounded-full text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] border ${
                      isSaved
                        ? "bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt text-kalvium-coral border-kalvium-coral/30 hover:bg-kalvium-coral-tint"
                        : "bg-white dark:bg-kalvium-dark-surface text-kalvium-text dark:text-kalvium-dark-text border-kalvium-border dark:border-kalvium-dark-border hover:border-kalvium-coral"
                    }`}
                  >
                    {saving ? (
                      <>
                        <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin shrink-0" />
                        <span>Saving…</span>
                      </>
                    ) : isSaved ? (
                      <>
                        <BookmarkCheck className="w-3.5 h-3.5 fill-kalvium-coral text-kalvium-coral" />
                        <span>Saved to My Schedule</span>
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-3.5 h-3.5" />
                        <span>Save to My Schedule</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          )}
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

      {/* Attendee Roster Modal */}
      <EventAttendeesModal
        isOpen={attendeesModalOpen}
        onClose={() => setAttendeesModalOpen(false)}
        eventId={event.id}
        eventTitle={event.title}
        eventDate={event.date}
        eventVenue={event.venue}
      />

      {/* Organizer Request Deletion Modal */}
      <RequestDeleteModal
        isOpen={requestDeleteModalOpen}
        onClose={() => setRequestDeleteModalOpen(false)}
        eventId={event.id}
        eventTitle={event.title}
        eventDate={event.date}
        eventVenue={event.venue}
        onSuccess={() => {
          onClose();
          router.refresh();
        }}
      />

      {/* Upload Certificate & Achievements Modal (Part 2) */}
      <UploadCertificateModal
        isOpen={certModalOpen}
        onClose={() => setCertModalOpen(false)}
        eventId={event.id}
        eventTitle={event.title}
        eventDate={event.date}
        eventVenue={event.venue}
        onSuccess={() => {
          setRefreshHallOfFame((prev) => prev + 1);
          fetchEnrollmentStatus(event.id);
          fetchUserParticipation(event.id);
        }}
      />
    </>
  );
}
