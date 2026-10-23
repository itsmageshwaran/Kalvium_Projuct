"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Scale,
  ShieldCheck,
  UserCheck,
  Code2,
  FileText,
  AlertTriangle,
  Server,
  Share2,
  Printer,
  ChevronRight,
  BookOpen,
  Search,
  CheckCircle2,
  Lock,
  Sparkles,
} from "lucide-react";

const SECTIONS = [
  { id: "eligibility", title: "1. Eligibility & Account Responsibilities" },
  { id: "acceptable-use", title: "2. Acceptable Use" },
  { id: "content-ownership", title: "3. Content Ownership & Academic Integrity" },
  { id: "service-availability", title: "4. Service Availability & Modifications" },
  { id: "verification-gate", title: "5. Campus Manager Verification & Quality Standards" },
];

export default function TermsAndConditionsPage() {
  const [activeSection, setActiveSection] = useState("eligibility");
  const [copied, setCopied] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");

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
    <div className="min-h-screen py-10 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Breadcrumb & Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs text-kalvium-muted dark:text-kalvium-dark-muted mb-3 font-medium">
          <Link href="/" className="hover:text-kalvium-coral transition">
            Home
          </Link>
          <span>/</span>
          <span className="text-kalvium-text dark:text-kalvium-dark-text font-semibold">Governance</span>
          <span>/</span>
          <span className="text-kalvium-coral font-semibold">Terms & Conditions</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-kalvium-border dark:border-kalvium-dark-border">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-kalvium-coral-tint dark:bg-kalvium-dark-coral-tint border border-kalvium-coral/20 text-kalvium-coral text-xs font-bold mb-2">
              <Scale size={13} />
              <span>Campus Governance & Terms of Use</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-kalvium-text dark:text-kalvium-dark-text tracking-tight">
              Terms & Conditions
            </h1>
            <p className="text-xs sm:text-sm text-kalvium-muted dark:text-kalvium-dark-muted mt-1 max-w-2xl leading-relaxed">
              Welcome to CampusHub. By accessing or using our platform, you agree to comply with and be bound by the following institutional terms and community guidelines.
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

        {/* Quick Document Key Attributes */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <div className="p-3.5 rounded-2xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border shadow-soft-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-kalvium-muted block mb-0.5">
              Effective Date
            </span>
            <p className="text-xs font-bold text-kalvium-text dark:text-kalvium-dark-text">October 2026</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border shadow-soft-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-kalvium-muted block mb-0.5">
              Enforcement
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-kalvium-success">
              <span className="w-1.5 h-1.5 rounded-full bg-kalvium-success animate-pulse" />
              Active & Enforced
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border shadow-soft-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-kalvium-muted block mb-0.5">
              Target Audience
            </span>
            <p className="text-xs font-bold text-kalvium-text dark:text-kalvium-dark-text">AIFT Students & Mentors</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border shadow-soft-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-kalvium-muted block mb-0.5">
              Squad Leads
            </span>
            <p className="text-xs font-bold text-kalvium-text dark:text-kalvium-dark-text">Squad 83 (SRM-AP)</p>
          </div>
        </div>

        {/* High-Level Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4">
          <div className="p-3.5 rounded-2xl bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border">
            <span className="text-[11px] font-bold text-kalvium-coral flex items-center gap-1.5 mb-1">
              <UserCheck size={14} /> 1. AIFT Exclusive
            </span>
            <p className="text-[11px] text-kalvium-muted dark:text-kalvium-dark-muted leading-relaxed">
              Restricted to verified Kalvium students and mentors in the AI & Future Tech cohort.
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border">
            <span className="text-[11px] font-bold text-kalvium-coral flex items-center gap-1.5 mb-1">
              <ShieldCheck size={14} /> 2. Academic Purpose
            </span>
            <p className="text-[11px] text-kalvium-muted dark:text-kalvium-dark-muted leading-relaxed">
              Designed for hackathons, technical sprints, squad projects, and verified meetups.
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border">
            <span className="text-[11px] font-bold text-kalvium-coral flex items-center gap-1.5 mb-1">
              <Code2 size={14} /> 3. Creator Rights
            </span>
            <p className="text-[11px] text-kalvium-muted dark:text-kalvium-dark-muted leading-relaxed">
              You own your posted content, grant display license to CampusHub, and follow honor code.
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border">
            <span className="text-[11px] font-bold text-kalvium-coral flex items-center gap-1.5 mb-1">
              <Server size={14} /> 4. Reliable Service
            </span>
            <p className="text-[11px] text-kalvium-muted dark:text-kalvium-dark-muted leading-relaxed">
              Continuous updates, data migrations, and scheduled maintenance for peak reliability.
            </p>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10 items-start">
        {/* Sticky Sidebar */}
        <aside className="sticky top-20 hidden lg:block bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border rounded-2xl p-4 shadow-soft-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-kalvium-muted dark:text-kalvium-dark-muted mb-3 px-2">
            Table of Contents
          </p>
          <nav className="space-y-1">
            {SECTIONS.map((sec) => (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                onClick={() => setActiveSection(sec.id)}
                className={`block text-xs py-2 px-2.5 rounded-xl transition ${
                  activeSection === sec.id
                    ? "bg-kalvium-coral-tint dark:bg-kalvium-dark-coral-tint text-kalvium-coral font-bold"
                    : "text-kalvium-muted dark:text-kalvium-dark-muted hover:text-kalvium-text dark:hover:text-kalvium-dark-text hover:bg-kalvium-surface-alt dark:hover:bg-kalvium-dark-surface-alt"
                }`}
              >
                {sec.title}
              </a>
            ))}
          </nav>

          <div className="mt-6 pt-4 border-t border-kalvium-border dark:border-kalvium-dark-border px-2">
            <span className="text-[10px] font-bold text-kalvium-muted uppercase tracking-wider block mb-1">
              Related Documents
            </span>
            <div className="space-y-1.5">
              <Link
                href="/privacy"
                className="text-xs text-kalvium-coral hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Privacy Policy</span>
                <ChevronRight size={12} />
              </Link>
              <Link
                href="/guidelines"
                className="text-xs text-kalvium-coral hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Event Hosting Guidelines</span>
                <ChevronRight size={12} />
              </Link>
              <Link
                href="/faq"
                className="text-xs text-kalvium-coral hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Help Center & FAQ</span>
                <ChevronRight size={12} />
              </Link>
              <Link
                href="/contact"
                className="text-xs text-kalvium-coral hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Contact Staff</span>
                <ChevronRight size={12} />
              </Link>
            </div>
          </div>
        </aside>

        {/* Content Body */}
        <div className="bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border rounded-3xl p-6 sm:p-10 shadow-kalvium-sm space-y-10 leading-relaxed text-xs sm:text-sm text-kalvium-text dark:text-kalvium-dark-text">
          {/* Section 1 */}
          <section id="eligibility" className="scroll-mt-24 space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-kalvium-border/70 dark:border-kalvium-dark-border/70">
              <div className="w-8 h-8 rounded-xl bg-kalvium-coral-tint dark:bg-kalvium-dark-coral-tint text-kalvium-coral flex items-center justify-center font-bold">
                <UserCheck size={18} />
              </div>
              <h2 className="text-lg sm:text-xl font-bold font-sans tracking-tight text-kalvium-ink dark:text-kalvium-dark-ink">
                1. Eligibility & Account Responsibilities
              </h2>
            </div>

            <div className="space-y-3 text-kalvium-muted dark:text-kalvium-dark-muted leading-relaxed">
              <p>
                Access to CampusHub is exclusively designated for enrolled students, mentors, and faculty belonging to the{" "}
                <strong className="text-kalvium-text dark:text-kalvium-dark-text">
                  Artificial Intelligence & Future Technologies (AIFT)
                </strong>{" "}
                program at SRM University-AP in partnership with Kalvium.
              </p>

              <div className="p-4 rounded-2xl bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-kalvium-text dark:text-kalvium-dark-text">
                  <CheckCircle2 size={15} className="text-kalvium-coral" />
                  <span>Key Responsibilities for Account Holders:</span>
                </div>
                <ul className="list-disc pl-5 space-y-1.5 text-xs text-kalvium-muted dark:text-kalvium-dark-muted">
                  <li>
                    <strong className="text-kalvium-text dark:text-kalvium-dark-text">Credential Security:</strong> You are fully responsible for maintaining the confidentiality of your login credentials and for all activities conducted under your student account.
                  </li>
                  <li>
                    <strong className="text-kalvium-text dark:text-kalvium-dark-text">Authentic Identity:</strong> Account details must be authentic, valid, and accurately represent your real name and identity within your assigned AIFT squad and cohort.
                  </li>
                  <li>
                    <strong className="text-kalvium-text dark:text-kalvium-dark-text">Email Domain Restrictions:</strong> Registration and login require an authorized academic email ending in <code className="bg-white dark:bg-kalvium-dark-surface px-1.5 py-0.5 rounded border border-kalvium-border dark:border-kalvium-dark-border font-mono text-[11px]">@kalvium.community</code> or <code className="bg-white dark:bg-kalvium-dark-surface px-1.5 py-0.5 rounded border border-kalvium-border dark:border-kalvium-dark-border font-mono text-[11px]">@kalvium.com</code>.
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section id="acceptable-use" className="scroll-mt-24 space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-kalvium-border/70 dark:border-kalvium-dark-border/70">
              <div className="w-8 h-8 rounded-xl bg-kalvium-coral-tint dark:bg-kalvium-dark-coral-tint text-kalvium-coral flex items-center justify-center font-bold">
                <ShieldCheck size={18} />
              </div>
              <h2 className="text-lg sm:text-xl font-bold font-sans tracking-tight text-kalvium-ink dark:text-kalvium-dark-ink">
                2. Acceptable Use Policy
              </h2>
            </div>

            <div className="space-y-3 text-kalvium-muted dark:text-kalvium-dark-muted leading-relaxed">
              <p>
                CampusHub is engineered specifically for AIFT academic collaboration, technical project tracking, hackathon/event coordination, and squad communication.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 space-y-1.5">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 size={14} /> Permitted Activities
                  </span>
                  <ul className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted space-y-1 pl-4 list-disc">
                    <li>Coordinating campus workshops & sprints</li>
                    <li>Publishing technical team deliverables</li>
                    <li>Managing personal schedules & clash checks</li>
                    <li>Peer squad discussions and event RSVPs</li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/40 space-y-1.5">
                  <span className="text-xs font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                    <AlertTriangle size={14} /> Strictly Prohibited
                  </span>
                  <ul className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted space-y-1 pl-4 list-disc">
                    <li>Abusive, defamatory, or disruptive content</li>
                    <li>Spamming discussion channels or peer threads</li>
                    <li>Reverse-engineering or probing API endpoints</li>
                    <li>Unauthorized database access or scraping</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section id="content-ownership" className="scroll-mt-24 space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-kalvium-border/70 dark:border-kalvium-dark-border/70">
              <div className="w-8 h-8 rounded-xl bg-kalvium-coral-tint dark:bg-kalvium-dark-coral-tint text-kalvium-coral flex items-center justify-center font-bold">
                <Code2 size={18} />
              </div>
              <h2 className="text-lg sm:text-xl font-bold font-sans tracking-tight text-kalvium-ink dark:text-kalvium-dark-ink">
                3. Content Ownership & Academic Integrity
              </h2>
            </div>

            <div className="space-y-3 text-kalvium-muted dark:text-kalvium-dark-muted leading-relaxed">
              <p>
                Content posted by users (including event announcements, code snippets, documentation, and squad deliverables) remains the intellectual property of the original creator.
              </p>

              <div className="p-4 rounded-2xl bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border space-y-2">
                <p className="text-xs leading-relaxed">
                  <strong className="text-kalvium-text dark:text-kalvium-dark-text">Platform License:</strong> By posting on CampusHub, you grant the platform a non-exclusive, worldwide, royalty-free license to display, index, and organize your content across the campus network for discovery and archival purposes.
                </p>
                <p className="text-xs leading-relaxed">
                  <strong className="text-kalvium-text dark:text-kalvium-dark-text">Academic Honor Code:</strong> Users must adhere strictly to academic integrity regulations and department honor codes. Plagiarism, unauthorized distribution of course assessments, sharing unreleased grading criteria, or releasing proprietary project assets without permission is grounds for immediate access termination.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section id="service-availability" className="scroll-mt-24 space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-kalvium-border/70 dark:border-kalvium-dark-border/70">
              <div className="w-8 h-8 rounded-xl bg-kalvium-coral-tint dark:bg-kalvium-dark-coral-tint text-kalvium-coral flex items-center justify-center font-bold">
                <Server size={18} />
              </div>
              <h2 className="text-lg sm:text-xl font-bold font-sans tracking-tight text-kalvium-ink dark:text-kalvium-dark-ink">
                4. Service Availability & Platform Modifications
              </h2>
            </div>

            <p className="text-kalvium-muted dark:text-kalvium-dark-muted leading-relaxed">
              CampusHub is maintained as a dedicated utility for the AIFT student community. We continually optimize the platform and reserve the right to deploy updates, enhance feature sets, improve security protocols, or temporarily suspend access for scheduled server maintenance and database upgrades. Advance notification will be provided whenever practicable for major maintenance windows.
            </p>
          </section>

          {/* Section 5 */}
          <section id="verification-gate" className="scroll-mt-24 space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-kalvium-border/70 dark:border-kalvium-dark-border/70">
              <div className="w-8 h-8 rounded-xl bg-kalvium-coral-tint dark:bg-kalvium-dark-coral-tint text-kalvium-coral flex items-center justify-center font-bold">
                <Sparkles size={18} />
              </div>
              <h2 className="text-lg sm:text-xl font-bold font-sans tracking-tight text-kalvium-ink dark:text-kalvium-dark-ink">
                5. Campus Manager Verification & Quality Standards
              </h2>
            </div>

            <p className="text-kalvium-muted dark:text-kalvium-dark-muted leading-relaxed">
              To prevent misinformation and unauthorized postings, all events submitted by students or organizers undergo a mandatory verification review by authenticated Campus Managers.
            </p>

            <div className="p-4 rounded-2xl bg-kalvium-coral-tint/40 dark:bg-kalvium-dark-coral-tint/30 border border-kalvium-coral/30 space-y-2">
              <span className="text-xs font-bold text-kalvium-coral flex items-center gap-1.5">
                <Lock size={14} /> Zero Self-Approval Guarantee
              </span>
              <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted leading-relaxed">
                Neither student organizers nor club leads can approve their own submissions. Every event marked with the official verification badge has had its venue, date, time, and organizer authenticated against university guidelines.
              </p>
            </div>
          </section>

          {/* Bottom Card */}
          <div className="pt-6 border-t border-kalvium-border dark:border-kalvium-dark-border">
            <div className="p-5 rounded-2xl bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-kalvium-text dark:text-kalvium-dark-text">
                  Have questions regarding our institutional terms?
                </p>
                <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted mt-0.5">
                  Reach out directly to the student development leads in Squad 83.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href="/contact"
                  className="px-4 py-2 rounded-xl bg-kalvium-coral text-white font-semibold text-xs hover:bg-kalvium-coral-dark transition shadow-soft-xs"
                >
                  Contact Staff
                </Link>
                <Link
                  href="/privacy"
                  className="px-4 py-2 rounded-xl border border-kalvium-border dark:border-kalvium-dark-border bg-white dark:bg-kalvium-dark-surface text-xs font-semibold text-kalvium-text dark:text-kalvium-dark-text hover:border-kalvium-coral transition"
                >
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
