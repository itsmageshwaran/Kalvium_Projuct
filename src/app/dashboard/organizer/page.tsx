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
        <div className="p-8 rounded-2xl bg-white  border-2 border-black  shadow-kalvium-md">
          <p className="text-base font-bold text-black  mb-2">Organizer Access Required</p>
          <p className="text-xs text-gray-500  mb-6">
            Please log in as an Organizer or switch to "Robotics Club (Organizer)" using the top demo bar.
          </p>
          <Link
            href="/login"
            className="px-5 py-2.5 rounded-full bg-[#E5391F] hover:bg-black text-white text-xs font-bold shadow-sm transition"
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
          <span className="text-xs font-sans uppercase tracking-widest text-[#E5391F] font-bold bg-white px-4 py-1.5 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_black]">
            Organizer Studio
          </span>
          <h1 className="text-5xl sm:text-6xl font-display font-black text-black tracking-tighter uppercase mt-4 leading-none">
            {user.name}
          </h1>
          <p className="text-xs sm:text-sm font-bold text-gray-600 mt-4 max-w-xl">
            Submit event flyers for AI extraction or create events manually, monitor review queues, and track campus verification.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {activeTab !== "SUBMISSIONS" ? (
            <button
              onClick={() => setActiveTab("SUBMISSIONS")}
              className="px-4 py-2.5 rounded-full border-2 border-black  bg-white  text-black  hover:border-[#E5391F] text-xs font-bold shadow-sm transition shrink-0 active:scale-95"
            >
              ← Back to Submissions
            </button>
          ) : (
            <>
              <button
                onClick={() => setActiveTab("CREATE_AI")}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#E5391F] text-white text-[10px] font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_black] border-2 border-black transition shrink-0 active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-amber-100" />
                <span>+ Create with AI</span>
              </button>

              <button
                onClick={() => setActiveTab("CREATE_MANUAL")}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black border-2 border-black text-[10px] font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_black] hover:bg-black hover:text-white transition shrink-0 active:scale-95"
              >
                <PenTool className="w-3.5 h-3.5 text-[#E5391F]" />
                <span>+ Add Manually</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* 3 Primary Task-Focused Workspace Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-300  pb-4 mb-8 overflow-x-auto">
        <button
          onClick={() => setActiveTab("SUBMISSIONS")}
          className={`px-5 py-2.5 rounded-full text-[10px] uppercase tracking-widest font-black border-2 transition-all duration-200 active:scale-95 flex items-center gap-2 shrink-0 ${
            activeTab === "SUBMISSIONS"
              ? "bg-[#E5391F] text-white border-black shadow-[4px_4px_0px_0px_black]"
              : "bg-white text-black hover:bg-black hover:text-white border-black "
          }`}
        >
          <span>Your Submissions</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-sans font-bold ${
            activeTab === "SUBMISSIONS" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
          }`}>
            {events.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("CREATE_AI")}
          className={`px-5 py-2.5 rounded-full text-[10px] uppercase tracking-widest font-black border-2 transition-all duration-200 active:scale-95 flex items-center gap-2 shrink-0 ${
            activeTab === "CREATE_AI"
              ? "bg-[#E5391F] text-white border-black shadow-[4px_4px_0px_0px_black]"
              : "bg-white text-black hover:bg-black hover:text-white border-black "
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Create with AI Poster</span>
        </button>

        <button
          onClick={() => setActiveTab("CREATE_MANUAL")}
          className={`px-5 py-2.5 rounded-full text-[10px] uppercase tracking-widest font-black border-2 transition-all duration-200 active:scale-95 flex items-center gap-2 shrink-0 ${
            activeTab === "CREATE_MANUAL"
              ? "bg-[#E5391F] text-white border-black shadow-[4px_4px_0px_0px_black]"
              : "bg-white text-black hover:bg-black hover:text-white border-black "
          }`}
        >
          <PenTool className="w-3.5 h-3.5 text-[#E5391F]" />
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
            <div className="p-6 rounded-2xl border-4 border-black bg-[#FFF8E1] shadow-[4px_4px_0px_0px_black] ">
              <span className="text-[10px] font-sans text-black uppercase tracking-widest font-black block mb-1">
                Pending Verification
              </span>
              <p className="text-4xl sm:text-5xl font-display font-black text-black leading-none">{stats.pending}</p>
            </div>

            <div className="p-6 rounded-2xl border-4 border-black bg-[#E8F5E9] shadow-[4px_4px_0px_0px_black] ">
              <span className="text-[10px] font-sans text-black uppercase tracking-widest font-black block mb-1">
                Approved & Public
              </span>
              <p className="text-4xl sm:text-5xl font-display font-black text-black leading-none">{stats.approved}</p>
            </div>

            <div className="p-6 rounded-2xl border-4 border-black bg-[#FDEAE7] shadow-[4px_4px_0px_0px_black] ">
              <span className="text-[10px] font-sans text-[#E5391F] uppercase tracking-widest font-black block mb-1">
                Declined
              </span>
              <p className="text-4xl sm:text-5xl font-display font-black text-[#E5391F] leading-none">{stats.declined}</p>
            </div>
          </div>

          {/* Submissions List Header */}
          <div className="flex items-center justify-between pt-2">
            <h2 className="text-xl font-display font-black uppercase tracking-tighter text-black ">
              Submission History
            </h2>
            <button
              onClick={fetchOrganizerData}
              className="text-xs text-gray-500 hover:text-black  flex items-center gap-1.5 transition active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>

          {loading ? (
            <div className="py-20 text-center text-gray-500 text-sm">
              Loading your submissions...
            </div>
          ) : events.length === 0 ? (
            <div className="py-16 text-center bg-white  border-2 border-black  rounded-2xl p-8 shadow-kalvium-sm">
              <p className="text-sm font-bold text-black  mb-2">No event submissions yet</p>
              <p className="text-xs text-gray-500  mb-6">
                Upload your promotional poster and let the AI analyzer extract structured event details.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => setActiveTab("CREATE_AI")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#E5391F] hover:bg-black text-white text-xs font-bold shadow-sm active:scale-95 transition"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Post with AI Poster</span>
                </button>
                <button
                  onClick={() => setActiveTab("CREATE_MANUAL")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-kalvium-card  border-2 border-black  hover:border-[#E5391F] text-black  text-xs font-bold shadow-sm active:scale-95 transition"
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
                  className="p-6 rounded-2xl bg-white border-4 border-black hover:-translate-y-1 shadow-[4px_4px_0px_0px_black] hover:shadow-[8px_8px_0px_0px_black] transition space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4 min-w-0">
                      <img
                        src={ev.posterUrl || "/images/placeholder.svg"}
                        alt={ev.title}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover bg-gray-100  shrink-0 border-2 border-black "
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-[10px] font-sans uppercase bg-gray-100  text-[#E5391F] px-2.5 py-0.5 rounded-full border-2 border-black font-semibold">
                            {ev.category}
                          </span>
                          {renderStatusBadge(ev.status)}
                          {ev.status === "APPROVED" && <CampusVerifiedBadge size="sm" />}
                        </div>
                        <h3 className="text-xl font-display font-black uppercase tracking-tighter text-black mb-1 truncate leading-none mt-2">{ev.title}</h3>
                        <p className="text-xs text-gray-500 ">
                          {ev.date} • {ev.startTime} – {ev.endTime} • {ev.venue}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {ev.status === "APPROVED" && (
                        <Link
                          href={`/events/${ev.id}`}
                          className="px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest text-[#E5391F] bg-white hover:bg-black hover:text-white border-2 border-black shadow-[2px_2px_0px_0px_black] transition"
                        >
                          Public Page →
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Decline Feedback Banner */}
                  {ev.status === "DECLINED" && (
                    <div className="p-4 rounded-xl bg-[#FDEAE7]  border border-[#E5391F] text-xs text-[#E5391F] space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <XCircle className="w-4 h-4" />
                        <span>Declined by Campus Manager</span>
                      </div>
                      <p className="text-black ">
                        <span className="font-semibold text-[#E5391F]">Reason:</span>{" "}
                        {ev.declineReason || "Event information could not be verified."}
                      </p>
                      {ev.declineCustomNotes && (
                        <p className="text-gray-500 text-[11px] pt-1 border-t border-[#E5391F]">
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
        <span className="text-[10px] font-medium uppercase tracking-wider bg-green-100 text-green-600 border border-green-300 px-2.5 py-0.5 rounded-full">
          Approved
        </span>
      );
    case "PENDING":
      return (
        <span className="text-[10px] font-medium uppercase tracking-wider bg-amber-100 text-amber-600 border border-amber-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Pending Verification
        </span>
      );
    case "DECLINED":
      return (
        <span className="text-[10px] font-medium uppercase tracking-wider bg-[#FDEAE7] text-[#E5391F] border border-[#E5391F] px-2.5 py-0.5 rounded-full flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          Declined
        </span>
      );
    default:
      return (
        <span className="text-[10px] font-medium uppercase tracking-wider bg-gray-100 text-gray-500 border-2 border-black px-2.5 py-0.5 rounded-full">
          Draft
        </span>
      );
  }
}
