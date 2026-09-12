"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Shield, User, GraduationCap, ChevronUp, ChevronDown } from "lucide-react";

export default function DemoSwitcherBar() {
  const { user, demoLogin, loading } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  // If in production mode, hide completely
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "false") {
    return null;
  }

  return (
    <div className="bg-kalvium-surface-alt dark:bg-kalvium-dark-surface border-b border-kalvium-border dark:border-kalvium-dark-border text-xs py-2 px-4 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 font-medium text-[11px] bg-white dark:bg-kalvium-dark-surface-alt text-kalvium-text dark:text-kalvium-dark-text px-2.5 py-0.5 rounded-full border border-kalvium-border dark:border-kalvium-dark-border">
            <span className="w-1.5 h-1.5 rounded-full bg-kalvium-coral" />
            <span>Demo Mode</span>
          </span>
          {!collapsed && (
            <span className="hidden md:inline text-[11px] text-kalvium-muted dark:text-kalvium-dark-muted font-normal">
              Switch role:
            </span>
          )}
        </div>

        {!collapsed ? (
          <div className="flex items-center gap-2 flex-wrap">
            {/* Student Switcher */}
            <button
              onClick={() => demoLogin("STUDENT")}
              disabled={loading}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all duration-150 active:scale-95 select-none ${
                user?.role === "STUDENT"
                  ? "bg-kalvium-coral text-white font-semibold shadow-xs"
                  : "bg-white dark:bg-kalvium-dark-surface-alt text-kalvium-text dark:text-kalvium-dark-text hover:border-kalvium-coral/50 border border-kalvium-border dark:border-kalvium-dark-border"
              }`}
            >
              <GraduationCap className={`w-3.5 h-3.5 ${user?.role === "STUDENT" ? "text-white" : "text-kalvium-muted"}`} />
              <span>Alex (Student)</span>
            </button>

            {/* Organizer Switcher */}
            <button
              onClick={() => demoLogin("ORGANIZER")}
              disabled={loading}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all duration-150 active:scale-95 select-none ${
                user?.role === "ORGANIZER"
                  ? "bg-kalvium-coral text-white font-semibold shadow-xs"
                  : "bg-white dark:bg-kalvium-dark-surface-alt text-kalvium-text dark:text-kalvium-dark-text hover:border-kalvium-coral/50 border border-kalvium-border dark:border-kalvium-dark-border"
              }`}
            >
              <User className={`w-3.5 h-3.5 ${user?.role === "ORGANIZER" ? "text-white" : "text-kalvium-muted"}`} />
              <span>Robotics Club (Organizer)</span>
            </button>

            {/* Campus Manager Switcher */}
            <button
              onClick={() => demoLogin("CAMPUS_MANAGER")}
              disabled={loading}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all duration-150 active:scale-95 select-none ${
                user?.role === "CAMPUS_MANAGER"
                  ? "bg-kalvium-coral text-white font-semibold shadow-xs"
                  : "bg-white dark:bg-kalvium-dark-surface-alt text-kalvium-text dark:text-kalvium-dark-text hover:border-kalvium-coral/50 border border-kalvium-border dark:border-kalvium-dark-border"
              }`}
            >
              <Shield className={`w-3.5 h-3.5 ${user?.role === "CAMPUS_MANAGER" ? "text-white" : "text-kalvium-muted"}`} />
              <span>Dr. Sharma (Manager)</span>
            </button>

            <button
              onClick={() => setCollapsed(true)}
              className="text-kalvium-muted hover:text-kalvium-text dark:hover:text-kalvium-dark-text p-1 rounded-full hover:bg-white/60 dark:hover:bg-kalvium-dark-surface-alt transition-colors"
              title="Minimize Demo Bar"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setCollapsed(false)}
            className="flex items-center gap-1.5 text-kalvium-text dark:text-kalvium-dark-text hover:text-kalvium-coral px-2.5 py-0.5 rounded-full bg-white dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border text-[11px] font-medium"
          >
            <span>Demo Roles</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
