"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ScanLine,
  ShieldCheck,
  UploadCloud,
  Zap,
  Sparkles,
  BookOpen,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  Lock,
  PenTool,
  SlidersHorizontal,
  Layers,
  GraduationCap,
  AlertTriangle,
  MapPin,
} from "lucide-react";
import MagneticButton from "@/components/MagneticButton";
import StaggerGrid from "@/components/StaggerGrid";
import CampusVerifiedBadge from "@/components/CampusVerifiedBadge";
import TiltCard from "@/components/TiltCard";
import { useAuth, getDashboardRoute } from "@/context/AuthContext";

const headlineLines = ["Find what's", "actually happening", "on campus."];

const pipeline = [
  {
    step: "01",
    tag: "DUAL INPUT",
    icon: UploadCloud,
    title: "Upload Flyer or Enter Manually",
    detail: "Drop a poster image for Gemini vision analysis, or switch to the direct manual entry form with custom fields.",
  },
  {
    step: "02",
    tag: "ON-DEVICE AI",
    icon: ScanLine,
    title: "Client-Side Vision Extraction",
    detail: "Your personal Gemini API key runs in browser storage. Zero keys or tokens are stored on Kalvium servers.",
  },
  {
    step: "03",
    tag: "HUMAN AUDIT",
    icon: ShieldCheck,
    title: "Manager Verification Studio",
    detail: "Campus managers inspect the original flyer side-by-side, verify venue bookings, and stamp official approval.",
  },
  {
    step: "04",
    tag: "ZERO CLASHES",
    icon: Zap,
    title: "Certified Campus Feed & RSVP",
    detail: "Approved events sync immediately with student schedules, backed by real-time conflict protection.",
  },
];

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace(getDashboardRoute(user.role));
    }
  }, [user, loading, router]);

  const { scrollY } = useScroll();

  const headlineScale = useTransform(scrollY, [0, 450], [1, 0.88]);
  const headlineOpacity = useTransform(scrollY, [0, 350], [1, 0]);
  const headlineY = useTransform(scrollY, [0, 450], [0, -45]);
  const cardsY = useTransform(scrollY, [0, 450], [0, 90]);

  // Interactive Product Studio states
  const [activeRoleTab, setActiveRoleTab] = React.useState<"student" | "organizer" | "manager">("student");
  const [simulatedClash, setSimulatedClash] = React.useState(false);
  const [organizerMode, setOrganizerMode] = React.useState<"vision" | "manual">("vision");

  if (loading || user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-kalvium-coral border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      {/* ---------------------------------------------------------------- */}
      {/* Hero Section (Cinematic Scroll-Driven Parallax)                  */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative overflow-hidden px-6 pt-6 sm:pt-10 pb-16 sm:px-10">
        {/* Subtle Campus Dot Grid Texture with Radial Fade */}
        <div className="absolute inset-0 bg-campus-dot-grid mask-radial-fade pointer-events-none -z-10" />

        {/* Ambient Subtle Warmth */}
        <div className="absolute top-[-8%] right-[-5%] w-[500px] h-[500px] bg-kalvium-coral/[0.04] dark:bg-kalvium-coral/[0.05] blur-[140px] rounded-full pointer-events-none -z-10" />
        <div className="absolute bottom-[-10%] left-[10%] w-[500px] h-[300px] bg-kalvium-surface-alt/[0.5] dark:bg-kalvium-dark-surface-alt/[0.3] blur-[140px] rounded-full pointer-events-none -z-10" />

        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 items-center">
          <motion.div style={{ scale: headlineScale, opacity: headlineOpacity, y: headlineY }}>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-kalvium-border dark:border-kalvium-dark-border bg-white dark:bg-kalvium-dark-surface px-4 py-1.5 text-xs sm:text-sm text-kalvium-text dark:text-kalvium-dark-text shadow-xs"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-kalvium-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-kalvium-success"></span>
              </span>
              <span className="font-semibold text-kalvium-success">Autumn 2026 semester</span>
              <span className="text-kalvium-muted">•</span>
              <span className="text-kalvium-muted">verified by AI and campus staff</span>
            </motion.p>

            <h1 className="font-display text-[clamp(2.5rem,5.2vw,4.5rem)] font-bold text-kalvium-text dark:text-kalvium-dark-text tracking-tight leading-[1.02]">
              {headlineLines.map((line, i) => (
                <motion.span
                  key={line}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.15 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                  className={`block ${i === 1 ? "text-kalvium-coral" : ""}`}
                >
                  {line}
                </motion.span>
              ))}
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="mt-6 max-w-md text-base sm:text-lg text-kalvium-muted dark:text-kalvium-dark-muted leading-relaxed font-normal"
            >
              Every listing is parsed by AI, certified by campus leadership, and matched against your
              personal schedule before it reaches you — so what you save is worth showing up to.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.75 }}
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              <MagneticButton href="/register" icon={<ArrowRight size={16} />}>
                Explore events
              </MagneticButton>
              <MagneticButton href="/register" variant="outline">
                Post an event
              </MagneticButton>
            </motion.div>

            {/* Mobile Hero Illustration (Simplified, non-layered for clean mobile layout) */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.85 }}
              className="mt-10 block lg:hidden relative"
            >
              {/* Subtle radial glow for dark mode contrast */}
              <div className="absolute inset-0 bg-white/20 dark:bg-white/10 blur-[80px] rounded-full pointer-events-none -z-10" />
              <div className="relative aspect-square sm:aspect-[4/3] w-full max-w-sm mx-auto">
                <Image
                  src="/images/image.png"
                  alt="Illustration of three students looking at a verified campus event notification on a phone."
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-contain object-center dark:hidden"
                />
                <Image
                  src="/images/imageLight.png"
                  alt="Illustration of three students looking at a verified campus event notification on a phone."
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-contain object-center hidden dark:block"
                />
              </div>
            </motion.div>
          </motion.div>

          {/* Dominant Character Illustration & Layered Elements (Desktop) */}
          <motion.div style={{ y: cardsY }} className="relative hidden lg:block h-[500px] xl:h-[560px] w-full">
            {/* Ambient Radial Spotlight */}
            <div className="absolute inset-0 bg-kalvium-coral/[0.04] blur-[100px] rounded-full pointer-events-none -z-10" />

            {/* Character Illustration (Transparent PNG) */}
            <div className="relative w-full h-full ml-4 xl:ml-8">
              <Image
                src="/images/image.png"
                alt="Illustration of three students looking at a verified campus event notification on a phone."
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain object-right-bottom drop-shadow-sm dark:hidden"
              />
              <Image
                src="/images/imageLight.png"
                alt="Illustration of three students looking at a verified campus event notification on a phone."
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain object-right-bottom drop-shadow-sm hidden dark:block"
              />
            </div>


          </motion.div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Official Brand Pillars & University Lockup                       */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative px-6 py-10 sm:px-10 border-y border-kalvium-border dark:border-kalvium-dark-border bg-white/70 dark:bg-kalvium-dark-surface/70 backdrop-blur-md">
        <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* 3 Value Pillars from Official Brand Sheet */}
          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:divide-x divide-kalvium-border dark:divide-kalvium-dark-border">
            <div className="flex items-center gap-3.5 sm:px-4 first:pl-0">
              <div className="w-11 h-11 rounded-2xl bg-kalvium-coral/10 dark:bg-kalvium-coral/15 flex items-center justify-center text-kalvium-coral shrink-0 border border-kalvium-coral/20">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-sans font-bold uppercase tracking-wider text-kalvium-text dark:text-kalvium-dark-text">
                  Discover Events
                </h4>
                <p className="text-[11px] text-kalvium-muted dark:text-kalvium-dark-muted mt-0.5">
                  Verified campus calendar
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 sm:px-4">
              <div className="w-11 h-11 rounded-2xl bg-kalvium-coral/10 dark:bg-kalvium-coral/15 flex items-center justify-center text-kalvium-coral shrink-0 border border-kalvium-coral/20">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-sans font-bold uppercase tracking-wider text-kalvium-text dark:text-kalvium-dark-text">
                  Organize Better
                </h4>
                <p className="text-[11px] text-kalvium-muted dark:text-kalvium-dark-muted mt-0.5">
                  Clash-free scheduling
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 sm:px-4">
              <div className="w-11 h-11 rounded-2xl bg-kalvium-coral/10 dark:bg-kalvium-coral/15 flex items-center justify-center text-kalvium-coral shrink-0 border border-kalvium-coral/20">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-sans font-bold uppercase tracking-wider text-kalvium-text dark:text-kalvium-dark-text">
                  Belong to More
                </h4>
                <p className="text-[11px] text-kalvium-muted dark:text-kalvium-dark-muted mt-0.5">
                  Active student life
                </p>
              </div>
            </div>
          </div>

          {/* Official 'Built for Kalvium' Lockup */}
          <div className="md:col-span-4 flex flex-col items-center md:items-end justify-center pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-kalvium-border dark:border-kalvium-dark-border md:pl-8 text-center md:text-right">
            <div className="text-base sm:text-lg font-bold tracking-tight text-kalvium-text dark:text-kalvium-dark-text leading-tight">
              <span>Built for </span>
              <span className="text-kalvium-coral font-bold">Kalvium.</span>
            </div>
            <div className="w-10 h-0.5 bg-kalvium-coral my-1.5 rounded-full" />
            <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] font-sans font-bold text-kalvium-muted dark:text-kalvium-dark-muted">
              A Brighter Campus Together
            </p>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Pipeline Sequence (Architectural Connected Flow)                 */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative px-6 py-20 sm:px-10 border-b border-kalvium-border dark:border-kalvium-dark-border">
        <div className="mx-auto max-w-6xl">
          {/* Section Kicker & Heading */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-kalvium-coral mb-3">
                <span className="h-1.5 w-1.5 rounded-full bg-kalvium-coral animate-ping" />
                <span>Architecture // 01</span>
              </div>
              <h2 className="font-display text-display-lg font-bold text-kalvium-text dark:text-kalvium-dark-text tracking-tight">
                From physical flyer to certified feed.
              </h2>
            </div>
            <p className="max-w-md text-sm text-kalvium-muted dark:text-kalvium-dark-muted leading-relaxed">
              How Kalvium combines client-side AI extraction with mandatory human verification before any event hits the campus calendar.
            </p>
          </div>

          {/* Connected Linear Step Flow */}
          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
              {pipeline.map((step, idx) => (
                <div key={step.title} className="group relative flex flex-col">
                  {/* Step Node Header (Icon on the connector line) */}
                  <div className="relative flex items-center mb-5">
                    {/* Architectural Node Tile */}
                    <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border shadow-soft-xs group-hover:border-kalvium-coral/60 group-hover:shadow-kalvium transition-all duration-300">
                      <step.icon className="h-6 w-6 text-kalvium-coral transition-transform duration-300 group-hover:scale-110" />
                      <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 px-1.5 items-center justify-center rounded-full bg-kalvium-coral text-white text-[10px] font-mono font-bold shadow-xs">
                        {step.step}
                      </span>
                    </div>

                    {/* Desktop Inter-Node Connector Line (between icon tiles only) */}
                    {idx < pipeline.length - 1 && (
                      <div className="hidden lg:block absolute left-14 right-[-2rem] top-1/2 -translate-y-1/2 z-0 pointer-events-none">
                        <div className="h-[2px] w-full bg-gradient-to-r from-kalvium-border via-kalvium-coral/30 to-kalvium-border dark:from-kalvium-dark-border dark:via-kalvium-coral/30 dark:to-kalvium-dark-border" />
                      </div>
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 flex flex-col items-start">
                    {/* Refined Stage Pill Badge (Cleanly separated below the line) */}
                    <div className="mb-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-kalvium-coral-tint dark:bg-kalvium-dark-coral-tint border border-kalvium-coral/20 text-[10px] font-mono font-bold uppercase tracking-wider text-kalvium-coral group-hover:border-kalvium-coral/40 transition-colors">
                      <span className="h-1.5 w-1.5 rounded-full bg-kalvium-coral" />
                      <span>{step.tag}</span>
                    </div>

                    {/* Step Title */}
                    <h3 className="font-display text-base font-bold text-kalvium-text dark:text-kalvium-dark-text group-hover:text-kalvium-coral transition-colors leading-snug">
                      {step.title}
                    </h3>

                    {/* Step Detail */}
                    <p className="mt-2 text-xs leading-relaxed text-kalvium-muted dark:text-kalvium-dark-muted">
                      {step.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Interactive Campus Console (Live Interactive Simulation)         */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative px-6 py-20 sm:px-10 bg-kalvium-surface-alt/40 dark:bg-kalvium-dark-surface-alt/40 border-b border-kalvium-border dark:border-kalvium-dark-border">
        <div className="mx-auto max-w-6xl">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold uppercase tracking-wider text-kalvium-coral mb-3">
              <Layers size={14} />
              <span>Interactive Campus Workspace</span>
            </div>
            <h2 className="font-display text-display-lg font-bold text-kalvium-text dark:text-kalvium-dark-text tracking-tight">
              One platform. Three unified perspectives.
            </h2>
            <p className="mt-3 text-sm text-kalvium-muted dark:text-kalvium-dark-muted">
              Select a role below to explore how students, organizers, and managers experience Campus Event Flow in real time.
            </p>

            {/* Segmented Tactile Tab Switcher */}
            <div className="mt-8 inline-flex p-1 rounded-2xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border shadow-xs">
              <button
                type="button"
                onClick={() => setActiveRoleTab("student")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeRoleTab === "student"
                    ? "bg-kalvium-coral text-white shadow-xs"
                    : "text-kalvium-muted hover:text-kalvium-text dark:hover:text-kalvium-dark-text"
                }`}
              >
                <GraduationCap size={15} />
                <span>Student View</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveRoleTab("organizer")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeRoleTab === "organizer"
                    ? "bg-kalvium-coral text-white shadow-xs"
                    : "text-kalvium-muted hover:text-kalvium-text dark:hover:text-kalvium-dark-text"
                }`}
              >
                <PenTool size={15} />
                <span>Organizer Studio</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveRoleTab("manager")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeRoleTab === "manager"
                    ? "bg-kalvium-coral text-white shadow-xs"
                    : "text-kalvium-muted hover:text-kalvium-text dark:hover:text-kalvium-dark-text"
                }`}
              >
                <ShieldCheck size={15} />
                <span>Verification Studio</span>
              </button>
            </div>
          </div>

          {/* Interactive Stage Canvas */}
          <div className="rounded-3xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border shadow-kalvium overflow-hidden">
            {/* Top Workspace Chrome / Window Header */}
            <div className="flex items-center justify-between px-6 py-3.5 border-b border-kalvium-border dark:border-kalvium-dark-border bg-kalvium-surface-alt/70 dark:bg-kalvium-dark-surface-alt/70 text-xs">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                <span className="ml-3 font-mono text-[11px] text-kalvium-muted dark:text-kalvium-dark-muted hidden sm:inline">
                  kalvium.app/{activeRoleTab === "student" ? "events" : activeRoleTab === "organizer" ? "events/create" : "manager"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  LIVE SIMULATION
                </span>
              </div>
            </div>

            {/* Stage Body */}
            <div className="p-6 sm:p-10">
              <AnimatePresence mode="wait">
                {activeRoleTab === "student" && (
                  <motion.div
                    key="student-tab"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
                  >
                    {/* Left Editorial Text */}
                    <div className="lg:col-span-5 space-y-4">
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-kalvium-coral-tint dark:bg-kalvium-dark-coral-tint px-3 py-1 text-xs font-semibold text-kalvium-coral border border-kalvium-coral/20">
                        <GraduationCap size={14} />
                        <span>Student Perspective</span>
                      </div>
                      <h3 className="font-display text-2xl sm:text-3xl font-bold text-kalvium-text dark:text-kalvium-dark-text leading-tight">
                        Never double-book your campus schedule.
                      </h3>
                      <p className="text-sm text-kalvium-muted dark:text-kalvium-dark-muted leading-relaxed">
                        Students discover verified events with certified seals. Try clicking the simulated RSVP button on the right to see our timetable clash protection in action.
                      </p>
                      <div className="pt-2 flex flex-wrap gap-4 text-xs font-medium text-kalvium-text dark:text-kalvium-dark-text">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-kalvium-coral" />
                          <span>Campus verified tags</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-kalvium-coral" />
                          <span>Instant RSVP synchronization</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-kalvium-coral" />
                          <span>Zero double-booking guarantee</span>
                        </div>
                      </div>
                      <div className="pt-4">
                        <Link
                          href="/events"
                          className="inline-flex items-center gap-2 text-xs font-bold text-kalvium-coral hover:underline"
                        >
                          <span>Go to Student Event Feed</span>
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>

                    {/* Right Interactive Simulator Widget */}
                    <div className="lg:col-span-7 bg-kalvium-surface-alt/80 dark:bg-kalvium-dark-surface-alt/80 rounded-2xl p-5 border border-kalvium-border dark:border-kalvium-dark-border space-y-4">
                      {/* Friday Timeline Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-kalvium-border dark:border-kalvium-dark-border">
                        <div className="flex items-center gap-2">
                          <Calendar size={15} className="text-kalvium-coral" />
                          <span className="text-xs font-bold text-kalvium-text dark:text-kalvium-dark-text">Friday Agenda</span>
                        </div>
                        <span className="font-mono text-[11px] text-kalvium-muted dark:text-kalvium-dark-muted">October 24, 2026</span>
                      </div>

                      {/* Existing Schedule Items */}
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border">
                          <div className="flex items-center gap-3">
                            <span className="h-2 w-2 rounded-full bg-blue-500" />
                            <div>
                              <p className="text-xs font-bold text-kalvium-text dark:text-kalvium-dark-text">Cloud Systems Lecture</p>
                              <p className="text-[11px] text-kalvium-muted dark:text-kalvium-dark-muted">10:00 AM – 11:30 AM · Hall 302</p>
                            </div>
                          </div>
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold">Academic</span>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-coral/30">
                          <div className="flex items-center gap-3">
                            <span className="h-2 w-2 rounded-full bg-kalvium-coral" />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <p className="text-xs font-bold text-kalvium-text dark:text-kalvium-dark-text">HackKalvium Dev Sprint</p>
                                <CampusVerifiedBadge size="sm" />
                              </div>
                              <p className="text-[11px] text-kalvium-muted dark:text-kalvium-dark-muted">02:00 PM – 04:30 PM · Main Innovation Quad</p>
                            </div>
                          </div>
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-kalvium-coral-tint dark:bg-kalvium-dark-coral-tint text-kalvium-coral font-semibold">RSVP'd ✓</span>
                        </div>
                      </div>

                      {/* Interactive Conflict Demo */}
                      <div className="p-4 rounded-xl border-2 border-dashed border-kalvium-coral/40 bg-kalvium-coral/[0.03]">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <span className="text-[10px] font-mono uppercase tracking-wider text-kalvium-coral font-bold">New Proposed Event</span>
                            <h4 className="text-xs font-bold text-kalvium-text dark:text-kalvium-dark-text">Robotics Drone Workshop</h4>
                            <p className="text-[11px] text-kalvium-muted dark:text-kalvium-dark-muted">02:30 PM – 04:00 PM · Auditorium B</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSimulatedClash(!simulatedClash)}
                            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-kalvium-coral text-white text-xs font-bold shadow-xs hover:bg-kalvium-coral-hover transition-colors shrink-0"
                          >
                            <Zap size={13} />
                            <span>{simulatedClash ? "Reset Test" : "Click to Test RSVP"}</span>
                          </button>
                        </div>

                        {simulatedClash && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 pt-3 border-t border-kalvium-coral/20 flex items-start gap-2.5 text-xs text-amber-700 dark:text-amber-300 bg-amber-500/10 p-2.5 rounded-lg"
                          >
                            <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-bold">Timetable Conflict Prevented!</p>
                              <p className="text-[11px] text-kalvium-muted dark:text-kalvium-dark-muted mt-0.5">
                                Overlaps by 90 minutes with your RSVP'd "HackKalvium Dev Sprint". The platform prevents students from double-booking.
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeRoleTab === "organizer" && (
                  <motion.div
                    key="organizer-tab"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
                  >
                    {/* Left Editorial Text */}
                    <div className="lg:col-span-5 space-y-4">
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-kalvium-coral-tint dark:bg-kalvium-dark-coral-tint px-3 py-1 text-xs font-semibold text-kalvium-coral border border-kalvium-coral/20">
                        <PenTool size={14} />
                        <span>Club Organizer Studio</span>
                      </div>
                      <h3 className="font-display text-2xl sm:text-3xl font-bold text-kalvium-text dark:text-kalvium-dark-text leading-tight">
                        Flyer upload or rapid manual entry.
                      </h3>
                      <p className="text-sm text-kalvium-muted dark:text-kalvium-dark-muted leading-relaxed">
                        Drop an event flyer for client-side Gemini Flash parsing, or toggle to the manual entry form when you already have all your event details ready.
                      </p>
                      <div className="pt-2 flex flex-wrap gap-4 text-xs font-medium text-kalvium-text dark:text-kalvium-dark-text">
                        <div className="flex items-center gap-2">
                          <Lock size={16} className="text-kalvium-coral" />
                          <span>On-device API key storage (0 server logs)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-kalvium-coral" />
                          <span>Live draft card preview</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-kalvium-coral" />
                          <span>Track approval status live</span>
                        </div>
                      </div>
                      <div className="pt-4">
                        <Link
                          href="/events/create"
                          className="inline-flex items-center gap-2 text-xs font-bold text-kalvium-coral hover:underline"
                        >
                          <span>Open Event Creation Studio</span>
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>

                    {/* Right Interactive Simulator Widget */}
                    <div className="lg:col-span-7 bg-kalvium-surface-alt/80 dark:bg-kalvium-dark-surface-alt/80 rounded-2xl p-5 border border-kalvium-border dark:border-kalvium-dark-border space-y-4">
                      {/* Studio Mode Selector */}
                      <div className="flex items-center justify-between pb-3 border-b border-kalvium-border dark:border-kalvium-dark-border">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-kalvium-text dark:text-kalvium-dark-text">Input Method</span>
                        </div>
                        <div className="flex p-0.5 rounded-lg bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border text-xs">
                          <button
                            type="button"
                            onClick={() => setOrganizerMode("vision")}
                            className={`px-3 py-1 rounded-md font-semibold transition-all ${
                              organizerMode === "vision"
                                ? "bg-kalvium-coral text-white"
                                : "text-kalvium-muted hover:text-kalvium-text dark:hover:text-kalvium-dark-text"
                            }`}
                          >
                            AI Vision
                          </button>
                          <button
                            type="button"
                            onClick={() => setOrganizerMode("manual")}
                            className={`px-3 py-1 rounded-md font-semibold transition-all ${
                              organizerMode === "manual"
                                ? "bg-kalvium-coral text-white"
                                : "text-kalvium-muted hover:text-kalvium-text dark:hover:text-kalvium-dark-text"
                            }`}
                          >
                            Manual Entry
                          </button>
                        </div>
                      </div>

                      {organizerMode === "vision" ? (
                        <div className="space-y-3">
                          <div className="p-4 rounded-xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border flex items-center gap-4">
                            <div className="h-16 w-16 rounded-xl bg-kalvium-coral/10 flex items-center justify-center shrink-0 border border-kalvium-coral/20 text-kalvium-coral">
                              <ScanLine size={24} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-kalvium-text dark:text-kalvium-dark-text truncate">tech_symposium_poster.png</span>
                                <span className="font-mono text-[10px] text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded font-bold">PARSED</span>
                              </div>
                              <p className="text-[11px] text-kalvium-muted dark:text-kalvium-dark-muted mt-0.5">
                                Gemini Flash extracted title, date, venue, and summary in 1.4s
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="p-2.5 rounded-lg bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border">
                              <span className="text-[10px] font-mono text-kalvium-muted uppercase block">Extracted Title</span>
                              <span className="font-bold text-kalvium-text dark:text-kalvium-dark-text">AI Innovation Summit</span>
                            </div>
                            <div className="p-2.5 rounded-lg bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border">
                              <span className="text-[10px] font-mono text-kalvium-muted uppercase block">Extracted Date</span>
                              <span className="font-bold text-kalvium-text dark:text-kalvium-dark-text">Nov 14, 2026 · 10:00 AM</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[11px] font-mono text-kalvium-muted dark:text-kalvium-dark-muted px-1 pt-1">
                            <span className="flex items-center gap-1.5">
                              <Lock size={12} className="text-kalvium-coral" />
                              <span>Key saved in client localStorage</span>
                            </span>
                            <span className="text-kalvium-coral font-semibold">Ready for submission →</span>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="p-4 rounded-xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono uppercase text-kalvium-muted">Zero-AI Direct Entry</span>
                              <span className="text-[10px] text-kalvium-coral font-semibold">Standard Form</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="h-8 rounded bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt px-2.5 flex items-center text-[11px] text-kalvium-text dark:text-kalvium-dark-text font-medium border border-kalvium-border dark:border-kalvium-dark-border">
                                Annual Drama Fest
                              </div>
                              <div className="h-8 rounded bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt px-2.5 flex items-center text-[11px] text-kalvium-text dark:text-kalvium-dark-text font-medium border border-kalvium-border dark:border-kalvium-dark-border">
                                Campus Amphitheater
                              </div>
                            </div>
                            <div className="h-8 rounded bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt px-2.5 flex items-center text-[11px] text-kalvium-muted dark:text-kalvium-dark-muted border border-kalvium-border dark:border-kalvium-dark-border">
                              Friday, Nov 20, 2026 · 06:00 PM – 09:00 PM
                            </div>
                          </div>
                          <p className="text-[11px] text-kalvium-muted dark:text-kalvium-dark-muted px-1">
                            Full control over every field. Ideal for organizers without flyers or for quick official announcements.
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeRoleTab === "manager" && (
                  <motion.div
                    key="manager-tab"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
                  >
                    {/* Left Editorial Text */}
                    <div className="lg:col-span-5 space-y-4">
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-kalvium-coral-tint dark:bg-kalvium-dark-coral-tint px-3 py-1 text-xs font-semibold text-kalvium-coral border border-kalvium-coral/20">
                        <ShieldCheck size={14} />
                        <span>Campus Manager Studio</span>
                      </div>
                      <h3 className="font-display text-2xl sm:text-3xl font-bold text-kalvium-text dark:text-kalvium-dark-text leading-tight">
                        The human firewall that protects campus trust.
                      </h3>
                      <p className="text-sm text-kalvium-muted dark:text-kalvium-dark-muted leading-relaxed">
                        Nothing publishes automatically. Campus managers review submissions in the dedicated Verification Studio, check room availability, and grant the official certified stamp.
                      </p>
                      <div className="pt-2 flex flex-wrap gap-4 text-xs font-medium text-kalvium-text dark:text-kalvium-dark-text">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-kalvium-coral" />
                          <span>Side-by-side flyer comparison</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-kalvium-coral" />
                          <span>Venue conflict verification</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-kalvium-coral" />
                          <span>Direct manual publishing access</span>
                        </div>
                      </div>
                      <div className="pt-4">
                        <Link
                          href="/manager"
                          className="inline-flex items-center gap-2 text-xs font-bold text-kalvium-coral hover:underline"
                        >
                          <span>Open Verification Studio</span>
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>

                    {/* Right Interactive Simulator Widget */}
                    <div className="lg:col-span-7 bg-kalvium-surface-alt/80 dark:bg-kalvium-dark-surface-alt/80 rounded-2xl p-5 border border-kalvium-border dark:border-kalvium-dark-border space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-kalvium-border dark:border-kalvium-dark-border">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-kalvium-text dark:text-kalvium-dark-text">Verification Studio Queue</span>
                        </div>
                        <span className="font-mono text-[10px] text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded font-bold">1 PENDING AUDIT</span>
                      </div>

                      <div className="p-4 rounded-xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-xs font-bold text-kalvium-text dark:text-kalvium-dark-text">NextGen Robotics Workshop</h4>
                            <p className="text-[11px] text-kalvium-muted dark:text-kalvium-dark-muted">Submitted by: Kalvium Robotics Society</p>
                          </div>
                          <span className="text-[10px] font-mono font-bold text-kalvium-coral bg-kalvium-coral-tint dark:bg-kalvium-dark-coral-tint px-2 py-0.5 rounded">
                            PENDING
                          </span>
                        </div>

                        {/* Audit Checklist */}
                        <div className="space-y-1.5 text-[11px] text-kalvium-text dark:text-kalvium-dark-text font-medium">
                          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 size={13} />
                            <span>Venue Availability: Lab 4B is free (No clash)</span>
                          </div>
                          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 size={13} />
                            <span>Club Authorization: Verified active chapter</span>
                          </div>
                          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 size={13} />
                            <span>Poster Inspection: Matches submitted details</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-2 flex items-center gap-3">
                          <div className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 text-white text-xs font-bold text-center">
                            ✓ Approve & Stamp Verified
                          </div>
                          <div className="px-3 py-2 rounded-lg border border-kalvium-border dark:border-kalvium-dark-border text-xs font-medium text-kalvium-muted text-center">
                            Request Edit
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Campus Atmosphere (Editorial Magazine Broadsheet Layout)         */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative px-6 py-20 sm:px-10">
        <div className="mx-auto max-w-6xl">
          {/* Broadsheet Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-kalvium-coral mb-3">
                <Sparkles size={14} />
                <span>Campus Pulse // University Life</span>
              </div>
              <h2 className="font-display text-display-lg font-bold text-kalvium-text dark:text-kalvium-dark-text tracking-tight">
                Where student life actually happens.
              </h2>
            </div>
            <p className="max-w-md text-sm text-kalvium-muted dark:text-kalvium-dark-muted leading-relaxed">
              From packed auditorium keynotes and late-night hackathon labs to open-air amphitheater concerts — explore authentic campus gatherings.
            </p>
          </div>

          {/* Large Photographic Spread */}
          <div className="relative h-[340px] sm:h-[440px] rounded-3xl overflow-hidden border border-kalvium-border dark:border-kalvium-dark-border shadow-kalvium group">
            <Image
              src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1600&auto=format&fit=crop&q=85"
              alt="University students collaborating in modern campus auditorium"
              fill
              sizes="(max-width: 1200px) 100vw, 1200px"
              className="object-cover object-center transition-transform duration-700 ease-editorial group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10 pointer-events-none" />
            <div className="absolute inset-0 bg-kalvium-coral/5 mix-blend-multiply pointer-events-none" />

            {/* Floating Location Nodes on Image */}
            <div className="absolute top-5 left-5 z-10 hidden sm:flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-white/90 dark:bg-kalvium-dark-surface/90 backdrop-blur-md px-3 py-1 text-[11px] font-mono font-semibold text-kalvium-text dark:text-kalvium-dark-text border border-white/20">
                <MapPin size={12} className="text-kalvium-coral" />
                <span>Innovation Quad</span>
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-black/40 backdrop-blur-md px-3 py-1 text-[11px] font-mono font-semibold text-white border border-white/10">
                <span>Auditorium A</span>
              </span>
            </div>

            <div className="absolute bottom-6 left-6 right-6 z-10 text-white">
              <div className="max-w-xl">
                <span className="text-[11px] font-mono uppercase tracking-widest text-kalvium-coral-tint font-bold">
                  Certified Campus Atmosphere
                </span>
                <h3 className="font-display text-2xl sm:text-3xl font-bold mt-1 leading-snug">
                  The heartbeat of university life happens in person.
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-white/80 line-clamp-2">
                  No ghost events. No double-booked seminar halls. Every gathering certified by campus authorities before you show up.
                </p>
              </div>
            </div>
          </div>

          {/* Three Clean Editorial Columns (No card boxes! Hairline dividers) */}
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-kalvium-border dark:divide-kalvium-dark-border mt-10 pt-4">
            <div className="py-6 md:py-2 md:pr-8 first:pl-0">
              <span className="font-mono text-xs font-bold text-kalvium-coral">01 //</span>
              <h4 className="font-display text-base font-bold text-kalvium-text dark:text-kalvium-dark-text mt-2">
                Keynotes & Tech Symposiums
              </h4>
              <p className="mt-2 text-xs text-kalvium-muted dark:text-kalvium-dark-muted leading-relaxed">
                Hackathons, developer workshops, and distinguished guest lectures confirmed directly by university departments.
              </p>
            </div>

            <div className="py-6 md:py-2 md:px-8">
              <span className="font-mono text-xs font-bold text-kalvium-coral">02 //</span>
              <h4 className="font-display text-base font-bold text-kalvium-text dark:text-kalvium-dark-text mt-2">
                Cultural & Performing Arts
              </h4>
              <p className="mt-2 text-xs text-kalvium-muted dark:text-kalvium-dark-muted leading-relaxed">
                Live music stages, amphitheater drama productions, and annual cultural celebrations with verified hall reservations.
              </p>
            </div>

            <div className="py-6 md:py-2 md:pl-8">
              <span className="font-mono text-xs font-bold text-kalvium-coral">03 //</span>
              <h4 className="font-display text-base font-bold text-kalvium-text dark:text-kalvium-dark-text mt-2">
                Student Societies & Chapters
              </h4>
              <p className="mt-2 text-xs text-kalvium-muted dark:text-kalvium-dark-muted leading-relaxed">
                Orientation fairs, design circles, and peer-led study meetups connecting students across all campus departments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Trust Callout                                                    */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative px-6 py-14 sm:px-10 border-t border-kalvium-border dark:border-kalvium-dark-border">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <CampusVerifiedBadge size="lg" animate />
            <p className="max-w-md text-sm text-kalvium-muted dark:text-kalvium-dark-muted font-normal leading-relaxed">
              AI makes event creation faster. A human check makes it trustworthy. Never miss what matters on campus.
            </p>
          </div>
          <MagneticButton href="/register">
            Start Exploring
          </MagneticButton>
        </div>
      </section>
    </div>
  );
}

function PreviewCard({
  className,
  category,
  title,
  when,
  where,
  image,
  delay,
}: {
  className: string;
  category: string;
  title: string;
  when: string;
  where: string;
  image?: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`rounded-3xl p-4 shadow-kalvium-md border border-kalvium-border dark:border-kalvium-dark-border bg-white dark:bg-kalvium-dark-surface ${className}`}
    >
      <div className="flex items-center gap-3">
        {image && (
          <div className="relative w-14 h-14 rounded-2xl overflow-hidden shrink-0 border border-kalvium-border dark:border-kalvium-dark-border shadow-xs">
            <Image src={image} alt={title} fill sizes="56px" className="object-cover" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="rounded-full bg-kalvium-coral-tint dark:bg-kalvium-dark-coral-tint px-2.5 py-0.5 text-[10px] font-semibold text-kalvium-coral border border-kalvium-coral/20">
              {category}
            </span>
            <CampusVerifiedBadge size="sm" />
          </div>
          <h4 className="font-display text-xs sm:text-sm font-bold text-kalvium-text dark:text-kalvium-dark-text leading-snug truncate">
            {title}
          </h4>
          <p className="text-[11px] font-medium text-kalvium-coral mt-0.5">{when}</p>
          <p className="text-[10px] text-kalvium-muted dark:text-kalvium-dark-muted truncate">{where}</p>
        </div>
      </div>
    </motion.div>
  );
}
