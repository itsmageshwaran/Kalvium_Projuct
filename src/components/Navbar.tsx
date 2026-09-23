"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuth, getDashboardRoute } from "@/context/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";
import CampusHubLogo from "@/components/CampusHubLogo";
import {
  Sparkles,
  Compass,
  ShieldCheck,
  Clock,
  LogOut,
  Menu,
  X,
  GraduationCap,
} from "lucide-react";

function NavbarContent() {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tab = searchParams?.get("tab")?.toLowerCase() || "";
  const isCreateTab = tab === "create" || tab === "create_ai" || tab === "create_manual";

  const isActive = (path: string) => pathname === path;

  // Granular active state computations
  const isStudentPortalActive = pathname === "/dashboard/student" && !isCreateTab;
  const isStudentRequestActive = (pathname === "/dashboard/student" && isCreateTab) || pathname === "/events/create";

  const isOrganizerPortalActive = pathname === "/dashboard/organizer" && !isCreateTab;
  const isOrganizerCreateActive = (pathname === "/dashboard/organizer" && isCreateTab) || pathname === "/events/create";

  const isManagerPortalActive = pathname === "/dashboard/manager";
  const isManagerAddActive = pathname === "/dashboard/organizer" && isCreateTab;

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname, searchParams]);

  // Close mobile drawer on Escape key press
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);


  return (
    <>
      <header className="bg-kalvium-surface/95 dark:bg-kalvium-dark-surface/95 backdrop-blur-md border-b border-kalvium-border dark:border-kalvium-dark-border transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <Link
              href={user ? getDashboardRoute(user.role) : "/"}
              className="flex items-center gap-2 group select-none"
            >
              <CampusHubLogo size="md" />
            </Link>
          </div>

          {/* Desktop Navigation Links - Editorial Pill Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt p-1 rounded-full border border-kalvium-border dark:border-kalvium-dark-border">
            {user?.role?.toUpperCase() === "STUDENT" && (
              <>
                <Link
                  href="/dashboard/student"
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs transition-all duration-150 active:scale-95 select-none ${
                    isStudentPortalActive
                      ? "bg-white dark:bg-kalvium-dark-surface text-kalvium-coral font-semibold shadow-xs"
                      : "text-kalvium-muted dark:text-kalvium-dark-muted hover:text-kalvium-text dark:hover:text-kalvium-dark-text font-medium"
                  }`}
                >
                  <GraduationCap className={`w-3.5 h-3.5 ${isStudentPortalActive ? "text-kalvium-coral" : "text-kalvium-muted dark:text-kalvium-dark-muted"}`} />
                  <span>Student's Portal</span>
                </Link>
                <Link
                  href="/dashboard/student?tab=create"
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs transition-all duration-150 active:scale-95 select-none ${
                    isStudentRequestActive
                      ? "bg-white dark:bg-kalvium-dark-surface text-kalvium-coral font-semibold shadow-xs"
                      : "text-kalvium-muted dark:text-kalvium-dark-muted hover:text-kalvium-text dark:hover:text-kalvium-dark-text font-medium"
                  }`}
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isStudentRequestActive ? "text-kalvium-coral" : "text-kalvium-coral/70"}`} />
                  <span>Request Event</span>
                </Link>
              </>
            )}

            {user?.role?.toUpperCase() === "ORGANIZER" && (
              <>
                <Link
                  href="/dashboard/organizer"
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs transition-all duration-150 active:scale-95 select-none ${
                    isOrganizerPortalActive
                      ? "bg-white dark:bg-kalvium-dark-surface text-kalvium-coral font-semibold shadow-xs"
                      : "text-kalvium-muted dark:text-kalvium-dark-muted hover:text-kalvium-text dark:hover:text-kalvium-dark-text font-medium"
                  }`}
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isOrganizerPortalActive ? "text-kalvium-coral" : "text-kalvium-muted dark:text-kalvium-dark-muted"}`} />
                  <span>Organizer's Portal</span>
                </Link>
                <Link
                  href="/dashboard/organizer?tab=create"
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs transition-all duration-150 active:scale-95 select-none ${
                    isOrganizerCreateActive
                      ? "bg-white dark:bg-kalvium-dark-surface text-kalvium-coral font-semibold shadow-xs"
                      : "text-kalvium-muted dark:text-kalvium-dark-muted hover:text-kalvium-text dark:hover:text-kalvium-dark-text font-medium"
                  }`}
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isOrganizerCreateActive ? "text-kalvium-coral" : "text-kalvium-coral/70"}`} />
                  <span>+ Create Event</span>
                </Link>
              </>
            )}

            {user?.role?.toUpperCase() === "CAMPUS_MANAGER" && (
              <>
                <Link
                  href="/dashboard/manager"
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs transition-all duration-150 active:scale-95 select-none ${
                    isManagerPortalActive
                      ? "bg-white dark:bg-kalvium-dark-surface text-kalvium-coral font-semibold shadow-xs"
                      : "text-kalvium-muted dark:text-kalvium-dark-muted hover:text-kalvium-text dark:hover:text-kalvium-dark-text font-medium"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-kalvium-success" />
                  <span>Manager's Portal</span>
                </Link>
                <Link
                  href="/dashboard/organizer?tab=create"
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs transition-all duration-150 active:scale-95 select-none ${
                    isManagerAddActive
                      ? "bg-white dark:bg-kalvium-dark-surface text-kalvium-coral font-semibold shadow-xs"
                      : "text-kalvium-muted dark:text-kalvium-dark-muted hover:text-kalvium-text dark:hover:text-kalvium-dark-text font-medium"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-kalvium-coral" />
                  <span>+ Add Event</span>
                </Link>
              </>
            )}

            <Link
              href="/events"
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs transition-all duration-150 active:scale-95 select-none ${
                isActive("/events")
                  ? "bg-white dark:bg-kalvium-dark-surface text-kalvium-coral font-semibold shadow-xs"
                  : "text-kalvium-muted dark:text-kalvium-dark-muted hover:text-kalvium-text dark:hover:text-kalvium-dark-text font-medium"
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Events</span>
            </Link>

            {user?.role?.toUpperCase() === "STUDENT" && (
              <Link
                href="/schedule"
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs transition-all duration-150 active:scale-95 select-none ${
                  isActive("/schedule")
                    ? "bg-white dark:bg-kalvium-dark-surface text-kalvium-coral font-semibold shadow-xs"
                    : "text-kalvium-muted dark:text-kalvium-dark-muted hover:text-kalvium-text dark:hover:text-kalvium-dark-text font-medium"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>My Schedule</span>
              </Link>
            )}
          </nav>

          {/* User Profile / Auth Actions & Theme Toggle */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />

            {loading ? (
              <div className="h-8 w-28 bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt rounded-full animate-pulse border border-kalvium-border dark:border-kalvium-dark-border" />
            ) : user ? (
              <div className="flex items-center gap-2.5 p-1 pl-3 bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt rounded-full border border-kalvium-border dark:border-kalvium-dark-border shadow-xs">
                <div className="text-right">
                  <p className="text-xs font-semibold text-kalvium-text dark:text-kalvium-dark-text leading-tight">{user.name}</p>
                  <span
                    className={`inline-block text-[10px] font-medium ${
                      user.role?.toUpperCase() === "CAMPUS_MANAGER"
                        ? "text-kalvium-success"
                        : user.role?.toUpperCase() === "ORGANIZER"
                        ? "text-kalvium-warning"
                        : "text-kalvium-muted"
                    }`}
                  >
                    {user.role?.toUpperCase() === "CAMPUS_MANAGER"
                      ? "Campus Manager"
                      : user.role?.toUpperCase() === "ORGANIZER"
                      ? "Organizer"
                      : "Student"}
                  </span>
                </div>

                <div className="w-7 h-7 rounded-full bg-kalvium-border dark:bg-kalvium-dark-border flex items-center justify-center font-bold text-xs text-kalvium-text dark:text-kalvium-dark-text overflow-hidden select-none relative">
                  <span className="text-[11px] font-bold">{user.name?.charAt(0) || "U"}</span>
                  {user.avatar && (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = "none";
                      }}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => logout()}
                  className="p-1.5 text-kalvium-muted hover:text-kalvium-coral rounded-full hover:bg-white dark:hover:bg-kalvium-dark-surface transition-colors active:scale-95 text-xs"
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-xs font-medium px-4 py-2 rounded-full text-kalvium-text dark:text-kalvium-dark-text hover:text-kalvium-coral transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="text-xs font-semibold px-4 py-2 rounded-full bg-kalvium-coral hover:bg-kalvium-coral-hover text-white transition-colors shadow-xs active:scale-95"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-kalvium-muted hover:text-kalvium-text rounded-full border border-kalvium-border dark:border-kalvium-dark-border bg-kalvium-surface dark:bg-kalvium-dark-surface transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer Backdrop & Menu */}
        {mobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 top-16 bg-black/25 dark:bg-black/50 backdrop-blur-xs z-40 md:hidden animate-fade-in"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative z-50 md:hidden border-t border-kalvium-border dark:border-kalvium-dark-border bg-kalvium-surface dark:bg-kalvium-dark-surface px-4 pt-3 pb-5 space-y-2">
            {user?.role?.toUpperCase() === "STUDENT" && (
              <>
                <Link
                  href="/dashboard/student"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-xl text-xs font-semibold ${
                    isStudentPortalActive
                      ? "text-kalvium-coral bg-kalvium-coral-tint dark:bg-kalvium-dark-coral-tint"
                      : "text-kalvium-text dark:text-kalvium-dark-text hover:bg-kalvium-surface-alt dark:hover:bg-kalvium-dark-surface-alt"
                  }`}
                >
                  Student's Portal
                </Link>
                <Link
                  href="/dashboard/student?tab=create"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-xl text-xs font-semibold ${
                    isStudentRequestActive
                      ? "text-kalvium-coral bg-kalvium-coral-tint dark:bg-kalvium-dark-coral-tint"
                      : "text-kalvium-text dark:text-kalvium-dark-text hover:bg-kalvium-surface-alt dark:hover:bg-kalvium-dark-surface-alt"
                  }`}
                >
                  Request Event
                </Link>
              </>
            )}
            {user?.role?.toUpperCase() === "ORGANIZER" && (
              <>
                <Link
                  href="/dashboard/organizer"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-xl text-xs font-semibold ${
                    isOrganizerPortalActive
                      ? "text-kalvium-coral bg-kalvium-coral-tint dark:bg-kalvium-dark-coral-tint"
                      : "text-kalvium-text dark:text-kalvium-dark-text hover:bg-kalvium-surface-alt dark:hover:bg-kalvium-dark-surface-alt"
                  }`}
                >
                  Organizer's Portal
                </Link>
                <Link
                  href="/dashboard/organizer?tab=create"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-xl text-xs font-semibold ${
                    isOrganizerCreateActive
                      ? "text-kalvium-coral bg-kalvium-coral-tint dark:bg-kalvium-dark-coral-tint"
                      : "text-kalvium-text dark:text-kalvium-dark-text hover:bg-kalvium-surface-alt dark:hover:bg-kalvium-dark-surface-alt"
                  }`}
                >
                  + Create Event
                </Link>
              </>
            )}

            {user?.role?.toUpperCase() === "CAMPUS_MANAGER" && (
              <>
                <Link
                  href="/dashboard/manager"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-xl text-xs font-semibold ${
                    isManagerPortalActive
                      ? "bg-kalvium-success-tint dark:bg-kalvium-dark-success-tint text-kalvium-success"
                      : "text-kalvium-text dark:text-kalvium-dark-text hover:bg-kalvium-surface-alt dark:hover:bg-kalvium-dark-surface-alt"
                  }`}
                >
                  Manager's Portal
                </Link>
                <Link
                  href="/dashboard/organizer?tab=create"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-xl text-xs font-semibold ${
                    isManagerAddActive
                      ? "text-kalvium-coral bg-kalvium-coral-tint dark:bg-kalvium-dark-coral-tint"
                      : "text-kalvium-text dark:text-kalvium-dark-text hover:bg-kalvium-surface-alt dark:hover:bg-kalvium-dark-surface-alt"
                  }`}
                >
                  + Add Event
                </Link>
              </>
            )}

            {user && (
              <Link
                href="/events"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-xl text-xs font-medium ${
                  isActive("/events")
                    ? "text-kalvium-coral bg-kalvium-coral-tint dark:bg-kalvium-dark-coral-tint font-semibold"
                    : "text-kalvium-text dark:text-kalvium-dark-text hover:bg-kalvium-surface-alt dark:hover:bg-kalvium-dark-surface-alt"
                }`}
              >
                Events
              </Link>
            )}

            {user?.role?.toUpperCase() === "STUDENT" && (
              <Link
                href="/schedule"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-xl text-xs font-medium ${
                  isActive("/schedule")
                    ? "text-kalvium-coral bg-kalvium-coral-tint dark:bg-kalvium-dark-coral-tint font-semibold"
                    : "text-kalvium-text dark:text-kalvium-dark-text hover:bg-kalvium-surface-alt dark:hover:bg-kalvium-dark-surface-alt"
                }`}
              >
                My Schedule
              </Link>
            )}

            {loading ? (
              <div className="pt-3 border-t border-kalvium-border dark:border-kalvium-dark-border flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-kalvium-border/50 dark:bg-kalvium-dark-border/50 animate-pulse" />
                <div className="h-4 w-28 bg-kalvium-border/50 dark:bg-kalvium-dark-border/50 rounded-md animate-pulse" />
              </div>
            ) : user ? (
              <div className="pt-3 border-t border-kalvium-border dark:border-kalvium-dark-border flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-kalvium-text dark:text-kalvium-dark-text">{user.name}</p>
                  <p className="text-[10px] text-kalvium-muted dark:text-kalvium-dark-muted">
                    {user.role?.toUpperCase() === "CAMPUS_MANAGER"
                      ? "Campus Manager"
                      : user.role?.toUpperCase() === "ORGANIZER"
                      ? "Organizer"
                      : "Student"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="text-xs text-kalvium-coral font-medium px-3 py-1 rounded-full border border-kalvium-coral/30 hover:bg-kalvium-coral-tint transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="pt-3 border-t border-kalvium-border dark:border-kalvium-dark-border grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 rounded-full border border-kalvium-border dark:border-kalvium-dark-border text-kalvium-text dark:text-kalvium-dark-text text-xs font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 rounded-full bg-kalvium-coral text-white text-xs font-semibold shadow-xs"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </header>

      {/* Sticky Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-kalvium-surface/95 dark:bg-kalvium-dark-surface/95 backdrop-blur-md border-t border-kalvium-border dark:border-kalvium-dark-border flex items-center justify-around py-2 px-3 shadow-lg">
        {user?.role?.toUpperCase() === "STUDENT" && (
          <>
            <Link
              href="/dashboard/student"
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
                isStudentPortalActive ? "text-kalvium-coral font-bold" : "text-kalvium-muted dark:text-kalvium-dark-muted"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span className="text-[10px] font-medium">Portal</span>
            </Link>
            <Link
              href="/dashboard/student?tab=create"
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
                isStudentRequestActive ? "text-kalvium-coral font-bold" : "text-kalvium-muted dark:text-kalvium-dark-muted"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-[10px] font-medium">Request</span>
            </Link>
          </>
        )}

        {(user?.role?.toUpperCase() === "ORGANIZER" || user?.role?.toUpperCase() === "CAMPUS_MANAGER") && (
          <>
            <Link
              href="/dashboard/organizer"
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
                isOrganizerPortalActive ? "text-kalvium-coral font-bold" : "text-kalvium-muted dark:text-kalvium-dark-muted"
              }`}
            >
              <Sparkles className="w-4 h-4 text-kalvium-coral" />
              <span className="text-[10px] font-medium">Organizer</span>
            </Link>
            <Link
              href="/dashboard/organizer?tab=create"
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
                isOrganizerCreateActive ? "text-kalvium-coral font-bold" : "text-kalvium-muted dark:text-kalvium-dark-muted"
              }`}
            >
              <Sparkles className="w-4 h-4 text-kalvium-coral" />
              <span className="text-[10px] font-medium">Create</span>
            </Link>
          </>
        )}

        {user?.role?.toUpperCase() === "CAMPUS_MANAGER" && (
          <Link
            href="/dashboard/manager"
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
              isManagerPortalActive ? "text-kalvium-success font-bold" : "text-kalvium-muted dark:text-kalvium-dark-muted"
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-kalvium-success" />
            <span className="text-[10px] font-medium">Verify</span>
          </Link>
        )}

        {user && (
          <Link
            href="/events"
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
              isActive("/events") ? "text-kalvium-coral font-bold" : "text-kalvium-muted dark:text-kalvium-dark-muted"
            }`}
          >
            <Compass className="w-4 h-4" />
            <span className="text-[10px] font-medium">Events</span>
          </Link>
        )}

        {user?.role?.toUpperCase() === "STUDENT" && (
          <Link
            href="/schedule"
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
              isActive("/schedule") ? "text-kalvium-coral font-bold" : "text-kalvium-muted dark:text-kalvium-dark-muted"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span className="text-[10px] font-medium">Schedule</span>
          </Link>
        )}

        {loading ? (
          <div className="flex flex-col items-center gap-1 py-1 px-3">
            <div className="w-4 h-4 rounded-full bg-kalvium-border/50 dark:bg-kalvium-dark-border/50 animate-pulse" />
          </div>
        ) : user ? (
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-kalvium-muted dark:text-kalvium-dark-muted"
          >
            <div className="w-4 h-4 rounded-full bg-kalvium-border dark:bg-kalvium-dark-border flex items-center justify-center text-[9px] font-bold text-kalvium-text dark:text-kalvium-dark-text">
              {user.name.charAt(0)}
            </div>
            <span className="text-[10px] font-medium">Menu</span>
          </button>
        ) : (
          <Link
            href="/login"
            className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-kalvium-muted dark:text-kalvium-dark-muted"
          >
            <div className="w-4 h-4 rounded-full bg-kalvium-coral text-white flex items-center justify-center text-[9px] font-bold">
              →
            </div>
            <span className="text-[10px] font-medium">Login</span>
          </Link>
        )}
      </nav>
    </>
  );
}

export default function Navbar() {
  return (
    <Suspense
      fallback={
        <header className="bg-kalvium-surface/95 dark:bg-kalvium-dark-surface/95 backdrop-blur-md border-b border-kalvium-border dark:border-kalvium-dark-border transition-colors duration-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between" />
        </header>
      }
    >
      <NavbarContent />
    </Suspense>
  );
}

