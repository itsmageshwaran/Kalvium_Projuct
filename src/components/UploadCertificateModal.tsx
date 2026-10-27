"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Award,
  UploadCloud,
  FileText,
  Trophy,
  Users,
  Plus,
  Trash2,
  CheckCircle2,
  Image as ImageIcon,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/components/Toast";

interface Teammate {
  name: string;
  email?: string;
  role?: string;
}

export const AWARD_PRESETS = [
  "🥇 1st Place / Winner",
  "🥈 2nd Place / Runner-up",
  "🥉 3rd Place / Bronze",
  "🏆 Champion / Gold Medal",
  "⭐ MVP / Best Performer",
  "💃 Best Choreography / Dance",
  "⚽ Top Scorer / Best Player",
  "💡 Best Innovation / Pitch",
  "🎖️ Special Jury Mention",
];

interface UploadCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventTitle: string;
  eventDate?: string;
  eventVenue?: string;
  onSuccess?: () => void;
}

export default function UploadCertificateModal({
  isOpen,
  onClose,
  eventId,
  eventTitle,
  eventDate,
  eventVenue,
  onSuccess,
}: UploadCertificateModalProps) {
  const { success, error: toastError } = useToast();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [hasExisting, setHasExisting] = useState(false);

  // Form State
  const [certificateFile, setCertificateFile] = useState<string>("");
  const [certificateFileName, setCertificateFileName] = useState<string>("");
  const [certificateType, setCertificateType] = useState<string>("PARTICIPATION");

  const [hasWonPrize, setHasWonPrize] = useState(false);
  const [awardTitle, setAwardTitle] = useState("");
  const [awardPhoto, setAwardPhoto] = useState<string>("");

  const [isTeamEvent, setIsTeamEvent] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [teammates, setTeammates] = useState<Teammate[]>([]);
  const [projectTitle, setProjectTitle] = useState("");
  const [projectUrl, setProjectUrl] = useState("");
  const [notes, setNotes] = useState("");

  const certInputRef = useRef<HTMLInputElement>(null);
  const awardPhotoInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Load existing participation if present
  useEffect(() => {
    if (!isOpen || !eventId) return;
    loadExistingParticipation();
  }, [isOpen, eventId]);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll while modal is open to prevent background page scroll
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Gently forward wheel scrolling from fixed header/footer into the scrollable body without calling preventDefault
  const handleOuterWheel = (e: React.WheelEvent) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop += e.deltaY;
    }
  };

  const loadExistingParticipation = async () => {
    resetForm();
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/participation`);
      if (res.ok) {
        const data = await res.json();
        if (data.hasSubmitted && data.participation) {
          const p = data.participation;
          setHasExisting(true);
          setCertificateFile(p.certificateUrl || "");
          setCertificateType(p.certificateType || "PARTICIPATION");
          setHasWonPrize(Boolean(p.hasWonPrize));
          setAwardTitle(p.awardTitle || "");
          setAwardPhoto(p.awardPhotoUrl || "");
          setIsTeamEvent(Boolean(p.isTeamEvent));
          setTeamName(p.teamName || "");
          setTeammates(Array.isArray(p.teammates) ? p.teammates : []);
          setProjectTitle(p.projectTitle || "");
          setProjectUrl(p.projectUrl || "");
          setNotes(p.notes || "");
          if (p.certificateUrl) {
            setCertificateFileName("Current Certificate on File");
          }
        } else {
          resetForm();
        }
      }
    } catch (err) {
      console.error("Error loading existing participation:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setHasExisting(false);
    setCertificateFile("");
    setCertificateFileName("");
    setCertificateType("PARTICIPATION");
    setHasWonPrize(false);
    setAwardTitle("");
    setAwardPhoto("");
    setIsTeamEvent(false);
    setTeamName("");
    setTeammates([]);
    setProjectTitle("");
    setProjectUrl("");
    setNotes("");
  };

  const handleCertFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      toastError("File size exceeds 8MB. Please upload a smaller image or compressed PDF.");
      return;
    }

    setCertificateFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setCertificateFile(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAwardPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      toastError("Award photo exceeds 8MB. Please upload a smaller image.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAwardPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const addTeammate = () => {
    setTeammates([...teammates, { name: "", email: "", role: "" }]);
  };

  const updateTeammate = (index: number, field: keyof Teammate, value: string) => {
    const updated = [...teammates];
    updated[index][field] = value;
    setTeammates(updated);
  };

  const removeTeammate = (index: number) => {
    setTeammates(teammates.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!certificateFile && !awardPhoto && !hasWonPrize) {
      toastError("Please upload your certificate or award proof to submit.");
      return;
    }

    if (hasWonPrize && !awardTitle.trim()) {
      toastError("Please enter your award or prize title (e.g. 1st Place Winner).");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/events/${eventId}/participation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          certificateFile,
          certificateType,
          hasWonPrize,
          awardTitle,
          awardPhoto,
          isTeamEvent,
          teamName,
          teammates: teammates.filter((t) => t.name.trim().length > 0),
          projectTitle,
          projectUrl,
          notes,
        }),
      });

      if (res.ok) {
        success(
          hasExisting
            ? "✓ Certificate and participation credentials updated!"
            : "✓ Certificate uploaded! Added to event showcase."
        );
        onSuccess?.();
        onClose();
      } else {
        const data = await res.json();
        toastError(data.error || "Failed to upload certificate.");
      }
    } catch {
      toastError("Network error while uploading certificate.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to remove your uploaded certificate and participation showcase?")) {
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(`/api/events/${eventId}/participation`, {
        method: "DELETE",
      });
      if (res.ok) {
        success("Participation submission deleted.");
        resetForm();
        onSuccess?.();
        onClose();
      } else {
        const data = await res.json();
        toastError(data.error || "Failed to remove submission.");
      }
    } catch {
      toastError("Network error while removing submission.");
    } finally {
      setDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 overflow-hidden"
        data-lenis-prevent="true"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          onClick={(e) => e.stopPropagation()}
          data-lenis-prevent="true"
          data-lenis-prevent-wheel="true"
          className="relative w-full max-w-2xl bg-white dark:bg-kalvium-dark-surface rounded-3xl shadow-2xl border border-kalvium-border dark:border-kalvium-dark-border overflow-hidden z-10 my-auto max-h-[90vh] flex flex-col modal-scroll-container"
        >
          {/* Header */}
          <div
            onWheel={handleOuterWheel}
            className="flex items-center justify-between p-5 sm:p-6 border-b border-kalvium-border dark:border-kalvium-dark-border bg-kalvium-surface-alt/50 dark:bg-kalvium-dark-surface-alt/30 shrink-0 select-none"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-kalvium-coral/10 text-kalvium-coral flex items-center justify-center shrink-0 border border-kalvium-coral/20">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-kalvium-text dark:text-kalvium-dark-text">
                  {hasExisting ? "Edit Participation & Certificate" : "Upload Event Certificate"}
                </h3>
                <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted truncate max-w-md">
                  {eventTitle}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-kalvium-muted hover:text-kalvium-text hover:bg-kalvium-surface-alt dark:hover:bg-kalvium-dark-surface-alt transition active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content - Smooth native scrollable container with Lenis prevention */}
          <div
            ref={scrollContainerRef}
            className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-6 focus:outline-none modal-scroll-container"
            data-lenis-prevent="true"
            data-lenis-prevent-wheel="true"
            tabIndex={0}
            style={{ overscrollBehavior: "contain", WebkitOverflowScrolling: "touch", touchAction: "pan-y" }}
          >
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-8 h-8 rounded-full border-2 border-kalvium-coral border-t-transparent animate-spin" />
                <p className="text-xs text-kalvium-muted">Loading your participation details…</p>
              </div>
            ) : (
              <form id="participation-form" onSubmit={handleSubmit} className="space-y-6">
                {/* Event Summary Pill */}
                <div className="p-3.5 rounded-2xl bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border text-xs flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-kalvium-text dark:text-kalvium-dark-text block truncate max-w-sm">
                      {eventTitle}
                    </span>
                    <span className="text-kalvium-muted text-[11px]">
                      {eventDate} {eventVenue ? `• ${eventVenue}` : ""}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-kalvium-success-tint dark:bg-kalvium-dark-success-tint text-kalvium-success font-semibold text-[11px] flex items-center gap-1 border border-kalvium-success/20">
                    <ShieldCheck size={12} />
                    Verified Campus Record
                  </span>
                </div>

                {/* 1. Certificate Upload Box */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-kalvium-text dark:text-kalvium-dark-text flex items-center gap-1.5">
                      <FileText size={14} className="text-kalvium-coral" />
                      <span>Certificate Document (PDF or Image) *</span>
                    </label>
                    <select
                      value={certificateType}
                      onChange={(e) => setCertificateType(e.target.value)}
                      className="text-xs px-2.5 py-1 rounded-lg bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border text-kalvium-text dark:text-kalvium-dark-text focus:outline-none focus:ring-1 focus:ring-kalvium-coral font-medium"
                    >
                      <option value="PARTICIPATION">Certificate of Participation</option>
                      <option value="WINNER">🥇 Winner / 1st Place Trophy</option>
                      <option value="RUNNER_UP">🥈 Runner-Up / 2nd Place</option>
                      <option value="THIRD_PLACE">🥉 3rd Place / Bronze</option>
                      <option value="MERIT">⭐ Certificate of Merit / Excellence</option>
                      <option value="SPECIAL_RECOGNITION">🎖️ Special Recognition / MVP</option>
                      <option value="COMPLETION">📜 Certificate of Completion</option>
                      <option value="APPRECIATION">👏 Certificate of Appreciation</option>
                    </select>
                  </div>

                  <input
                    ref={certInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleCertFileChange}
                    className="hidden"
                  />

                  {certificateFile ? (
                    <div className="p-4 rounded-2xl border border-kalvium-success/30 bg-kalvium-success-tint/20 dark:bg-kalvium-dark-success-tint/10 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 rounded-xl bg-kalvium-success/10 text-kalvium-success flex items-center justify-center shrink-0 border border-kalvium-success/20">
                          {certificateFile.includes("pdf") ? (
                            <FileText size={20} />
                          ) : (
                            <ImageIcon size={20} />
                          )}
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-bold text-kalvium-text dark:text-kalvium-dark-text truncate">
                            {certificateFileName || "Uploaded Certificate"}
                          </p>
                          <p className="text-[11px] text-kalvium-success font-medium flex items-center gap-1">
                            <CheckCircle2 size={12} /> Ready for verification
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => certInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-kalvium-dark-surface border border-kalvium-border hover:border-kalvium-coral transition active:scale-95"
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCertificateFile("");
                            setCertificateFileName("");
                          }}
                          className="p-1.5 rounded-lg text-kalvium-muted hover:text-kalvium-coral hover:bg-kalvium-coral/10 transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => certInputRef.current?.click()}
                      className="border-2 border-dashed border-kalvium-border dark:border-kalvium-dark-border hover:border-kalvium-coral dark:hover:border-kalvium-coral rounded-2xl p-6 text-center cursor-pointer transition bg-kalvium-surface-alt/30 hover:bg-kalvium-coral/5 group"
                    >
                      <UploadCloud className="w-8 h-8 mx-auto text-kalvium-muted group-hover:text-kalvium-coral transition mb-2" />
                      <p className="text-xs font-bold text-kalvium-text dark:text-kalvium-dark-text">
                        Click or drag your Certificate here
                      </p>
                      <p className="text-[11px] text-kalvium-muted mt-1">
                        Supports PDF, PNG, JPG, or WEBP up to 8MB
                      </p>
                    </div>
                  )}
                </div>

                {/* 2. Prize & Award Winner Toggle */}
                <div className="p-4 rounded-2xl border border-kalvium-border dark:border-kalvium-dark-border bg-kalvium-surface-alt/40 dark:bg-kalvium-dark-surface-alt/20 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
                        <Trophy size={16} />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-kalvium-text dark:text-kalvium-dark-text block">
                          Did you win a prize, medal, or placement in this event?
                        </span>
                        <span className="text-[11px] text-kalvium-muted">
                          Showcase your trophy, medal, placement, or special award across sports, dance, and competitions
                        </span>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasWonPrize}
                        onChange={(e) => setHasWonPrize(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-kalvium-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-kalvium-coral" />
                    </label>
                  </div>

                  {hasWonPrize && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-4 pt-2 border-t border-kalvium-border dark:border-kalvium-dark-border"
                    >
                      {/* Award Title */}
                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-kalvium-muted block mb-1.5">
                          Award Title / Placement *
                        </label>
                        <div className="flex flex-wrap gap-1.5 mb-2.5">
                          {AWARD_PRESETS.map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setAwardTitle(preset)}
                              className={`text-[11px] py-1 px-2.5 rounded-lg font-medium border text-center transition ${
                                awardTitle === preset
                                  ? "bg-kalvium-coral text-white border-kalvium-coral shadow-sm"
                                  : "bg-white dark:bg-kalvium-dark-surface text-kalvium-text dark:text-kalvium-dark-text border-kalvium-border hover:border-kalvium-coral"
                              }`}
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                        <input
                          type="text"
                          value={awardTitle}
                          onChange={(e) => setAwardTitle(e.target.value)}
                          placeholder="e.g. 1st Place Winner, Best Solo Dancer, MVP - Football Finals, Best Innovation, Runner-up"
                          className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border text-kalvium-text dark:text-kalvium-dark-text focus:outline-none focus:ring-1 focus:ring-kalvium-coral"
                        />
                      </div>

                      {/* Optional Award Photo */}
                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-kalvium-muted block mb-1.5">
                          Trophy / Medal / Podium / Celebration Photo (Optional)
                        </label>
                        <input
                          ref={awardPhotoInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleAwardPhotoChange}
                          className="hidden"
                        />
                        {awardPhoto ? (
                          <div className="relative rounded-2xl overflow-hidden border border-kalvium-border w-32 h-24 group">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={awardPhoto}
                              alt="Award"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => awardPhotoInputRef.current?.click()}
                                className="p-1 rounded-md bg-white text-kalvium-text text-[10px] font-bold"
                              >
                                Change
                              </button>
                              <button
                                type="button"
                                onClick={() => setAwardPhoto("")}
                                className="p-1 rounded-md bg-kalvium-coral text-white text-[10px]"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => awardPhotoInputRef.current?.click()}
                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-kalvium-dark-surface border border-kalvium-border hover:border-kalvium-coral transition active:scale-95"
                          >
                            <ImageIcon size={14} className="text-amber-500" />
                            <span>Upload Trophy / Celebration Photo</span>
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* 3. Team / Squad / Group Entry Toggle */}
                <div className="p-4 rounded-2xl border border-kalvium-border dark:border-kalvium-dark-border bg-kalvium-surface-alt/40 dark:bg-kalvium-dark-surface-alt/20 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
                        <Users size={16} />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-kalvium-text dark:text-kalvium-dark-text block">
                          Was this a Team, Squad, Crew, or Group Entry?
                        </span>
                        <span className="text-[11px] text-kalvium-muted">
                          For dance crews, sports teams, hackathon squads, bands, or group competitions
                        </span>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isTeamEvent}
                        onChange={(e) => setIsTeamEvent(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-kalvium-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-kalvium-coral" />
                    </label>
                  </div>

                  {isTeamEvent && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-4 pt-2 border-t border-kalvium-border dark:border-kalvium-dark-border"
                    >
                      {/* Team Name */}
                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-kalvium-muted block mb-1.5">
                          Team / Squad / Crew / Band Name
                        </label>
                        <input
                          type="text"
                          value={teamName}
                          onChange={(e) => setTeamName(e.target.value)}
                          placeholder="e.g. Rhythm Rebels (Dance), Kalvium Strikers (Football), Team Apex (Hackathon), SoundWave (Band)"
                          className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border text-kalvium-text dark:text-kalvium-dark-text focus:outline-none focus:ring-1 focus:ring-kalvium-coral"
                        />
                      </div>

                      {/* Teammates List */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold uppercase tracking-wider text-kalvium-muted block">
                            Teammates &amp; Crew Members
                          </label>
                          <button
                            type="button"
                            onClick={addTeammate}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-kalvium-coral hover:underline"
                          >
                            <Plus size={12} />
                            <span>Add Member</span>
                          </button>
                        </div>

                        {teammates.length === 0 ? (
                          <p className="text-xs text-kalvium-muted italic">
                            No team members added yet. Click &ldquo;Add Member&rdquo; above.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {teammates.map((mate, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border text-xs"
                              >
                                <input
                                  type="text"
                                  value={mate.name}
                                  onChange={(e) => updateTeammate(idx, "name", e.target.value)}
                                  placeholder="Full Name *"
                                  className="flex-1 px-2.5 py-1.5 rounded-lg bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border text-xs text-kalvium-text dark:text-kalvium-dark-text"
                                />
                                <input
                                  type="text"
                                  value={mate.role || ""}
                                  onChange={(e) => updateTeammate(idx, "role", e.target.value)}
                                  placeholder="Role (e.g. Lead Dancer, Striker, Captain, Frontend, Vocals)"
                                  className="w-48 sm:w-60 px-2.5 py-1.5 rounded-lg bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border text-xs text-kalvium-text dark:text-kalvium-dark-text"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeTeammate(idx)}
                                  className="p-1.5 rounded-lg text-kalvium-muted hover:text-kalvium-coral transition"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Performance / Project Title & Link */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-bold uppercase tracking-wider text-kalvium-muted block mb-1">
                            Routine / Match / Project / Entry Title (Optional)
                          </label>
                          <input
                            type="text"
                            value={projectTitle}
                            onChange={(e) => setProjectTitle(e.target.value)}
                            placeholder="e.g. Hip-Hop Showcase 2026, Finals vs SRM (3-1), Kalvium Web App"
                            className="w-full text-xs px-3.5 py-2 rounded-xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border text-kalvium-text dark:text-kalvium-dark-text"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold uppercase tracking-wider text-kalvium-muted block mb-1">
                            Video / Performance / Demo / Highlights Link (Optional)
                          </label>
                          <input
                            type="url"
                            value={projectUrl}
                            onChange={(e) => setProjectUrl(e.target.value)}
                            placeholder="e.g. YouTube video, Instagram Reel, Drive link, or GitHub repo"
                            className="w-full text-xs px-3.5 py-2 rounded-xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border text-kalvium-text dark:text-kalvium-dark-text"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-kalvium-muted block mb-1.5">
                    Highlights &amp; Reflections (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder="Share your highlights, favorite moments, performance memories, match score, or key takeaways..."
                    className="w-full text-xs p-3 rounded-2xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border text-kalvium-text dark:text-kalvium-dark-text focus:outline-none focus:ring-1 focus:ring-kalvium-coral"
                  />
                </div>
              </form>
            )}
          </div>

          {/* Footer Actions */}
          <div
            onWheel={handleOuterWheel}
            className="p-4 sm:p-6 border-t border-kalvium-border dark:border-kalvium-dark-border bg-kalvium-surface-alt/50 dark:bg-kalvium-dark-surface-alt/30 flex items-center justify-between gap-3 shrink-0 select-none"
          >
            {hasExisting ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting || submitting}
                className="px-4 py-2.5 rounded-full text-xs font-bold text-kalvium-coral hover:bg-kalvium-coral/10 transition active:scale-95 disabled:opacity-50"
              >
                {deleting ? "Removing…" : "Remove Submission"}
              </button>
            ) : (
              <span className="text-[11px] text-kalvium-muted">
                Credited directly to your student portfolio
              </span>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-5 py-2.5 rounded-full text-xs font-semibold bg-white dark:bg-kalvium-dark-surface text-kalvium-muted border border-kalvium-border hover:bg-kalvium-surface-alt transition active:scale-95"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="participation-form"
                disabled={submitting || loading}
                className="px-6 py-2.5 rounded-full text-xs font-bold bg-kalvium-coral text-white hover:bg-kalvium-coral-hover transition active:scale-95 shadow-md shadow-kalvium-coral/20 flex items-center gap-2 disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Saving Credentials…</span>
                  </>
                ) : (
                  <>
                    <Award size={14} />
                    <span>{hasExisting ? "Save Changes" : "Submit Credentials"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
