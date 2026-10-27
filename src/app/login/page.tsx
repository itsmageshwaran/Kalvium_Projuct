"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, ArrowRight, ShieldCheck, GraduationCap, PenTool, User, Lock, Mail, Eye, EyeOff } from "lucide-react";
import { useAuth, getDashboardRoute } from "@/context/AuthContext";
import { isSafeRedirectUrl } from "@/lib/safe-redirect";
import CampusVerifiedBadge from "@/components/CampusVerifiedBadge";

function LoginContent() {
  const { login, loginWithGoogle, user, loading: authLoading, logout } = useAuth();
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
      if (redirectParam && isSafeRedirectUrl(redirectParam)) {
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

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    const res = await loginWithGoogle(roleParam);
    setLoading(false);
    if (res.success) {
      if (redirectParam && isSafeRedirectUrl(redirectParam)) {
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
      setError(res.error || "Google sign-in failed.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await login(email, password);
    setLoading(false);
    if (res.success) {
      if (redirectParam && isSafeRedirectUrl(redirectParam)) {
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

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-kalvium-coral border-t-transparent animate-spin" />
        <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted animate-pulse">Checking credentials...</p>
      </div>
    );
  }

  if (user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border rounded-3xl p-6 sm:p-8 space-y-4 shadow-soft-sm">
          <div className="w-12 h-12 rounded-full bg-kalvium-coral-tint border border-kalvium-coral/20 text-kalvium-coral flex items-center justify-center mx-auto mb-2">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-display font-black text-kalvium-ink dark:text-kalvium-dark-ink">
            Already Signed In
          </h2>
          <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted">
            You are logged in as <span className="font-semibold text-kalvium-coral">{user.email}</span> ({user.role}).
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href={getDashboardRoute(user.role)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-kalvium-coral hover:bg-kalvium-coral-hover text-white text-xs font-bold transition shadow-soft-xs"
            >
              Enter Dashboard →
            </Link>
            <button
              type="button"
              onClick={() => logout()}
              className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-kalvium-border dark:border-kalvium-dark-border text-kalvium-text dark:text-kalvium-dark-text hover:bg-kalvium-surface-alt dark:hover:bg-kalvium-dark-surface-alt text-xs font-bold transition"
            >
              Sign Out
            </button>
          </div>
        </div>
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
              placeholder="e.g. udeep.chowdary.s83@kalvium.community"
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

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-kalvium-border dark:border-kalvium-dark-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-kalvium-dark-surface px-2.5 text-[10px] font-bold text-kalvium-muted">
              Or
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-full border border-kalvium-border dark:border-kalvium-dark-border bg-kalvium-surface-alt/70 dark:bg-kalvium-dark-surface-alt/70 hover:bg-white dark:hover:bg-kalvium-dark-surface hover:border-kalvium-coral/60 text-kalvium-text dark:text-kalvium-dark-text text-xs font-bold transition flex items-center justify-center gap-2.5 active:scale-98 shadow-soft-xs disabled:opacity-50"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
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
            Register as Student
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
