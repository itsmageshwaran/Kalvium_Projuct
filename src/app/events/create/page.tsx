"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Sparkles, PenTool, ArrowLeft, Clock } from "lucide-react";
import CreateEventStudio from "@/components/CreateEventStudio";
import ManualEventForm from "@/components/ManualEventForm";
import { useAuth } from "@/context/AuthContext";

function CreateEventStudioInner() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const initialMode = searchParams?.get("mode") === "manual" ? "MANUAL" : "AI";
  const [activeTab, setActiveTab] = useState<"AI" | "MANUAL">(initialMode);

  const isManager = user?.role?.toUpperCase() === "CAMPUS_MANAGER";
  const isOrganizer = user?.role?.toUpperCase() === "ORGANIZER";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Navigation Back Link & Mode Indicator */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {isManager ? (
          <Link
            href="/dashboard/manager"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-kalvium-muted dark:text-kalvium-dark-muted hover:text-kalvium-coral transition active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Manager's Portal</span>
          </Link>
        ) : isOrganizer ? (
          <Link
            href="/dashboard/organizer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-kalvium-muted dark:text-kalvium-dark-muted hover:text-kalvium-coral transition active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Organizer's Portal</span>
          </Link>
        ) : (
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-kalvium-muted dark:text-kalvium-dark-muted hover:text-kalvium-coral transition active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Events</span>
          </Link>
        )}

        {isManager && (
          <span className="text-xs font-sans uppercase tracking-widest text-kalvium-warning font-bold bg-kalvium-warning-tint dark:bg-kalvium-dark-warning-tint px-3 py-1 rounded-full border border-kalvium-warning-border dark:border-kalvium-dark-warning-border inline-flex items-center gap-1.5 w-fit">
            <Clock className="w-3.5 h-3.5" />
            <span>Sends to Verification Studio for Approval</span>
          </span>
        )}
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="text-xs font-sans uppercase tracking-widest text-kalvium-coral font-bold bg-kalvium-coral-tint dark:bg-kalvium-dark-coral-tint px-2.5 py-0.5 rounded-full border border-kalvium-coral/20">
            {activeTab === "AI" ? "AI Event Creation Studio" : "Manual Event Creation"}
          </span>
          <span className="text-kalvium-muted">•</span>
          <span className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted">
            {activeTab === "AI" ? "Automated Poster Analysis" : "Standard Form Entry"}
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-kalvium-text dark:text-kalvium-dark-text tracking-tight">
          {activeTab === "AI"
            ? "Create an Event with AI Poster Analysis"
            : "Create Event via Manual Entry"}
        </h1>
        <p className="text-sm text-kalvium-muted dark:text-kalvium-dark-muted mt-1">
          {activeTab === "AI"
            ? "Upload your event poster and let AI extract structured event details, evaluate confidence scores, and format content."
            : "Enter event title, schedule dates, select a preset banner or custom poster, and publish your event directly."}
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-kalvium-border dark:border-kalvium-dark-border pb-4 mb-8 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("AI")}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 active:scale-95 flex items-center gap-2 shrink-0 ${
            activeTab === "AI"
              ? "bg-kalvium-coral text-white shadow-sm"
              : "bg-white dark:bg-kalvium-dark-surface text-kalvium-muted dark:text-kalvium-dark-muted hover:text-kalvium-text dark:hover:text-kalvium-dark-text border border-kalvium-border dark:border-kalvium-dark-border"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Poster Analysis</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("MANUAL")}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 active:scale-95 flex items-center gap-2 shrink-0 ${
            activeTab === "MANUAL"
              ? "bg-kalvium-coral text-white shadow-sm"
              : "bg-white dark:bg-kalvium-dark-surface text-kalvium-muted dark:text-kalvium-dark-muted hover:text-kalvium-text dark:hover:text-kalvium-dark-text border border-kalvium-border dark:border-kalvium-dark-border"
          }`}
        >
          <PenTool className="w-3.5 h-3.5" />
          <span>Manual Entry</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === "AI" ? (
        <CreateEventStudio />
      ) : (
        <ManualEventForm />
      )}
    </div>
  );
}

export default function CreateEventStudioPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-kalvium-coral border-t-transparent animate-spin" />
        </div>
      }
    >
      <CreateEventStudioInner />
    </Suspense>
  );
}
