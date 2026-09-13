"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
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
} from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  return (
    <>
      <header className="bg-kalvium-surface/95 dark:bg-kalvium-dark-surface/95 backdrop-blur-md border-b border-kalvium-border dark:border-kalvium-dark-border transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group select-none">
              <CampusHubLogo size="md" />
            </Link>
          </div>

          {/* Desktop Navigation Links - Editorial Pill Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt p-1 rounded-full border border-kalvium-border dark:border-kalvium-dark-border">
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

            {/* Student Links: Events -> Schedule */}
            {(!user || user.role === "STUDENT") && (
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

            {/* Organizer Links: Events -> Organizer Studio */}
            {user?.role === "ORGANIZER" && (
              <Link
                href="/dashboard/organizer"
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs transition-all duration-150 active:scale-95 select-none ${
                  isActive("/dashboard/organizer")
                    ? "bg-white dark:bg-kalvium-dark-surface text-kalvium-coral font-semibold shadow-xs"
                    : "text-kalvium-muted dark:text-kalvium-dark-muted hover:text-kalvium-text dark:hover:text-kalvium-dark-text font-medium"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-kalvium-coral" />
                <span>Organizer Studio</span>
              </Link>
            )}

            {/* Campus Manager Links: Events -> Verification Center */}
            {user?.role === "CAMPUS_MANAGER" && (
              <Link
                href="/dashboard/manager"
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs transition-all duration-150 active:scale-95 select-none ${
                  isActive("/dashboard/manager")
                    ? "bg-white dark:bg-kalvium-dark-surface text-kalvium-coral font-semibold shadow-xs"
                    : "text-kalvium-muted dark:text-kalvium-dark-muted hover:text-kalvium-text dark:hover:text-kalvium-dark-text font-medium"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-kalvium-success" />
                <span>Verification Studio</span>
              </Link>
            )}
          </nav>

          {/* User Profile / Auth Actions & Theme Toggle */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />

            {user ? (
              <div className="flex items-center gap-2.5 p-1 pl-3 bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt rounded-full border border-kalvium-border dark:border-kalvium-dark-border shadow-xs">
                <div className="text-right">
                  <p className="text-xs font-semibold text-kalvium-text dark:text-kalvium-dark-text leading-tight">{user.name}</p>
                  <span
                    className={`inline-block text-[10px] font-medium ${
                      user.role === "CAMPUS_MANAGER"
                        ? "text-kalvium-success"
                        : user.role === "ORGANIZER"
                        ? "text-kalvium-warning"
                        : "text-kalvium-muted"
                    }`}
                  >
                    {user.role === "CAMPUS_MANAGER"
                      ? "Campus Manager"
                      : user.role === "ORGANIZER"
                      ? "Organizer"
                      : "Student"}
                  </span>
                </div>

                <div className="w-7 h-7 rounded-full bg-kalvium-border dark:bg-kalvium-dark-border flex items-center justify-center font-bold text-xs text-kalvium-text dark:text-kalvium-dark-text overflow-hidden select-none">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.name.charAt(0)
                  )}
                </div>

                <button
                  onClick={() => logout()}
                  className="p-1.5 text-kalvium-muted hover:text-kalvium-coral rounded-full hover:bg-white dark:hover:bg-kalvium-dark-surface transition-colors active:scale-95 text-xs"
                  title="Sign out"
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

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-kalvium-border dark:border-kalvium-dark-border bg-kalvium-surface dark:bg-kalvium-dark-surface px-4 pt-3 pb-5 space-y-2">
            <Link
              href="/events"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-kalvium-text dark:text-kalvium-dark-text hover:bg-kalvium-surface-alt dark:hover:bg-kalvium-dark-surface-alt text-xs font-medium"
            >
              Events
            </Link>
            {(!user || user.role === "STUDENT") && (
              <Link
                href="/schedule"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-kalvium-text dark:text-kalvium-dark-text hover:bg-kalvium-surface-alt dark:hover:bg-kalvium-dark-surface-alt text-xs font-medium"
              >
                My Schedule
              </Link>
            )}

            {user?.role === "ORGANIZER" && (
              <Link
                href="/dashboard/organizer"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-kalvium-coral bg-kalvium-coral-tint dark:bg-kalvium-dark-coral-tint text-xs font-semibold"
              >
                Organizer Studio
              </Link>
            )}

            {user?.role === "CAMPUS_MANAGER" && (
              <Link
                href="/dashboard/manager"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl bg-kalvium-success-tint dark:bg-kalvium-dark-success-tint text-kalvium-success text-xs font-semibold"
              >
                Verification Studio
              </Link>
            )}

            {user ? (
              <div className="pt-3 border-t border-kalvium-border dark:border-kalvium-dark-border flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-kalvium-text dark:text-kalvium-dark-text">{user.name}</p>
                  <p className="text-[10px] text-kalvium-muted dark:text-kalvium-dark-muted">
                    {user.role === "CAMPUS_MANAGER"
                      ? "Campus Manager"
                      : user.role === "ORGANIZER"
                      ? "Organizer"
                      : "Student"}
                  </p>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
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
        )}
      </header>

      {/* Sticky Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-kalvium-surface/95 dark:bg-kalvium-dark-surface/95 backdrop-blur-md border-t border-kalvium-border dark:border-kalvium-dark-border flex items-center justify-around py-2 px-3 shadow-lg">
        <Link
          href="/events"
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
            isActive("/events") ? "text-kalvium-coral font-bold" : "text-kalvium-muted dark:text-kalvium-dark-muted"
          }`}
        >
          <Compass className="w-4 h-4" />
          <span className="text-[10px] font-medium">Events</span>
        </Link>

        {(!user || user.role === "STUDENT") && (
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

        {user?.role === "ORGANIZER" && (
          <Link
            href="/dashboard/organizer"
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
              isActive("/dashboard/organizer") ? "text-kalvium-coral font-bold" : "text-kalvium-muted dark:text-kalvium-dark-muted"
            }`}
          >
            <Sparkles className="w-4 h-4 text-kalvium-coral" />
            <span className="text-[10px] font-medium">Studio</span>
          </Link>
        )}

        {user?.role === "CAMPUS_MANAGER" && (
          <Link
            href="/dashboard/manager"
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
              isActive("/dashboard/manager") ? "text-kalvium-success font-bold" : "text-kalvium-muted dark:text-kalvium-dark-muted"
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-kalvium-success" />
            <span className="text-[10px] font-medium">Verify</span>
          </Link>
        )}

        {user ? (
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
