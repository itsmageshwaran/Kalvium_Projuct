"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  UserCheck,
  Database,
  Share2,
  Printer,
  ChevronRight,
  Eye,
  Server,
  FileCheck,
  CheckCircle2,
  Key,
  HardDrive,
  HeartHandshake,
  AlertCircle,
} from "lucide-react";

const SECTIONS = [
  { id: "information-collected", title: "1. Information Collected" },
  { id: "how-information-used", title: "2. How Information Is Used" },
  { id: "data-sharing-security", title: "3. Data Sharing & Platform Security" },
  { id: "zero-storage-keys", title: "4. Zero-Storage Policy for AI Keys" },
  { id: "student-rights", title: "5. Student Rights & Data Requests" },
];

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState("information-collected");
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
    <div className="min-h-screen py-10 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Breadcrumb Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs text-kalvium-muted dark:text-kalvium-dark-muted mb-3 font-medium">
          <Link href="/" className="hover:text-kalvium-coral transition">
            Home
          </Link>
          <span>/</span>
          <span className="text-kalvium-text dark:text-kalvium-dark-text font-semibold">Governance</span>
          <span>/</span>
          <span className="text-kalvium-coral font-semibold">Privacy Policy</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-kalvium-border dark:border-kalvium-dark-border">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-kalvium-coral-tint dark:bg-kalvium-dark-coral-tint border border-kalvium-coral/20 text-kalvium-coral text-xs font-bold mb-2">
              <ShieldCheck size={13} />
              <span>Campus Data Governance & Privacy</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-kalvium-text dark:text-kalvium-dark-text tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-xs sm:text-sm text-kalvium-muted dark:text-kalvium-dark-muted mt-1 max-w-2xl leading-relaxed">
              CampusHub respects your personal privacy and commits to safeguarding your data within our academic ecosystem with strict institutional protections.
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

        {/* Quick Attributes */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <div className="p-3.5 rounded-2xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border shadow-soft-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-kalvium-muted block mb-0.5">
              Effective Date
            </span>
            <p className="text-xs font-bold text-kalvium-text dark:text-kalvium-dark-text">October 2026</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border shadow-soft-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-kalvium-muted block mb-0.5">
              Commercial Policy
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-kalvium-success">
              <span className="w-1.5 h-1.5 rounded-full bg-kalvium-success animate-pulse" />
              100% Non-Monetized
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border shadow-soft-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-kalvium-muted block mb-0.5">
              Cloud Infrastructure
            </span>
            <p className="text-xs font-bold text-kalvium-text dark:text-kalvium-dark-text">Firebase Security Rules</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border shadow-soft-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-kalvium-muted block mb-0.5">
              Ecosystem
            </span>
            <p className="text-xs font-bold text-kalvium-text dark:text-kalvium-dark-text">AIFT Squad 83</p>
          </div>
        </div>

        {/* Zero-Commercialization Pledge Banner */}
        <div className="mt-4 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 flex items-start gap-3">
          <HeartHandshake className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
              Our Zero-Commercialization & Non-Monetization Pledge
            </h4>
            <p className="text-xs text-emerald-700/90 dark:text-emerald-400/90 leading-relaxed">
              Student data is sacred. CampusHub never sells, rents, tracks, or shares student information with external advertisers, data brokers, or marketing networks. All data exists solely for academic coordination and squad progress.
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
                href="/terms"
                className="text-xs text-kalvium-coral hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Terms & Conditions</span>
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
          <section id="information-collected" className="scroll-mt-24 space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-kalvium-border/70 dark:border-kalvium-dark-border/70">
              <div className="w-8 h-8 rounded-xl bg-kalvium-coral-tint dark:bg-kalvium-dark-coral-tint text-kalvium-coral flex items-center justify-center font-bold">
                <Database size={18} />
              </div>
              <h2 className="text-lg sm:text-xl font-bold font-sans tracking-tight text-kalvium-ink dark:text-kalvium-dark-ink">
                1. Information Collected
              </h2>
            </div>

            <p className="text-kalvium-muted dark:text-kalvium-dark-muted">
              We collect only the essential academic data points required to power your campus event experience:
            </p>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border">
                <h4 className="font-bold text-xs text-kalvium-text dark:text-kalvium-dark-text mb-1 flex items-center gap-1.5">
                  <UserCheck size={14} className="text-kalvium-coral" />
                  <span>Profile & Academic Identity</span>
                </h4>
                <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted leading-relaxed">
                  Your full name, official Kalvium email address (<code className="font-mono text-[11px]">@kalvium.community</code> or <code className="font-mono text-[11px]">@kalvium.com</code>), assigned AIFT squad number (e.g., Squad 83), and optional profile links you choose to share (such as your GitHub handle, personal portfolio, or technical skills).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border">
                <h4 className="font-bold text-xs text-kalvium-text dark:text-kalvium-dark-text mb-1 flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-kalvium-coral" />
                  <span>Activity & Squad Engagement</span>
                </h4>
                <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted leading-relaxed">
                  Events you register for, hackathons participated in, squad project contributions, workshop submissions, calendar conflict checks, and platform interaction logs.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border">
                <h4 className="font-bold text-xs text-kalvium-text dark:text-kalvium-dark-text mb-1 flex items-center gap-1.5">
                  <HardDrive size={14} className="text-kalvium-coral" />
                  <span>Technical Metadata</span>
                </h4>
                <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted leading-relaxed">
                  Device and browser specifications, cryptographic session tokens for role verification, and performance telemetry to monitor uptime, prevent brute-force attacks, and protect platform endpoints.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section id="how-information-used" className="scroll-mt-24 space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-kalvium-border/70 dark:border-kalvium-dark-border/70">
              <div className="w-8 h-8 rounded-xl bg-kalvium-coral-tint dark:bg-kalvium-dark-coral-tint text-kalvium-coral flex items-center justify-center font-bold">
                <FileCheck size={18} />
              </div>
              <h2 className="text-lg sm:text-xl font-bold font-sans tracking-tight text-kalvium-ink dark:text-kalvium-dark-ink">
                2. How Information Is Used
              </h2>
            </div>

            <p className="text-kalvium-muted dark:text-kalvium-dark-muted">
              Every piece of collected information directly serves your academic workflow:
            </p>

            <ul className="space-y-2.5 pl-2">
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-kalvium-coral mt-2 shrink-0" />
                <span className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted leading-relaxed">
                  <strong className="text-kalvium-text dark:text-kalvium-dark-text">Role-Based Access:</strong> Authenticating student and mentor identities, granting role-based permissions (Student Portal, Organizer Studio, Campus Manager Verification).
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-kalvium-coral mt-2 shrink-0" />
                <span className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted leading-relaxed">
                  <strong className="text-kalvium-text dark:text-kalvium-dark-text">Event Notifications & Reminders:</strong> Dispatching timely alerts regarding registered campus hackathons, sprint milestones, venue shifts, and cohort-wide announcements.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-kalvium-coral mt-2 shrink-0" />
                <span className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted leading-relaxed">
                  <strong className="text-kalvium-text dark:text-kalvium-dark-text">Collaboration & Showcases:</strong> Facilitating squad collaboration, showcasing technical projects across the AIFT community, and diagnosing internal system errors.
                </span>
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section id="data-sharing-security" className="scroll-mt-24 space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-kalvium-border/70 dark:border-kalvium-dark-border/70">
              <div className="w-8 h-8 rounded-xl bg-kalvium-coral-tint dark:bg-kalvium-dark-coral-tint text-kalvium-coral flex items-center justify-center font-bold">
                <Lock size={18} />
              </div>
              <h2 className="text-lg sm:text-xl font-bold font-sans tracking-tight text-kalvium-ink dark:text-kalvium-dark-ink">
                3. Data Sharing & Platform Security
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border space-y-1">
                <span className="font-bold text-xs text-kalvium-text dark:text-kalvium-dark-text flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-kalvium-coral" />
                  <span>Strict Community Boundary</span>
                </span>
                <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted leading-relaxed">
                  Access to squad deliverables and personal profiles is restricted strictly to verified members within the Kalvium AIFT community.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border space-y-1">
                <span className="font-bold text-xs text-kalvium-text dark:text-kalvium-dark-text flex items-center gap-1.5">
                  <Server size={14} className="text-kalvium-coral" />
                  <span>Encrypted Cloud Storage</span>
                </span>
                <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted leading-relaxed">
                  All application records and authentication states are securely hosted on Google Cloud Firebase with industry-standard TLS encryption at rest and in transit.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section id="zero-storage-keys" className="scroll-mt-24 space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-kalvium-border/70 dark:border-kalvium-dark-border/70">
              <div className="w-8 h-8 rounded-xl bg-kalvium-coral-tint dark:bg-kalvium-dark-coral-tint text-kalvium-coral flex items-center justify-center font-bold">
                <Key size={18} />
              </div>
              <h2 className="text-lg sm:text-xl font-bold font-sans tracking-tight text-kalvium-ink dark:text-kalvium-dark-ink">
                4. Zero-Storage Policy for Gemini API Keys
              </h2>
            </div>

            <p className="text-kalvium-muted dark:text-kalvium-dark-muted leading-relaxed">
              When organizers utilize the AI Multimodal Poster Studio, they have the option to provide a personal Google Gemini API Key. To ensure absolute confidentiality:
            </p>

            <div className="p-4 rounded-2xl bg-kalvium-coral-tint/40 dark:bg-kalvium-dark-coral-tint/30 border border-kalvium-coral/30 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-kalvium-coral">
                <Lock size={15} />
                <span>Client-Side On-Device Isolation</span>
              </div>
              <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted leading-relaxed">
                Your Gemini API key is stored exclusively on your own browser device using client-side <code className="font-mono text-[11px] bg-white dark:bg-kalvium-dark-surface px-1 rounded">localStorage</code>. It is NEVER transmitted to our backend servers, NEVER written to Firebase Firestore, and NEVER logged. Optical vision requests are routed directly from your browser to Google API endpoints.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section id="student-rights" className="scroll-mt-24 space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-kalvium-border/70 dark:border-kalvium-dark-border/70">
              <div className="w-8 h-8 rounded-xl bg-kalvium-coral-tint dark:bg-kalvium-dark-coral-tint text-kalvium-coral flex items-center justify-center font-bold">
                <UserCheck size={18} />
              </div>
              <h2 className="text-lg sm:text-xl font-bold font-sans tracking-tight text-kalvium-ink dark:text-kalvium-dark-ink">
                5. Student Rights & Data Requests
              </h2>
            </div>

            <p className="text-kalvium-muted dark:text-kalvium-dark-muted leading-relaxed">
              You maintain full control over your academic data. You can review and update your profile details at any time through your Profile Settings. If you wish to request a complete account deletion, data export, or audit record removal, contact our development leads.
            </p>

            <div className="p-4 rounded-2xl bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-kalvium-text dark:text-kalvium-dark-text">
                  Data Protection & Privacy Contact
                </p>
                <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted">
                  Squad 83 Student Development Leads
                </p>
              </div>
              <Link
                href="/contact"
                className="px-4 py-2 rounded-xl bg-kalvium-coral text-white font-semibold text-xs hover:bg-kalvium-coral-dark transition shadow-soft-xs shrink-0"
              >
                Contact Staff
              </Link>
            </div>
          </section>

          {/* Bottom Card */}
          <div className="pt-6 border-t border-kalvium-border dark:border-kalvium-dark-border">
            <div className="p-5 rounded-2xl bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-kalvium-text dark:text-kalvium-dark-text">
                  Reviewed our Privacy Policy?
                </p>
                <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted mt-0.5">
                  Check out the Event Hosting Guidelines to learn how events are verified.
                </p>
              </div>
              <Link
                href="/guidelines"
                className="px-4 py-2 rounded-xl border border-kalvium-border dark:border-kalvium-dark-border bg-white dark:bg-kalvium-dark-surface text-xs font-semibold text-kalvium-text dark:text-kalvium-dark-text hover:border-kalvium-coral transition shrink-0"
              >
                Event Guidelines
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
