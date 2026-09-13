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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white border-4 border-black shadow-[8px_8px_0px_0px_black] rounded-none p-6 text-black">
        <div className="flex items-start justify-between gap-4 border-b-4 border-black pb-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-bauhaus-red border-2 border-black flex items-center justify-center shrink-0">
              <XCircle className="w-6 h-6 text-white" strokeWidth={3} />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-bauhaus-red block">
                Manager Action
              </span>
              <h3 className="text-2xl font-display font-black text-black uppercase tracking-tight">Decline Event</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-black border-2 border-transparent hover:border-black p-1 transition"
          >
            <X className="w-6 h-6" strokeWidth={3} />
          </button>
        </div>

        <p className="text-sm font-bold uppercase tracking-widest mb-6">
          Declining <span className="text-bauhaus-red">"{eventTitle}"</span>. The organizer will receive your feedback and the event will remain private.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-black text-black uppercase tracking-widest mb-3">
              Why are you declining this event?
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {PRESET_REASONS.map((reason) => (
                <label
                  key={reason}
                  className={`flex items-center gap-3 p-3 border-2 text-sm font-bold uppercase tracking-widest cursor-pointer transition-all duration-200 ${selectedReason === reason
                      ? "bg-bauhaus-yellow border-black shadow-[2px_2px_0px_0px_black] text-black"
                      : "bg-white border-gray-300 text-gray-500 hover:border-black hover:text-black"
                    }`}
                >
                  <input
                    type="radio"
                    name="declineReason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={() => setSelectedReason(reason)}
                    className="accent-black w-4 h-4"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-black text-black uppercase tracking-widest mb-3">
              Specific Instructions / Notes for Organizer:
            </label>
            <textarea
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="e.g. The venue stated on the poster does not match student union bookings for this date. Please attach revised poster."
              rows={3}
              className="w-full bg-white border-4 border-black rounded-none px-4 py-3 text-sm font-bold text-black placeholder:text-gray-400 focus:outline-none focus:bg-bauhaus-yellow transition-colors"
            />
          </div>

          <div className="flex items-center justify-end gap-4 pt-4 border-t-4 border-black">
            <button
              type="button"
              onClick={onClose}
              className="btn-bauhaus-ghost px-6 py-3 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-bauhaus px-6 py-3 text-sm text-white"
              style={{ backgroundColor: "#D02020" }}
            >
              {submitting ? "DECLINING..." : "CONFIRM DECLINE"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
