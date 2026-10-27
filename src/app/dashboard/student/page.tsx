"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  Flame,
  AlertTriangle,
  Compass,
  ArrowRight,
  ShieldCheck,
  Bookmark,
  Sparkles,
  PenTool,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Trash2,
  PlusCircle,
  GraduationCap,
  Users,
  Award,
  Trophy,
  ExternalLink,
} from "lucide-react";
import CampusVerifiedBadge from "@/components/CampusVerifiedBadge";
import CreateEventStudio from "@/components/CreateEventStudio";
import ManualEventForm from "@/components/ManualEventForm";
import UploadCertificateModal from "@/components/UploadCertificateModal";
import { useAuth, getDashboardRoute } from "@/context/AuthContext";
import { useToast } from "@/components/Toast";
import { getTimeGreeting } from "@/lib/time";


type TabType = "AGENDA" | "ENROLLED" | "ACHIEVEMENTS" | "REQUESTS" | "CREATE_AI" | "CREATE_MANUAL";

function StudentDashboardContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { success, error } = useToast();

  // Tab State: Agenda, Enrolled, Requests, or Create
  const [activeTab, setActiveTab] = useState<TabType>("AGENDA");
  // Inline delete confirmation — holds the eventId pending deletion
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);


  // Agenda Data (Saved events & conflicts)
  const [agendaData, setAgendaData] = useState<any>(null);
  const [agendaLoading, setAgendaLoading] = useState(true);

  // Enrolled Events Data
  const [enrolledEvents, setEnrolledEvents] = useState<any[]>([]);
  const [enrolledLoading, setEnrolledLoading] = useState(false);

  // Student Participations & Certificates Data (Part 2)
  const [participationsData, setParticipationsData] = useState<any>(null);
  const [participationsLoading, setParticipationsLoading] = useState(false);
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [selectedCertEvent, setSelectedCertEvent] = useState<{ id: string; title: string; date?: string; venue?: string } | null>(null);

  // Student's Event Submissions / Requests Data
  const [requestsData, setRequestsData] = useState<any>(null);
  const [requestsLoading, setRequestsLoading] = useState(false);

  // Handle tab change: updates both state and URL query param
  const handleTabChange = (newTab: TabType) => {
    setActiveTab(newTab);
    if (newTab === "AGENDA") {
      router.replace("/dashboard/student", { scroll: false });
    } else if (newTab === "ENROLLED") {
      router.replace("/dashboard/student?tab=enrolled", { scroll: false });
    } else if (newTab === "ACHIEVEMENTS") {
      router.replace("/dashboard/student?tab=achievements", { scroll: false });
      fetchStudentParticipations();
    } else if (newTab === "REQUESTS") {
      router.replace("/dashboard/student?tab=requests", { scroll: false });
    } else if (newTab === "CREATE_AI") {
      router.replace("/dashboard/student?tab=create", { scroll: false });
    } else if (newTab === "CREATE_MANUAL") {
      router.replace("/dashboard/student?tab=create_manual", { scroll: false });
    }
  };

  // Sync tab with URL query parameter if present
  useEffect(() => {
    const tabParam = searchParams.get("tab")?.toLowerCase();
    if (tabParam === "create" || tabParam === "create_ai") {
      setActiveTab("CREATE_AI");
    } else if (tabParam === "create_manual") {
      setActiveTab("CREATE_MANUAL");
    } else if (tabParam === "enrolled") {
      setActiveTab("ENROLLED");
    } else if (tabParam === "achievements") {
      setActiveTab("ACHIEVEMENTS");
      fetchStudentParticipations();
    } else if (tabParam === "requests") {
      setActiveTab("REQUESTS");
    } else {
      setActiveTab("AGENDA");
    }
  }, [searchParams]);

  useEffect(() => {
    if (!authLoading && user && user.role?.toUpperCase() !== "STUDENT") {
      router.replace(getDashboardRoute(user.role));
    } else if (!authLoading && !user) {
      router.replace("/login?redirect=/dashboard/student");
    }
  }, [user, authLoading, router]);

  // Fetch saved events for agenda
  const fetchAgenda = async () => {
    setAgendaLoading(true);
    try {
      const res = await fetch("/api/saved", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        setAgendaData(json);
      }
    } catch (e) {
      console.error("Failed to fetch student saved events:", e);
    } finally {
      setAgendaLoading(false);
    }
  };

  // Fetch events the student applied/enrolled into
  const fetchEnrolledEvents = async () => {
    setEnrolledLoading(true);
    try {
      const res = await fetch("/api/student/enrolled", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        setEnrolledEvents(json.enrolledEvents || []);
      }
    } catch (e) {
      console.error("Failed to fetch enrolled events:", e);
    } finally {
      setEnrolledLoading(false);
    }
  };

  // Fetch student participations & certificates (Part 2)
  const fetchStudentParticipations = async () => {
    setParticipationsLoading(true);
    try {
      const res = await fetch("/api/student/participations", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        setParticipationsData(json);
      }
    } catch (e) {
      console.error("Failed to fetch student participations:", e);
    } finally {
      setParticipationsLoading(false);
    }
  };

  const handleWithdrawEnrollment = async (eventId: string) => {
    try {
      const res = await fetch(`/api/events/${eventId}/apply`, {
        method: "DELETE",
      });
      if (res.ok) {
        success("Your application has been withdrawn.");
        fetchEnrolledEvents();
      } else {
        const err = await res.json();
        error(err.error || "Failed to withdraw enrollment.");
      }
    } catch {
      error("Network error while withdrawing.");
    }
  };

  // Fetch student's own event proposals/requests
  const fetchRequests = async () => {
    setRequestsLoading(true);
    try {
      const res = await fetch("/api/organizer/events", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        setRequestsData(json);
      }
    } catch (e) {
      console.error("Failed to fetch student event requests:", e);
    } finally {
      setRequestsLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role?.toUpperCase() !== "STUDENT") return;
    fetchAgenda();
    fetchEnrolledEvents();
    fetchRequests();
  }, [user]);

  const handleDeleteRequest = async (eventId: string) => {
    // First call: set the id so inline confirm renders. Second call: actually delete.
    if (confirmDeleteId !== eventId) {
      setConfirmDeleteId(eventId);
      return;
    }
    setConfirmDeleteId(null);
    try {
      const res = await fetch(`/api/organizer/events/${eventId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        success("Event request withdrawn successfully.");
        fetchRequests();
      } else {
        const err = await res.json();
        error(`Failed to withdraw request: ${err.error || "Unknown error"}`);
      }
    } catch (e) {
      console.error(e);
      error("An error occurred while withdrawing the event request.");
    }
  };


  if (authLoading || (user && user.role?.toUpperCase() !== "STUDENT")) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-kalvium-coral border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="p-8 rounded-3xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border shadow-soft-sm text-center">
          <div className="w-12 h-12 rounded-full bg-kalvium-coral/10 text-kalvium-coral flex items-center justify-center mx-auto mb-3">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-display font-bold text-kalvium-text dark:text-kalvium-dark-text mb-2">
            Student Portal
          </h2>
          <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted mb-6">
            Please log in with your campus credentials to view your agenda, saved events, and event requests.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login?redirect=/dashboard/student"
              className="w-full sm:w-auto px-5 py-2.5 bg-kalvium-coral hover:bg-kalvium-coral-hover text-white rounded-full text-xs font-bold shadow-sm transition"
            >
              Sign In to Portal
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto px-5 py-2.5 border border-kalvium-border dark:border-kalvium-dark-border hover:bg-kalvium-surface-alt dark:hover:bg-kalvium-dark-surface-alt text-kalvium-text dark:text-kalvium-dark-text rounded-full text-xs font-bold transition"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const conflictsCount = agendaData?.conflictsCount || 0;
  const savedEvents = agendaData?.events || [];
  const upcomingSavedEvents = savedEvents.filter((ev: any) => !ev.isPast && ev.dateCategory !== "PAST");
  const pastSavedEvents = savedEvents.filter((ev: any) => ev.isPast || ev.dateCategory === "PAST");
  const startingSoonEvent = upcomingSavedEvents.find((e: any) => e.isStartingSoon);

  const requestStats = requestsData?.stats || { total: 0, pending: 0, approved: 0, declined: 0 };
  const requestedEvents = requestsData?.events || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Hero Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-xs font-sans uppercase tracking-widest text-kalvium-coral font-bold bg-kalvium-bg dark:bg-kalvium-dark-surface px-3 py-1 rounded-full border border-kalvium-border dark:border-kalvium-dark-border shadow-soft-xs">
              Student Portal
            </span>
            <CampusVerifiedBadge size="sm" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-bold text-kalvium-text dark:text-kalvium-dark-text tracking-tight">
            {getTimeGreeting()}, {user.name.split(" ")[0]}
          </h1>
          <p className="text-base text-kalvium-muted dark:text-kalvium-dark-muted mt-2">
            Explore verified campus events, organize your schedule, or submit new event proposals.
          </p>
        </div>

        {/* Quick Action Button to Request Event */}
        {activeTab === "AGENDA" && (
          <button
            onClick={() => handleTabChange("CREATE_AI")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-kalvium-coral hover:bg-kalvium-coral-hover text-white text-xs font-bold shadow-sm transition-all duration-200 active:scale-95 shrink-0 self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>+ Request an Event</span>
          </button>
        )}
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-kalvium-border dark:border-kalvium-dark-border pb-4 mb-8 overflow-x-auto no-scrollbar scroll-smooth">
        <button
          onClick={() => handleTabChange("AGENDA")}
          className={`px-3.5 sm:px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 active:scale-95 flex items-center gap-1.5 sm:gap-2 shrink-0 ${
            activeTab === "AGENDA"
              ? "bg-kalvium-coral text-white shadow-sm"
              : "bg-white dark:bg-kalvium-dark-surface text-kalvium-muted dark:text-kalvium-dark-muted hover:text-kalvium-text dark:hover:text-kalvium-dark-text border border-kalvium-border dark:border-kalvium-dark-border"
          }`}
        >
          <Calendar className="w-3.5 h-3.5 shrink-0" />
          <span>
            Agenda<span className="hidden sm:inline"> & Saved</span>
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-sans font-bold ${
              activeTab === "AGENDA" ? "bg-white/20 text-white" : "bg-kalvium-surface-alt text-kalvium-muted"
            }`}
          >
            {savedEvents.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange("ENROLLED")}
          className={`px-3.5 sm:px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 active:scale-95 flex items-center gap-1.5 sm:gap-2 shrink-0 ${
            activeTab === "ENROLLED"
              ? "bg-kalvium-coral text-white shadow-sm"
              : "bg-white dark:bg-kalvium-dark-surface text-kalvium-muted dark:text-kalvium-dark-muted hover:text-kalvium-text dark:hover:text-kalvium-dark-text border border-kalvium-border dark:border-kalvium-dark-border"
          }`}
        >
          <Users className="w-3.5 h-3.5 shrink-0" />
          <span>My Enrollments</span>
          {enrolledEvents.length > 0 && (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-sans font-bold ${
                activeTab === "ENROLLED"
                  ? "bg-white/20 text-white"
                  : "bg-kalvium-success/20 text-kalvium-success"
              }`}
            >
              {enrolledEvents.length}
            </span>
          )}
        </button>

        <button
          onClick={() => handleTabChange("ACHIEVEMENTS")}
          className={`px-3.5 sm:px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 active:scale-95 flex items-center gap-1.5 sm:gap-2 shrink-0 ${
            activeTab === "ACHIEVEMENTS"
              ? "bg-kalvium-coral text-white shadow-sm"
              : "bg-white dark:bg-kalvium-dark-surface text-kalvium-muted dark:text-kalvium-dark-muted hover:text-kalvium-text dark:hover:text-kalvium-dark-text border border-kalvium-border dark:border-kalvium-dark-border"
          }`}
        >
          <Trophy className="w-3.5 h-3.5 shrink-0 text-amber-500" />
          <span>Certificates & Awards</span>
          {participationsData?.stats?.totalCertificates > 0 && (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-sans font-bold ${
                activeTab === "ACHIEVEMENTS"
                  ? "bg-white/20 text-white"
                  : "bg-amber-500/20 text-amber-600 dark:text-amber-400"
              }`}
            >
              {participationsData.stats.totalCertificates}
            </span>
          )}
        </button>

        <button
          onClick={() => handleTabChange("REQUESTS")}
          className={`px-3.5 sm:px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 active:scale-95 flex items-center gap-1.5 sm:gap-2 shrink-0 ${
            activeTab === "REQUESTS"
              ? "bg-kalvium-coral text-white shadow-sm"
              : "bg-white dark:bg-kalvium-dark-surface text-kalvium-muted dark:text-kalvium-dark-muted hover:text-kalvium-text dark:hover:text-kalvium-dark-text border border-kalvium-border dark:border-kalvium-dark-border"
          }`}
        >
          <Clock className="w-3.5 h-3.5 shrink-0" />
          <span>My Requests</span>
          {requestedEvents.length > 0 && (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-sans font-bold ${
                activeTab === "REQUESTS"
                  ? "bg-white/20 text-white"
                  : requestStats.pending > 0
                  ? "bg-kalvium-warning/20 text-kalvium-warning"
                  : "bg-kalvium-surface-alt text-kalvium-muted"
              }`}
            >
              {requestedEvents.length}
            </span>
          )}
        </button>

        <button
          onClick={() => handleTabChange("CREATE_AI")}
          className={`px-3.5 sm:px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 active:scale-95 flex items-center gap-1.5 sm:gap-2 shrink-0 ${
            activeTab === "CREATE_AI"
              ? "bg-kalvium-coral text-white shadow-sm"
              : "bg-white dark:bg-kalvium-dark-surface text-kalvium-muted dark:text-kalvium-dark-muted hover:text-kalvium-text dark:hover:text-kalvium-dark-text border border-kalvium-border dark:border-kalvium-dark-border"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span>
            AI Request<span className="hidden sm:inline"> Poster</span>
          </span>
        </button>

        <button
          onClick={() => handleTabChange("CREATE_MANUAL")}
          className={`px-3.5 sm:px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 active:scale-95 flex items-center gap-1.5 sm:gap-2 shrink-0 ${
            activeTab === "CREATE_MANUAL"
              ? "bg-kalvium-coral text-white shadow-sm"
              : "bg-white dark:bg-kalvium-dark-surface text-kalvium-muted dark:text-kalvium-dark-muted hover:text-kalvium-text dark:hover:text-kalvium-dark-text border border-kalvium-border dark:border-kalvium-dark-border"
          }`}
        >
          <PenTool className="w-3.5 h-3.5 shrink-0" />
          <span>
            Manual<span className="hidden sm:inline"> Request</span>
          </span>
        </button>
      </div>

      {/* TAB 1: AGENDA & SAVED EVENTS */}
      {activeTab === "AGENDA" && (
        <div className="space-y-8 animate-fade-in">
          {/* Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border shadow-kalvium-sm transition-all duration-300 hover:-translate-y-0.5 animate-slide-up stagger-1">
              <span className="text-[11px] font-sans text-kalvium-muted dark:text-kalvium-dark-muted uppercase tracking-wider font-semibold block mb-1">
                SAVED EVENTS
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-display font-bold text-kalvium-text dark:text-kalvium-dark-text">
                  {upcomingSavedEvents.length}
                </span>
                <span className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted">
                  upcoming ({savedEvents.length} total)
                </span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border shadow-kalvium-sm transition-all duration-300 hover:-translate-y-0.5 animate-slide-up stagger-2">
              <span className="text-[11px] font-sans text-kalvium-muted dark:text-kalvium-dark-muted uppercase tracking-wider font-semibold block mb-1">
                STARTING SOON
              </span>
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-4xl font-display font-bold ${
                    upcomingSavedEvents.filter((e: any) => e.isStartingSoon).length > 0
                      ? "text-kalvium-coral"
                      : "text-kalvium-text dark:text-kalvium-dark-text"
                  }`}
                >
                  {upcomingSavedEvents.filter((e: any) => e.isStartingSoon).length}
                </span>
                <span className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted">within 24 hours</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border hover:border-kalvium-coral/30 shadow-kalvium-sm transition-all duration-300 hover:-translate-y-0.5 animate-slide-up stagger-3">
              <span className="text-[11px] font-sans uppercase tracking-wider font-semibold block mb-1 text-kalvium-muted dark:text-kalvium-dark-muted">
                SCHEDULE CONFLICTS
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-display font-bold text-kalvium-text dark:text-kalvium-dark-text">
                  {conflictsCount}
                </span>
                <span className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted">
                  {conflictsCount === 1 ? "overlapping clash" : "overlapping clashes"}
                </span>
              </div>
              {conflictsCount > 0 && (
                <Link
                  href="/schedule"
                  className="inline-flex items-center gap-1 text-xs font-bold text-kalvium-coral hover:underline mt-2 transition-colors"
                >
                  <span>Review your saved events →</span>
                </Link>
              )}
            </div>
          </div>

          {/* Starting Soon Spotlight Card if applicable */}
          {startingSoonEvent && (
            <div className="p-6 rounded-3xl bg-kalvium-coral-tint dark:bg-kalvium-dark-surface border border-kalvium-coral/30 dark:border-kalvium-coral/40 shadow-kalvium-sm relative overflow-hidden animate-scale-in">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-kalvium-coral text-white flex items-center gap-1.5 shadow-sm">
                  <Flame className="w-3.5 h-3.5 text-white" />
                  <span>STARTING SOON SPOTLIGHT</span>
                </span>
                <CampusVerifiedBadge size="sm" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-8 space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-display font-bold text-kalvium-text dark:text-kalvium-dark-text tracking-tight">
                    {startingSoonEvent.title}
                  </h2>
                  <div className="flex items-center gap-4 text-xs text-kalvium-text dark:text-kalvium-dark-text font-medium flex-wrap">
                    <span className="text-kalvium-coral font-bold">{startingSoonEvent.countdown}</span>
                    <span>•</span>
                    <span>
                      {startingSoonEvent.startTime} – {startingSoonEvent.endTime}
                    </span>
                    <span>•</span>
                    <span>{startingSoonEvent.venue}</span>
                  </div>
                  <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted line-clamp-2 mt-2">
                    {startingSoonEvent.summary}
                  </p>
                </div>

                <div className="lg:col-span-4 flex justify-start lg:justify-end">
                  <Link
                    href={`/events/${startingSoonEvent.id}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-kalvium-coral hover:bg-kalvium-coral-hover text-white text-xs font-bold shadow-sm transition-all duration-200 active:scale-95"
                  >
                    <span>View Event Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Two Column Layout: Upcoming Agenda vs Quick Links */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Your Upcoming Events */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-display font-bold uppercase tracking-wider text-kalvium-text dark:text-kalvium-dark-text">
                  Your Upcoming Saved Events
                </h2>
                <Link href="/schedule" className="text-xs font-bold text-kalvium-coral hover:underline">
                  Full Schedule View →
                </Link>
              </div>

              {agendaLoading ? (
                <div className="p-8 text-center text-xs text-kalvium-muted">Loading schedule...</div>
              ) : upcomingSavedEvents.length === 0 ? (
                <div className="p-8 rounded-2xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border text-center shadow-kalvium-sm">
                  <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted mb-3">
                    You have no upcoming events on your schedule.
                  </p>
                  <Link
                    href="/events"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-kalvium-coral hover:bg-kalvium-coral-hover text-white text-xs font-bold shadow-sm"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Explore Upcoming Events</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingSavedEvents.slice(0, 5).map((ev: any) => (
                    <div
                      key={ev.id}
                      className="group p-4 rounded-xl border border-kalvium-border dark:border-kalvium-dark-border bg-white dark:bg-kalvium-dark-surface hover:border-kalvium-coral/40 dark:hover:border-kalvium-coral/40 flex items-center justify-between gap-4 transition-all duration-200 hover:-translate-y-0.5 shadow-kalvium-sm animate-slide-up"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="text-[10px] font-sans uppercase bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt text-kalvium-coral px-2.5 py-0.5 rounded-full border border-kalvium-border dark:border-kalvium-dark-border font-semibold">
                            {ev.category}
                          </span>
                          {ev.hasClash && (
                            <span className="text-[10px] font-medium text-kalvium-muted dark:text-kalvium-dark-muted bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border px-2.5 py-0.5 rounded-full flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-kalvium-muted dark:text-kalvium-dark-muted" />
                              <span>Schedule Conflict</span>
                            </span>
                          )}
                        </div>
                        <Link href={`/events/${ev.id}`}>
                          <h4 className="text-sm font-bold text-kalvium-text dark:text-kalvium-dark-text group-hover:text-kalvium-coral transition-colors truncate">
                            {ev.title}
                          </h4>
                        </Link>
                        <div className="flex items-center gap-3 text-[11px] text-kalvium-muted dark:text-kalvium-dark-muted mt-1">
                          <span>{ev.countdown}</span>
                          <span>•</span>
                          <span>{ev.venue}</span>
                        </div>
                      </div>

                      <Link
                        href={`/events/${ev.id}`}
                        aria-label={`View ${ev.title}`}
                        className="p-2 rounded-full bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt hover:bg-kalvium-coral hover:text-white text-kalvium-text dark:text-kalvium-dark-text shrink-0 transition-all duration-200 active:scale-95 group-hover:translate-x-0.5"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}

              {/* PAST SAVED EVENTS SECTION */}
              {pastSavedEvents.length > 0 && (
                <div className="mt-8 pt-6 border-t border-kalvium-border dark:border-kalvium-dark-border space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-kalvium-muted" />
                      <h3 className="text-xs font-sans uppercase tracking-wider text-kalvium-muted dark:text-kalvium-dark-muted font-bold">
                        Past Events
                      </h3>
                      <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded-full bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt text-kalvium-muted border border-kalvium-border dark:border-kalvium-dark-border">
                        {pastSavedEvents.length} concluded
                      </span>
                    </div>
                    <span className="text-[11px] text-kalvium-muted dark:text-kalvium-dark-muted">Saved from previous dates</span>
                  </div>

                  <div className="space-y-3 opacity-75 hover:opacity-100 transition-opacity">
                    {pastSavedEvents.slice(0, 5).map((ev: any) => (
                      <div
                        key={ev.id}
                        className="group p-4 rounded-xl border border-kalvium-border dark:border-kalvium-dark-border bg-kalvium-surface-alt/40 dark:bg-kalvium-dark-surface/50 flex items-center justify-between gap-4 transition-all duration-200"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className="text-[10px] font-sans uppercase bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt text-kalvium-muted px-2.5 py-0.5 rounded-full border border-kalvium-border dark:border-kalvium-dark-border font-semibold">
                              {ev.category}
                            </span>
                            <span className="text-[10px] font-sans uppercase tracking-wider font-semibold bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt text-kalvium-muted border border-kalvium-border dark:border-kalvium-dark-border px-2 py-0.5 rounded-full">
                              Past Event
                            </span>
                          </div>
                          <Link href={`/events/${ev.id}`}>
                            <h4 className="text-sm font-bold text-kalvium-text dark:text-kalvium-dark-text group-hover:text-kalvium-coral transition-colors truncate">
                              {ev.title}
                            </h4>
                          </Link>
                          <div className="flex items-center gap-3 text-[11px] text-kalvium-muted dark:text-kalvium-dark-muted mt-1">
                            <span>{ev.date}</span>
                            <span>•</span>
                            <span>{ev.startTime} – {ev.endTime}</span>
                            <span>•</span>
                            <span>{ev.venue}</span>
                          </div>
                        </div>

                        <Link
                          href={`/events/${ev.id}`}
                          aria-label={`View ${ev.title}`}
                          className="p-2 rounded-full bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt hover:bg-kalvium-coral hover:text-white text-kalvium-muted shrink-0 transition-all duration-200 active:scale-95 group-hover:translate-x-0.5"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Quick Discovery & Proposal Banner */}
            <div className="lg:col-span-4 space-y-6">
              {/* Propose an Event Banner */}
              <div className="p-5 rounded-2xl bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-coral/30 dark:border-kalvium-coral/30 space-y-3 shadow-kalvium-sm">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-kalvium-coral text-white">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-kalvium-text dark:text-kalvium-dark-text">
                      Propose a Campus Event
                    </h3>
                    <span className="text-[10px] text-kalvium-coral font-bold uppercase tracking-wider">
                      Student Initiative
                    </span>
                  </div>
                </div>
                <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted leading-relaxed">
                  Have an idea for a study group, workshop, hack session, or cultural gathering? Propose your event with AI poster analysis.
                </p>
                <button
                  onClick={() => handleTabChange("CREATE_AI")}
                  className="w-full py-2 px-4 rounded-full bg-kalvium-coral hover:bg-kalvium-coral-hover text-white text-xs font-bold shadow-sm transition active:scale-95 flex items-center justify-center gap-2"
                >
                  <span>Start Event Request →</span>
                </button>
              </div>

              {/* Quick Actions & Navigation Shortcuts */}
              <div className="p-5 rounded-2xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border space-y-4 shadow-kalvium-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-sans uppercase tracking-wider text-kalvium-text dark:text-kalvium-dark-text font-bold">
                    Quick Actions
                  </h3>
                  <span className="text-[11px] text-kalvium-muted dark:text-kalvium-dark-muted">Shortcuts</span>
                </div>
                <div className="space-y-2">
                  <Link
                    href="/schedule"
                    className="flex items-center justify-between p-3 rounded-xl bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt hover:border-kalvium-coral/40 border border-kalvium-border dark:border-kalvium-dark-border transition-all text-xs font-medium text-kalvium-text dark:text-kalvium-dark-text group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Calendar className="w-4 h-4 text-kalvium-coral" />
                      <span>My Calendar Schedule</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-kalvium-muted group-hover:text-kalvium-coral group-hover:translate-x-0.5 transition-all" />
                  </Link>
                  <Link
                    href="/events"
                    className="flex items-center justify-between p-3 rounded-xl bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt hover:border-kalvium-coral/40 border border-kalvium-border dark:border-kalvium-dark-border transition-all text-xs font-medium text-kalvium-text dark:text-kalvium-dark-text group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Compass className="w-4 h-4 text-kalvium-coral" />
                      <span>Discover Verified Events</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-kalvium-muted group-hover:text-kalvium-coral group-hover:translate-x-0.5 transition-all" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: MY ENROLLED EVENTS */}
      {activeTab === "ENROLLED" && (
        <div className="space-y-6 animate-fade-in">
          {/* Header & Refresh */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-display font-bold text-kalvium-text dark:text-kalvium-dark-text tracking-tight">
                My Enrolled Events
              </h2>
              <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted mt-1">
                Official applications and registered campus events. Event organizers and campus managers have received your enrollment.
              </p>
            </div>
            <button
              onClick={fetchEnrolledEvents}
              disabled={enrolledLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-kalvium-border dark:border-kalvium-dark-border bg-white dark:bg-kalvium-dark-surface hover:bg-kalvium-surface-alt text-xs font-semibold text-kalvium-text dark:text-kalvium-dark-text transition disabled:opacity-50 self-start sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${enrolledLoading ? "animate-spin text-kalvium-coral" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Metrics Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border shadow-soft-xs">
              <span className="text-[11px] font-sans text-kalvium-muted dark:text-kalvium-dark-muted uppercase tracking-wider font-semibold block mb-1">
                Confirmed Enrollments
              </span>
              <p className="text-2xl sm:text-3xl font-sans font-bold text-kalvium-text dark:text-kalvium-dark-text mt-1">
                {enrolledEvents.length}
              </p>
              <p className="text-[11px] text-kalvium-muted dark:text-kalvium-dark-muted mt-0.5">
                Active campus applications
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border shadow-soft-xs">
              <span className="text-[11px] font-sans text-kalvium-muted dark:text-kalvium-dark-muted uppercase tracking-wider font-semibold block mb-1">
                Upcoming Events
              </span>
              <p className="text-2xl sm:text-3xl font-sans font-bold text-kalvium-coral mt-1">
                {enrolledEvents.filter((e) => !e.isPast).length}
              </p>
              <p className="text-[11px] text-kalvium-muted dark:text-kalvium-dark-muted mt-0.5">
                On your upcoming calendar
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border shadow-soft-xs">
              <span className="text-[11px] font-sans text-kalvium-muted dark:text-kalvium-dark-muted uppercase tracking-wider font-semibold block mb-1">
                Completed / Past
              </span>
              <p className="text-2xl sm:text-3xl font-sans font-bold text-kalvium-text dark:text-kalvium-dark-text mt-1">
                {enrolledEvents.filter((e) => e.isPast).length}
              </p>
              <p className="text-[11px] text-kalvium-muted dark:text-kalvium-dark-muted mt-0.5">
                Concluded events
              </p>
            </div>
          </div>

          {/* Enrolled Events List */}
          {enrolledLoading ? (
            <div className="p-12 text-center text-xs text-kalvium-muted flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-kalvium-coral" />
              <span>Loading your enrolled events...</span>
            </div>
          ) : enrolledEvents.length === 0 ? (
            <div className="p-10 rounded-2xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border text-center shadow-soft-xs">
              <div className="w-12 h-12 rounded-full bg-kalvium-coral/10 text-kalvium-coral flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-base font-display font-bold text-kalvium-text dark:text-kalvium-dark-text mb-1">
                No Event Applications Yet
              </h3>
              <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted max-w-md mx-auto mb-5">
                When you apply for events, your confirmed registration and attendee records will appear here. The campus manager and organizers can view your registration.
              </p>
              <Link
                href="/events"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-kalvium-coral hover:bg-kalvium-coral-hover text-white text-xs font-bold shadow-sm transition"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Explore Campus Events</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {enrolledEvents.map((ev: any) => (
                <div
                  key={ev.id}
                  className="p-5 rounded-2xl border border-kalvium-border dark:border-kalvium-dark-border bg-white dark:bg-kalvium-dark-surface shadow-soft-xs hover:border-kalvium-coral/40 dark:hover:border-kalvium-coral/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-[10px] font-sans uppercase bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt text-kalvium-coral px-2.5 py-0.5 rounded-full border border-kalvium-border dark:border-kalvium-dark-border font-semibold">
                        {ev.category}
                      </span>
                      <span className="text-[10px] font-sans font-bold px-2.5 py-0.5 rounded-full bg-kalvium-success/15 text-kalvium-success border border-kalvium-success/20 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Confirmed Registration</span>
                      </span>
                      {ev.isPast && (
                        <span className="text-[10px] font-sans uppercase tracking-wider font-semibold bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt text-kalvium-muted border border-kalvium-border dark:border-kalvium-dark-border px-2 py-0.5 rounded-full">
                          Past Event
                        </span>
                      )}
                    </div>

                    <Link href={`/events/${ev.id}`}>
                      <h3 className="text-base font-bold text-kalvium-text dark:text-kalvium-dark-text hover:text-kalvium-coral transition-colors truncate">
                        {ev.title}
                      </h3>
                    </Link>

                    <div className="flex items-center gap-3 text-xs text-kalvium-muted dark:text-kalvium-dark-muted mt-2 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-kalvium-coral" />
                        {ev.date}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-kalvium-coral" />
                        {ev.startTime} – {ev.endTime}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-kalvium-coral" />
                        {ev.venue}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-semibold text-kalvium-text dark:text-kalvium-dark-text">
                        <Users className="w-3.5 h-3.5 text-kalvium-coral" />
                        {ev.enrolledCount || 1} Enrolled
                      </span>
                    </div>

                    {ev.enrolledAt && (
                      <p className="text-[11px] text-kalvium-muted dark:text-kalvium-dark-muted mt-2">
                        Applied: {new Date(ev.enrolledAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0 self-start md:self-center">
                    <button
                      onClick={() => {
                        setSelectedCertEvent({
                          id: ev.id,
                          title: ev.title,
                          date: ev.date,
                          venue: ev.venue,
                        });
                        setCertModalOpen(true);
                      }}
                      className="px-3.5 py-2 rounded-full border border-kalvium-coral/30 bg-kalvium-coral/10 hover:bg-kalvium-coral text-kalvium-coral hover:text-white text-xs font-bold transition flex items-center gap-1.5 active:scale-95"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>Upload Certificate</span>
                    </button>

                    <Link
                      href={`/events/${ev.id}`}
                      className="px-4 py-2 rounded-full border border-kalvium-border dark:border-kalvium-dark-border hover:border-kalvium-coral/50 bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt text-xs font-bold text-kalvium-text dark:text-kalvium-dark-text transition hover:text-kalvium-coral flex items-center gap-1.5"
                    >
                      <span>View Event</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    <button
                      onClick={() => handleWithdrawEnrollment(ev.id)}
                      title="Withdraw your application"
                      className="px-3.5 py-2 rounded-full border border-kalvium-border dark:border-kalvium-dark-border hover:border-kalvium-error/40 hover:bg-kalvium-error/10 text-xs font-medium text-kalvium-muted hover:text-kalvium-error transition flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Withdraw</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: MY CERTIFICATES & AWARDS SHOWCASE */}
      {activeTab === "ACHIEVEMENTS" && (
        <div className="space-y-6 animate-fade-in">
          {/* Header & Refresh */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-display font-bold text-kalvium-text dark:text-kalvium-dark-text tracking-tight flex items-center gap-2">
                <span>My Certificates & Achievements</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white uppercase tracking-wider">
                  Portfolio
                </span>
              </h2>
              <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted mt-1">
                Verified certificates of participation, hackathon prize wins, and podium achievements across campus events.
              </p>
            </div>
            <button
              onClick={fetchStudentParticipations}
              disabled={participationsLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-kalvium-border dark:border-kalvium-dark-border bg-white dark:bg-kalvium-dark-surface hover:bg-kalvium-surface-alt text-xs font-semibold text-kalvium-text dark:text-kalvium-dark-text transition disabled:opacity-50 self-start sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${participationsLoading ? "animate-spin text-kalvium-coral" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Metrics Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border shadow-soft-xs">
              <span className="text-[11px] font-sans text-kalvium-muted dark:text-kalvium-dark-muted uppercase tracking-wider font-semibold block mb-1">
                Certificates Earned
              </span>
              <p className="text-2xl sm:text-3xl font-sans font-bold text-kalvium-text dark:text-kalvium-dark-text mt-1">
                {participationsData?.stats?.totalCertificates || 0}
              </p>
              <p className="text-[11px] text-kalvium-muted dark:text-kalvium-dark-muted mt-0.5">
                Verified event credentials
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border shadow-soft-xs">
              <span className="text-[11px] font-sans text-kalvium-muted dark:text-kalvium-dark-muted uppercase tracking-wider font-semibold block mb-1">
                Prizes & Awards Won
              </span>
              <p className="text-2xl sm:text-3xl font-sans font-bold text-amber-500 mt-1">
                {participationsData?.stats?.awardsCount || 0}
              </p>
              <p className="text-[11px] text-kalvium-muted dark:text-kalvium-dark-muted mt-0.5">
                Podium & hackathon wins
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border shadow-soft-xs">
              <span className="text-[11px] font-sans text-kalvium-muted dark:text-kalvium-dark-muted uppercase tracking-wider font-semibold block mb-1">
                Team Competitions
              </span>
              <p className="text-2xl sm:text-3xl font-sans font-bold text-kalvium-coral mt-1">
                {participationsData?.stats?.teamProjectsCount || 0}
              </p>
              <p className="text-[11px] text-kalvium-muted dark:text-kalvium-dark-muted mt-0.5">
                Hackathons & group projects
              </p>
            </div>
          </div>

          {/* List or Empty State */}
          {participationsLoading ? (
            <div className="p-12 text-center text-xs text-kalvium-muted flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-kalvium-coral" />
              <span>Loading your certificates and awards...</span>
            </div>
          ) : !participationsData?.participations || participationsData.participations.length === 0 ? (
            <div className="p-10 rounded-2xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border text-center shadow-soft-xs">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto mb-3">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="text-base font-display font-bold text-kalvium-text dark:text-kalvium-dark-text mb-1">
                No Certificates Uploaded Yet
              </h3>
              <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted max-w-md mx-auto mb-5 leading-relaxed">
                When you participate in campus events, upload your certificates, winner photos, and hackathon project links to build your campus achievement portfolio!
              </p>
              <button
                onClick={() => handleTabChange("ENROLLED")}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-kalvium-coral hover:bg-kalvium-coral-hover text-white text-xs font-bold shadow-sm transition"
              >
                <Users className="w-3.5 h-3.5" />
                <span>View Enrolled Events to Upload</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {participationsData.participations.map((part: any) => (
                <div
                  key={part.id}
                  className="p-5 rounded-2xl border border-kalvium-border dark:border-kalvium-dark-border bg-white dark:bg-kalvium-dark-surface shadow-soft-xs hover:border-kalvium-coral/30 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {part.awardPhotoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={part.awardPhotoUrl}
                          alt="Award"
                          className="w-12 h-12 rounded-xl object-cover border border-amber-500/30 shrink-0"
                        />
                      ) : part.hasWonPrize ? (
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 border border-amber-500/20">
                          <Trophy size={20} />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-kalvium-success/10 text-kalvium-success flex items-center justify-center shrink-0 border border-kalvium-success/20">
                          <Award size={20} />
                        </div>
                      )}
                      <div>
                        {part.hasWonPrize && (
                          <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500 text-white uppercase tracking-wider mb-1">
                            {part.awardTitle || "Award Winner"}
                          </span>
                        )}
                        <h4 className="font-display font-bold text-sm text-kalvium-text dark:text-kalvium-dark-text truncate max-w-xs">
                          {part.eventTitle}
                        </h4>
                        <p className="text-[11px] text-kalvium-muted">
                          {part.eventDate} {part.eventVenue ? `• ${part.eventVenue}` : ""}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedCertEvent({
                          id: part.eventId,
                          title: part.eventTitle,
                          date: part.eventDate,
                          venue: part.eventVenue,
                        });
                        setCertModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-kalvium-surface-alt hover:bg-kalvium-coral hover:text-white transition active:scale-95 border border-kalvium-border"
                    >
                      Edit
                    </button>
                  </div>

                  {part.isTeamEvent && part.teamName && (
                    <div className="p-2.5 rounded-xl bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-kalvium-coral">Team: {part.teamName}</span>
                        {part.projectTitle && (
                          <span className="text-[11px] text-kalvium-muted">Entry: {part.projectTitle}</span>
                        )}
                      </div>
                      {part.teammates && part.teammates.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {part.teammates.map((m: any, i: number) => (
                            <span key={i} className="px-2 py-0.5 rounded-md bg-white dark:bg-kalvium-dark-surface text-[10px] border border-kalvium-border">
                              {m.name} {m.role ? `(${m.role})` : ""}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-kalvium-border dark:border-kalvium-dark-border text-xs">
                    <span className="text-kalvium-success font-medium text-[11px] flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      Verified {part.certificateType === "PARTICIPATION" ? "Participation Certificate" : part.certificateType}
                    </span>

                    {part.certificateUrl && (
                      <a
                        href={part.certificateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-kalvium-coral hover:underline"
                      >
                        <span>View Certificate</span>
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY EVENT REQUESTS */}
      {activeTab === "REQUESTS" && (
        <div className="space-y-6 animate-fade-in">
          {/* Status Metrics Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border shadow-soft-xs transition-all hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-sans text-kalvium-muted dark:text-kalvium-dark-muted uppercase tracking-wider font-semibold block mb-1">
                  Pending Verification
                </span>
                <span className="w-2 h-2 rounded-full bg-kalvium-warning inline-block" />
              </div>
              <p className="text-2xl sm:text-3xl font-sans font-bold text-kalvium-text dark:text-kalvium-dark-text mt-1">
                {requestStats.pending}
              </p>
              <p className="text-[11px] text-kalvium-muted dark:text-kalvium-dark-muted mt-0.5">
                Under review by Campus Manager
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border shadow-soft-xs transition-all hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-sans text-kalvium-muted dark:text-kalvium-dark-muted uppercase tracking-wider font-semibold block mb-1">
                  Approved & Live
                </span>
                <CheckCircle2 className="w-3.5 h-3.5 text-kalvium-success" />
              </div>
              <p className="text-2xl sm:text-3xl font-sans font-bold text-kalvium-text dark:text-kalvium-dark-text mt-1">
                {requestStats.approved}
              </p>
              <p className="text-[11px] text-kalvium-muted dark:text-kalvium-dark-muted mt-0.5">
                Published to campus calendar
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border shadow-soft-xs transition-all hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-sans text-kalvium-muted dark:text-kalvium-dark-muted uppercase tracking-wider font-semibold block mb-1">
                  Declined / Needs Update
                </span>
                <XCircle className="w-3.5 h-3.5 text-kalvium-coral" />
              </div>
              <p className="text-2xl sm:text-3xl font-sans font-bold text-kalvium-text dark:text-kalvium-dark-text mt-1">
                {requestStats.declined}
              </p>
              <p className="text-[11px] text-kalvium-muted dark:text-kalvium-dark-muted mt-0.5">
                Feedback provided by Manager
              </p>
            </div>
          </div>

          {/* Request Header */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <h2 className="text-sm font-sans font-bold uppercase tracking-wider text-kalvium-text dark:text-kalvium-dark-text">
                Your Submitted Event Proposals
              </h2>
              <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted mt-0.5">
                Track status and review notes from the campus management team.
              </p>
            </div>
            <button
              onClick={fetchRequests}
              className="text-xs text-kalvium-muted hover:text-kalvium-text dark:hover:text-kalvium-dark-text flex items-center gap-1.5 transition active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>

          {requestsLoading ? (
            <div className="py-20 text-center text-kalvium-muted text-sm">
              Loading your submitted event requests...
            </div>
          ) : requestedEvents.length === 0 ? (
            <div className="py-16 text-center bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border rounded-2xl p-8 shadow-kalvium-sm">
              <div className="w-12 h-12 rounded-full bg-kalvium-coral-tint dark:bg-kalvium-dark-coral-tint text-kalvium-coral flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-kalvium-text dark:text-kalvium-dark-text mb-1">
                You haven't requested any events yet
              </p>
              <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted max-w-md mx-auto mb-6">
                Students can propose clubs, tournaments, hackathons, and guest talks. Every proposal is reviewed by Campus Managers before going live.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => handleTabChange("CREATE_AI")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-kalvium-coral text-white text-xs font-bold shadow-sm active:scale-95 transition hover:bg-kalvium-coral/90"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Request with AI Poster</span>
                </button>
                <button
                  onClick={() => handleTabChange("CREATE_MANUAL")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border hover:border-kalvium-coral text-kalvium-text dark:text-kalvium-dark-text text-xs font-bold shadow-sm active:scale-95 transition"
                >
                  <PenTool className="w-4 h-4" />
                  <span>Manual Request</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {requestedEvents.map((ev: any) => (
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
                          <span className="text-[10px] font-sans uppercase bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt text-kalvium-muted dark:text-kalvium-dark-muted px-2.5 py-0.5 rounded-full border border-kalvium-border dark:border-kalvium-dark-border font-semibold">
                            {ev.category}
                          </span>
                          <span className="text-[10px] font-sans uppercase tracking-wider font-semibold bg-kalvium-coral-tint text-kalvium-coral border border-kalvium-coral/20 px-2 py-0.5 rounded-full">
                            🎓 Student Proposal
                          </span>
                          {renderStatusBadge(ev.status)}
                          {ev.status === "APPROVED" && <CampusVerifiedBadge size="sm" />}
                        </div>
                        <h3 className="text-base font-bold text-kalvium-text dark:text-kalvium-dark-text mb-1 truncate">
                          {ev.title}
                        </h3>
                        <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted">
                          {ev.date} • {ev.startTime} – {ev.endTime} • {ev.venue}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {ev.status === "APPROVED" && (
                        <Link
                          href={`/events/${ev.id}`}
                          className="px-4 py-1.5 rounded-full text-xs font-semibold text-kalvium-text dark:text-kalvium-dark-text hover:text-kalvium-coral bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt hover:bg-white dark:hover:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border transition shadow-soft-xs active:scale-95"
                        >
                          Public Page →
                        </Link>
                      )}
                      {confirmDeleteId === ev.id ? (
                        <div className="flex items-center gap-1.5 animate-fade-in">
                          <span className="text-[11px] text-kalvium-coral font-medium shrink-0">Withdraw?</span>
                          <button
                            onClick={() => handleDeleteRequest(ev.id)}
                            className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-kalvium-coral text-white hover:bg-kalvium-coral/90 transition active:scale-95 shadow-sm"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt text-kalvium-muted border border-kalvium-border dark:border-kalvium-dark-border hover:border-kalvium-coral transition active:scale-95"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleDeleteRequest(ev.id)}
                          className="p-2 rounded-full text-kalvium-muted hover:text-kalvium-coral bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt hover:bg-white dark:hover:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border transition shadow-soft-xs active:scale-95"
                          title="Withdraw Event Request"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Decline Feedback Banner */}
                  {ev.status === "DECLINED" && (
                    <div className="p-4 rounded-xl bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border text-xs space-y-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-kalvium-coral">
                        <XCircle className="w-4 h-4" />
                        <span>Declined by Campus Manager</span>
                      </div>
                      <p className="text-kalvium-text dark:text-kalvium-dark-text">
                        <span className="font-semibold text-kalvium-coral">Reason:</span>{" "}
                        {ev.declineReason || "Event proposal could not be verified."}
                      </p>
                      {ev.declineCustomNotes && (
                        <p className="text-kalvium-muted dark:text-kalvium-dark-muted text-[11px] pt-1 border-t border-kalvium-border dark:border-kalvium-dark-border">
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

      {/* TAB 3: REQUEST WITH AI POSTER */}
      {activeTab === "CREATE_AI" && (
        <div className="space-y-6 animate-fade-in">
          {/* Student Policy Notice Banner */}
          <div className="p-4 rounded-2xl bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border flex items-start gap-3">
            <div className="p-2 rounded-xl bg-kalvium-coral/10 text-kalvium-coral shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-xs text-kalvium-text dark:text-kalvium-dark-text space-y-1">
              <p className="font-bold">Student Event Submission Policy</p>
              <p className="text-kalvium-muted dark:text-kalvium-dark-muted leading-relaxed">
                Your event will be submitted with status <strong className="text-kalvium-warning">PENDING</strong>. Campus Managers will review the venue, schedule conflicts, and legitimacy before publishing it live on the campus calendar.
              </p>
            </div>
          </div>

          <CreateEventStudio
            onComplete={() => {
              handleTabChange("REQUESTS");
              fetchRequests();
            }}
          />
        </div>
      )}

      {/* TAB 4: MANUAL EVENT REQUEST */}
      {activeTab === "CREATE_MANUAL" && (
        <div className="space-y-6 animate-fade-in">
          {/* Student Policy Notice Banner */}
          <div className="p-4 rounded-2xl bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border flex items-start gap-3">
            <div className="p-2 rounded-xl bg-kalvium-coral/10 text-kalvium-coral shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-xs text-kalvium-text dark:text-kalvium-dark-text space-y-1">
              <p className="font-bold">Student Event Submission Policy</p>
              <p className="text-kalvium-muted dark:text-kalvium-dark-muted leading-relaxed">
                Your event will be submitted with status <strong className="text-kalvium-warning">PENDING</strong>. Campus Managers will review the venue, schedule conflicts, and legitimacy before publishing it live on the campus calendar.
              </p>
            </div>
          </div>

          <ManualEventForm
            onComplete={() => {
              handleTabChange("REQUESTS");
              fetchRequests();
            }}
          />
        </div>
      )}

      {/* Certificate & Achievement Upload Modal */}
      {selectedCertEvent && (
        <UploadCertificateModal
          isOpen={certModalOpen}
          onClose={() => {
            setCertModalOpen(false);
            setSelectedCertEvent(null);
          }}
          eventId={selectedCertEvent.id}
          eventTitle={selectedCertEvent.title}
          eventDate={selectedCertEvent.date}
          eventVenue={selectedCertEvent.venue}
          onSuccess={() => {
            fetchEnrolledEvents();
            fetchStudentParticipations();
          }}
        />
      )}
    </div>
  );
}

export default function StudentDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-kalvium-coral border-t-transparent animate-spin" />
        </div>
      }
    >
      <StudentDashboardContent />
    </Suspense>
  );
}

function renderStatusBadge(status: string) {
  switch (status) {
    case "APPROVED":
      return (
        <span className="text-[10px] font-sans uppercase tracking-wider font-semibold bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt text-kalvium-success border border-kalvium-border dark:border-kalvium-dark-border px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-kalvium-success shrink-0" />
          <span>Approved & Live</span>
        </span>
      );
    case "PENDING":
      return (
        <span className="text-[10px] font-sans uppercase tracking-wider font-semibold bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt text-kalvium-warning border border-kalvium-border dark:border-kalvium-dark-border px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
          <Clock className="w-3 h-3 text-kalvium-warning shrink-0" />
          <span>Pending Verification</span>
        </span>
      );
    case "DECLINED":
      return (
        <span className="text-[10px] font-sans uppercase tracking-wider font-semibold bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt text-kalvium-coral border border-kalvium-border dark:border-kalvium-dark-border px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
          <XCircle className="w-3 h-3 text-kalvium-coral shrink-0" />
          <span>Declined</span>
        </span>
      );
    default:
      return (
        <span className="text-[10px] font-sans uppercase tracking-wider font-semibold bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt text-kalvium-muted dark:text-kalvium-dark-muted border border-kalvium-border dark:border-kalvium-dark-border px-2.5 py-0.5 rounded-full">
          Draft
        </span>
      );
  }
}
