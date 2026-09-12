"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Clock,
  FileCheck,
  Info,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { SAMPLE_POSTERS, ConfidenceLevel } from "@/lib/ai-poster-analyzer";

const CATEGORIES = [
  "Workshop",
  "Hackathon",
  "Cultural",
  "Technical",
  "Sports",
  "Seminar",
  "Competition",
  "Fest",
];

interface CreateEventStudioProps {
  onComplete?: () => void;
}

export default function CreateEventStudio({ onComplete }: CreateEventStudioProps) {
  const { user } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<"UPLOAD" | "ANALYZING" | "REVIEW">("UPLOAD");
  const [analyzingStepIndex, setAnalyzingStepIndex] = useState(0);

  // Poster Image state
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);

  // Extracted Event state
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    startTime: "",
    endTime: "",
    venue: "",
    organizerName: "",
    category: "Workshop",
    summary: "",
    description: "",
    tags: "",
    registrationUrl: "",
    contactInfo: "",
  });

  const [confidences, setConfidences] = useState<Record<string, ConfidenceLevel>>({});
  const [duplicateWarning, setDuplicateWarning] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const analyzingSteps = [
    "Reading event poster typography & imagery...",
    "Extracting calendar dates and time windows...",
    "Identifying campus venue and room numbers...",
    "Verifying organizer affiliations...",
    "Generating anti-hallucinated description & tags...",
  ];

  // Handle Drag & Drop / File Input
  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (JPG, PNG, WebP).");
      return;
    }

    setPosterFile(file);
    setSelectedSampleId(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setPosterPreview(base64);
      startAnalysis({ imageData: base64, mimeType: file.type });
    };
    reader.readAsDataURL(file);
  };

  // Handle 1-click Sample Poster selection
  const handleSelectSample = (sample: (typeof SAMPLE_POSTERS)[0]) => {
    setSelectedSampleId(sample.id);
    setPosterFile(null);
    setPosterPreview(sample.previewUrl);
    startAnalysis({ sampleId: sample.id, posterUrl: sample.previewUrl });
  };

  // Trigger AI Analysis
  const startAnalysis = async (payload: {
    sampleId?: string;
    imageData?: string;
    mimeType?: string;
    posterUrl?: string;
  }) => {
    setStep("ANALYZING");
    setAnalyzingStepIndex(0);
    setErrorMsg(null);

    const interval = setInterval(() => {
      setAnalyzingStepIndex((prev) => {
        if (prev < analyzingSteps.length - 1) return prev + 1;
        return prev;
      });
    }, 600);

    try {
      const res = await fetch("/api/ai/analyze-poster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      clearInterval(interval);

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "AI analysis failed");
      }

      const data = await res.json();
      const extracted = data.extractedData;

      setFormData({
        title: extracted.title || "",
        date: extracted.date || "",
        startTime: extracted.startTime || "",
        endTime: extracted.endTime || "",
        venue: extracted.venue || "",
        organizerName: extracted.organizerName || user?.name || "",
        category: extracted.category || "Technical",
        summary: extracted.summary || "",
        description: extracted.description || "",
        tags: Array.isArray(extracted.tags) ? extracted.tags.join(", ") : extracted.tags || "",
        registrationUrl: extracted.registrationUrl || "",
        contactInfo: extracted.contactInfo || "",
      });

      setConfidences(extracted.confidences || {});
      setDuplicateWarning(data.duplicateCheck?.hasPotentialDuplicate ? data.duplicateCheck : null);
      setStep("REVIEW");
    } catch (err: any) {
      clearInterval(interval);
      setErrorMsg(err.message || "Could not analyze poster. Please enter details manually.");
      setStep("REVIEW");
    }
  };

  // Submit for Manager Verification
  const handleSubmitForVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/organizer/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          posterUrl: posterPreview,
          confidences,
          duplicatesDetected: duplicateWarning,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Submission failed");
      }

      if (onComplete) {
        setStep("UPLOAD");
        setPosterPreview(null);
        setPosterFile(null);
        onComplete();
      } else {
        router.push("/dashboard/organizer");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit event. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* STAGE 1: UPLOAD POSTER */}
      {step === "UPLOAD" && (
        <div className="space-y-10 animate-fade-in">
          {/* Dropzone Container */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFile(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            className="group relative border-2 border-dashed border-kalvium-border dark:border-kalvium-dark-border hover:border-kalvium-coral dark:hover:border-kalvium-coral bg-white dark:bg-kalvium-dark-surface rounded-3xl p-10 text-center transition-all duration-300 cursor-pointer overflow-hidden shadow-kalvium-sm hover:shadow-kalvium-md active:scale-[0.995]"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFile(e.target.files[0]);
                }
              }}
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="hidden"
            />

            <div className="relative z-10 w-16 h-16 rounded-2xl bg-kalvium-coral-tint dark:bg-kalvium-dark-coral-tint border border-kalvium-coral/20 text-kalvium-coral flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-all duration-300 shadow-sm">
              <Upload className="w-7 h-7 group-hover:-translate-y-0.5 transition-transform duration-300" />
            </div>

            <h3 className="relative z-10 text-xl font-display font-bold text-kalvium-text dark:text-kalvium-dark-text mb-1 tracking-tight">
              Drop your event poster here
            </h3>
            <p className="relative z-10 text-sm text-kalvium-muted dark:text-kalvium-dark-muted mb-4">
              or <span className="text-kalvium-coral font-semibold underline underline-offset-2">browse from your computer</span>
            </p>
            <p className="relative z-10 text-xs text-kalvium-muted uppercase tracking-wider font-sans font-semibold">
              SUPPORTS JPG, JPEG, PNG, WEBP (UP TO 10MB)
            </p>
          </div>

          {/* Quick 1-Click Sample Posters Carousel */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-display font-bold uppercase tracking-wider text-kalvium-text dark:text-kalvium-dark-text">
                  Or Test with Sample Campus Posters (1-Click AI Demo)
                </h3>
                <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted">
                  Select any prepared campus poster to see real AI extraction, confidence scores, and clash scenarios.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {SAMPLE_POSTERS.map((sample, idx) => (
                <div
                  key={sample.id}
                  onClick={() => handleSelectSample(sample)}
                  className={`group relative rounded-2xl overflow-hidden bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border hover:border-kalvium-coral/50 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-kalvium-md active:scale-95 animate-slide-up stagger-${(idx % 4) + 1}`}
                >
                  <div className="aspect-[4/3] w-full overflow-hidden bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt">
                    <img
                      src={sample.previewUrl}
                      alt={sample.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 will-change-transform"
                    />
                  </div>
                  <div className="p-3.5">
                    <span className="text-[10px] font-sans uppercase tracking-wider font-bold text-kalvium-coral block mb-1">
                      {sample.category}
                    </span>
                    <h4 className="text-xs font-bold text-kalvium-text dark:text-kalvium-dark-text group-hover:text-kalvium-coral line-clamp-1 transition-colors">
                      {sample.name}
                    </h4>
                    <span className="text-[11px] text-kalvium-muted group-hover:text-kalvium-coral block mt-1 transition-colors">
                      Click to analyze with AI →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STAGE 2: AI ANALYZING ANIMATION */}
      {step === "ANALYZING" && (
        <div className="py-12 text-center max-w-lg mx-auto animate-scale-in">
          {/* Scanner Poster Preview */}
          {posterPreview ? (
            <div className="relative mx-auto w-48 aspect-[3/4] rounded-2xl overflow-hidden border border-kalvium-border dark:border-kalvium-dark-border shadow-kalvium-md mb-6 bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt">
              <img
                src={posterPreview}
                alt="Scanning poster"
                className="w-full h-full object-cover opacity-90"
              />
              <div className="laser-scan-line" />
              <div className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full text-[10px] font-sans font-bold uppercase bg-white/90 dark:bg-kalvium-dark-surface/90 text-kalvium-coral border border-kalvium-coral/30">
                AI SCANNING
              </div>
            </div>
          ) : (
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="relative w-full h-full rounded-full bg-kalvium-coral-tint dark:bg-kalvium-dark-coral-tint border-2 border-kalvium-coral flex items-center justify-center shadow-kalvium-md">
                <Sparkles className="w-8 h-8 text-kalvium-coral animate-spin" />
              </div>
            </div>
          )}

          <h2 className="text-2xl font-display font-bold text-kalvium-text dark:text-kalvium-dark-text mb-2 tracking-tight">
            Analyzing Your Event Poster...
          </h2>
          <p className="text-sm font-medium text-kalvium-coral mb-6 h-6 flex items-center justify-center animate-fade-in">
            {analyzingSteps[analyzingStepIndex]}
          </p>

          <div className="space-y-2.5 text-left bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border rounded-2xl p-5 text-xs text-kalvium-text dark:text-kalvium-dark-text shadow-kalvium-sm">
            {analyzingSteps.map((s, idx) => (
              <div
                key={s}
                className={`flex items-center gap-2.5 transition-all duration-300 ${
                  idx <= analyzingStepIndex
                    ? "opacity-100 text-kalvium-text dark:text-kalvium-dark-text translate-x-0"
                    : "opacity-40 text-kalvium-muted translate-x-1"
                }`}
              >
                {idx < analyzingStepIndex ? (
                  <CheckCircle2 className="w-4 h-4 text-kalvium-success shrink-0" />
                ) : idx === analyzingStepIndex ? (
                  <div className="w-4 h-4 rounded-full border-2 border-kalvium-coral border-t-transparent animate-spin shrink-0"></div>
                ) : (
                  <div className="w-4 h-4 rounded-full bg-kalvium-border dark:bg-kalvium-dark-border shrink-0"></div>
                )}
                <span className={idx === analyzingStepIndex ? "font-semibold text-kalvium-coral" : ""}>
                  {s}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STAGE 3: AI GENERATED RESULT & REVIEW */}
      {step === "REVIEW" && (
        <div className="animate-fade-in space-y-8">
          {/* Top Review Bar */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border shadow-kalvium-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-kalvium-coral-tint dark:bg-kalvium-dark-coral-tint text-kalvium-coral flex items-center justify-center font-bold">
                <FileCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-kalvium-text dark:text-kalvium-dark-text">Review AI-Generated Event Details</h3>
                <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted">
                  Inspect extracted fields, make any necessary adjustments, and submit for Campus Manager approval.
                </p>
              </div>
            </div>

            <button
              onClick={() => setStep("UPLOAD")}
              className="text-xs text-kalvium-muted hover:text-kalvium-text dark:hover:text-kalvium-dark-text flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-kalvium-border dark:border-kalvium-dark-border hover:bg-kalvium-surface-alt dark:hover:bg-kalvium-dark-surface-alt transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Upload Different Poster</span>
            </button>
          </div>

          {/* Duplicate Event Warning Banner if detected */}
          {duplicateWarning && (
            <div className="p-4 rounded-2xl bg-kalvium-warning-tint dark:bg-kalvium-dark-warning-tint border border-kalvium-warning-border dark:border-kalvium-dark-warning-border flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-kalvium-warning shrink-0 mt-0.5" />
              <div className="text-xs text-kalvium-warning">
                <p className="font-bold">Possible Duplicate Event Detected</p>
                <p className="mt-0.5 opacity-90">{duplicateWarning.reason}</p>
                <p className="text-[11px] mt-1 opacity-75">
                  You may still review and submit. The Campus Manager will also receive this duplicate advisory.
                </p>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 rounded-2xl bg-kalvium-coral-tint border border-kalvium-coral/30 text-xs text-kalvium-coral">
              {errorMsg}
            </div>
          )}

          {/* Side-By-Side Layout: Poster + Editable Form */}
          <form onSubmit={handleSubmitForVerification} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Original Poster Preview + AI Confidence Overview */}
            <div className="lg:col-span-5 space-y-6 animate-scale-in">
              <div className="rounded-2xl overflow-hidden bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border p-2 shadow-kalvium-sm group">
                <span className="text-[10px] font-sans text-kalvium-muted uppercase tracking-wider block mb-2 px-2 pt-1 font-bold">
                  Original Uploaded Poster Truth
                </span>
                {posterPreview && (
                  <img
                    src={posterPreview}
                    alt="Event Poster"
                    className="w-full h-auto rounded-xl object-cover max-h-[480px] transition-transform duration-500 group-hover:scale-[1.01]"
                  />
                )}
              </div>

              {/* Confidence Ratings Card */}
              <div className="p-5 rounded-2xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border space-y-3 shadow-kalvium-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-sans uppercase tracking-wider text-kalvium-muted font-bold">
                    Extraction Certainty Ratings
                  </span>
                  <span className="text-[11px] font-sans text-kalvium-coral font-bold uppercase tracking-wider">AI OCR ENGINE</span>
                </div>

                <div className="space-y-2 text-xs">
                  {Object.entries(confidences).map(([field, level]) => (
                    <div
                      key={field}
                      className="flex items-center justify-between py-1 border-b border-kalvium-border/40 dark:border-kalvium-dark-border/40 last:border-none"
                    >
                      <span className="capitalize text-kalvium-text dark:text-kalvium-dark-text font-medium">
                        {field.replace(/([A-Z])/g, " $1")}
                      </span>
                      {renderConfidenceBadge(level)}
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-kalvium-border dark:border-kalvium-dark-border text-[11px] text-kalvium-muted leading-relaxed flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-kalvium-coral shrink-0 mt-0.5" />
                  <span>
                    Confidence reflects optical clarity only. Campus Manager approval is required for authentic public listing.
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Editable Structured Form */}
            <div className="lg:col-span-7 space-y-5 bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border rounded-3xl p-6 shadow-kalvium-sm animate-slide-up stagger-1">
              <h3 className="text-base font-display font-bold text-kalvium-text dark:text-kalvium-dark-text border-b border-kalvium-border dark:border-kalvium-dark-border pb-3">
                Event Information
              </h3>

              {/* Event Title */}
              <div>
                <label className="block text-xs font-bold text-kalvium-muted dark:text-kalvium-dark-muted uppercase tracking-wider mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border rounded-xl px-4 py-2.5 text-sm text-kalvium-text dark:text-kalvium-dark-text focus:outline-none focus:border-kalvium-coral"
                />
              </div>

              {/* Date & Times Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-kalvium-muted dark:text-kalvium-dark-muted uppercase tracking-wider mb-1">
                    Date (YYYY-MM-DD) *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border rounded-xl px-3 py-2 text-sm text-kalvium-text dark:text-kalvium-dark-text focus:outline-none focus:border-kalvium-coral"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-kalvium-muted dark:text-kalvium-dark-muted uppercase tracking-wider mb-1">
                    Start Time *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10:00 AM"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border rounded-xl px-3 py-2 text-sm text-kalvium-text dark:text-kalvium-dark-text focus:outline-none focus:border-kalvium-coral"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-kalvium-muted dark:text-kalvium-dark-muted uppercase tracking-wider mb-1">
                    End Time *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 01:00 PM"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border rounded-xl px-3 py-2 text-sm text-kalvium-text dark:text-kalvium-dark-text focus:outline-none focus:border-kalvium-coral"
                  />
                </div>
              </div>

              {/* Venue & Category Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-kalvium-muted dark:text-kalvium-dark-muted uppercase tracking-wider mb-1">
                    Venue / Campus Location *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Innovation Lab 304"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    className="w-full bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border rounded-xl px-4 py-2.5 text-sm text-kalvium-text dark:text-kalvium-dark-text focus:outline-none focus:border-kalvium-coral"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-kalvium-muted dark:text-kalvium-dark-muted uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border rounded-xl px-3.5 py-2.5 text-sm text-kalvium-text dark:text-kalvium-dark-text focus:outline-none focus:border-kalvium-coral"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Organizer Name */}
              <div>
                <label className="block text-xs font-bold text-kalvium-muted dark:text-kalvium-dark-muted uppercase tracking-wider mb-1">
                  Organizer / Society Name
                </label>
                <input
                  type="text"
                  value={formData.organizerName}
                  onChange={(e) => setFormData({ ...formData, organizerName: e.target.value })}
                  placeholder="e.g. Robotics & AI Society"
                  className="w-full bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border rounded-xl px-4 py-2.5 text-sm text-kalvium-text dark:text-kalvium-dark-text focus:outline-none focus:border-kalvium-coral"
                />
              </div>

              {/* Summary */}
              <div>
                <label className="block text-xs font-bold text-kalvium-muted dark:text-kalvium-dark-muted uppercase tracking-wider mb-1">
                  1-2 Sentence Summary (Card Teaser)
                </label>
                <input
                  type="text"
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="Concise summary for student discovery cards"
                  className="w-full bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border rounded-xl px-4 py-2 text-sm text-kalvium-text dark:text-kalvium-dark-text focus:outline-none focus:border-kalvium-coral"
                />
              </div>

              {/* Full Description */}
              <div>
                <label className="block text-xs font-bold text-kalvium-muted dark:text-kalvium-dark-muted uppercase tracking-wider mb-1">
                  Full Description (Strictly based on poster) *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border rounded-xl px-4 py-2.5 text-sm text-kalvium-text dark:text-kalvium-dark-text focus:outline-none focus:border-kalvium-coral leading-relaxed"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-bold text-kalvium-muted dark:text-kalvium-dark-muted uppercase tracking-wider mb-1">
                  Tags (Comma separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="AI, Robotics, Hardware, Workshop"
                  className="w-full bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border rounded-xl px-4 py-2 text-sm text-kalvium-text dark:text-kalvium-dark-text focus:outline-none focus:border-kalvium-coral"
                />
              </div>

              {/* Registration URL & Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-kalvium-muted dark:text-kalvium-dark-muted uppercase tracking-wider mb-1">
                    Registration Link (if any)
                  </label>
                  <input
                    type="text"
                    value={formData.registrationUrl}
                    onChange={(e) => setFormData({ ...formData, registrationUrl: e.target.value })}
                    placeholder="https://... or Not specified"
                    className="w-full bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border rounded-xl px-4 py-2 text-sm text-kalvium-text dark:text-kalvium-dark-text focus:outline-none focus:border-kalvium-coral"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-kalvium-muted dark:text-kalvium-dark-muted uppercase tracking-wider mb-1">
                    Contact Email / Phone
                  </label>
                  <input
                    type="text"
                    value={formData.contactInfo}
                    onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                    placeholder="contact@campus.edu or Not specified"
                    className="w-full bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border rounded-xl px-4 py-2 text-sm text-kalvium-text dark:text-kalvium-dark-text focus:outline-none focus:border-kalvium-coral"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-kalvium-border dark:border-kalvium-dark-border flex items-center justify-between">
                <span className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted">
                  Event will be submitted in <span className="font-bold text-kalvium-warning">Pending Verification</span> state.
                </span>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 rounded-full text-sm font-bold bg-kalvium-coral hover:bg-kalvium-coral-hover text-white shadow-sm transition-all duration-200 active:scale-95 flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit for Verification</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function renderConfidenceBadge(level?: ConfidenceLevel) {
  if (level === "HIGH") {
    return (
      <span className="text-[11px] font-semibold text-kalvium-success bg-kalvium-success-tint border border-kalvium-success-border px-2.5 py-0.5 rounded-full">
        ✓ High confidence
      </span>
    );
  }
  if (level === "MEDIUM") {
    return (
      <span className="text-[11px] font-semibold text-kalvium-warning bg-kalvium-warning-tint border border-kalvium-warning-border px-2.5 py-0.5 rounded-full">
        ⚠ Medium confidence
      </span>
    );
  }
  return (
    <span className="text-[11px] font-semibold text-kalvium-coral bg-kalvium-coral-tint border border-kalvium-coral/30 px-2.5 py-0.5 rounded-full">
      ⚠ Low confidence (Check poster)
    </span>
  );
}
