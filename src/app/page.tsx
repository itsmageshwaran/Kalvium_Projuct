"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ScanLine, ShieldCheck, UploadCloud, Zap, Sparkles, BookOpen, Calendar, Users } from "lucide-react";
import MagneticButton from "@/components/MagneticButton";
import CountUp from "@/components/CountUp";
import StaggerGrid from "@/components/StaggerGrid";
import CampusVerifiedBadge from "@/components/CampusVerifiedBadge";
import TiltCard from "@/components/TiltCard";
import { useAuth, getDashboardRoute } from "@/context/AuthContext";

const headlineLines = ["Find what's", "actually happening", "on campus."];

const pipeline = [
  {
    icon: UploadCloud,
    title: "An organizer uploads a poster",
    detail: "No forms to fill in twice — the flyer they already made is the input.",
  },
  {
    icon: ScanLine,
    title: "AI reads the details",
    detail: "Time, venue, and category are extracted automatically with field-level confidence.",
  },
  {
    icon: ShieldCheck,
    title: "Campus staff verify it",
    detail: "A real person on the manager team checks the AI's read before anything goes live.",
  },
  {
    icon: Zap,
    title: "It lands on your schedule",
    detail: "Clash detection checks it against what you've already saved, instantly.",
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
      {/* Pipeline Sequence                                                */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative px-6 py-20 sm:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] items-center mb-12">
            <div>
              <motion.span
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-kalvium-coral mb-3"
              >
                <Sparkles size={14} />
                <span>Verification Pipeline</span>
              </motion.span>
              <motion.h2
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="font-display text-display-lg font-bold text-kalvium-text dark:text-kalvium-dark-text tracking-tight"
              >
                From poster to verified event.
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="mt-3 text-base text-kalvium-muted dark:text-kalvium-dark-muted max-w-lg leading-relaxed"
              >
                Every listing is scanned for schedule clashes, confirmed with campus organizers, and certified before students RSVP.
              </motion.p>
            </div>

            {/* Supporting Editorial Image Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative h-44 sm:h-52 rounded-3xl overflow-hidden border border-kalvium-border dark:border-kalvium-dark-border shadow-kalvium group bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt"
            >
              <Image
                src="https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=80"
                alt="Students planning and reviewing campus event posters and schedules"
                fill
                sizes="(max-width: 1024px) 100vw, 35vw"
                className="object-cover object-center transition-transform duration-700 ease-editorial group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-kalvium-coral/5 mix-blend-multiply pointer-events-none" />
              <div className="absolute bottom-3.5 left-4 right-4 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-kalvium-coral text-white text-[11px] font-bold">
                    ✓
                  </span>
                  <span className="text-xs font-semibold">Human-in-the-loop review</span>
                </div>
                <span className="text-[11px] text-white/80 font-mono">100% audited</span>
              </div>
            </motion.div>
          </div>

          <StaggerGrid className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {pipeline.map((step, i) => (
              <motion.div
                key={step.title}
                variants={{
                  hidden: { opacity: 0, y: 28 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
                }}
                className="bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border rounded-3xl p-6 transition-all duration-300 hover:border-kalvium-coral/40 shadow-kalvium-sm hover:shadow-kalvium-md"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-kalvium-coral-tint dark:bg-kalvium-dark-coral-tint text-kalvium-coral border border-kalvium-coral/20">
                    <step.icon size={20} />
                  </span>
                  <span className="font-display text-2xl font-bold text-kalvium-muted/40">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="mt-5 font-display text-base font-bold text-kalvium-text dark:text-kalvium-dark-text">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-kalvium-muted dark:text-kalvium-dark-muted">{step.detail}</p>
              </motion.div>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Animated Stats Section                                           */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative px-6 py-14 sm:px-10">
        <div className="bg-white dark:bg-kalvium-dark-surface mx-auto grid max-w-5xl grid-cols-2 gap-8 rounded-3xl p-8 sm:p-12 sm:grid-cols-4 border border-kalvium-border dark:border-kalvium-dark-border shadow-kalvium-sm">
          <Stat value={1200} suffix="+" label="Verified events" />
          <Stat value={38} suffix="" label="Clubs posting weekly" />
          <Stat value={94} suffix="%" label="AI extraction accuracy" />
          <Stat value={0} suffix="" label="Double-bookings, since launch" />
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Campus Life & Atmosphere (Editorial Photography Collage)        */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative px-6 py-16 sm:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <motion.span
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-kalvium-coral mb-3"
              >
                <Sparkles size={14} />
                <span>Campus Pulse</span>
              </motion.span>
              <motion.h2
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="font-display text-display-lg font-bold text-kalvium-text dark:text-kalvium-dark-text tracking-tight"
              >
                Built for every rhythm of student life.
              </motion.h2>
            </div>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="max-w-md text-sm sm:text-base text-kalvium-muted dark:text-kalvium-dark-muted leading-relaxed"
            >
              From packed keynote amphitheaters to late-night hackathons and open-air club sessions — discover the real gatherings that shape your university years.
            </motion.p>
          </div>

          {/* 3-Image Editorial Collage */}
          <div className="grid gap-6 md:grid-cols-12">
            {/* Primary Dominant Card (7 cols) */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="relative md:col-span-7 h-[320px] sm:h-[400px] rounded-3xl overflow-hidden border border-kalvium-border dark:border-kalvium-dark-border shadow-kalvium group bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt"
            >
              <Image
                src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&auto=format&fit=crop&q=85"
                alt="Students gathered in modern university lecture auditorium for keynote symposium"
                fill
                sizes="(max-width: 768px) 100vw, 60vw"
                className="object-cover object-center transition-transform duration-700 ease-editorial group-hover:scale-105 will-change-transform"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-kalvium-coral/5 mix-blend-multiply pointer-events-none" />

              <div className="absolute top-4 left-4 z-10">
                <span className="rounded-full bg-white/90 dark:bg-kalvium-dark-surface/90 backdrop-blur-md px-3 py-1 text-[11px] font-semibold text-kalvium-text dark:text-kalvium-dark-text border border-white/20 shadow-xs">
                  Keynotes & Tech Symposiums
                </span>
              </div>

              <div className="absolute bottom-6 left-6 right-6 z-10 text-white">
                <p className="text-xs uppercase tracking-wider text-white/75 font-semibold">Innovation Quad · Hall A</p>
                <h3 className="font-display text-xl sm:text-2xl font-bold mt-1 leading-snug">
                  Tech Horizons Annual Showcase
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm text-white/80 line-clamp-2 max-w-lg">
                  Every attendee seat synchronized with real-time clash protection. Zero overlapping bookings since semester launch.
                </p>
              </div>
            </motion.div>

            {/* Right Stack (5 cols): Two complementary cards */}
            <div className="md:col-span-5 grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-1">
              {/* Card 2: Cultural Amphitheater */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="relative h-[180px] sm:h-[188px] rounded-3xl overflow-hidden border border-kalvium-border dark:border-kalvium-dark-border shadow-kalvium group bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt"
              >
                <Image
                  src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80"
                  alt="Vibrant campus music festival and cultural stage lighting"
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-cover object-center transition-transform duration-700 ease-editorial group-hover:scale-105 will-change-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-kalvium-coral/5 mix-blend-multiply pointer-events-none" />

                <div className="absolute bottom-4 left-5 right-5 z-10 text-white">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-kalvium-coral-tint">
                    Cultural & Arts
                  </span>
                  <h4 className="font-display text-base font-bold leading-tight mt-0.5">
                    Campus Amphitheater Live
                  </h4>
                  <p className="text-[11px] text-white/75 mt-0.5">Sound checks, drama, and festival stages</p>
                </div>
              </motion.div>

              {/* Card 3: Student Communities & Outdoors */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="relative h-[180px] sm:h-[188px] rounded-3xl overflow-hidden border border-kalvium-border dark:border-kalvium-dark-border shadow-kalvium group bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt"
              >
                <Image
                  src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop&q=80"
                  alt="Diverse university students enjoying community club fair on campus grounds"
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-cover object-center transition-transform duration-700 ease-editorial group-hover:scale-105 will-change-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-kalvium-coral/5 mix-blend-multiply pointer-events-none" />

                <div className="absolute bottom-4 left-5 right-5 z-10 text-white">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-kalvium-coral-tint">
                    Student Communities
                  </span>
                  <h4 className="font-display text-base font-bold leading-tight mt-0.5">
                    Outdoor Club Fairs & Societies
                  </h4>
                  <p className="text-[11px] text-white/75 mt-0.5">38 active campus chapters connected weekly</p>
                </div>
              </motion.div>
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

function Stat({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  return (
    <div>
      <p className="font-display text-3xl font-extrabold text-kalvium-text dark:text-kalvium-dark-text sm:text-4xl tracking-tight">
        <CountUp to={value} suffix={suffix} />
      </p>
      <p className="mt-1.5 text-xs sm:text-sm text-kalvium-muted dark:text-kalvium-dark-muted font-medium">{label}</p>
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
