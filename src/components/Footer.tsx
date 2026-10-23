"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  Sparkles,
  Lock,
  Compass,
  Calendar,
  Clock,
  HelpCircle,
  FileText,
  Mail,
  GraduationCap,
  Building2,
} from "lucide-react";
import CampusVerifiedBadge from "@/components/CampusVerifiedBadge";

export default function Footer() {
  return (
    <footer className="relative border-t border-kalvium-border dark:border-kalvium-dark-border bg-kalvium-surface dark:bg-kalvium-dark-surface pt-16 pb-12 px-6 sm:px-10 text-xs text-kalvium-muted dark:text-kalvium-dark-muted transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        {/* Top Section: Brand + Mission + Status */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-12 border-b border-kalvium-border/70 dark:border-kalvium-dark-border/70">
          <div>
            <div className="mb-3">
              <Image
                src="/brand/campus-hub-full-dark.png?v=2"
                alt="CampusHub Logo"
                width={190}
                height={55}
                className="w-44 h-auto object-contain dark:hidden"
              />
              <Image
                src="/brand/campus-hub-full-light.png?v=2"
                alt="CampusHub Logo"
                width={190}
                height={55}
                className="w-44 h-auto object-contain hidden dark:block"
              />
            </div>
            <p className="text-kalvium-muted dark:text-kalvium-dark-muted max-w-md text-xs leading-relaxed">
              "AI makes event creation faster. Human verification makes event discovery trustworthy."
            </p>
          </div>

          {/* Operational Status & Kalvium Lockup */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border text-xs shadow-soft-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-kalvium-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-kalvium-success"></span>
              </span>
              <span className="font-semibold text-kalvium-text dark:text-kalvium-dark-text">Campus Systems Live</span>
              <span className="text-kalvium-muted">•</span>
              <span className="text-kalvium-success font-medium">Winter 2026</span>
            </div>

            <div className="pl-0 sm:pl-6 sm:border-l border-kalvium-border dark:border-kalvium-dark-border">
              <div className="text-xs font-bold tracking-tight text-kalvium-text dark:text-kalvium-dark-text">
                <span>Built for </span>
                <span className="text-kalvium-coral font-bold">Kalvium.</span>
              </div>
              <div className="w-8 h-0.5 bg-kalvium-coral my-1 rounded-full" />
              <p className="text-[9px] uppercase tracking-[0.16em] text-kalvium-muted dark:text-kalvium-dark-muted font-bold">
                A Brighter Campus Together
              </p>
            </div>
          </div>
        </div>

        {/* 4-Column Navigation Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-b border-kalvium-border/70 dark:border-kalvium-dark-border/70">
          {/* Col 1: Discovery */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-kalvium-text dark:text-kalvium-dark-text flex items-center gap-1.5">
              <Compass size={14} className="text-kalvium-coral" />
              <span>Event Discovery</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/events" className="hover:text-kalvium-coral transition">
                  Browse All Events
                </Link>
              </li>
              <li>
                <Link href="/events?dateFilter=TODAY" className="hover:text-kalvium-coral transition">
                  Happening Today
                </Link>
              </li>
              <li>
                <Link href="/events?category=Hackathon" className="hover:text-kalvium-coral transition">
                  Hackathons & Tech
                </Link>
              </li>
              <li>
                <Link href="/events?category=Workshop" className="hover:text-kalvium-coral transition">
                  Hands-on Workshops
                </Link>
              </li>
              <li>
                <Link href="/schedule" className="hover:text-kalvium-coral transition">
                  Personal Schedule & Calendar
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Campus Portals */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-kalvium-text dark:text-kalvium-dark-text flex items-center gap-1.5">
              <GraduationCap size={14} className="text-kalvium-coral" />
              <span>Campus Portals</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/dashboard/student" className="hover:text-kalvium-coral transition">
                  Student Portal & Agenda
                </Link>
              </li>
              <li>
                <Link href="/dashboard/student?tab=create" className="hover:text-kalvium-coral transition">
                  Propose Student Event
                </Link>
              </li>
              <li>
                <Link href="/dashboard/organizer" className="hover:text-kalvium-coral transition">
                  Organizer Studio
                </Link>
              </li>
              <li>
                <Link href="/dashboard/manager" className="hover:text-kalvium-coral transition">
                  Campus Manager Studio
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-kalvium-coral transition">
                  Campus Account Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Technology & Safety */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-kalvium-text dark:text-kalvium-dark-text flex items-center gap-1.5">
              <Sparkles size={14} className="text-kalvium-coral" />
              <span>Technology & Standards</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/guidelines" className="hover:text-kalvium-coral transition flex items-center gap-1">
                  <span>Verification Standard</span>
                  <CampusVerifiedBadge size="sm" />
                </Link>
              </li>
              <li>
                <Link href="/terms#ai-disclaimer" className="hover:text-kalvium-coral transition">
                  AI Anti-Hallucination Policy
                </Link>
              </li>
              <li>
                <Link href="/terms#clash-engine" className="hover:text-kalvium-coral transition">
                  Schedule Clash Engine
                </Link>
              </li>
              <li>
                <Link href="/dashboard/organizer?tab=create" className="hover:text-kalvium-coral transition">
                  Test Pre-calibrated Posters
                </Link>
              </li>
              <li>
                <Link href="/privacy#api-key-zero-storage" className="hover:text-kalvium-coral transition">
                  Zero Key Storage Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Governance & Legal */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-kalvium-text dark:text-kalvium-dark-text flex items-center gap-1.5">
              <FileText size={14} className="text-kalvium-coral" />
              <span>Governance & Trust</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/terms" className="hover:text-kalvium-coral transition font-semibold text-kalvium-text dark:text-kalvium-dark-text">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-kalvium-coral transition font-semibold text-kalvium-text dark:text-kalvium-dark-text">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/guidelines" className="hover:text-kalvium-coral transition font-semibold text-kalvium-text dark:text-kalvium-dark-text">
                  Event Hosting Guidelines
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-kalvium-coral transition font-semibold text-kalvium-text dark:text-kalvium-dark-text">
                  Help Center & FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-kalvium-coral transition inline-flex items-center gap-1.5 text-kalvium-coral font-medium"
                >
                  <Mail size={12} />
                  <span>Contact Staff</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Squad 83 Attribution */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted">
            © 2026 CampusHub. Kalvium Educational Ecosystem. All rights reserved.
          </p>

          <p className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-kalvium-text dark:text-kalvium-dark-text">
            <span>Built with</span>
            <span className="text-kalvium-coral text-base animate-pulse">♥</span>
            <span>by</span>
            <span className="font-display font-bold text-lg sm:text-xl text-kalvium-coral">
              Squad 83
            </span>
          </p>

          <div className="flex items-center gap-4 text-[11px] text-kalvium-muted dark:text-kalvium-dark-muted">
            <Link href="/terms" className="hover:text-kalvium-coral transition">
              Terms
            </Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-kalvium-coral transition">
              Privacy
            </Link>
            <span>•</span>
            <Link href="/guidelines" className="hover:text-kalvium-coral transition">
              Guidelines
            </Link>
            <span>•</span>
            <Link href="/faq" className="hover:text-kalvium-coral transition">
              FAQ
            </Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-kalvium-coral transition">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
