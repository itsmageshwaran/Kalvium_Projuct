"use client";

import Link from "next/link";
import { Compass, LayoutDashboard, Home } from "lucide-react";
import { useAuth, getDashboardRoute } from "@/context/AuthContext";

export default function NotFound() {
  const { user } = useAuth();
  const homeHref = user ? getDashboardRoute(user.role) : "/";
  const homeText = user ? "My Portal" : "Back to Home";

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-md mx-auto space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-kalvium-coral/10 dark:bg-kalvium-coral/20 text-kalvium-coral flex items-center justify-center mx-auto shadow-sm">
          <Compass className="w-8 h-8 animate-spin-slow" />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-kalvium-coral">
            404 Error
          </p>
          <h1 className="text-3xl font-display font-bold text-kalvium-text dark:text-kalvium-dark-text">
            Page Not Found
          </h1>
          <p className="text-sm text-kalvium-muted dark:text-kalvium-dark-muted leading-relaxed">
            The campus event or page you are looking for does not exist, has been removed, or has moved to a new venue.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/events"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-kalvium-coral text-white font-medium text-sm hover:bg-kalvium-coral/90 transition-colors shadow-sm inline-flex items-center justify-center gap-2"
          >
            <Compass className="w-4 h-4" />
            Explore Campus Events
          </Link>
          <Link
            href={homeHref}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-kalvium-border dark:border-kalvium-dark-border bg-kalvium-surface dark:bg-kalvium-dark-surface text-kalvium-text dark:text-kalvium-dark-text font-medium text-sm hover:border-kalvium-coral/50 transition-colors inline-flex items-center justify-center gap-2"
          >
            {user ? <LayoutDashboard className="w-4 h-4" /> : <Home className="w-4 h-4" />}
            {homeText}
          </Link>
        </div>
      </div>
    </div>
  );
}
