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
    <div className="bg-[#E5391F] border-b-4 border-black py-3 px-4 transition-colors relative z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 font-black uppercase tracking-widest text-[10px] text-white bg-black px-3 py-1.5 border-2 border-black shadow-[2px_2px_0px_0px_black]">
            <span className="w-2 h-2 rounded-full bg-[#E5391F] animate-pulse border border-black" />
            <span>Demo Mode</span>
          </span>
          {!collapsed && (
            <span className="hidden md:inline text-[10px] font-black uppercase tracking-widest text-black">
              Select role to test
            </span>
          )}
        </div>

        {!collapsed ? (
          <div className="flex items-center gap-4 flex-wrap">
            {/* Student Switcher */}
            <button
              onClick={() => demoLogin("STUDENT")}
              disabled={loading}
              className={`flex items-center gap-2 px-4 py-2 border-2 border-black text-[10px] font-black uppercase tracking-widest transition-all duration-200 select-none ${user?.role === "STUDENT"
                  ? "bg-white text-black shadow-none translate-y-[4px] translate-x-[4px]"
                  : "bg-black text-white shadow-[4px_4px_0px_0px_black] hover:shadow-[2px_2px_0px_0px_black] hover:translate-y-[2px] hover:translate-x-[2px]"
                }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student</span>
            </button>

            {/* Organizer Switcher */}
            <button
              onClick={() => demoLogin("ORGANIZER")}
              disabled={loading}
              className={`flex items-center gap-2 px-4 py-2 border-2 border-black text-[10px] font-black uppercase tracking-widest transition-all duration-200 select-none ${user?.role === "ORGANIZER"
                  ? "bg-white text-black shadow-none translate-y-[4px] translate-x-[4px]"
                  : "bg-black text-white shadow-[4px_4px_0px_0px_black] hover:shadow-[2px_2px_0px_0px_black] hover:translate-y-[2px] hover:translate-x-[2px]"
                }`}
            >
              <User className="w-4 h-4" />
              <span>Organizer</span>
            </button>

            {/* Campus Manager Switcher */}
            <button
              onClick={() => demoLogin("CAMPUS_MANAGER")}
              disabled={loading}
              className={`flex items-center gap-2 px-4 py-2 border-2 border-black text-[10px] font-black uppercase tracking-widest transition-all duration-200 select-none ${user?.role === "CAMPUS_MANAGER"
                  ? "bg-white text-black shadow-none translate-y-[4px] translate-x-[4px]"
                  : "bg-black text-white shadow-[4px_4px_0px_0px_black] hover:shadow-[2px_2px_0px_0px_black] hover:translate-y-[2px] hover:translate-x-[2px]"
                }`}
            >
              <Shield className="w-4 h-4" />
              <span>Manager</span>
            </button>

            <button
              onClick={() => setCollapsed(true)}
              className="text-black hover:text-white p-1 transition-colors ml-2 bg-transparent border-2 border-transparent hover:border-black hover:bg-black rounded-full shadow-none hover:shadow-[2px_2px_0px_0px_black]"
              title="Minimize Demo Bar"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setCollapsed(false)}
            className="flex items-center gap-2 text-black bg-white hover:bg-black hover:text-white border-2 border-black shadow-[4px_4px_0px_0px_black] px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors"
          >
            <span>Roles</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
