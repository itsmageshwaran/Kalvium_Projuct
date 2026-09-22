"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyRound, Mail, ArrowLeft, CheckCircle2, RefreshCw, Sparkles, ShieldCheck } from "lucide-react";
import { useAuth, getDashboardRoute } from "@/context/AuthContext";

export default function ForgotPasswordPage() {
  const { resetPassword, user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // If already logged in, redirect to respective dashboard
  useEffect(() => {
    if (!authLoading && user) {
      router.replace(getDashboardRoute(user.role));
    }
  }, [user, authLoading, router]);

  // Resend cooldown timer countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your campus email address.");
      return;
    }

    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail.endsWith("@kalvium.community") && !cleanEmail.endsWith("@kalvium.com")) {
      setError("Please enter a valid campus email ending in @kalvium.community or @kalvium.com");
      return;
    }

    setLoading(true);
    setError(null);

    const res = await resetPassword(cleanEmail);
    setLoading(false);

    if (res.success) {
      setSubmittedEmail(cleanEmail);
      setCooldown(30); // 30 second cooldown before allowing resend
    } else {
      setError(res.error || "Failed to send reset email. Please try again.");
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || !submittedEmail) return;
    setLoading(true);
    setError(null);

    const res = await resetPassword(submittedEmail);
    setLoading(false);

    if (res.success) {
      setCooldown(30);
    } else {
      setError(res.error || "Failed to resend reset email. Please try again.");
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
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-full bg-kalvium-coral-tint border border-kalvium-coral/20 text-kalvium-coral flex items-center justify-center mx-auto mb-3 shadow-soft-xs">
          {submittedEmail ? <CheckCircle2 className="w-6 h-6 text-emerald-600" /> : <KeyRound className="w-6 h-6" />}
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-black text-kalvium-ink dark:text-kalvium-dark-ink">
          {submittedEmail ? "Check Your Inbox" : "Reset Password"}
        </h1>
        <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted mt-1 max-w-sm mx-auto">
          {submittedEmail
            ? "A password recovery email has been sent to your campus account."
            : "Enter your registered campus email to receive a secure password recovery link."}
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border rounded-3xl p-6 sm:p-8 space-y-5 shadow-soft-sm">
        {error && (
          <div className="p-3.5 rounded-xl bg-kalvium-coral-tint border border-kalvium-coral/30 text-kalvium-coral text-xs font-medium leading-relaxed">
            {error}
          </div>
        )}

        {submittedEmail ? (
          /* Success confirmation state */
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-300">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Reset Instructions Dispatched</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                We have sent instructions to <span className="font-semibold underline">{submittedEmail}</span>. Please click the link in that email to choose a new password.
              </p>
            </div>

            <div className="text-[11px] text-kalvium-muted dark:text-kalvium-dark-muted bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt p-3.5 rounded-xl border border-kalvium-border dark:border-kalvium-dark-border space-y-1">
              <p className="font-semibold text-kalvium-ink dark:text-kalvium-dark-ink">Didn't get the email?</p>
              <ul className="list-disc pl-4 space-y-0.5 text-kalvium-muted dark:text-kalvium-dark-muted">
                <li>Check your spam or junk folder</li>
                <li>Make sure the email is registered to a Kalvium account</li>
                <li>Wait a few moments for campus email delivery</li>
              </ul>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleResend}
                disabled={loading || cooldown > 0}
                className="w-full py-2.5 rounded-full border border-kalvium-border dark:border-kalvium-dark-border hover:border-kalvium-coral text-kalvium-ink dark:text-kalvium-dark-ink text-xs font-bold transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:border-kalvium-border"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                {cooldown > 0 ? `Resend email in ${cooldown}s` : loading ? "Resending..." : "Resend reset email"}
              </button>

              <Link
                href="/login"
                className="w-full py-3 rounded-full bg-kalvium-coral hover:bg-kalvium-coral-hover text-white text-xs font-bold shadow-soft-xs transition duration-200 flex items-center justify-center gap-2 active:scale-98"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          /* Email Input Form */
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <p className="text-[11px] text-kalvium-muted dark:text-kalvium-dark-muted mt-1.5">
                Must end with <span className="font-mono text-kalvium-coral font-medium">@kalvium.community</span> or <span className="font-mono text-kalvium-coral font-medium">@kalvium.com</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full bg-kalvium-coral hover:bg-kalvium-coral-hover text-white text-xs font-bold shadow-soft-xs transition duration-200 active:scale-98 disabled:opacity-50"
            >
              {loading ? "Sending link..." : "Send Password Reset Link"}
            </button>

            <div className="pt-2 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-kalvium-muted dark:text-kalvium-dark-muted hover:text-kalvium-coral transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>

      {/* Security info footer */}
      <div className="mt-8 text-center text-[11px] text-kalvium-muted dark:text-kalvium-dark-muted flex items-center justify-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-kalvium-coral" />
        <span>Kalvium Verified Campus Security & Identity Protection</span>
      </div>
    </div>
  );
}
