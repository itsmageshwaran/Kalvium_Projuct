"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Clock, MapPin, X } from "lucide-react";

interface ClashWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSave: () => void;
  conflictingEvent: {
    title: string;
    startTime: string;
    endTime: string;
    venue?: string;
    date: string;
  };
  currentEvent: {
    title: string;
    startTime: string;
    endTime: string;
    venue?: string;
    date: string;
  };
  overlapStr: string;
}

export default function ClashWarningModal({
  isOpen,
  onClose,
  onConfirmSave,
  conflictingEvent,
  currentEvent,
  overlapStr,
}: ClashWarningModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-kalvium-text/40 dark:bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white dark:bg-kalvium-dark-surface p-6 sm:p-8 text-kalvium-text dark:text-kalvium-dark-text shadow-kalvium-lg border border-kalvium-border dark:border-kalvium-dark-border"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-kalvium-warning-tint dark:bg-kalvium-dark-warning-tint text-kalvium-warning border border-kalvium-warning-border dark:border-kalvium-dark-warning-border">
                  <AlertTriangle size={20} />
                </span>
                <div>
                  <span className="text-[11px] font-semibold tracking-wider text-kalvium-warning uppercase block">
                    Schedule Conflict Detected
                  </span>
                  <h3 className="font-display text-xl font-bold text-kalvium-text dark:text-kalvium-dark-text tracking-tight">
                    Schedule Clash Warning
                  </h3>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-kalvium-muted hover:text-kalvium-text dark:hover:text-kalvium-dark-text p-1.5 rounded-full hover:bg-kalvium-surface-alt dark:hover:bg-kalvium-dark-surface-alt transition"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <p className="mt-4 text-sm text-kalvium-muted dark:text-kalvium-dark-muted leading-relaxed">
              You are about to save an event that overlaps with an item already on your personal schedule:
            </p>

            {/* Overlapping Cards */}
            <div className="mt-5 space-y-3">
              {/* Conflicting Event */}
              <div className="rounded-xl border border-kalvium-border dark:border-kalvium-dark-border bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt p-4">
                <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-kalvium-muted dark:text-kalvium-dark-muted block mb-1">
                  Already Saved Event
                </span>
                <p className="font-display text-sm sm:text-base font-semibold text-kalvium-text dark:text-kalvium-dark-text mb-1.5">
                  {conflictingEvent.title}
                </p>
                <div className="flex items-center gap-3 text-xs text-kalvium-muted dark:text-kalvium-dark-muted flex-wrap">
                  <span className="flex items-center gap-1.5 text-kalvium-warning font-medium bg-kalvium-warning-tint dark:bg-kalvium-dark-warning-tint px-2.5 py-0.5 rounded-full border border-kalvium-warning-border dark:border-kalvium-dark-warning-border">
                    <Clock size={12} />
                    {conflictingEvent.startTime} – {conflictingEvent.endTime}
                  </span>
                  {conflictingEvent.venue && (
                    <span className="flex items-center gap-1">
                      <MapPin size={12} className="text-kalvium-muted" />
                      {conflictingEvent.venue}
                    </span>
                  )}
                </div>
              </div>

              {/* Event Being Saved */}
              <div className="rounded-xl border border-kalvium-coral/30 bg-kalvium-coral-tint dark:bg-kalvium-dark-coral-tint p-4">
                <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-kalvium-coral block mb-1">
                  Event You Are Saving
                </span>
                <p className="font-display text-sm sm:text-base font-semibold text-kalvium-text dark:text-kalvium-dark-text mb-1.5">
                  {currentEvent.title}
                </p>
                <div className="flex items-center gap-3 text-xs text-kalvium-text dark:text-kalvium-dark-text flex-wrap">
                  <span className="flex items-center gap-1.5 text-white font-medium bg-kalvium-coral px-2.5 py-0.5 rounded-full">
                    <Clock size={12} />
                    {currentEvent.startTime} – {currentEvent.endTime}
                  </span>
                  {currentEvent.venue && (
                    <span className="flex items-center gap-1 text-kalvium-muted dark:text-kalvium-dark-muted">
                      <MapPin size={12} className="text-kalvium-muted" />
                      {currentEvent.venue}
                    </span>
                  )}
                </div>
              </div>

              {/* Overlap Window Badge */}
              <div className="flex items-center justify-between rounded-xl border border-kalvium-warning-border dark:border-kalvium-dark-warning-border bg-kalvium-warning-tint dark:bg-kalvium-dark-warning-tint px-4 py-2.5 text-xs text-kalvium-warning">
                <span className="flex items-center gap-2 font-medium">
                  <span className="h-2 w-2 rounded-full bg-kalvium-warning animate-pulse" />
                  Direct Overlap Window:
                </span>
                <span className="font-sans font-bold">
                  {overlapStr}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="rounded-full border border-kalvium-border dark:border-kalvium-dark-border px-5 py-2.5 text-xs sm:text-sm font-semibold text-kalvium-muted dark:text-kalvium-dark-muted hover:text-kalvium-text dark:hover:text-kalvium-dark-text hover:bg-kalvium-surface-alt dark:hover:bg-kalvium-dark-surface-alt transition active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onConfirmSave();
                  onClose();
                }}
                className="rounded-full bg-kalvium-coral hover:bg-kalvium-coral-hover px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition active:scale-95"
              >
                Save Anyway
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
