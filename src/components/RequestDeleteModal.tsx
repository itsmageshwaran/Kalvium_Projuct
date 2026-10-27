"use client";

import React, { useState } from "react";
import { AlertTriangle, X, Send, Trash2, Calendar, MapPin } from "lucide-react";
import { useToast } from "@/components/Toast";

interface RequestDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventTitle: string;
  eventDate?: string;
  eventVenue?: string;
  onSuccess: () => void;
}

const PRESET_REASONS = [
  "Event Cancelled / Postponed",
  "Event Already Concluded / Finished",
  "Duplicate Event Submission",
  "Incorrect Information / Replaced by New Proposal",
  "Other Reason",
];

export default function RequestDeleteModal({
  isOpen,
  onClose,
  eventId,
  eventTitle,
  eventDate,
  eventVenue,
  onSuccess,
}: RequestDeleteModalProps) {
  const [selectedReason, setSelectedReason] = useState(PRESET_REASONS[0]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason) {
      error("Please choose a reason for the deletion request.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/organizer/events/${eventId}/request-delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: selectedReason,
          notes,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        success("Deletion request submitted to Campus Manager.");
        onSuccess();
        onClose();
      } else {
        error(data.error || "Failed to submit deletion request.");
      }
    } catch {
      error("Network error while submitting deletion request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-lg rounded-3xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border shadow-soft-xl overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-kalvium-border dark:border-kalvium-dark-border bg-kalvium-surface-alt/40 dark:bg-kalvium-dark-surface-alt/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-display font-bold text-kalvium-text dark:text-kalvium-dark-text">
                Request Event Deletion
              </h2>
              <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted">
                Formal request for Campus Manager review
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-kalvium-surface-alt text-kalvium-muted hover:text-kalvium-text transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content & Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Target Event Info */}
          <div className="p-3.5 rounded-2xl bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border space-y-1">
            <span className="text-[10px] font-sans uppercase font-bold tracking-wider text-kalvium-coral">
              Target Event
            </span>
            <h3 className="text-xs font-bold text-kalvium-text dark:text-kalvium-dark-text truncate">
              {eventTitle}
            </h3>
            {(eventDate || eventVenue) && (
              <div className="flex items-center gap-3 text-[11px] text-kalvium-muted dark:text-kalvium-dark-muted pt-0.5">
                {eventDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-kalvium-coral" />
                    {eventDate}
                  </span>
                )}
                {eventVenue && (
                  <span className="flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 text-kalvium-coral" />
                    {eventVenue}
                  </span>
                )}
              </div>
            )}
          </div>

          <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted leading-relaxed">
            Because this event is approved on the campus schedule, deletions must be verified by the Campus Manager to prevent accidental calendar disruption.
          </p>

          {/* Reason Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-kalvium-text dark:text-kalvium-dark-text">
              Reason for Deletion <span className="text-kalvium-coral">*</span>
            </label>
            <div className="space-y-1.5">
              {PRESET_REASONS.map((reason) => {
                const isSelected = selectedReason === reason;
                return (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setSelectedReason(reason)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-xs font-medium transition flex items-center justify-between ${
                      isSelected
                        ? "bg-kalvium-coral/10 border-kalvium-coral text-kalvium-coral font-bold"
                        : "bg-white dark:bg-kalvium-dark-surface border-kalvium-border dark:border-kalvium-dark-border text-kalvium-text dark:text-kalvium-dark-text hover:border-kalvium-coral/40"
                    }`}
                  >
                    <span>{reason}</span>
                    <span
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "border-kalvium-coral bg-kalvium-coral text-white"
                          : "border-kalvium-border dark:border-kalvium-dark-border"
                      }`}
                    >
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Additional Notes */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-kalvium-text dark:text-kalvium-dark-text">
              Additional Details / Context <span className="text-kalvium-muted font-normal">(Optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. The speakers cancelled, or event completed on Saturday and is no longer relevant."
              rows={3}
              className="w-full p-3 rounded-xl border border-kalvium-border dark:border-kalvium-dark-border bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt text-xs text-kalvium-text dark:text-kalvium-dark-text focus:outline-none focus:border-kalvium-coral resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-kalvium-border dark:border-kalvium-dark-border">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-full border border-kalvium-border dark:border-kalvium-dark-border hover:bg-kalvium-surface-alt text-xs font-semibold text-kalvium-muted hover:text-kalvium-text transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-2 disabled:opacity-50 active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? "Submitting..." : "Submit Deletion Request"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
