"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Building2,
  Calendar,
  Share2,
  Printer,
  ChevronRight,
  Users,
  Megaphone,
  CheckSquare,
  ArrowRight,
  FileText,
  BadgeCheck,
} from "lucide-react";
import CampusVerifiedBadge from "@/components/CampusVerifiedBadge";

export default function EventGuidelinesPage() {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="min-h-screen py-10 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Breadcrumb Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs text-kalvium-muted dark:text-kalvium-dark-muted mb-3 font-medium">
          <Link href="/" className="hover:text-kalvium-coral transition">
            Home
          </Link>
          <span>/</span>
          <span className="text-kalvium-text dark:text-kalvium-dark-text font-semibold">Governance</span>
          <span>/</span>
          <span className="text-kalvium-coral font-semibold">Event Guidelines</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-kalvium-border dark:border-kalvium-dark-border">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-kalvium-coral-tint dark:bg-kalvium-dark-coral-tint border border-kalvium-coral/20 text-kalvium-coral text-xs font-bold mb-2">
              <ShieldCheck size={13} />
              <span>Campus Standards & Organizer Code</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-kalvium-text dark:text-kalvium-dark-text tracking-tight">
              Event Hosting Guidelines
            </h1>
            <p className="text-xs sm:text-sm text-kalvium-muted dark:text-kalvium-dark-muted mt-1 max-w-2xl leading-relaxed">
              To ensure campus events run smoothly, maintain high participation, and adhere to community standards, organizers must observe the following rules:
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-center">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-kalvium-border dark:border-kalvium-dark-border bg-white dark:bg-kalvium-dark-surface text-xs font-semibold text-kalvium-text dark:text-kalvium-dark-text hover:border-kalvium-coral transition shadow-soft-xs"
              title="Copy page URL"
            >
              <Share2 size={13} />
              <span>{copied ? "Link Copied!" : "Share"}</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-kalvium-border dark:border-kalvium-dark-border bg-white dark:bg-kalvium-dark-surface text-xs font-semibold text-kalvium-text dark:text-kalvium-dark-text hover:border-kalvium-coral transition shadow-soft-xs print:hidden"
              title="Print document"
            >
              <Printer size={13} />
              <span>Print</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Core Guidelines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {/* Guideline 1 */}
        <div className="bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border rounded-3xl p-6 sm:p-7 shadow-kalvium-sm hover:border-kalvium-coral/40 transition space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-kalvium-coral-tint dark:bg-kalvium-dark-coral-tint text-kalvium-coral flex items-center justify-center font-bold">
              <CampusVerifiedBadge size="sm" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt text-kalvium-coral">
              Rule 1
            </span>
          </div>
          <h3 className="text-base font-bold text-kalvium-text dark:text-kalvium-dark-text">
            Event Verification & Scope
          </h3>
          <p className="text-xs sm:text-sm text-kalvium-muted dark:text-kalvium-dark-muted leading-relaxed">
            All listed hackathons, workshops, cohort meetups, and club sessions must clearly state their objectives, schedule, venue/online link, and eligibility criteria.
          </p>
          <div className="pt-2 border-t border-kalvium-border/60 dark:border-kalvium-dark-border/60">
            <span className="text-[11px] font-semibold text-kalvium-text dark:text-kalvium-dark-text flex items-center gap-1">
              <CheckCircle2 size={13} className="text-kalvium-success" />
              <span>Mandatory: Title, start/end time, venue & organizer contact.</span>
            </span>
          </div>
        </div>

        {/* Guideline 2 */}
        <div className="bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border rounded-3xl p-6 sm:p-7 shadow-kalvium-sm hover:border-kalvium-coral/40 transition space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Users size={20} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt text-emerald-600 dark:text-emerald-400">
              Rule 2
            </span>
          </div>
          <h3 className="text-base font-bold text-kalvium-text dark:text-kalvium-dark-text">
            Respectful Environment
          </h3>
          <p className="text-xs sm:text-sm text-kalvium-muted dark:text-kalvium-dark-muted leading-relaxed">
            Organizers must maintain an inclusive and respectful atmosphere. Discriminatory behavior or harassment of any kind will lead to immediate event cancellation and host suspension.
          </p>
          <div className="pt-2 border-t border-kalvium-border/60 dark:border-kalvium-dark-border/60">
            <span className="text-[11px] font-semibold text-kalvium-text dark:text-kalvium-dark-text flex items-center gap-1">
              <AlertTriangle size={13} className="text-rose-500" />
              <span>Zero-tolerance policy for discriminatory conduct.</span>
            </span>
          </div>
        </div>

        {/* Guideline 3 */}
        <div className="bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border rounded-3xl p-6 sm:p-7 shadow-kalvium-sm hover:border-kalvium-coral/40 transition space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Megaphone size={20} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt text-amber-600 dark:text-amber-400">
              Rule 3
            </span>
          </div>
          <h3 className="text-base font-bold text-kalvium-text dark:text-kalvium-dark-text">
            Timely Communication
          </h3>
          <p className="text-xs sm:text-sm text-kalvium-muted dark:text-kalvium-dark-muted leading-relaxed">
            Keep participants informed about itinerary shifts, prerequisites (software installs, laptop requirements), or venue changes at least 24 hours in advance.
          </p>
          <div className="pt-2 border-t border-kalvium-border/60 dark:border-kalvium-dark-border/60">
            <span className="text-[11px] font-semibold text-kalvium-text dark:text-kalvium-dark-text flex items-center gap-1">
              <Clock size={13} className="text-amber-500" />
              <span>Broadcast changes at least 24h prior to kickoff.</span>
            </span>
          </div>
        </div>

        {/* Guideline 4 */}
        <div className="bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border rounded-3xl p-6 sm:p-7 shadow-kalvium-sm hover:border-kalvium-coral/40 transition space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Building2 size={20} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt text-blue-600 dark:text-blue-400">
              Rule 4
            </span>
          </div>
          <h3 className="text-base font-bold text-kalvium-text dark:text-kalvium-dark-text">
            Resource Fair Use
          </h3>
          <p className="text-xs sm:text-sm text-kalvium-muted dark:text-kalvium-dark-muted leading-relaxed">
            Ensure campus facility and equipment reservations comply with standard university regulations and safety protocols before confirming in-person venues.
          </p>
          <div className="pt-2 border-t border-kalvium-border/60 dark:border-kalvium-dark-border/60">
            <span className="text-[11px] font-semibold text-kalvium-text dark:text-kalvium-dark-text flex items-center gap-1">
              <ShieldCheck size={13} className="text-blue-500" />
              <span>Verify room capacity, permissions & AV gear booking.</span>
            </span>
          </div>
        </div>
      </div>

      {/* Verification Lifecycle Walkthrough */}
      <div className="bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border rounded-3xl p-6 sm:p-8 shadow-kalvium-sm mb-12 space-y-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-kalvium-coral block mb-1">
            Verification Lifecycle
          </span>
          <h3 className="text-lg font-bold text-kalvium-text dark:text-kalvium-dark-text">
            How An Event Gets Campus-Verified
          </h3>
          <p className="text-xs sm:text-sm text-kalvium-muted dark:text-kalvium-dark-muted mt-1 leading-relaxed">
            Our multi-step verification pipeline ensures that every event appearing on the public student dashboard is 100% genuine and authorized.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-kalvium-coral text-white text-xs font-bold flex items-center justify-center">1</span>
            <h4 className="text-xs font-bold text-kalvium-text dark:text-kalvium-dark-text">Creation & Draft</h4>
            <p className="text-[11px] text-kalvium-muted dark:text-kalvium-dark-muted leading-relaxed">
              Organizer enters details or uploads flyer for AI extraction.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center">2</span>
            <h4 className="text-xs font-bold text-kalvium-text dark:text-kalvium-dark-text">Pending Queue</h4>
            <p className="text-[11px] text-kalvium-muted dark:text-kalvium-dark-muted leading-relaxed">
              Submission enters moderation queue; duplicate alerts evaluated.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center">3</span>
            <h4 className="text-xs font-bold text-kalvium-text dark:text-kalvium-dark-text">Manager Review</h4>
            <p className="text-[11px] text-kalvium-muted dark:text-kalvium-dark-muted leading-relaxed">
              Campus Manager verifies venue, schedule, and club identity.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-kalvium-success text-white text-xs font-bold flex items-center justify-center">4</span>
            <h4 className="text-xs font-bold text-kalvium-text dark:text-kalvium-dark-text">Live Campus Feed</h4>
            <p className="text-[11px] text-kalvium-muted dark:text-kalvium-dark-muted leading-relaxed">
              Badged as Verified and made available for student RSVPs.
            </p>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border shadow-kalvium-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h4 className="text-base font-bold text-kalvium-text dark:text-kalvium-dark-text">
            Ready to organize your next event?
          </h4>
          <p className="text-xs sm:text-sm text-kalvium-muted dark:text-kalvium-dark-muted mt-1">
            Head to the event creation studio or reach out to staff for hosting permissions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/events"
            className="px-5 py-2.5 rounded-xl border border-kalvium-border dark:border-kalvium-dark-border bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt text-xs font-semibold text-kalvium-text dark:text-kalvium-dark-text hover:border-kalvium-coral transition"
          >
            Explore Events
          </Link>
          <Link
            href="/contact"
            className="px-5 py-2.5 rounded-xl bg-kalvium-coral text-white text-xs font-semibold hover:bg-kalvium-coral-dark transition shadow-soft-xs"
          >
            Contact Staff
          </Link>
        </div>
      </div>
    </div>
  );
}
