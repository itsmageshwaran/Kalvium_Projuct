"use client";

import React, { useState } from "react";
import { XCircle, X } from "lucide-react";

interface DeclineReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDecline: (reason: string, customNotes: string) => void;
  eventTitle: string;
}

const PRESET_REASONS = [
  "Information doesn't match poster",
  "Event cannot be verified",
  "Invalid date",
  "Invalid time",
  "Invalid venue",
  "Duplicate event",
  "Unauthorized organizer",
  "Other",
];

export default function DeclineReasonModal({
  isOpen,
  onClose,
  onConfirmDecline,
  eventTitle,
}: DeclineReasonModalProps) {
  const [selectedReason, setSelectedReason] = useState(PRESET_REASONS[0]);
  const [customNotes, setCustomNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onConfirmDecline(selectedReason, customNotes);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-kalvium-text/40 dark:bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border rounded-2xl shadow-kalvium-lg p-6 text-kalvium-text dark:text-kalvium-dark-text animate-scale-in">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-kalvium-coral-tint dark:bg-kalvium-dark-coral-tint border border-kalvium-coral/20 flex items-center justify-center shrink-0">
              <XCircle className="w-5 h-5 text-kalvium-coral" />
            </div>
            <div>
              <span className="text-[11px] font-sans uppercase tracking-widest text-kalvium-coral font-bold">
                Manager Verification
              </span>
              <h3 className="text-xl font-display font-bold text-kalvium-text dark:text-kalvium-dark-text">Decline Event Submission</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-kalvium-muted hover:text-kalvium-text dark:hover:text-kalvium-dark-text p-1.5 rounded-full hover:bg-kalvium-surface-alt dark:hover:bg-kalvium-dark-surface-alt transition-all duration-200 active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted mb-4">
          Declining <span className="font-semibold text-kalvium-text dark:text-kalvium-dark-text">"{eventTitle}"</span>. The organizer will receive your feedback and the event will remain private.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-kalvium-muted dark:text-kalvium-dark-muted uppercase tracking-wider mb-2">
              Why are you declining this event?
            </label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {PRESET_REASONS.map((reason) => (
                <label
                  key={reason}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all duration-200 active:scale-[0.99] ${
                    selectedReason === reason
                      ? "bg-kalvium-coral-tint dark:bg-kalvium-dark-coral-tint border-kalvium-coral text-kalvium-coral font-semibold shadow-sm"
                      : "bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border-kalvium-border dark:border-kalvium-dark-border text-kalvium-text dark:text-kalvium-dark-text hover:border-kalvium-coral/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="declineReason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={() => setSelectedReason(reason)}
                    className="accent-kalvium-coral"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-kalvium-muted dark:text-kalvium-dark-muted uppercase tracking-wider mb-1.5">
              Specific Instructions / Notes for Organizer:
            </label>
            <textarea
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="e.g. The venue stated on the poster does not match student union bookings for this date. Please attach revised poster."
              rows={3}
              className="w-full bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border rounded-xl px-3.5 py-2.5 text-xs text-kalvium-text dark:text-kalvium-dark-text placeholder:text-kalvium-muted focus:outline-none focus:border-kalvium-coral transition-all duration-200"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-kalvium-border dark:border-kalvium-dark-border text-xs font-semibold text-kalvium-muted dark:text-kalvium-dark-muted hover:text-kalvium-text dark:hover:text-kalvium-dark-text hover:bg-kalvium-surface-alt dark:hover:bg-kalvium-dark-surface-alt transition-all duration-200 active:scale-95"
            >
              Back to Queue
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-full text-xs font-bold bg-kalvium-coral hover:bg-kalvium-coral-hover text-white shadow-sm transition-all duration-200 ease-out active:scale-95 disabled:opacity-50"
            >
              {submitting ? "Declining..." : "Confirm Decline"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
