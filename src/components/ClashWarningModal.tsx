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
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className="relative w-full max-w-lg overflow-hidden bg-white border-4 border-black shadow-[8px_8px_0px_0px_black] rounded-none p-6 sm:p-8 text-black"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b-4 border-black pb-4 mb-4">
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center bg-bauhaus-yellow border-2 border-black">
                  <AlertTriangle size={24} strokeWidth={3} className="text-black" />
                </span>
                <div>
                  <span className="text-xs font-black tracking-widest text-bauhaus-red uppercase block">
                    Conflict Detected
                  </span>
                  <h3 className="font-display text-2xl font-black text-black tracking-tight uppercase">
                    Schedule Clash
                  </h3>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-black border-2 border-transparent hover:border-black p-1 transition"
                aria-label="Close"
              >
                <X size={24} strokeWidth={3} />
              </button>
            </div>

            <p className="text-sm font-bold uppercase tracking-widest mb-6">
              You are about to save an event that overlaps with an item already on your personal schedule:
            </p>

            {/* Overlapping Cards */}
            <div className="space-y-4">
              {/* Conflicting Event */}
              <div className="border-4 border-black bg-gray-100 p-4 relative">
                <div className="absolute top-0 right-0 bg-black text-white text-[10px] font-black uppercase tracking-widest px-2 py-1">
                  Already Saved
                </div>
                <p className="font-display text-lg font-black text-black uppercase mb-2 pr-24 line-clamp-1">
                  {conflictingEvent.title}
                </p>
                <div className="flex items-center gap-4 text-sm font-bold uppercase tracking-widest flex-wrap">
                  <span className="flex items-center gap-2 bg-bauhaus-yellow border-2 border-black px-2 py-1">
                    <Clock size={16} strokeWidth={3} />
                    {conflictingEvent.startTime} – {conflictingEvent.endTime}
                  </span>
                  {conflictingEvent.venue && (
                    <span className="flex items-center gap-1 border-b-2 border-black">
                      <MapPin size={16} strokeWidth={3} />
                      {conflictingEvent.venue}
                    </span>
                  )}
                </div>
              </div>

              {/* Event Being Saved */}
              <div className="border-4 border-bauhaus-red bg-white p-4 relative">
                <div className="absolute top-0 right-0 bg-bauhaus-red text-white text-[10px] font-black uppercase tracking-widest px-2 py-1">
                  Saving Now
                </div>
                <p className="font-display text-lg font-black text-black uppercase mb-2 pr-24 line-clamp-1">
                  {currentEvent.title}
                </p>
                <div className="flex items-center gap-4 text-sm font-bold uppercase tracking-widest flex-wrap">
                  <span className="flex items-center gap-2 bg-bauhaus-red text-white border-2 border-bauhaus-red px-2 py-1">
                    <Clock size={16} strokeWidth={3} />
                    {currentEvent.startTime} – {currentEvent.endTime}
                  </span>
                  {currentEvent.venue && (
                    <span className="flex items-center gap-1 border-b-2 border-black">
                      <MapPin size={16} strokeWidth={3} />
                      {currentEvent.venue}
                    </span>
                  )}
                </div>
              </div>

              {/* Overlap Window Badge */}
              <div className="flex items-center justify-between border-4 border-black bg-bauhaus-yellow px-4 py-3 font-bold uppercase tracking-widest text-black">
                <span className="flex items-center gap-3">
                  <span className="h-3 w-3 bg-black animate-pulse" />
                  Direct Overlap:
                </span>
                <span>
                  {overlapStr}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex items-center justify-end gap-4 border-t-4 border-black pt-6">
              <button
                onClick={onClose}
                className="btn-bauhaus-ghost px-6 py-3"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onConfirmSave();
                  onClose();
                }}
                className="btn-bauhaus px-6 py-3 text-white"
                style={{ backgroundColor: "#D02020" }} // Red button for action
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
