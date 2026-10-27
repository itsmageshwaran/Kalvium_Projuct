"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Users,
  Search,
  Download,
  Copy,
  Check,
  Calendar,
  Clock,
  MapPin,
  GraduationCap,
  Mail,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/components/Toast";
import { auth as firebaseClientAuth } from "@/lib/firebase/client";

interface Attendee {
  id: string;
  userId: string;
  studentName: string;
  studentEmail: string;
  studentAvatar?: string | null;
  studentRole: string;
  enrolledAt: string;
  status: string;
}

interface EventAttendeesModalProps {
  eventId: string;
  eventTitle: string;
  eventDate?: string;
  eventVenue?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function EventAttendeesModal({
  eventId,
  eventTitle,
  eventDate,
  eventVenue,
  isOpen,
  onClose,
}: EventAttendeesModalProps) {
  const { success, error: toastError } = useToast();
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && eventId) {
      fetchAttendees();
    }
  }, [isOpen, eventId]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background body scroll
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  const fetchAttendees = async () => {
    setLoading(true);
    try {
      const headers: Record<string, string> = {};
      try {
        const idToken = await firebaseClientAuth.currentUser?.getIdToken();
        if (idToken) headers["Authorization"] = `Bearer ${idToken}`;
      } catch {
        // use session cookie
      }

      const res = await fetch(`/api/events/${eventId}/enrollments`, {
        headers,
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        setAttendees(data.enrollments || []);
      } else {
        const err = await res.json();
        toastError(err.error || "Failed to load attendees.");
      }
    } catch (e: any) {
      toastError("Failed to fetch attendee roster.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredAttendees = attendees.filter((a) => {
    const q = searchQuery.toLowerCase();
    return (
      a.studentName.toLowerCase().includes(q) ||
      a.studentEmail.toLowerCase().includes(q)
    );
  });

  const handleCopyEmails = () => {
    if (attendees.length === 0) return;
    const emails = attendees.map((a) => a.studentEmail).filter(Boolean).join(", ");
    navigator.clipboard.writeText(emails);
    setCopied(true);
    success(`Copied ${attendees.length} student emails to clipboard!`);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleExportCSV = () => {
    if (attendees.length === 0) return;
    const header = ["Student Name", "Institutional Email", "Role", "Enrolled At"];
    const rows = attendees.map((a) => [
      `"${a.studentName.replace(/"/g, '""')}"`,
      `"${a.studentEmail.replace(/"/g, '""')}"`,
      `"${a.studentRole}"`,
      `"${new Date(a.enrolledAt).toLocaleString()}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [header.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendees_${eventTitle.toLowerCase().replace(/[^a-z0-9]/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success("Attendee roster exported as CSV.");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-kalvium-text/60 dark:bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border rounded-3xl shadow-kalvium-lg overflow-hidden flex flex-col z-10 animate-scale-in">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-kalvium-border dark:border-kalvium-dark-border bg-kalvium-surface-alt/40 dark:bg-kalvium-dark-surface-alt/40 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-kalvium-coral-tint dark:bg-kalvium-dark-coral-tint text-kalvium-coral flex items-center gap-1.5">
                <Users className="w-3 h-3" />
                Live Attendee Roster
              </span>
              <span className="text-[10px] font-sans font-bold text-kalvium-muted dark:text-kalvium-dark-muted bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border px-2 py-0.5 rounded-full">
                {attendees.length} Enrolled
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-kalvium-text dark:text-kalvium-dark-text truncate">
              {eventTitle}
            </h3>
            {(eventDate || eventVenue) && (
              <div className="flex items-center gap-3 text-xs text-kalvium-muted dark:text-kalvium-dark-muted mt-1 flex-wrap">
                {eventDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-kalvium-coral" />
                    {eventDate}
                  </span>
                )}
                {eventVenue && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-kalvium-coral" />
                    {eventVenue}
                  </span>
                )}
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-kalvium-surface dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border flex items-center justify-center text-kalvium-muted dark:text-kalvium-dark-muted hover:text-kalvium-text dark:hover:text-kalvium-dark-text transition shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toolbar: Search & Action Buttons */}
        <div className="p-4 sm:p-5 border-b border-kalvium-border dark:border-kalvium-dark-border flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-kalvium-dark-surface">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-kalvium-muted dark:text-kalvium-dark-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by name or email..."
              className="w-full text-xs pl-8 pr-3 py-2 rounded-xl bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border text-kalvium-text dark:text-kalvium-dark-text focus:outline-none focus:border-kalvium-coral transition"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={fetchAttendees}
              disabled={loading}
              title="Refresh roster"
              className="p-2 rounded-xl border border-kalvium-border dark:border-kalvium-dark-border text-kalvium-muted dark:text-kalvium-dark-muted hover:text-kalvium-text dark:hover:text-kalvium-dark-text transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-kalvium-coral" : ""}`} />
            </button>
            <button
              onClick={handleCopyEmails}
              disabled={attendees.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border text-kalvium-text dark:text-kalvium-dark-text hover:border-kalvium-coral transition disabled:opacity-50"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-kalvium-success" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy Emails"}</span>
            </button>
            <button
              onClick={handleExportCSV}
              disabled={attendees.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-kalvium-coral hover:bg-kalvium-coral-hover text-white transition disabled:opacity-50 shadow-soft-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Attendee List */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[50vh] divide-y divide-kalvium-border/60 dark:divide-kalvium-dark-border/60">
          {loading ? (
            <div className="py-12 text-center text-xs text-kalvium-muted dark:text-kalvium-dark-muted">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-kalvium-coral" />
              Loading student roster...
            </div>
          ) : filteredAttendees.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="w-8 h-8 text-kalvium-muted/60 dark:text-kalvium-dark-muted/60 mx-auto mb-2" />
              <p className="text-xs font-semibold text-kalvium-text dark:text-kalvium-dark-text">
                {searchQuery ? "No matching attendees found." : "No students have applied to this event yet."}
              </p>
              <p className="text-[11px] text-kalvium-muted dark:text-kalvium-dark-muted mt-0.5">
                {searchQuery ? "Try a different search term." : "Applications will appear here automatically when students click 'Apply'."}
              </p>
            </div>
          ) : (
            filteredAttendees.map((attendee, index) => (
              <div
                key={attendee.id || index}
                className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3 hover:bg-kalvium-surface-alt/30 dark:hover:bg-kalvium-dark-surface-alt/30 px-2 rounded-xl transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={
                      attendee.studentAvatar ||
                      `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(attendee.studentEmail)}`
                    }
                    alt={attendee.studentName}
                    className="w-9 h-9 rounded-full bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border shrink-0 object-cover"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-kalvium-text dark:text-kalvium-dark-text truncate">
                        {attendee.studentName}
                      </span>
                      <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-300/60 px-1.5 py-0.2 rounded">
                        {attendee.studentRole === "STUDENT" ? "Student" : attendee.studentRole}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-kalvium-muted dark:text-kalvium-dark-muted truncate mt-0.5">
                      <span className="flex items-center gap-1 truncate">
                        <Mail className="w-3 h-3 text-kalvium-muted/70 shrink-0" />
                        {attendee.studentEmail}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-kalvium-muted dark:text-kalvium-dark-muted block">
                    Applied on
                  </span>
                  <span className="text-[11px] font-medium text-kalvium-text dark:text-kalvium-dark-text">
                    {attendee.enrolledAt ? new Date(attendee.enrolledAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "Recently"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-kalvium-border dark:border-kalvium-dark-border bg-kalvium-surface-alt/30 dark:bg-kalvium-dark-surface-alt/30 flex items-center justify-between text-xs text-kalvium-muted dark:text-kalvium-dark-muted">
          <span>Showing {filteredAttendees.length} of {attendees.length} student application{attendees.length !== 1 ? "s" : ""}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-full bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border text-xs font-bold text-kalvium-text dark:text-kalvium-dark-text hover:border-kalvium-coral transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
