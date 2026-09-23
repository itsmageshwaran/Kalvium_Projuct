"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, ArrowRight, ShieldCheck, GraduationCap, PenTool, User, Lock, Mail, Eye, EyeOff } from "lucide-react";
import { useAuth, getDashboardRoute } from "@/context/AuthContext";
import CampusVerifiedBadge from "@/components/CampusVerifiedBadge";

function LoginContent() {
  const { login, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectParam = searchParams.get("redirect");
  const roleParam = searchParams.get("role")?.toUpperCase();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      if (redirectParam && redirectParam.startsWith("/")) {
        const isManagerTarget = redirectParam.includes("/manager") && user.role !== "CAMPUS_MANAGER";
        const isOrganizerTarget = redirectParam.includes("/organizer") && user.role !== "ORGANIZER" && user.role !== "CAMPUS_MANAGER";
        if (!isManagerTarget && !isOrganizerTarget) {
          router.replace(redirectParam);
          return;
        }
      }
      router.replace(getDashboardRoute(user.role));
    }
  }, [user, authLoading, router, redirectParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await login(email, password);
    setLoading(false);
    if (res.success) {
      if (redirectParam && redirectParam.startsWith("/")) {
        const userRole = res.role;
        const isManagerTarget = redirectParam.includes("/manager") && userRole !== "CAMPUS_MANAGER";
        const isOrganizerTarget = redirectParam.includes("/organizer") && userRole !== "ORGANIZER" && userRole !== "CAMPUS_MANAGER";
        if (!isManagerTarget && !isOrganizerTarget) {
          router.push(redirectParam);
          return;
        }
      }
      router.push(getDashboardRoute(res.role));
    } else {
      setError(res.error || "Invalid credentials.");
    }
  };

  if (authLoading || user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-kalvium-coral border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-full bg-kalvium-coral-tint border border-kalvium-coral/20 text-kalvium-coral flex items-center justify-center mx-auto mb-3">
          <Sparkles className="w-6 h-6" />
        </div>

        {/* Contextual portal setup badge */}
        {(redirectParam?.includes("/student") || roleParam === "STUDENT") && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-kalvium-coral-tint dark:bg-kalvium-coral/10 border border-kalvium-coral/30 text-kalvium-coral text-xs font-bold mb-3 shadow-xs">
            <GraduationCap size={14} />
            <span>Sign in to Student's Portal</span>
          </div>
        )}
        {(redirectParam?.includes("/organizer") || roleParam === "ORGANIZER") && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-kalvium-warning-tint dark:bg-amber-500/10 border border-kalvium-warning-border dark:border-amber-500/30 text-kalvium-warning dark:text-amber-400 text-xs font-bold mb-3 shadow-xs">
            <PenTool size={14} />
            <span>Sign in to Organizer's Portal</span>
          </div>
        )}
        {(redirectParam?.includes("/manager") || roleParam === "CAMPUS_MANAGER") && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-3 shadow-xs">
            <ShieldCheck size={14} />
            <span>Sign in to Campus Manager's Portal</span>
          </div>
        )}

        <h1 className="text-2xl sm:text-3xl font-display font-black text-kalvium-ink dark:text-kalvium-dark-ink">Sign In to Campus Hub</h1>
        <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted mt-1">
          Access your personal schedule, submit event posters, or verify campus submissions.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border rounded-3xl p-6 sm:p-8 space-y-4 shadow-soft-sm">
        {error && (
          <div className="p-3.5 rounded-xl bg-kalvium-coral-tint border border-kalvium-coral/30 text-kalvium-coral text-xs font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-kalvium-ink dark:text-kalvium-dark-ink uppercase tracking-wider mb-1.5">
            Campus Email
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-kalvium-muted dark:text-kalvium-dark-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. alex@kalvium.community"
              className="w-full bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border rounded-xl pl-9 pr-3 py-2.5 text-xs text-kalvium-ink dark:text-kalvium-dark-ink focus:outline-none focus:border-kalvium-coral transition"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-kalvium-ink dark:text-kalvium-dark-ink uppercase tracking-wider">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-[11px] font-semibold text-kalvium-coral hover:text-kalvium-coral-hover transition hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-kalvium-muted dark:text-kalvium-dark-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border rounded-xl pl-9 pr-10 py-2.5 text-xs text-kalvium-ink dark:text-kalvium-dark-ink focus:outline-none focus:border-kalvium-coral transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-kalvium-muted hover:text-kalvium-text dark:hover:text-kalvium-dark-text transition p-0.5 rounded focus:outline-none"
              title={showPassword ? "Hide password" : "Show password"}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-full bg-kalvium-coral hover:bg-kalvium-coral-hover text-white text-xs font-bold shadow-soft-xs transition duration-200 active:scale-98 disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In & Enter Portal"}
        </button>

        <p className="text-center text-xs text-kalvium-muted dark:text-kalvium-dark-muted pt-2">
          Don't have an account?{" "}
          <Link
            href={
              redirectParam
                ? `/register?redirect=${encodeURIComponent(redirectParam)}${roleParam ? `&role=${encodeURIComponent(roleParam)}` : ""}`
                : "/register"
            }
            className="text-kalvium-coral font-bold hover:underline"
          >
            Register as Student / Club
          </Link>
        </p>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-kalvium-coral border-t-transparent animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
