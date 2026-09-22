"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, ShieldCheck, GraduationCap, User, Lock, Mail } from "lucide-react";
import { useAuth, getDashboardRoute } from "@/context/AuthContext";
import CampusVerifiedBadge from "@/components/CampusVerifiedBadge";

export default function LoginPage() {
  const { login, user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace(getDashboardRoute(user.role));
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await login(email, password);
    setLoading(false);
    if (res.success) {
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
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border rounded-xl pl-9 pr-3 py-2.5 text-xs text-kalvium-ink dark:text-kalvium-dark-ink focus:outline-none focus:border-kalvium-coral transition"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-full bg-kalvium-coral hover:bg-kalvium-coral-hover text-white text-xs font-bold shadow-soft-xs transition duration-200 active:scale-98 disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In to Campus Hub"}
        </button>

        <p className="text-center text-xs text-kalvium-muted dark:text-kalvium-dark-muted pt-2">
          Don't have an account?{" "}
          <Link href="/register" className="text-kalvium-coral font-bold hover:underline">
            Register as Student / Club
          </Link>
        </p>
      </form>
    </div>
  );
}
