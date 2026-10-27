"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  ArrowLeft,
  ExternalLink,
  Mail,
  Bookmark,
  BookmarkCheck,
  Flame,
  ShieldCheck,
  Sparkles,
  Users,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  Award,
} from "lucide-react";
import CampusVerifiedBadge from "@/components/CampusVerifiedBadge";
import dynamic from "next/dynamic";
const ClashWarningModal = dynamic(() => import("@/components/ClashWarningModal"), { ssr: false });
const EventAttendeesModal = dynamic(() => import("@/components/EventAttendeesModal"), { ssr: false });
const RequestDeleteModal = dynamic(() => import("@/components/RequestDeleteModal"), { ssr: false });
const UploadCertificateModal = dynamic(() => import("@/components/UploadCertificateModal"), { ssr: false });
const EventHallOfFame = dynamic(() => import("@/components/EventHallOfFame"), { ssr: false });
import MagneticButton from "@/components/MagneticButton";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/Toast";
import { isStartingSoon, getHumanCountdown, isEventPast } from "@/lib/time";

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { success, warning, error: toastError } = useToast();
  const id = params?.id as string;

  const isManager = user?.role?.toUpperCase() === "CAMPUS_MANAGER";
  const isOrganizer = user?.role?.toUpperCase() === "ORGANIZER";
  const isStaffOrManager = isManager || isOrganizer;

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Enrollment states
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolledCount, setEnrolledCount] = useState<number>(0);
  const [enrolling, setEnrolling] = useState(false);
  const [attendeesModalOpen, setAttendeesModalOpen] = useState(false);

  // Deletion states
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Certificate & Hall of Fame states (Part 2)
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [refreshHallOfFame, setRefreshHallOfFame] = useState(0);

  const [clashModalOpen, setClashModalOpen] = useState(false);
  const [clashData, setClashData] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    fetchEvent();
    fetchEnrollmentStatus(id);
    if (!isStaffOrManager) {
      checkIfSaved();
    }
  }, [id, user, isStaffOrManager]);

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

  const fetchEvent = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${id}`);
      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Event not found or access denied.");
      } else {
        const data = await res.json();
        setEvent(data.event);
        if (typeof data.event?.enrolledCount === "number") {
          setEnrolledCount(data.event.enrolledCount);
        }
      }
    } catch (e: any) {
      setError(e.message || "Failed to load event.");
    } finally {
      setLoading(false);
    }
  };

  const checkIfSaved = async () => {
    if (!user || !id) return;
    try {
      const res = await fetch("/api/saved");
      if (res.ok) {
        const data = await res.json();
        const found = (data.events || []).some((e: any) => e.id === id);
        setIsSaved(found);
      }
    } catch {
      // ignore
    }
  };

  const handleApplyToggle = async () => {
    if (!user) {
      warning("Please sign in to apply for this event.");
      router.push(`/login?redirect=/events/${id}`);
      return;
    }

    setEnrolling(true);
    try {
      const method = isEnrolled ? "DELETE" : "POST";
      const res = await fetch(`/api/events/${id}/apply`, { method });
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
        warning(err.error || "Failed to update enrollment.");
      }
    } catch {
      warning("Network error while submitting application.");
    } finally {
      setEnrolling(false);
    }
  };

  const handleSaveToggle = async () => {
    if (!user) {
      warning("Please sign in to save events to your schedule.");
      router.push(`/login?redirect=/events/${event.id}`);
      return;
    }

    if (isSaved) {
      executeSave(false);
      return;
    }

    // Pre-check for clash
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

      await executeSave(true);
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  const executeSave = async (targetState: boolean) => {
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
        if (data.saved) {
          success("Event saved to your personal schedule!");
        } else {
          success("Event removed from your schedule.");
        }
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!event) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/organizer/events/${event.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        success("Event permanently deleted by Manager.");
        router.push("/events");
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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="glass h-[50vh] rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <div className="bg-white dark:bg-kalvium-dark-surface p-8 rounded-3xl border border-kalvium-border dark:border-kalvium-dark-border shadow-kalvium-md">
          <p className="font-display text-lg font-bold text-kalvium-text dark:text-kalvium-dark-text mb-2">Event Not Found</p>
          <p className="text-sm text-kalvium-muted dark:text-kalvium-dark-muted mb-6">{error || "This event could not be found."}</p>
          <Link
            href="/events"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-kalvium-coral hover:bg-kalvium-coral-hover text-white text-xs font-semibold active:scale-95 transition shadow-sm"
          >
            <ArrowLeft size={16} />
            <span>Back to Discovery</span>
          </Link>
        </div>
      </div>
    );
  }

  const isPast = Boolean(event.isPast) || isEventPast(event.date, event.endTime, undefined, event.startTime);
  const startingSoon = !isPast && isStartingSoon(event.date, event.startTime);
  const countdown = getHumanCountdown(event.date, event.startTime);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back button */}
      <Link
        href="/events"
        className="group inline-flex items-center gap-2 text-xs font-semibold text-kalvium-muted hover:text-kalvium-text dark:hover:text-kalvium-dark-text mb-8 transition duration-200"
      >
        <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
        <span>Back to Events</span>
      </Link>

      {/* Poster Hero */}
      <motion.div
        initial={{ clipPath: "inset(0 0 100% 0)" }}
        animate={{ clipPath: "inset(0 0 0% 0)" }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full flex justify-center overflow-hidden rounded-3xl bg-kalvium-surface-alt dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border shadow-kalvium-md"
      >
        <img
          src={event.posterUrl}
          alt={event.title}
          className="w-full h-auto max-h-[600px] object-contain"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <span className="rounded-full bg-white/90 dark:bg-kalvium-dark-surface/90 px-3 py-1 text-xs font-semibold text-kalvium-text dark:text-kalvium-dark-text backdrop-blur border border-kalvium-border dark:border-kalvium-dark-border shadow-xs">
            {event.category}
          </span>
          {isPast && (
            <span className="rounded-full bg-kalvium-surface-alt/90 dark:bg-kalvium-dark-surface/90 px-3 py-1 text-xs font-bold text-kalvium-muted border border-kalvium-border dark:border-kalvium-dark-border shadow-xs backdrop-blur">
              Past Event
            </span>
          )}
          {event.status === "APPROVED" && <CampusVerifiedBadge animate />}
        </div>
      </motion.div>

      {/* Main Details */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.08, delayChildren: 0.3 } } }}
        className="mt-8 space-y-8"
      >
        {/* Title and Save Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div>
            {isPast ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt px-3 py-1 text-xs font-bold text-kalvium-muted border border-kalvium-border dark:border-kalvium-dark-border mb-3">
                <span>Past Event • Concluded</span>
              </span>
            ) : startingSoon ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-kalvium-coral-tint dark:bg-kalvium-dark-coral-tint px-3 py-1 text-xs font-bold text-kalvium-coral border border-kalvium-coral/30 mb-3">
                <Flame size={14} className="animate-pulse" />
                <span>Starting soon ({countdown})</span>
              </span>
            ) : null}
            <h1 className="font-display text-display-lg font-bold text-kalvium-text dark:text-kalvium-dark-text tracking-tight leading-tight">
              {event.title}
            </h1>
            <p className="mt-2 text-sm text-kalvium-muted dark:text-kalvium-dark-muted">
              Organized by <span className="text-kalvium-text dark:text-kalvium-dark-text font-semibold">{event.organizerName || event.organizer?.name || "Campus Club"}</span>
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3 flex-wrap">
            {isManager ? (
              <>
                <button
                  type="button"
                  onClick={() => setAttendeesModalOpen(true)}
                  className="rounded-full px-5 py-2.5 text-xs font-bold flex items-center gap-2 bg-kalvium-coral text-white hover:bg-kalvium-coral-hover transition active:scale-95 shadow-soft-xs"
                >
                  <Users size={16} />
                  <span>Enrolled Students ({enrolledCount})</span>
                </button>
                <Link
                  href="/dashboard/manager"
                  className="rounded-full px-4 py-2.5 text-xs font-semibold flex items-center gap-2 bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt text-kalvium-text dark:text-kalvium-dark-text border border-kalvium-border dark:border-kalvium-dark-border hover:border-kalvium-coral transition active:scale-95"
                >
                  <ShieldCheck size={16} className="text-kalvium-success" />
                  <span>Manager Portal</span>
                </Link>
                {confirmDelete ? (
                  <div className="flex items-center gap-1.5 animate-fade-in">
                    <span className="text-xs text-kalvium-coral font-medium">Delete?</span>
                    <button
                      onClick={handleDeleteEvent}
                      disabled={deleting}
                      className="px-3 py-2 rounded-full text-xs font-bold bg-kalvium-coral text-white transition active:scale-95 shadow-sm"
                    >
                      {deleting ? "Deleting…" : "Yes, Delete"}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="px-3 py-2 rounded-full text-xs font-bold bg-kalvium-surface-alt text-kalvium-muted border border-kalvium-border transition"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="rounded-full px-4 py-2.5 text-xs font-semibold flex items-center gap-2 border border-kalvium-border hover:border-kalvium-coral hover:text-kalvium-coral bg-white dark:bg-kalvium-dark-surface text-kalvium-muted transition active:scale-95"
                    title="Permanently Delete Event (Manager Action)"
                  >
                    <Trash2 size={15} />
                    <span>Delete Event</span>
                  </button>
                )}
              </>
            ) : isOrganizer ? (
              <>
                <button
                  type="button"
                  onClick={() => setAttendeesModalOpen(true)}
                  className="rounded-full px-5 py-2.5 text-xs font-bold flex items-center gap-2 bg-kalvium-coral text-white hover:bg-kalvium-coral-hover transition active:scale-95 shadow-soft-xs"
                >
                  <Users size={16} />
                  <span>Enrolled Students ({enrolledCount})</span>
                </button>
                <Link
                  href="/dashboard/organizer"
                  className="rounded-full px-4 py-2.5 text-xs font-semibold flex items-center gap-2 bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt text-kalvium-text dark:text-kalvium-dark-text border border-kalvium-border dark:border-kalvium-dark-border hover:border-kalvium-coral transition active:scale-95"
                >
                  <Sparkles size={16} className="text-kalvium-coral" />
                  <span>Organizer Portal</span>
                </Link>
                {event.deletionRequested ? (
                  <span className="rounded-full px-4 py-2.5 text-xs font-semibold flex items-center gap-1.5 bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                    <AlertTriangle size={15} />
                    <span>Deletion Requested</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setDeleteModalOpen(true)}
                    className="rounded-full px-4 py-2.5 text-xs font-semibold flex items-center gap-2 border border-kalvium-border hover:border-kalvium-coral hover:text-kalvium-coral bg-white dark:bg-kalvium-dark-surface text-kalvium-muted transition active:scale-95"
                    title="Request Event Deletion from Campus Manager"
                  >
                    <Trash2 size={15} />
                    <span>Request Deletion</span>
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={handleApplyToggle}
                  disabled={enrolling || isPast}
                  className={`rounded-full px-6 py-3 text-sm font-bold flex items-center gap-2 transition active:scale-95 shadow-soft-xs disabled:opacity-60 disabled:cursor-not-allowed ${
                    isEnrolled
                      ? "bg-kalvium-success-tint dark:bg-kalvium-dark-success-tint text-kalvium-success border border-kalvium-success/40 hover:bg-kalvium-success hover:text-white"
                      : isPast
                      ? "bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt text-kalvium-muted border border-kalvium-border"
                      : "bg-kalvium-coral text-white hover:bg-kalvium-coral-hover shadow-md shadow-kalvium-coral/25"
                  }`}
                >
                  {enrolling ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin shrink-0" />
                      <span>Applying…</span>
                    </>
                  ) : isPast ? (
                    <span>Event Concluded</span>
                  ) : isEnrolled ? (
                    <>
                      <CheckCircle2 size={16} />
                      <span>✓ Enrolled • Withdraw</span>
                    </>
                  ) : (
                    <>
                      <Users size={16} />
                      <span>Apply / Enroll Now</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleSaveToggle}
                  disabled={saving}
                  className={`rounded-full px-5 py-3 text-xs font-semibold flex items-center gap-2 transition active:scale-95 border ${
                    isSaved
                      ? "bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt text-kalvium-coral border-kalvium-coral/30 hover:bg-kalvium-coral-tint"
                      : "bg-white dark:bg-kalvium-dark-surface text-kalvium-text dark:text-kalvium-dark-text border-kalvium-border dark:border-kalvium-dark-border hover:bg-kalvium-surface-alt"
                  }`}
                >
                  {isSaved ? (
                    <>
                      <BookmarkCheck size={15} className="fill-kalvium-coral text-kalvium-coral" />
                      <span>Saved</span>
                    </>
                  ) : (
                    <>
                      <Bookmark size={15} />
                      <span>Save</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setCertModalOpen(true)}
                  className="rounded-full px-5 py-3 text-xs font-semibold flex items-center gap-2 transition active:scale-95 border border-kalvium-coral/30 bg-kalvium-coral/10 hover:bg-kalvium-coral text-kalvium-coral hover:text-white"
                  title="Upload Certificate of Participation or Award"
                >
                  <Award size={15} />
                  <span>Upload Certificate</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-kalvium-dark-surface rounded-2xl p-4 border border-kalvium-border dark:border-kalvium-dark-border shadow-kalvium-sm">
            <span className="flex items-center gap-2 text-xs font-medium text-kalvium-muted dark:text-kalvium-dark-muted mb-1">
              <Calendar size={14} className="text-kalvium-coral" />
              Date
            </span>
            <p className="font-display font-semibold text-kalvium-text dark:text-kalvium-dark-text">{event.date}</p>
            <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted mt-0.5">{countdown}</p>
          </div>

          <div className="bg-white dark:bg-kalvium-dark-surface rounded-2xl p-4 border border-kalvium-border dark:border-kalvium-dark-border shadow-kalvium-sm">
            <span className="flex items-center gap-2 text-xs font-medium text-kalvium-muted dark:text-kalvium-dark-muted mb-1">
              <Clock size={14} className="text-kalvium-coral" />
              Time Window
            </span>
            <p className="font-display font-semibold text-kalvium-text dark:text-kalvium-dark-text">{event.startTime} – {event.endTime}</p>
            <p className="text-xs text-kalvium-success font-medium mt-0.5">Clash protected</p>
          </div>

          <div className="bg-white dark:bg-kalvium-dark-surface rounded-2xl p-4 border border-kalvium-border dark:border-kalvium-dark-border shadow-kalvium-sm">
            <span className="flex items-center gap-2 text-xs font-medium text-kalvium-muted dark:text-kalvium-dark-muted mb-1">
              <MapPin size={14} className="text-kalvium-success" />
              Campus Venue
            </span>
            <p className="font-display font-semibold text-kalvium-text dark:text-kalvium-dark-text truncate">{event.venue}</p>
            <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted mt-0.5">On campus</p>
          </div>

          <div className="bg-white dark:bg-kalvium-dark-surface rounded-2xl p-4 border border-kalvium-border dark:border-kalvium-dark-border shadow-kalvium-sm">
            <span className="flex items-center gap-2 text-xs font-medium text-kalvium-muted dark:text-kalvium-dark-muted mb-1">
              <Users size={14} className="text-kalvium-coral" />
              Applications
            </span>
            <p className="font-display font-semibold text-kalvium-text dark:text-kalvium-dark-text">
              {enrolledCount} Student{enrolledCount === 1 ? "" : "s"}
            </p>
            <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted mt-0.5">
              {isEnrolled ? "✓ You are enrolled" : "Enrolled attendees"}
            </p>
          </div>
        </div>

        {/* Summary & Description */}
        <div className="bg-white dark:bg-kalvium-dark-surface rounded-3xl p-6 sm:p-8 space-y-6 border border-kalvium-border dark:border-kalvium-dark-border shadow-kalvium-sm">
          <div>
            <h2 className="font-display text-lg font-bold text-kalvium-text dark:text-kalvium-dark-text mb-2">About this event</h2>
            <p className="text-sm sm:text-base text-kalvium-muted dark:text-kalvium-dark-muted leading-relaxed font-normal">
              {event.description || event.summary}
            </p>
          </div>

          {event.summary && event.summary !== event.description && (
            <div className="rounded-2xl bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt p-4 border border-kalvium-border dark:border-kalvium-dark-border">
              <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-kalvium-muted dark:text-kalvium-dark-muted mb-1">
                AI Structured Summary
              </h3>
              <p className="text-xs sm:text-sm text-kalvium-text dark:text-kalvium-dark-text leading-relaxed">
                {event.summary}
              </p>
            </div>
          )}

          {/* Additional details: tags, contact, registration */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-kalvium-border dark:border-kalvium-dark-border text-xs text-kalvium-muted dark:text-kalvium-dark-muted">
            {event.tags && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-sans font-semibold text-kalvium-muted uppercase">Tags:</span>
                {event.tags.split(",").map((t: string) => (
                  <span key={t} className="rounded-full bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt px-2.5 py-0.5 text-kalvium-text dark:text-kalvium-dark-text border border-kalvium-border dark:border-kalvium-dark-border">
                    {t.trim()}
                  </span>
                ))}
              </div>
            )}

            {event.registrationUrl &&
              event.registrationUrl !== "Not specified" &&
              event.registrationUrl !== "Needs verification" &&
              (event.registrationUrl.startsWith("http://") || event.registrationUrl.startsWith("https://")) && (
                <a
                  href={event.registrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-semibold text-kalvium-coral hover:underline"
                >
                  <span>External Registration</span>
                  <ExternalLink size={14} />
                </a>
              )}
          </div>
        </div>

        {/* Hall of Fame & Participants Showcase (Part 2) */}
        <div className="bg-white dark:bg-kalvium-dark-surface rounded-3xl p-6 sm:p-8 border border-kalvium-border dark:border-kalvium-dark-border shadow-kalvium-sm">
          <EventHallOfFame
            eventId={event.id}
            eventTitle={event.title}
            canUpload={Boolean(user)}
            onOpenUploadModal={() => setCertModalOpen(true)}
            refreshTrigger={refreshHallOfFame}
          />
        </div>
      </motion.div>

      {/* Clash Warning Dialog */}
      {clashData && (
        <ClashWarningModal
          isOpen={clashModalOpen}
          onClose={() => setClashModalOpen(false)}
          onConfirmSave={() => executeSave(true)}
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
        eventId={id}
        eventTitle={event.title}
        eventDate={event.date}
        eventVenue={event.venue}
      />

      {/* Organizer Request Deletion Modal */}
      {event && (
        <RequestDeleteModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          eventId={event.id}
          eventTitle={event.title}
          eventDate={event.date}
          eventVenue={event.venue}
          onSuccess={() => {
            fetchEvent();
          }}
        />
      )}

      {/* Upload Certificate & Achievements Modal (Part 2) */}
      {event && (
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
          }}
        />
      )}
    </div>
  );
}
