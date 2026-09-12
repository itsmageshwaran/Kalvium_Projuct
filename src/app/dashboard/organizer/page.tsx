"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  PlusCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles,
  RefreshCw,
  PenTool,
} from "lucide-react";
import CampusVerifiedBadge from "@/components/CampusVerifiedBadge";
import CreateEventStudio from "@/components/CreateEventStudio";
import { useAuth } from "@/context/AuthContext";

export default function OrganizerDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"SUBMISSIONS" | "CREATE_AI" | "CREATE_MANUAL">("SUBMISSIONS");

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

  useEffect(() => {
    fetchOrganizerData();
  }, [user]);

  if (!user || user.role === "STUDENT") {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="p-8 rounded-2xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border shadow-kalvium-md">
          <p className="text-base font-bold text-kalvium-text dark:text-kalvium-dark-text mb-2">Organizer Access Required</p>
          <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted mb-6">
            Please log in as an Organizer or switch to "Robotics Club (Organizer)" using the top demo bar.
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
          <span className="text-xs font-sans uppercase tracking-widest text-kalvium-coral font-bold bg-kalvium-coral-tint dark:bg-kalvium-dark-coral-tint px-2.5 py-0.5 rounded-full border border-kalvium-coral/20">
            Organizer Studio
          </span>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-kalvium-text dark:text-kalvium-dark-text tracking-tight mt-1">
            {user.name}
          </h1>
          <p className="text-xs sm:text-sm text-kalvium-muted dark:text-kalvium-dark-muted mt-1">
            Submit event flyers for AI extraction or create events manually, monitor review queues, and track campus verification.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {activeTab !== "SUBMISSIONS" ? (
            <button
              onClick={() => setActiveTab("SUBMISSIONS")}
              className="px-4 py-2.5 rounded-full border border-kalvium-border dark:border-kalvium-dark-border bg-white dark:bg-kalvium-dark-surface text-kalvium-text dark:text-kalvium-dark-text hover:border-kalvium-coral text-xs font-bold shadow-sm transition shrink-0 active:scale-95"
            >
              ← Back to Submissions
            </button>
          ) : (
            <>
              <button
                onClick={() => setActiveTab("CREATE_AI")}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-kalvium-coral hover:bg-kalvium-coral-hover text-white text-xs font-bold shadow-sm transition shrink-0 active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-amber-100" />
                <span>+ Create with AI</span>
              </button>

              <button
                onClick={() => setActiveTab("CREATE_MANUAL")}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-kalvium-border dark:border-kalvium-dark-border bg-white dark:bg-kalvium-dark-surface text-kalvium-text dark:text-kalvium-dark-text hover:border-kalvium-coral hover:text-kalvium-coral text-xs font-bold shadow-sm transition shrink-0 active:scale-95"
              >
                <PenTool className="w-3.5 h-3.5 text-kalvium-coral" />
                <span>+ Add Manually</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* 3 Primary Task-Focused Workspace Tabs */}
      <div className="flex items-center gap-2 border-b border-kalvium-border dark:border-kalvium-dark-border pb-4 mb-8 overflow-x-auto">
        <button
          onClick={() => setActiveTab("SUBMISSIONS")}
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
          onClick={() => setActiveTab("CREATE_AI")}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 active:scale-95 flex items-center gap-2 shrink-0 ${
            activeTab === "CREATE_AI"
              ? "bg-kalvium-coral text-white shadow-sm"
              : "bg-white dark:bg-kalvium-dark-surface text-kalvium-muted dark:text-kalvium-dark-muted hover:text-kalvium-text dark:hover:text-kalvium-dark-text border border-kalvium-border dark:border-kalvium-dark-border"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Create with AI Poster</span>
        </button>

        <button
          onClick={() => setActiveTab("CREATE_MANUAL")}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 active:scale-95 flex items-center gap-2 shrink-0 ${
            activeTab === "CREATE_MANUAL"
              ? "bg-kalvium-coral text-white shadow-sm"
              : "bg-white dark:bg-kalvium-dark-surface text-kalvium-muted dark:text-kalvium-dark-muted hover:text-kalvium-text dark:hover:text-kalvium-dark-text border border-kalvium-border dark:border-kalvium-dark-border"
          }`}
        >
          <PenTool className="w-3.5 h-3.5 text-kalvium-coral" />
          <span>Manual Event Entry</span>
        </button>
      </div>

      {/* View 1: Create with AI or Manual */}
      {activeTab === "CREATE_AI" || activeTab === "CREATE_MANUAL" ? (
        <div className="animate-fade-in">
          <CreateEventStudio
            initialMode={activeTab === "CREATE_MANUAL" ? "MANUAL" : "AI"}
            onComplete={() => {
              setActiveTab("SUBMISSIONS");
              fetchOrganizerData();
            }}
          />
        </div>
      ) : (
        /* Tab 2: Your Submissions & Quick Metrics */
        <div className="space-y-6 animate-fade-in">
          {/* Status Metrics Strip */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl border border-kalvium-warning-border bg-kalvium-warning-tint dark:bg-kalvium-dark-warning-tint">
              <span className="text-[11px] font-sans text-kalvium-warning uppercase tracking-wider font-semibold block mb-1">
                Pending Verification
              </span>
              <p className="text-2xl sm:text-3xl font-display font-bold text-kalvium-warning">{stats.pending}</p>
            </div>

            <div className="p-4 rounded-2xl border border-kalvium-success-border bg-kalvium-success-tint dark:bg-kalvium-dark-success-tint">
              <span className="text-[11px] font-sans text-kalvium-success uppercase tracking-wider font-semibold block mb-1">
                Approved & Public
              </span>
              <p className="text-2xl sm:text-3xl font-display font-bold text-kalvium-success">{stats.approved}</p>
            </div>

            <div className="p-4 rounded-2xl border border-kalvium-coral/30 bg-kalvium-coral-tint dark:bg-kalvium-dark-coral-tint">
              <span className="text-[11px] font-sans text-kalvium-coral uppercase tracking-wider font-semibold block mb-1">
                Declined
              </span>
              <p className="text-2xl sm:text-3xl font-display font-bold text-kalvium-coral">{stats.declined}</p>
            </div>
          </div>

          {/* Submissions List Header */}
          <div className="flex items-center justify-between pt-2">
            <h2 className="text-sm font-display font-bold uppercase tracking-wider text-kalvium-text dark:text-kalvium-dark-text">
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
                Upload your promotional poster and let the AI analyzer extract structured event details.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => setActiveTab("CREATE_AI")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-kalvium-coral hover:bg-kalvium-coral-hover text-white text-xs font-bold shadow-sm active:scale-95 transition"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Post with AI Poster</span>
                </button>
                <button
                  onClick={() => setActiveTab("CREATE_MANUAL")}
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
                          <span className="text-[10px] font-sans uppercase bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt text-kalvium-coral px-2.5 py-0.5 rounded-full border border-kalvium-border font-semibold">
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
                          className="px-4 py-1.5 rounded-full text-xs font-semibold text-kalvium-coral bg-kalvium-coral-tint hover:bg-kalvium-coral/20 border border-kalvium-coral/30 transition"
                        >
                          Public Page →
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Decline Feedback Banner */}
                  {ev.status === "DECLINED" && (
                    <div className="p-4 rounded-xl bg-kalvium-coral-tint dark:bg-kalvium-dark-coral-tint border border-kalvium-coral/30 text-xs text-kalvium-coral space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <XCircle className="w-4 h-4" />
                        <span>Declined by Campus Manager</span>
                      </div>
                      <p className="text-kalvium-text dark:text-kalvium-dark-text">
                        <span className="font-semibold text-kalvium-coral">Reason:</span>{" "}
                        {ev.declineReason || "Event information could not be verified."}
                      </p>
                      {ev.declineCustomNotes && (
                        <p className="text-kalvium-muted text-[11px] pt-1 border-t border-kalvium-coral/20">
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
        <span className="text-[10px] font-medium uppercase tracking-wider bg-kalvium-success-tint text-kalvium-success border border-kalvium-success-border px-2.5 py-0.5 rounded-full">
          Approved
        </span>
      );
    case "PENDING":
      return (
        <span className="text-[10px] font-medium uppercase tracking-wider bg-kalvium-warning-tint text-kalvium-warning border border-kalvium-warning-border px-2.5 py-0.5 rounded-full flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Pending Verification
        </span>
      );
    case "DECLINED":
      return (
        <span className="text-[10px] font-medium uppercase tracking-wider bg-kalvium-coral-tint text-kalvium-coral border border-kalvium-coral/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          Declined
        </span>
      );
    default:
      return (
        <span className="text-[10px] font-medium uppercase tracking-wider bg-kalvium-surface-alt text-kalvium-muted border border-kalvium-border px-2.5 py-0.5 rounded-full">
          Draft
        </span>
      );
  }
}
