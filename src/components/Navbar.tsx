"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import KalviumLogo from "@/components/KalviumLogo";
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
      <header className="bg-white dark:bg-[#111111] border-b-4 border-black transition-colors duration-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 group select-none">
              <div className="group-hover:scale-105 transition-transform duration-200 text-[#E5391F]">
                <KalviumLogo size={28} className="text-[#E5391F]" />
              </div>
              <span className="font-display font-black tracking-tighter text-2xl uppercase leading-none text-black dark:text-white">
                CampusHub
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-3">
            {user?.role === "STUDENT" && (
              <Link
                href="/dashboard/student"
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-black text-xs uppercase tracking-widest transition-all duration-200 border-2 ${isActive("/dashboard/student")
                  ? "bg-[#E5391F] text-white border-[#E5391F] shadow-[4px_4px_0px_0px_black]"
                  : "bg-white text-black border-transparent hover:border-black hover:shadow-[4px_4px_0px_0px_black]"
                  }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Student Portal</span>
              </Link>
            )}

            <Link
              href="/events"
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-black text-xs uppercase tracking-widest transition-all duration-200 border-2 ${isActive("/events")
                ? "bg-[#E5391F] text-white border-[#E5391F] shadow-[4px_4px_0px_0px_black]"
                : "bg-white text-black border-transparent hover:border-black hover:shadow-[4px_4px_0px_0px_black]"
                }`}
            >
              <Compass className="w-4 h-4" />
              <span>Events</span>
            </Link>

            {(!user || user.role === "STUDENT") && (
              <Link
                href="/schedule"
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-black text-xs uppercase tracking-widest transition-all duration-200 border-2 ${isActive("/schedule")
                  ? "bg-[#E5391F] text-white border-[#E5391F] shadow-[4px_4px_0px_0px_black]"
                  : "bg-white text-black border-transparent hover:border-black hover:shadow-[4px_4px_0px_0px_black]"
                  }`}
              >
                <Clock className="w-4 h-4" />
                <span>My Schedule</span>
              </Link>
            )}

            {user?.role === "ORGANIZER" && (
              <Link
                href="/dashboard/organizer"
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-black text-xs uppercase tracking-widest transition-all duration-200 border-2 ${isActive("/dashboard/organizer")
                  ? "bg-[#E5391F] text-white border-[#E5391F] shadow-[4px_4px_0px_0px_black]"
                  : "bg-white text-black border-transparent hover:border-black hover:shadow-[4px_4px_0px_0px_black]"
                  }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Organizer Studio</span>
              </Link>
            )}

            {user?.role === "CAMPUS_MANAGER" && (
              <Link
                href="/dashboard/manager"
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-black text-xs uppercase tracking-widest transition-all duration-200 border-2 ${isActive("/dashboard/manager")
                  ? "bg-[#E5391F] text-white border-[#E5391F] shadow-[4px_4px_0px_0px_black]"
                  : "bg-white text-black border-transparent hover:border-black hover:shadow-[4px_4px_0px_0px_black]"
                  }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Verification Studio</span>
              </Link>
            )}
          </nav>

          {/* User Profile / Auth Actions & Theme Toggle */}
          <div className="hidden md:flex items-center gap-4">

            {user ? (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-black text-black dark:text-white uppercase tracking-tighter">{user.name}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#E5391F]">
                    {user.role === "CAMPUS_MANAGER"
                      ? "Campus Manager"
                      : user.role === "ORGANIZER"
                        ? "Organizer"
                        : "Student"}
                  </p>
                </div>

                <div className="w-10 h-10 rounded-full bg-black border-2 border-black flex items-center justify-center font-bold text-sm text-white overflow-hidden select-none shadow-[2px_2px_0px_0px_black]">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.name.charAt(0)
                  )}
                </div>

                <button
                  onClick={() => logout()}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-black border-2 border-black hover:bg-[#E5391F] hover:text-white hover:border-[#E5391F] shadow-[4px_4px_0px_0px_black] transition-all duration-200"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/login" className="px-6 py-2.5 bg-white text-black font-black text-xs uppercase tracking-widest border-2 border-black rounded-full hover:bg-black hover:text-white transition-all duration-200">
                  Sign in
                </Link>
                <Link href="/register" className="px-6 py-2.5 bg-[#E5391F] text-white font-black text-xs uppercase tracking-widest border-2 border-black rounded-full shadow-[4px_4px_0px_0px_black] hover:bg-black hover:border-black transition-all duration-200">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu hamburger */}
          <div className="flex md:hidden items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-10 h-10 flex items-center justify-center text-black dark:text-white border-2 border-black rounded-full shadow-[4px_4px_0px_0px_black]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#D6D6D2] dark:border-[#444444] bg-white dark:bg-[#111111] px-4 pt-4 pb-6 space-y-2">
            {user?.role === "STUDENT" && (
              <Link
                href="/dashboard/student"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-md font-bold text-sm text-[#111111] dark:text-white hover:bg-[#F7F7F5] dark:hover:bg-[#222222]"
              >
                Student Portal
              </Link>
            )}
            <Link
              href="/events"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 rounded-md font-bold text-sm text-[#111111] dark:text-white hover:bg-[#F7F7F5] dark:hover:bg-[#222222]"
            >
              Events
            </Link>
            {(!user || user.role === "STUDENT") && (
              <Link
                href="/schedule"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-md font-bold text-sm text-[#111111] dark:text-white hover:bg-[#F7F7F5] dark:hover:bg-[#222222]"
              >
                My Schedule
              </Link>
            )}

            {user?.role === "ORGANIZER" && (
              <Link
                href="/dashboard/organizer"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-md font-bold text-sm text-[#111111] dark:text-white hover:bg-[#F7F7F5] dark:hover:bg-[#222222]"
              >
                Organizer Studio
              </Link>
            )}

            {user?.role === "CAMPUS_MANAGER" && (
              <Link
                href="/dashboard/manager"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-md font-bold text-sm text-[#111111] dark:text-white hover:bg-[#F7F7F5] dark:hover:bg-[#222222]"
              >
                Verification Studio
              </Link>
            )}

            {user ? (
              <div className="pt-4 mt-2 border-t border-[#D6D6D2] dark:border-[#444444] flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-[#111111] dark:text-white">{user.name}</p>
                  <p className="text-xs font-semibold text-[#777777]">
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
                  className="btn-kalvium-outline py-2 px-4 text-xs"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="pt-4 mt-2 border-t border-[#D6D6D2] dark:border-[#444444] grid grid-cols-2 gap-3">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-kalvium-outline text-center py-2"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-kalvium-primary text-center py-2"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
}
