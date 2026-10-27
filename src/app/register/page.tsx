"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, ArrowRight, User, Mail, Lock, ShieldAlert, GraduationCap, PenTool, Eye, EyeOff } from "lucide-react";
import { useAuth, getDashboardRoute } from "@/context/AuthContext";
import { isSafeRedirectUrl } from "@/lib/safe-redirect";

function RegisterContent() {
  const { register, loginWithGoogle, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectParam = searchParams.get("redirect");
  const roleParam = searchParams.get("role")?.toUpperCase();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const role = "STUDENT";
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
    const res = await loginWithGoogle(roleParam || role);
    setLoading(false);
    if (res.success) {
      if (redirectParam && isSafeRedirectUrl(redirectParam)) {
        const userRole = res.role || role;
        const isManagerTarget = redirectParam.includes("/manager") && userRole !== "CAMPUS_MANAGER";
        const isOrganizerTarget = redirectParam.includes("/organizer") && userRole !== "ORGANIZER" && userRole !== "CAMPUS_MANAGER";
        if (!isManagerTarget && !isOrganizerTarget) {
          router.push(redirectParam);
          return;
        }
      }
      router.push(getDashboardRoute(res.role || role));
    } else {
      setError(res.error || "Google sign-in failed.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) {
      setError("Please agree to the Terms & Conditions and acknowledge our Privacy Policy to proceed.");
      return;
    }
    setLoading(true);
    setError(null);
    const res = await register(name, email, password, role);
    setLoading(false);
    if (res.success) {
      if (redirectParam && isSafeRedirectUrl(redirectParam)) {
        const userRole = res.role || role;
        const isManagerTarget = redirectParam.includes("/manager") && userRole !== "CAMPUS_MANAGER";
        const isOrganizerTarget = redirectParam.includes("/organizer") && userRole !== "ORGANIZER" && userRole !== "CAMPUS_MANAGER";
        if (!isManagerTarget && !isOrganizerTarget) {
          router.push(redirectParam);
          return;
        }
      }
      router.push(getDashboardRoute(res.role || role));
    } else {
      setError(res.error || "Registration failed.");
    }
  };

  if (authLoading || user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-kalvium-coral border-t-transparent animate-spin" />
      </div>
    );
  }

  const isRestrictedTarget = roleParam === "CAMPUS_MANAGER" || roleParam === "ORGANIZER" || redirectParam?.includes("/manager") || redirectParam?.includes("/organizer");

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-full bg-kalvium-coral-tint border border-kalvium-coral/20 text-kalvium-coral flex items-center justify-center mx-auto mb-3">
          <Sparkles className="w-6 h-6" />
        </div>
        
        {/* Contextual portal setup badge */}
        {redirectParam?.includes("/student") && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-kalvium-coral-tint dark:bg-kalvium-coral/10 border border-kalvium-coral/30 text-kalvium-coral text-xs font-bold mb-3 shadow-xs">
            <GraduationCap size={14} />
            <span>Student's Portal Access</span>
          </div>
        )}
        {redirectParam?.includes("/organizer") && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-kalvium-warning-tint dark:bg-amber-500/10 border border-kalvium-warning-border dark:border-amber-500/30 text-kalvium-warning dark:text-amber-400 text-xs font-bold mb-3 shadow-xs">
            <PenTool size={14} />
            <span>Organizer's Portal Access</span>
          </div>
        )}

        <h1 className="text-2xl sm:text-3xl font-display font-black text-kalvium-ink dark:text-kalvium-dark-ink">Create Your Account</h1>
        <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted mt-1">
          Join the campus event ecosystem as a student.
        </p>
      </div>

      {/* Restricted Notice if manager or organizer portal was clicked */}
      {isRestrictedTarget && (
        <div className="mb-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs shadow-xs">
          <div className="flex items-center gap-2 font-bold mb-1 text-amber-700 dark:text-amber-300">
            <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Restricted Portal Access</span>
          </div>
          <p className="text-[11px] leading-relaxed text-kalvium-muted dark:text-kalvium-dark-muted">
            Campus Manager and Club Organizer accounts are provisioned directly by university administration. If you already have these credentials, please{" "}
            <Link
              href={
                redirectParam
                  ? `/login?redirect=${encodeURIComponent(redirectParam)}&role=${roleParam || "STUDENT"}`
                  : "/login"
              }
              className="text-kalvium-coral font-bold underline hover:text-kalvium-coral-hover"
            >
              Sign In with your credentials →
            </Link>
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border rounded-3xl p-6 sm:p-8 space-y-4 shadow-soft-sm">
        {error && (
          <div className="p-3.5 rounded-xl bg-kalvium-coral-tint border border-kalvium-coral/30 text-kalvium-coral text-xs font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-kalvium-ink dark:text-kalvium-dark-ink uppercase tracking-wider mb-1.5">
            Full Name
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-kalvium-muted dark:text-kalvium-dark-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Johnson"
              className="w-full bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border rounded-xl pl-9 pr-3 py-2.5 text-xs text-kalvium-ink dark:text-kalvium-dark-ink focus:outline-none focus:border-kalvium-coral transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-kalvium-ink dark:text-kalvium-dark-ink uppercase tracking-wider mb-1.5">
            Campus Email Address
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
          <label className="block text-xs font-bold text-kalvium-ink dark:text-kalvium-dark-ink uppercase tracking-wider mb-1.5">
            Password
          </label>
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

        {/* Terms & Privacy Acceptance Checkbox */}
        <div className="flex items-start gap-2.5 pt-1 pb-1">
          <input
            id="terms-checkbox"
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-kalvium-border dark:border-kalvium-dark-border text-kalvium-coral focus:ring-kalvium-coral cursor-pointer"
          />
          <label
            htmlFor="terms-checkbox"
            className="text-[11px] leading-relaxed text-kalvium-muted dark:text-kalvium-dark-muted cursor-pointer select-none"
          >
            I agree to the{" "}
            <Link
              href="/terms"
              target="_blank"
              className="font-semibold text-kalvium-text dark:text-kalvium-dark-text underline hover:text-kalvium-coral transition"
            >
              Terms &amp; Conditions
            </Link>
            , acknowledge the{" "}
            <Link
              href="/privacy"
              target="_blank"
              className="font-semibold text-kalvium-text dark:text-kalvium-dark-text underline hover:text-kalvium-coral transition"
            >
              Privacy Policy
            </Link>
            , and agree to adhere to the{" "}
            <Link
              href="/guidelines"
              target="_blank"
              className="font-semibold text-kalvium-text dark:text-kalvium-dark-text underline hover:text-kalvium-coral transition"
            >
              Campus Event Guidelines
            </Link>
            .
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-full bg-kalvium-coral hover:bg-kalvium-coral-hover text-white text-xs font-bold shadow-soft-xs transition duration-200 active:scale-98 disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Complete Registration & Enter Portal"}
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
          <span>Register with Google</span>
        </button>

        <p className="text-center text-xs text-kalvium-muted dark:text-kalvium-dark-muted pt-2">
          Already have an account?{" "}
          <Link
            href={
              redirectParam
                ? `/login?redirect=${encodeURIComponent(redirectParam)}${roleParam ? `&role=${encodeURIComponent(roleParam)}` : ""}`
                : "/login"
            }
            className="text-kalvium-coral font-bold hover:underline"
          >
            Sign In
          </Link>
        </p>
      </form>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-kalvium-coral border-t-transparent animate-spin" />
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
