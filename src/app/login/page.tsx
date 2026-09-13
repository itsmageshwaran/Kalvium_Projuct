"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, ShieldCheck, GraduationCap, User, Lock, Mail } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import CampusVerifiedBadge from "@/components/CampusVerifiedBadge";

export default function LoginPage() {
  const { login, demoLogin } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await login(email, password);
    setLoading(false);
    if (res.success) {
      router.push("/events");
    } else {
      setError(res.error || "Invalid credentials.");
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-full bg-[#FFF8E1] border-4 border-black shadow-[4px_4px_0px_0px_black] text-black flex items-center justify-center mx-auto mb-3">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-display font-black text-black uppercase tracking-tighter mt-4">Sign In to Campus Hub</h1>
        <p className="text-[10px] font-bold text-black uppercase tracking-widest mt-4">
          Access your personal schedule, submit event posters, or verify campus submissions.
        </p>
      </div>

      {/* Demo Evaluation Presets */}
      <div className="mb-8 p-6 rounded-2xl bg-gray-50 border-4 border-black space-y-4 shadow-[4px_4px_0px_0px_black]">
        <span className="text-[10px] font-sans uppercase tracking-widest text-black font-black block mb-2">
          ⚡ 1-Click Demo Evaluation Sign In
        </span>
        <div className="grid grid-cols-1 gap-2">
          <button
            type="button"
            onClick={() => demoLogin("STUDENT")}
            className="flex items-center justify-between p-4 rounded-xl bg-white border-2 border-black hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_black] text-[10px] font-black uppercase tracking-widest text-black transition-all"
          >
            <span className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-black" />
              <span>Alex Johnson (Student)</span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-black">Sign In →</span>
          </button>

          <button
            type="button"
            onClick={() => demoLogin("ORGANIZER")}
            className="flex items-center justify-between p-4 rounded-xl bg-white border-2 border-black hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_black] text-[10px] font-black uppercase tracking-widest text-black transition-all"
          >
            <span className="flex items-center gap-2">
              <User className="w-4 h-4 text-black" />
              <span>Robotics Club (Organizer)</span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-black">Sign In →</span>
          </button>

          <button
            type="button"
            onClick={() => demoLogin("CAMPUS_MANAGER")}
            className="flex items-center justify-between p-4 rounded-xl bg-white border-2 border-black hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_black] text-[10px] font-black uppercase tracking-widest text-black transition-all"
          >
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-black" />
              <span>Dr. Sharma (Campus Manager)</span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-black">Sign In →</span>
          </button>
        </div>
      </div>

      <div className="relative flex py-2 items-center mb-6">
        <div className="flex-grow border-t-2 border-black"></div>
        <span className="flex-shrink mx-4 text-[10px] font-sans text-black font-black uppercase tracking-widest">
          Or Enter Credentials
        </span>
        <div className="flex-grow border-t-2 border-black"></div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_black] rounded-3xl p-6 sm:p-8 space-y-6">
        {error && (
          <div className="p-4 rounded-xl bg-[#FDEAE7] border-2 border-[#E5391F] text-[#E5391F] text-[10px] font-black uppercase tracking-widest">
            {error}
          </div>
        )}

        <div>
          <label className="block text-[10px] font-black text-black uppercase tracking-widest mb-2">
            Campus Email
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-black absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. alex@campus.edu"
              className="w-full bg-white border-2 border-black shadow-[2px_2px_0px_0px_black] rounded-xl pl-10 pr-4 py-3 text-[10px] font-black uppercase tracking-widest text-black focus:outline-none focus:-translate-y-0.5 focus:shadow-[4px_4px_0px_0px_black] transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-black uppercase tracking-widest mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-black absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white border-2 border-black shadow-[2px_2px_0px_0px_black] rounded-xl pl-10 pr-4 py-3 text-[10px] font-black uppercase tracking-widest text-black focus:outline-none focus:-translate-y-0.5 focus:shadow-[4px_4px_0px_0px_black] transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-full bg-[#EF321F] hover:bg-black text-white text-[10px] font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_black] border-2 border-black transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_black] active:translate-y-0 active:shadow-[2px_2px_0px_0px_black] disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In to Campus Hub"}
        </button>

        <p className="text-center text-[10px] font-black text-black uppercase tracking-widest pt-4">
          Don't have an account?{" "}
          <Link href="/register" className="text-[#EF321F] hover:text-black hover:underline">
            Register as Student / Club
          </Link>
        </p>
      </form>
    </div>
  );
}
