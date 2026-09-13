"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Filter,
} from "lucide-react";
import CampusVerifiedBadge from "@/components/CampusVerifiedBadge";
import { useAuth } from "@/context/AuthContext";

export default function ManagerAuditHistoryPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState<"ALL" | "APPROVED" | "DECLINED">("ALL");

  useEffect(() => {
    if (!user) return;
    fetchHistory();
  }, [user]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/manager/history");
      if (res.ok) {
        const json = await res.json();
        setHistory(json.history || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== "CAMPUS_MANAGER") {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="p-8 rounded-3xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border shadow-soft-sm text-center">
          <ShieldCheck className="w-10 h-10 text-kalvium-success mx-auto mb-3" />
          <h2 className="text-xl font-display font-black text-kalvium-ink dark:text-kalvium-dark-ink mb-2">Access Restricted</h2>
          <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted mb-6">
            Access to the immutable audit trail is restricted to Campus Managers.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center px-5 py-2.5 rounded-full bg-kalvium-coral hover:bg-kalvium-coral-hover text-white text-xs font-bold transition shadow-soft-xs"
          >
            Sign In with Manager Credentials
          </Link>
        </div>
      </div>
    );
  }

  const filteredHistory = history.filter((item) => {
    if (filterAction === "ALL") return true;
    return item.action === filterAction;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        href="/dashboard/manager"
        className="inline-flex items-center gap-2 text-xs font-semibold text-kalvium-muted dark:text-kalvium-dark-muted hover:text-kalvium-coral mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Verification Queue</span>
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-sans uppercase tracking-widest text-kalvium-success font-bold bg-kalvium-bg dark:bg-kalvium-dark-surface px-3 py-1 rounded-full border border-kalvium-border dark:border-kalvium-dark-border shadow-soft-xs">
            Immutable Audit Trail
          </span>
          <h1 className="text-3xl font-display font-black text-kalvium-ink dark:text-kalvium-dark-ink tracking-tight mt-1">
            Campus Verification History
          </h1>
          <p className="text-xs sm:text-sm text-kalvium-muted dark:text-kalvium-dark-muted mt-1">
            Complete record of manager verification actions, approval stamps, and decline rationales.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1 bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border p-1 rounded-full text-xs shadow-soft-xs">
          <button
            onClick={() => setFilterAction("ALL")}
            className={`px-3 py-1.5 rounded-full font-semibold transition ${
              filterAction === "ALL" ? "bg-kalvium-coral text-white" : "text-kalvium-muted dark:text-kalvium-dark-muted hover:text-kalvium-ink"
            }`}
          >
            All ({history.length})
          </button>
          <button
            onClick={() => setFilterAction("APPROVED")}
            className={`px-3 py-1.5 rounded-full font-semibold transition ${
              filterAction === "APPROVED"
                ? "bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt text-kalvium-success border border-kalvium-border dark:border-kalvium-dark-border"
                : "text-kalvium-muted dark:text-kalvium-dark-muted hover:text-kalvium-ink"
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilterAction("DECLINED")}
            className={`px-3 py-1.5 rounded-full font-semibold transition ${
              filterAction === "DECLINED"
                ? "bg-kalvium-coral-tint text-kalvium-coral border border-kalvium-coral/30"
                : "text-kalvium-muted dark:text-kalvium-dark-muted hover:text-kalvium-ink"
            }`}
          >
            Declined
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-kalvium-muted dark:text-kalvium-dark-muted text-sm">Loading audit history...</div>
      ) : filteredHistory.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border rounded-2xl shadow-soft-xs">
          <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted">No records found matching filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredHistory.map((entry) => (
            <div
              key={entry.id}
              className={`p-5 rounded-2xl border transition shadow-soft-xs ${
                entry.action === "APPROVED"
                  ? "bg-white dark:bg-kalvium-dark-surface border-kalvium-border dark:border-kalvium-dark-border hover:border-kalvium-success/40"
                  : "bg-white dark:bg-kalvium-dark-surface border-kalvium-border dark:border-kalvium-dark-border hover:border-kalvium-coral/40"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <img
                    src={entry.event.posterUrl}
                    alt={entry.event.title}
                    className="w-16 h-16 rounded-xl object-cover bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt shrink-0 border border-kalvium-border dark:border-kalvium-dark-border"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      {entry.action === "APPROVED" ? (
                        <span className="text-[10px] font-sans uppercase tracking-wider font-semibold bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt text-kalvium-success border border-kalvium-border dark:border-kalvium-dark-border px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-kalvium-success" />
                          Approved & Certified
                        </span>
                      ) : (
                        <span className="text-[10px] font-sans uppercase tracking-wider font-semibold bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt text-kalvium-coral border border-kalvium-border dark:border-kalvium-dark-border px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <XCircle className="w-3 h-3 text-kalvium-coral" />
                          Declined
                        </span>
                      )}

                      <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-kalvium-muted dark:text-kalvium-dark-muted bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt px-2.5 py-0.5 rounded-full">
                        {entry.event.category}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-kalvium-ink dark:text-kalvium-dark-ink mb-1">{entry.event.title}</h3>
                    <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted">
                      Event Date: {entry.event.date} • Venue: {entry.event.venue}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] font-sans text-kalvium-muted dark:text-kalvium-dark-muted block">
                    {new Date(entry.timestamp).toLocaleString()}
                  </span>
                  <span className="text-xs text-kalvium-ink dark:text-kalvium-dark-ink font-semibold mt-0.5 block">
                    Manager: {entry.manager.name}
                  </span>
                </div>
              </div>

              {/* Action Notes */}
              <div className="mt-4 pt-3 border-t border-kalvium-border dark:border-kalvium-dark-border text-xs text-kalvium-ink/90 dark:text-kalvium-dark-ink/90 flex items-start gap-2">
                <span className="font-bold text-kalvium-muted dark:text-kalvium-dark-muted shrink-0">
                  {entry.action === "APPROVED" ? "Audit Log:" : "Decline Reason & Notes:"}
                </span>
                <span className="text-kalvium-ink/80 dark:text-kalvium-dark-ink/80">
                  {entry.reason ? `${entry.reason} — ` : ""}
                  {entry.notes || "No additional notes"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
