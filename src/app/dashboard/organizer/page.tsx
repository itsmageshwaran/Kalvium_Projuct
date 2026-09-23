"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  PlusCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles,
  RefreshCw,
  PenTool,
  Trash2,
  ShieldCheck,
} from "lucide-react";
import CampusVerifiedBadge from "@/components/CampusVerifiedBadge";
import CreateEventStudio from "@/components/CreateEventStudio";
import ManualEventForm from "@/components/ManualEventForm";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/Toast";
import { getTimeGreeting } from "@/lib/time";


function OrganizerDashboardContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"SUBMISSIONS" | "CREATE_AI" | "CREATE_MANUAL">("SUBMISSIONS");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const { success, error } = useToast();


  const handleTabChange = (newTab: "SUBMISSIONS" | "CREATE_AI" | "CREATE_MANUAL") => {
    setActiveTab(newTab);
    if (newTab === "SUBMISSIONS") {
      router.replace("/dashboard/organizer", { scroll: false });
    } else if (newTab === "CREATE_AI") {
      router.replace("/dashboard/organizer?tab=create", { scroll: false });
    } else if (newTab === "CREATE_MANUAL") {
      router.replace("/dashboard/organizer?tab=create_manual", { scroll: false });
    }
  };

  useEffect(() => {
    const tabParam = searchParams.get("tab")?.toLowerCase();
    if (tabParam === "create" || tabParam === "create_ai") {
      setActiveTab("CREATE_AI");
    } else if (tabParam === "create_manual") {
      setActiveTab("CREATE_MANUAL");
    } else {
      setActiveTab("SUBMISSIONS");
    }
  }, [searchParams]);

  const fetchOrganizerData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch("/api/organizer/events", { cache: "no-store" });
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

  const handleDeleteEvent = async (eventId: string) => {
    if (confirmDeleteId !== eventId) {
      setConfirmDeleteId(eventId);
      return;
    }
    setConfirmDeleteId(null);
    try {
      const res = await fetch(`/api/organizer/events/${eventId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        success("Event deleted successfully.");
        fetchOrganizerData();
      } else {
        const errorData = await res.json();
        error(`Failed to delete event: ${errorData.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error(err);
      error("An error occurred while deleting the event.");
    }
  };


  useEffect(() => {
    fetchOrganizerData();
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-kalvium-coral border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user || user.role?.toUpperCase() === "STUDENT") {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="p-8 rounded-2xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border shadow-kalvium-md">
          <p className="text-base font-bold text-kalvium-text dark:text-kalvium-dark-text mb-2">Organizer Access Required</p>
          <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted mb-6">
            Please log in with an Organizer account to access this portal.
          </p>
          <Link
            href="/login"
            className="px-5 py-2.5 rounded-full bg-kalvium-coral hover:bg-kalvium-coral-hover text-white text-xs font-bold shadow-sm transition"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const stats = data?.stats || { total: 0, pending: 0, approved: 0, declined: 0 };
  const events = data?.events || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-sans uppercase tracking-widest text-kalvium-coral dark:text-kalvium-coral font-bold bg-kalvium-bg dark:bg-kalvium-dark-surface px-3 py-1 rounded-full border border-kalvium-border dark:border-kalvium-dark-border shadow-soft-xs inline-flex items-center gap-1.5">
            {user?.role?.toUpperCase() === "CAMPUS_MANAGER" ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-kalvium-success" />
                <span>Manager's Portal</span>
              </>
            ) : (
              <span>Organizer's Portal</span>
            )}
          </span>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-kalvium-text dark:text-kalvium-dark-text tracking-tight mt-1.5">
            {getTimeGreeting()}, {user.name}
          </h1>
          <p className="text-xs sm:text-sm text-kalvium-muted dark:text-kalvium-dark-muted mt-1">
            {user?.role?.toUpperCase() === "CAMPUS_MANAGER"
              ? "Create campus events directly, manage submissions, and review verification queues."
              : "Create events manually, monitor review queues, and track campus verification."}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {user?.role?.toUpperCase() === "CAMPUS_MANAGER" && (
            <Link
              href="/dashboard/manager"
              className="px-4 py-2.5 rounded-full border border-kalvium-success/30 bg-kalvium-success-tint dark:bg-kalvium-dark-success-tint text-kalvium-success text-xs font-bold shadow-soft-xs transition shrink-0 active:scale-95 flex items-center gap-1.5 hover:bg-kalvium-success hover:text-white"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verification Center →</span>
            </Link>
          )}
          {activeTab !== "SUBMISSIONS" && (
            <button
              onClick={() => handleTabChange("SUBMISSIONS")}
              className="px-4 py-2.5 rounded-full border border-kalvium-border dark:border-kalvium-dark-border bg-white dark:bg-kalvium-dark-surface text-kalvium-text dark:text-kalvium-dark-text hover:border-kalvium-coral text-xs font-bold shadow-sm transition shrink-0 active:scale-95"
            >
              ← Back to Submissions
            </button>
          )}
        </div>
      </div>

      {/* Workspace Tabs */}
      <div className="flex items-center gap-2 border-b border-kalvium-border dark:border-kalvium-dark-border pb-4 mb-8 overflow-x-auto">
        <button
          onClick={() => handleTabChange("SUBMISSIONS")}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 active:scale-95 flex items-center gap-2 shrink-0 ${
            activeTab === "SUBMISSIONS"
              ? "bg-kalvium-coral text-white shadow-sm"
              : "bg-white dark:bg-kalvium-dark-surface text-kalvium-muted dark:text-kalvium-dark-muted hover:text-kalvium-text dark:hover:text-kalvium-dark-text border border-kalvium-border dark:border-kalvium-dark-border"
          }`}
        >
          <span>Your Submissions</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-sans font-bold ${
            activeTab === "SUBMISSIONS" ? "bg-white/20 text-white" : "bg-kalvium-surface-alt text-kalvium-muted"
          }`}>
            {events.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange("CREATE_AI")}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 active:scale-95 flex items-center gap-2 shrink-0 ${
            activeTab === "CREATE_AI"
              ? "bg-kalvium-coral text-white shadow-sm"
              : "bg-white dark:bg-kalvium-dark-surface text-kalvium-muted dark:text-kalvium-dark-muted hover:text-kalvium-text dark:hover:text-kalvium-dark-text border border-kalvium-border dark:border-kalvium-dark-border"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Poster Analysis</span>
        </button>

        <button
          onClick={() => handleTabChange("CREATE_MANUAL")}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 active:scale-95 flex items-center gap-2 shrink-0 ${
            activeTab === "CREATE_MANUAL"
              ? "bg-kalvium-coral text-white shadow-sm"
              : "bg-white dark:bg-kalvium-dark-surface text-kalvium-muted dark:text-kalvium-dark-muted hover:text-kalvium-text dark:hover:text-kalvium-dark-text border border-kalvium-border dark:border-kalvium-dark-border"
          }`}
        >
          <PenTool className="w-3.5 h-3.5" />
          <span>Manual Entry</span>
        </button>
      </div>

      {/* AI Poster Analysis Tab */}
      {activeTab === "CREATE_AI" ? (
        <div className="animate-fade-in">
          <CreateEventStudio
            onComplete={() => {
              handleTabChange("SUBMISSIONS");
              fetchOrganizerData();
            }}
          />
        </div>
      ) : activeTab === "CREATE_MANUAL" ? (
        <div className="animate-fade-in">
          <ManualEventForm
            onComplete={() => {
              handleTabChange("SUBMISSIONS");
              fetchOrganizerData();
            }}
          />
        </div>
      ) : (
        /* Tab 2: Your Submissions & Quick Metrics */
        <div className="space-y-6 animate-fade-in">
          {/* Status Metrics Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border shadow-soft-xs transition-all hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-sans text-kalvium-muted dark:text-kalvium-dark-muted uppercase tracking-wider font-semibold block mb-1">
                  Pending Verification
                </span>
                <span className="w-2 h-2 rounded-full bg-kalvium-warning inline-block" />
              </div>
              <p className="text-2xl sm:text-3xl font-sans font-bold text-kalvium-text dark:text-kalvium-dark-text mt-1">{stats.pending}</p>
              <p className="text-[11px] text-kalvium-muted dark:text-kalvium-dark-muted mt-0.5">In manager review queue</p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border shadow-soft-xs transition-all hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-sans text-kalvium-muted dark:text-kalvium-dark-muted uppercase tracking-wider font-semibold block mb-1">
                  Approved & Public
                </span>
                <CheckCircle2 className="w-3.5 h-3.5 text-kalvium-success" />
              </div>
              <p className="text-2xl sm:text-3xl font-sans font-bold text-kalvium-text dark:text-kalvium-dark-text mt-1">{stats.approved}</p>
              <p className="text-[11px] text-kalvium-muted dark:text-kalvium-dark-muted mt-0.5">Live on campus feed</p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border shadow-soft-xs transition-all hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-sans text-kalvium-muted dark:text-kalvium-dark-muted uppercase tracking-wider font-semibold block mb-1">
                  Declined
                </span>
                <XCircle className="w-3.5 h-3.5 text-kalvium-coral" />
              </div>
              <p className="text-2xl sm:text-3xl font-sans font-bold text-kalvium-text dark:text-kalvium-dark-text mt-1">{stats.declined}</p>
              <p className="text-[11px] text-kalvium-muted dark:text-kalvium-dark-muted mt-0.5">Requires information update</p>
            </div>
          </div>

          {/* Submissions List Header */}
          <div className="flex items-center justify-between pt-2">
            <h2 className="text-sm font-sans font-bold uppercase tracking-wider text-kalvium-text dark:text-kalvium-dark-text">
              Submission History
            </h2>
            <button
              onClick={fetchOrganizerData}
              className="text-xs text-kalvium-muted hover:text-kalvium-text dark:hover:text-kalvium-dark-text flex items-center gap-1.5 transition active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>

          {loading ? (
            <div className="py-20 text-center text-kalvium-muted text-sm">
              Loading your submissions...
            </div>
          ) : events.length === 0 ? (
            <div className="py-16 text-center bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border rounded-2xl p-8 shadow-kalvium-sm">
              <p className="text-sm font-bold text-kalvium-text dark:text-kalvium-dark-text mb-2">No event submissions yet</p>
              <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted mb-6">
                Fill in the event details to submit a new event.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => handleTabChange("CREATE_AI")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-kalvium-coral text-white text-xs font-bold shadow-sm active:scale-95 transition hover:bg-kalvium-coral/90"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>AI Poster Analysis</span>
                </button>
                <button
                  onClick={() => handleTabChange("CREATE_MANUAL")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-kalvium-card dark:bg-kalvium-dark-card border border-kalvium-border dark:border-kalvium-dark-border hover:border-kalvium-coral text-kalvium-text dark:text-kalvium-dark-text text-xs font-bold shadow-sm active:scale-95 transition"
                >
                  <PenTool className="w-4 h-4" />
                  <span>Manual Entry</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((ev: any) => (
                <div
                  key={ev.id}
                  className="p-5 rounded-2xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border hover:border-kalvium-coral/40 shadow-kalvium-sm transition space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4 min-w-0">
                      <img
                        src={ev.posterUrl || "/images/placeholder.svg"}
                        alt={ev.title}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt shrink-0 border border-kalvium-border dark:border-kalvium-dark-border"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-[10px] font-sans uppercase bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt text-kalvium-muted dark:text-kalvium-dark-muted px-2.5 py-0.5 rounded-full border border-kalvium-border dark:border-kalvium-dark-border font-semibold">
                            {ev.category}
                          </span>
                          {renderStatusBadge(ev.status)}
                          {ev.status === "APPROVED" && <CampusVerifiedBadge size="sm" />}
                        </div>
                        <h3 className="text-base font-bold text-kalvium-text dark:text-kalvium-dark-text mb-1 truncate">{ev.title}</h3>
                        <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted">
                          {ev.date} • {ev.startTime} – {ev.endTime} • {ev.venue}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {ev.status === "APPROVED" && (
                        <Link
                          href={`/events/${ev.id}`}
                          className="px-4 py-1.5 rounded-full text-xs font-semibold text-kalvium-text dark:text-kalvium-dark-text hover:text-kalvium-coral bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt hover:bg-white dark:hover:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border transition shadow-soft-xs active:scale-95"
                        >
                          Public Page →
                        </Link>
                      )}
                      {confirmDeleteId === ev.id ? (
                        <div className="flex items-center gap-1.5 animate-fade-in">
                          <span className="text-[11px] text-kalvium-coral font-medium shrink-0">Delete?</span>
                          <button
                            onClick={() => handleDeleteEvent(ev.id)}
                            className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-kalvium-coral text-white hover:bg-kalvium-coral/90 transition active:scale-95 shadow-sm"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt text-kalvium-muted border border-kalvium-border dark:border-kalvium-dark-border hover:border-kalvium-coral transition active:scale-95"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleDeleteEvent(ev.id)}
                          className="p-2 rounded-full text-kalvium-muted hover:text-kalvium-coral bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt hover:bg-white dark:hover:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border transition shadow-soft-xs active:scale-95"
                          title="Delete Event"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Decline Feedback Banner */}
                  {ev.status === "DECLINED" && (
                    <div className="p-4 rounded-xl bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border text-xs space-y-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-kalvium-coral">
                        <XCircle className="w-4 h-4" />
                        <span>Declined by Campus Manager</span>
                      </div>
                      <p className="text-kalvium-text dark:text-kalvium-dark-text">
                        <span className="font-semibold text-kalvium-coral">Reason:</span>{" "}
                        {ev.declineReason || "Event information could not be verified."}
                      </p>
                      {ev.declineCustomNotes && (
                        <p className="text-kalvium-muted dark:text-kalvium-dark-muted text-[11px] pt-1 border-t border-kalvium-border dark:border-kalvium-dark-border">
                          Manager feedback: {ev.declineCustomNotes}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function renderStatusBadge(status: string) {
  switch (status) {
    case "APPROVED":
      return (
        <span className="text-[10px] font-sans uppercase tracking-wider font-semibold bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt text-kalvium-success border border-kalvium-border dark:border-kalvium-dark-border px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-kalvium-success shrink-0" />
          <span>Approved</span>
        </span>
      );
    case "PENDING":
      return (
        <span className="text-[10px] font-sans uppercase tracking-wider font-semibold bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt text-kalvium-warning border border-kalvium-border dark:border-kalvium-dark-border px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
          <Clock className="w-3 h-3 text-kalvium-warning shrink-0" />
          <span>Pending Verification</span>
        </span>
      );
    case "DECLINED":
      return (
        <span className="text-[10px] font-sans uppercase tracking-wider font-semibold bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt text-kalvium-coral border border-kalvium-border dark:border-kalvium-dark-border px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
          <XCircle className="w-3 h-3 text-kalvium-coral shrink-0" />
          <span>Declined</span>
        </span>
      );
    default:
      return (
        <span className="text-[10px] font-sans uppercase tracking-wider font-semibold bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt text-kalvium-muted dark:text-kalvium-dark-muted border border-kalvium-border dark:border-kalvium-dark-border px-2.5 py-0.5 rounded-full">
          Draft
        </span>
      );
  }
}

export default function OrganizerDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-kalvium-coral border-t-transparent animate-spin" />
        </div>
      }
    >
      <OrganizerDashboardContent />
    </Suspense>
  );
}
