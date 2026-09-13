"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  MapPin,
  Calendar,
  User,
  Sparkles,
  ArrowRight,
  Edit3,
  RefreshCw,
  ExternalLink,
  Search,
  Eye,
  Info,
} from "lucide-react";
import confetti from "canvas-confetti";
import CampusVerifiedBadge from "@/components/CampusVerifiedBadge";
import DeclineReasonModal from "@/components/DeclineReasonModal";
import { useAuth } from "@/context/AuthContext";
import { ConfidenceLevel } from "@/lib/ai-poster-analyzer";

export default function CampusManagerVerificationQueue() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Selected event for deep verification review
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableFields, setEditableFields] = useState<any>({});

  // Tab state: single unified workspace
  const [activeTab, setActiveTab] = useState<"PENDING" | "APPROVED" | "DECLINED">("PENDING");
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Decline modal state
  const [declineModalOpen, setDeclineModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const fetchPendingQueue = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch("/api/manager/pending", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        setData(json);
        if (json.pendingEvents && json.pendingEvents.length > 0 && !selectedEvent) {
          selectEventForReview(json.pendingEvents[0]);
        }
      }
    } catch (e) {
      console.error("Queue load error:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    if (!user) return;
    setHistoryLoading(true);
    try {
      const res = await fetch("/api/manager/history", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        setHistory(json.history || []);
      }
    } catch (e) {
      console.error("History load error:", e);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingQueue();
    fetchHistory();
  }, [user]);

  const selectEventForReview = (event: any) => {
    setSelectedEvent(event);
    setEditableFields({
      title: event.title,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      venue: event.venue,
      organizerName: event.organizerName || "",
      category: event.category,
      summary: event.summary,
      description: event.description,
    });
    setIsEditing(false);
  };

  // Campus Manager Approves Event
  const handleApprove = async () => {
    if (!selectedEvent) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/manager/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: selectedEvent.id,
          action: "APPROVE",
          corrections: isEditing ? editableFields : undefined,
        }),
      });

      if (res.ok) {
        // Trigger celebratory confetti for verification stamp!
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#10B981", "#6366F1", "#3B82F6"],
        });

        setSuccessToast(`✓ "${selectedEvent.title}" stamped with CAMPUS VERIFIED badge and published!`);
        setTimeout(() => setSuccessToast(null), 5000);

        setSelectedEvent(null);
        fetchPendingQueue();
        fetchHistory();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  // Campus Manager Declines Event
  const handleConfirmDecline = async (reason: string, customNotes: string) => {
    if (!selectedEvent) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/manager/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: selectedEvent.id,
          action: "DECLINE",
          reason,
          customNotes,
        }),
      });

      if (res.ok) {
        setSuccessToast(`Event declined. Feedback logged for organizer.`);
        setTimeout(() => setSuccessToast(null), 4000);
        setSelectedEvent(null);
        fetchPendingQueue();
        fetchHistory();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  if (!user || user.role !== "CAMPUS_MANAGER") {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="p-8 rounded-3xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border shadow-soft-sm text-center">
          <div className="w-12 h-12 rounded-full bg-kalvium-success-tint border border-kalvium-success-border text-kalvium-success flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-display font-black text-kalvium-ink dark:text-kalvium-dark-ink mb-2">Campus Manager Portal</h2>
          <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted mb-6">
            Only campus leadership and verified managers have authority to approve or decline submissions.
            Please switch to "Dr. Sharma (Campus Manager)" using the top evaluation bar.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center px-5 py-2.5 rounded-full bg-kalvium-coral hover:bg-kalvium-coral-hover text-white text-xs font-bold transition shadow-soft-xs"
          >
            Sign In with Manager Credentials
          </Link>
        </div>
      </div>
    );
  }

  const stats = data?.stats || { pending: 0, approved: 0, declined: 0, total: 0 };
  const pendingEvents = data?.pendingEvents || [];

  // Parse AI Analysis data if available
  let confidenceMap: Record<string, ConfidenceLevel> = {
    title: "HIGH",
    date: "HIGH",
    startTime: "MEDIUM",
    endTime: "LOW",
    venue: "HIGH",
    organizerName: "LOW",
  };

  if (selectedEvent?.analyses && selectedEvent.analyses[0]?.confidenceData) {
    try {
      confidenceMap = {
        ...confidenceMap,
        ...JSON.parse(selectedEvent.analyses[0].confidenceData),
      };
    } catch {
      // fallback
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Signature Pipeline Concept Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="text-[10px] font-sans uppercase tracking-widest text-black font-black bg-white px-4 py-1.5 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_black]">
            Official Campus Certification Studio
          </span>
          <span className="text-kalvium-muted hidden sm:inline">•</span>
          <div className="hidden sm:flex items-center gap-2 text-[10px] font-sans font-black tracking-widest text-black bg-white px-4 py-1.5 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_black]">
            <span className="text-black font-black uppercase tracking-widest">POSTER TRUTH</span>
            <span className="text-[#E5391F] font-black">→</span>
            <span className="text-[#E5391F] font-black uppercase tracking-widest">AI UNDERSTANDING</span>
            <span className="text-[#E5391F] font-black">→</span>
            <span className="text-[#FFB300] font-black uppercase tracking-widest">HUMAN VERIFICATION</span>
            <span className="text-kalvium-success font-bold">→</span>
            <span className="text-white font-black bg-[#10B981] px-2.5 py-0.5 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_black] uppercase tracking-widest">
              ✓ CAMPUS VERIFIED
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-5xl sm:text-6xl font-display font-black text-black tracking-tighter uppercase mt-4 leading-none">
              Event Verification Center
            </h1>
            <p className="text-xs sm:text-sm text-black font-bold mt-4">
              Authenticate event legitimacy against original posters before events reach student feeds.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/manager/history"
              className="px-6 py-3 rounded-full bg-white border-2 border-black text-[10px] font-black uppercase tracking-widest text-black hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_black] active:translate-y-1 active:shadow-[2px_2px_0px_0px_black]"
            >
              View Audit History →
            </Link>
            <button
              onClick={fetchPendingQueue}
              className="p-3 rounded-full bg-white border-2 border-black text-black hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_black] active:translate-y-1 active:shadow-[2px_2px_0px_0px_black]"
              title="Refresh Queue"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {successToast && (
        <div className="mb-6 p-4 rounded-2xl bg-kalvium-success-tint border border-kalvium-success-border text-kalvium-success text-xs font-semibold flex items-center justify-between shadow-soft-sm animate-slide-down">
          <span>{successToast}</span>
          <button onClick={() => setSuccessToast(null)} className="text-kalvium-success hover:opacity-75 active:scale-90 transition-transform">
            ✕
          </button>
        </div>
      )}

      {/* 3 Main Task-Focused Tabs: Pending / Approved / Declined */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
        <button
          onClick={() => setActiveTab("PENDING")}
          className={`p-6 rounded-2xl border-4 border-black text-left transition-all shadow-[4px_4px_0px_0px_black] hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_black] ${activeTab === "PENDING"
              ? "bg-white"
              : "bg-gray-100 opacity-80"
            }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-sans uppercase tracking-widest font-black text-black">
              Needs Review
            </span>
            <span className="w-3 h-3 rounded-full bg-[#FFB300] border-2 border-black animate-pulse" />
          </div>
          <p className="text-5xl sm:text-6xl font-display font-black text-black mt-4 leading-none">
            {stats.pending.toString().padStart(2, "0")}
          </p>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-2">Pending verification queue</p>
        </button>

        <button
          onClick={() => {
            setActiveTab("APPROVED");
            fetchHistory();
          }}
          className={`p-6 rounded-2xl border-4 border-black text-left transition-all shadow-[4px_4px_0px_0px_black] hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_black] ${activeTab === "APPROVED"
              ? "bg-[#E8F5E9]"
              : "bg-gray-100 opacity-80"
            }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-sans uppercase tracking-widest font-black text-black">
              Campus Verified
            </span>
            <CheckCircle2 className="w-5 h-5 text-black" strokeWidth={3} />
          </div>
          <p className="text-5xl sm:text-6xl font-display font-black text-black mt-4 leading-none">
            {stats.approved.toString().padStart(2, "0")}
          </p>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-2">Certified events audit</p>
        </button>

        <button
          onClick={() => {
            setActiveTab("DECLINED");
            fetchHistory();
          }}
          className={`p-6 rounded-2xl border-4 border-black text-left transition-all shadow-[4px_4px_0px_0px_black] hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_black] ${activeTab === "DECLINED"
              ? "bg-[#FDEAE7]"
              : "bg-gray-100 opacity-80"
            }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-sans uppercase tracking-widest font-black text-[#E5391F]">
              Declined Submissions
            </span>
            <XCircle className="w-5 h-5 text-[#E5391F]" strokeWidth={3} />
          </div>
          <p className="text-5xl sm:text-6xl font-display font-black text-[#E5391F] mt-4 leading-none">
            {stats.declined.toString().padStart(2, "0")}
          </p>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-2">Declined with feedback log</p>
        </button>
      </div>

      {/* Main Verification Studio & Views */}
      {activeTab === "PENDING" ? (
        loading ? (
          <div className="py-24 text-center text-kalvium-muted dark:text-kalvium-dark-muted text-sm">
            Loading verification queue...
          </div>
        ) : pendingEvents.length === 0 ? (
          <div className="py-20 text-center bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border rounded-3xl p-8 max-w-xl mx-auto shadow-soft-sm">
            <div className="w-12 h-12 rounded-full bg-kalvium-success-tint border border-kalvium-success-border text-kalvium-success flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-display font-black text-kalvium-ink dark:text-kalvium-dark-ink mb-1">Verification Queue is Clear</h3>
            <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted mb-4">
              All submitted campus event posters have been certified. New submissions from student organizers will appear here immediately.
            </p>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-kalvium-coral hover:bg-kalvium-coral-hover text-white text-xs font-bold transition shadow-soft-xs"
            >
              View Public Approved Events
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Queue List (Select an event to inspect) */}
            <div className="lg:col-span-4 space-y-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-sans uppercase tracking-widest text-black font-black">
                  Queue ({pendingEvents.length} Pending)
                </span>
                <span className="text-[10px] font-black text-[#E5391F] uppercase tracking-widest">Click to Inspect</span>
              </div>

              <div className="space-y-3 max-h-[750px] overflow-y-auto pr-1">
                {pendingEvents.map((event: any, idx: number) => {
                  const isSelected = selectedEvent?.id === event.id;
                  return (
                    <div
                      key={event.id}
                      onClick={() => selectEventForReview(event)}
                      className={`p-5 rounded-2xl border-4 border-black cursor-pointer transition-all duration-200 ease-out-expo animate-slide-up stagger-${(idx % 4) + 1} ${isSelected
                          ? "bg-[#FDEAE7] scale-[1.01]"
                          : "bg-white shadow-[2px_2px_0px_0px_black] hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_black]"
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={event.posterUrl}
                          alt={event.title}
                          className="w-16 h-16 rounded-xl object-cover bg-gray-100 shrink-0 border-2 border-black"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-sans font-black uppercase tracking-widest text-[#E5391F] block mb-1">
                            {event.category}
                          </span>
                          <h4 className="text-lg font-display font-black uppercase tracking-tighter text-black truncate mb-1 leading-none">
                            {event.title}
                          </h4>
                          <div className="text-[10px] text-black font-bold uppercase tracking-widest space-y-0.5 mt-2">
                            <p>{event.date} • {event.startTime}</p>
                            <p className="truncate text-kalvium-ink/80 dark:text-kalvium-dark-ink/80 font-medium">
                              By {event.organizerName || event.organizer?.name}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Signature Side-By-Side Verification Studio */}
            <div className="lg:col-span-8">
              {selectedEvent ? (
                <div className="bg-white border-4 border-black rounded-3xl p-6 space-y-6 shadow-[8px_8px_0px_0px_black]">
                  {/* Studio Header & Certification Disclaimer */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-4 border-black">
                    <div>
                      <span className="text-[10px] font-sans uppercase tracking-widest text-black font-black bg-[#FFF8E1] px-3 py-1 rounded-full border-2 border-black">
                        Pending Manager Certification
                      </span>
                      <h2 className="text-3xl font-display font-black uppercase tracking-tighter text-black mt-4 leading-none">
                        {selectedEvent.title}
                      </h2>
                      <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted">
                        Submitted by <span className="text-black font-black uppercase tracking-widest">{selectedEvent.organizerName || selectedEvent.organizer?.name}</span> ({selectedEvent.organizer?.email})
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsEditing(!isEditing)}
                        className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition border-2 border-black shadow-[2px_2px_0px_0px_black] ${isEditing
                            ? "bg-black text-white shadow-none translate-y-0.5"
                            : "bg-white border-2 border-black shadow-[2px_2px_0px_0px_black] text-kalvium-ink dark:text-kalvium-dark-ink hover:border-kalvium-coral"
                          }`}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{isEditing ? "Editing Mode Active" : "Edit Before Approving"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Mandated Human Authority Disclaimer */}
                  <div className="p-4 rounded-2xl bg-gray-50 border-2 border-black flex items-start gap-2.5 text-[10px] font-bold text-black uppercase tracking-widest">
                    <Info className="w-5 h-5 text-[#E5391F] shrink-0 mt-0.5" strokeWidth={3} />
                    <span>
                      <strong className="text-black font-black uppercase tracking-widest">Campus Trust Authority:</strong> AI only extracts optical content and does not certify event truthfulness. As Campus Manager, you are the verifying authority who certifies this event's legitimacy.
                    </span>
                  </div>

                  {/* Side-By-Side: ORIGINAL POSTER vs AI EXTRACTED INFORMATION */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Left Column: ORIGINAL POSTER (High Prominence) */}
                    <div className="md:col-span-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-sans font-bold uppercase tracking-wider text-kalvium-ink dark:text-kalvium-dark-ink flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-kalvium-coral" />
                          Original Poster Truth
                        </span>
                        <a
                          href={selectedEvent.posterUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] font-black text-[#E5391F] uppercase tracking-widest hover:underline flex items-center gap-1"
                        >
                          Full Res <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      <div className="rounded-2xl overflow-hidden bg-white border-2 border-black shadow-[2px_2px_0px_0px_black] shadow-soft-sm group relative">
                        <img
                          src={selectedEvent.posterUrl}
                          alt="Original Poster"
                          className="w-full h-auto object-cover max-h-[480px] transition-transform duration-500 ease-out-expo group-hover:scale-[1.02] will-change-transform"
                        />
                      </div>
                    </div>

                    {/* Right Column: AI EXTRACTED DETAILS & FIELD CONFIDENCES */}
                    <div className="md:col-span-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-sans font-bold uppercase tracking-wider text-kalvium-ink dark:text-kalvium-dark-ink flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-kalvium-coral" />
                          AI Understanding & Confidence
                        </span>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-kalvium-muted dark:text-kalvium-dark-muted">
                          Field-Level Scrutiny
                        </span>
                      </div>

                      {/* Field 1: Title */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-kalvium-ink dark:text-kalvium-dark-ink">Title</span>
                          {renderConfidenceBadge(confidenceMap.title)}
                        </div>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editableFields.title}
                            onChange={(e) =>
                              setEditableFields({ ...editableFields, title: e.target.value })
                            }
                            className="w-full bg-white border-2 border-black shadow-[2px_2px_0px_0px_black] rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-black focus:outline-none"
                          />
                        ) : (
                          <p className="p-2.5 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_0px_black] text-[10px] font-black uppercase tracking-widest text-black">
                            {selectedEvent.title}
                          </p>
                        )}
                      </div>

                      {/* Field 2: Date */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-kalvium-ink dark:text-kalvium-dark-ink">Date</span>
                          {renderConfidenceBadge(confidenceMap.date)}
                        </div>
                        {isEditing ? (
                          <input
                            type="date"
                            value={editableFields.date}
                            onChange={(e) =>
                              setEditableFields({ ...editableFields, date: e.target.value })
                            }
                            className="w-full bg-white border-2 border-black shadow-[2px_2px_0px_0px_black] rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-black focus:outline-none"
                          />
                        ) : (
                          <p className="p-2.5 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_0px_black] text-[10px] font-black uppercase tracking-widest text-black">
                            {selectedEvent.date}
                          </p>
                        )}
                      </div>

                      {/* Field 3: Time (Often MEDIUM/LOW confidence -> visually highlighted) */}
                      <div
                        className={`p-2.5 rounded-xl border transition ${confidenceMap.startTime === "LOW" || confidenceMap.endTime === "LOW"
                            ? "bg-kalvium-warning-tint/50 border-kalvium-warning/40"
                            : "bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border-kalvium-border dark:border-kalvium-dark-border"
                          }`}
                      >
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-semibold text-kalvium-ink dark:text-kalvium-dark-ink flex items-center gap-1">
                            <Clock className="w-3 h-3 text-kalvium-warning" />
                            <span>Scheduled Time Window</span>
                          </span>
                          {renderConfidenceBadge(confidenceMap.startTime || "MEDIUM")}
                        </div>

                        {isEditing ? (
                          <div className="grid grid-cols-2 gap-2 mt-1">
                            <input
                              type="text"
                              value={editableFields.startTime}
                              onChange={(e) =>
                                setEditableFields({ ...editableFields, startTime: e.target.value })
                              }
                              className="bg-white dark:bg-kalvium-dark-surface border border-kalvium-coral/50 rounded-lg px-2 py-1.5 text-xs text-kalvium-ink dark:text-kalvium-dark-ink"
                              placeholder="Start: 10:00 AM"
                            />
                            <input
                              type="text"
                              value={editableFields.endTime}
                              onChange={(e) =>
                                setEditableFields({ ...editableFields, endTime: e.target.value })
                              }
                              className="bg-white dark:bg-kalvium-dark-surface border border-kalvium-coral/50 rounded-lg px-2 py-1.5 text-xs text-kalvium-ink dark:text-kalvium-dark-ink"
                              placeholder="End: 01:00 PM"
                            />
                          </div>
                        ) : (
                          <p className="text-[10px] font-black uppercase tracking-widest text-black">
                            {selectedEvent.startTime} – {selectedEvent.endTime}
                          </p>
                        )}

                        {(confidenceMap.startTime !== "HIGH" || confidenceMap.endTime !== "HIGH") && (
                          <span className="text-[10px] text-[#FFB300] font-black uppercase tracking-widest block mt-1">
                            ⚠ Check poster for exact duration & end-time clarification
                          </span>
                        )}
                      </div>

                      {/* Field 4: Venue */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-kalvium-ink dark:text-kalvium-dark-ink">Venue</span>
                          {renderConfidenceBadge(confidenceMap.venue)}
                        </div>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editableFields.venue}
                            onChange={(e) =>
                              setEditableFields({ ...editableFields, venue: e.target.value })
                            }
                            className="w-full bg-white border-2 border-black shadow-[2px_2px_0px_0px_black] rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-black"
                          />
                        ) : (
                          <p className="p-2.5 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_0px_black] text-[10px] font-black uppercase tracking-widest text-black">
                            {selectedEvent.venue}
                          </p>
                        )}
                      </div>

                      {/* Field 5: Organizer (Uncertain -> Low Confidence Warning) */}
                      <div
                        className={`p-2.5 rounded-xl border transition ${confidenceMap.organizerName === "LOW"
                            ? "bg-kalvium-warning-tint/50 border-kalvium-warning/40"
                            : "bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border-kalvium-border dark:border-kalvium-dark-border"
                          }`}
                      >
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-semibold text-kalvium-ink dark:text-kalvium-dark-ink">Organizer / Host</span>
                          {renderConfidenceBadge(confidenceMap.organizerName || "LOW")}
                        </div>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editableFields.organizerName}
                            onChange={(e) =>
                              setEditableFields({ ...editableFields, organizerName: e.target.value })
                            }
                            className="w-full bg-white dark:bg-kalvium-dark-surface border border-kalvium-coral/50 rounded-lg px-2 py-1.5 text-xs text-kalvium-ink dark:text-kalvium-dark-ink mt-1"
                          />
                        ) : (
                          <p className="text-[10px] font-black uppercase tracking-widest text-black">
                            {selectedEvent.organizerName || selectedEvent.organizer?.name}
                          </p>
                        )}
                        {confidenceMap.organizerName === "LOW" && (
                          <span className="text-[10px] text-[#FFB300] font-black uppercase tracking-widest block mt-1">
                            ⚠ Needs manual verification: Confirm organizer is registered student union society
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description & Summary Section */}
                  <div className="p-4 rounded-2xl bg-white border-2 border-black shadow-[2px_2px_0px_0px_black] space-y-2">
                    <span className="text-[10px] font-sans uppercase tracking-widest text-black font-black block">
                      Generated Description (Anti-Hallucination Checked)
                    </span>
                    {isEditing ? (
                      <textarea
                        rows={3}
                        value={editableFields.description}
                        onChange={(e) =>
                          setEditableFields({ ...editableFields, description: e.target.value })
                        }
                        className="w-full bg-white dark:bg-kalvium-dark-surface border border-kalvium-coral/50 rounded-xl p-3 text-xs text-kalvium-ink dark:text-kalvium-dark-ink focus:outline-none"
                      />
                    ) : (
                      <p className="text-xs text-kalvium-ink/90 dark:text-kalvium-dark-ink/90 leading-relaxed">
                        {selectedEvent.description}
                      </p>
                    )}
                  </div>

                  {/* Verification Decision Actions */}
                  <div className="pt-4 border-t-4 border-black flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted">
                      Action will be permanently recorded in Campus Verification Audit Log.
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      {/* DECLINE BUTTON */}
                      <button
                        onClick={() => setDeclineModalOpen(true)}
                        disabled={actionLoading}
                        className="flex-1 sm:flex-initial px-6 py-3 rounded-full text-[10px] uppercase tracking-widest font-black text-black bg-white hover:bg-black hover:text-white border-2 border-black shadow-[4px_4px_0px_0px_black] transition-all duration-200 active:scale-95"
                      >
                        Decline Event...
                      </button>

                      {/* APPROVE BUTTON */}
                      <button
                        onClick={handleApprove}
                        disabled={actionLoading}
                        className="flex-1 sm:flex-initial px-8 py-3 rounded-full text-[10px] uppercase tracking-widest font-black text-white bg-[#10B981] hover:bg-black border-2 border-black shadow-[4px_4px_0px_0px_black] transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        <span>{isEditing ? "Save Edits & Approve" : "Approve Event (Stamp Verified)"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border rounded-3xl shadow-soft-xs">
                  <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted">
                    Select a pending event from the queue on the left to begin verification.
                  </p>
                </div>
              )}
            </div>
          </div>
        )) : activeTab === "APPROVED" ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-sans uppercase tracking-widest text-black font-black">
                Campus Certified Events ({history.filter((h) => h.action === "APPROVED").length})
              </span>
            </div>
            {historyLoading ? (
              <div className="py-20 text-center text-kalvium-muted dark:text-kalvium-dark-muted text-sm">Loading certified events...</div>
            ) : history.filter((h) => h.action === "APPROVED").length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border rounded-2xl max-w-xl mx-auto shadow-soft-xs">
                <p className="text-sm font-bold text-kalvium-ink dark:text-kalvium-dark-ink mb-1">No certified events recorded yet</p>
                <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted">Approved events from the pending queue will be cataloged here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history
                  .filter((h) => h.action === "APPROVED")
                  .map((entry) => (
                    <div
                      key={entry.id}
                      className="p-5 rounded-2xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-success-border/60 hover:border-kalvium-success shadow-soft-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200"
                    >
                      <div className="flex items-start gap-4 min-w-0">
                        <img
                          src={entry.event?.posterUrl || "/images/placeholder.svg"}
                          alt={entry.event?.title || "Event"}
                          className="w-16 h-16 rounded-xl object-cover bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt shrink-0 border border-kalvium-border dark:border-kalvium-dark-border"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-[10px] font-sans uppercase tracking-wider font-bold bg-kalvium-success-tint text-kalvium-success border border-kalvium-success-border px-2.5 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Approved & Certified
                            </span>
                            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-kalvium-muted dark:text-kalvium-dark-muted bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt px-2.5 py-0.5 rounded-full">
                              {entry.event?.category}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-kalvium-ink dark:text-kalvium-dark-ink truncate">{entry.event?.title}</h4>
                          <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted mt-0.5">
                            {entry.event?.date} • {entry.event?.venue}
                          </p>
                        </div>
                      </div>

                      <div className="sm:text-right shrink-0">
                        <span className="text-[11px] font-sans text-kalvium-muted dark:text-kalvium-dark-muted block">
                          {new Date(entry.timestamp).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-black font-black uppercase tracking-widest block mt-0.5">
                          Verified by {entry.manager?.name}
                        </span>
                        {entry.event?.id && (
                          <Link
                            href={`/events/${entry.event.id}`}
                            className="inline-flex items-center gap-1 text-xs font-bold text-kalvium-coral hover:underline mt-1"
                          >
                            View Live <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-sans uppercase tracking-widest text-black font-black">
              Declined Submissions ({history.filter((h) => h.action === "DECLINED").length})
            </span>
          </div>
          {historyLoading ? (
            <div className="py-20 text-center text-kalvium-muted dark:text-kalvium-dark-muted text-sm">Loading declined submissions...</div>
          ) : history.filter((h) => h.action === "DECLINED").length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border rounded-2xl max-w-xl mx-auto shadow-soft-xs">
              <p className="text-sm font-bold text-kalvium-ink dark:text-kalvium-dark-ink mb-1">No declined events</p>
              <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted">Submissions declined during review will appear here with rationale.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history
                .filter((h) => h.action === "DECLINED")
                .map((entry) => (
                  <div
                    key={entry.id}
                    className="p-5 rounded-2xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-coral/30 hover:border-kalvium-coral/60 shadow-soft-xs flex flex-col gap-3 transition-all duration-200"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-4 min-w-0">
                        <img
                          src={entry.event?.posterUrl || "/images/placeholder.svg"}
                          alt={entry.event?.title || "Event"}
                          className="w-16 h-16 rounded-xl object-cover bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt shrink-0 border border-kalvium-border dark:border-kalvium-dark-border opacity-60"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-[10px] font-sans uppercase tracking-wider font-bold bg-kalvium-coral-tint text-kalvium-coral border border-kalvium-coral/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                              <XCircle className="w-3 h-3" />
                              Declined
                            </span>
                            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-kalvium-muted dark:text-kalvium-dark-muted bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt px-2.5 py-0.5 rounded-full">
                              {entry.event?.category}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-kalvium-ink dark:text-kalvium-dark-ink truncate">{entry.event?.title}</h4>
                          <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted mt-0.5">
                            {entry.event?.date} • {entry.event?.venue}
                          </p>
                        </div>
                      </div>

                      <div className="sm:text-right shrink-0">
                        <span className="text-[11px] font-sans text-kalvium-muted dark:text-kalvium-dark-muted block">
                          {new Date(entry.timestamp).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-black font-black uppercase tracking-widest block mt-0.5">
                          Manager: {entry.manager?.name}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2.5 border-t-4 border-black text-xs text-kalvium-ink/90 dark:text-kalvium-dark-ink/90 flex items-start gap-2">
                      <span className="font-bold text-kalvium-coral shrink-0">Reason:</span>
                      <span className="text-kalvium-ink/80 dark:text-kalvium-dark-ink/80">
                        {entry.reason ? `${entry.reason} — ` : ""}
                        {entry.notes || "No additional feedback provided."}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Decline Reason Modal */}
      {selectedEvent && (
        <DeclineReasonModal
          isOpen={declineModalOpen}
          onClose={() => setDeclineModalOpen(false)}
          onConfirmDecline={handleConfirmDecline}
          eventTitle={selectedEvent.title}
        />
      )}
    </div>
  );
}

function renderConfidenceBadge(level?: ConfidenceLevel | string) {
  if (level === "MANUAL") {
    return (
      <span className="text-[10px] font-sans font-bold text-kalvium-coral bg-kalvium-coral-tint border border-kalvium-coral/30 px-2 py-0.5 rounded-full">
        ✍️ Manual Entry
      </span>
    );
  }
  if (level === "HIGH") {
    return (
      <span className="text-[10px] font-sans font-bold text-kalvium-success bg-kalvium-success-tint border border-kalvium-success-border px-2 py-0.5 rounded-full">
        ✓ High
      </span>
    );
  }
  if (level === "MEDIUM") {
    return (
      <span className="text-[10px] font-sans font-bold text-kalvium-warning bg-kalvium-warning-tint border border-kalvium-warning-border px-2 py-0.5 rounded-full">
        ⚠ Medium
      </span>
    );
  }
  return (
    <span className="text-[10px] font-sans font-bold text-kalvium-coral bg-kalvium-coral-tint border border-kalvium-coral/30 px-2 py-0.5 rounded-full">
      ⚠ Low (Scrutinize)
    </span>
  );
}
