"use client";

import React, { useState, useRef, useEffect } from "react";
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
  PenTool,
  Image as ImageIcon,
  ExternalLink,
  Trash2,
  Check,
  Calendar,
  MapPin,
  Tag,
  Link as LinkIcon,
  Mail,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { SAMPLE_POSTERS, ConfidenceLevel } from "@/lib/poster-shared";

const CATEGORIES = [
  "Workshop",
  "Hackathon",
  "Cultural",
  "Technical",
  "Sports",
  "Seminar",
  "Competition",
  "Fest",
  "Club",
];

const PRESET_THUMBNAILS = [
  {
    id: "hackathon",
    label: "Hackathon & Code",
    category: "Hackathon",
    url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "robotics",
    label: "AI & Tech Workshop",
    category: "Workshop",
    url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "cultural",
    label: "Music & Cultural Fest",
    category: "Cultural",
    url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "design",
    label: "UI/UX & Product Design",
    category: "Technical",
    url: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "sports",
    label: "Campus Sports Tourney",
    category: "Sports",
    url: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "seminar",
    label: "Keynote & Speaker Talk",
    category: "Seminar",
    url: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80",
  },
];

const COMMON_VENUES = [
  "Main Auditorium",
  "Innovation Lab 304",
  "Amphitheatre Lawn",
  "CS Seminar Hall A",
  "Design Studio 402",
  "Campus Sports Complex",
];

const TIME_SLOT_PRESETS = [
  { label: "10:00 AM – 01:00 PM", start: "10:00 AM", end: "01:00 PM" },
  { label: "02:00 PM – 05:00 PM", start: "02:00 PM", end: "05:00 PM" },
  { label: "05:30 PM – 08:30 PM", start: "05:30 PM", end: "08:30 PM" },
  { label: "09:00 AM – 05:00 PM", start: "09:00 AM", end: "05:00 PM" },
];

interface CreateEventStudioProps {
  initialMode?: "AI" | "MANUAL";
  onComplete?: () => void;
}

export default function CreateEventStudio({
  initialMode = "AI",
  onComplete,
}: CreateEventStudioProps) {
  const { user } = useAuth();
  const router = useRouter();

  // Top-level creation mode: "AI" (extract from poster) or "MANUAL" (direct entry)
  const [creationMode, setCreationMode] = useState<"AI" | "MANUAL">(initialMode);

  useEffect(() => {
    if (initialMode) {
      setCreationMode(initialMode);
    }
  }, [initialMode]);

  // AI Pipeline Steps
  const [step, setStep] = useState<"UPLOAD" | "ANALYZING" | "REVIEW">("UPLOAD");
  const [analyzingStepIndex, setAnalyzingStepIndex] = useState(0);

  // Poster / Thumbnail Image state
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [customThumbnailUrl, setCustomThumbnailUrl] = useState<string>("");
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);

  // Event Form State
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    startTime: "",
    endTime: "",
    venue: "",
    organizerName: user?.name || "",
    category: "Workshop",
    summary: "",
    description: "",
    tags: "",
    registrationUrl: "",
    contactInfo: user?.email || "",
  });

  const [confidences, setConfidences] = useState<Record<string, ConfidenceLevel>>({});
  const [duplicateWarning, setDuplicateWarning] = useState<any>(null);
  const [conflictChecking, setConflictChecking] = useState(false);
  const [conflictResult, setConflictResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const manualFileInputRef = useRef<HTMLInputElement>(null);

  // Auto-fill organizer name and email from session if empty
  useEffect(() => {
    if (user && !formData.organizerName) {
      setFormData((prev) => ({
        ...prev,
        organizerName: user.name || "",
        contactInfo: prev.contactInfo || user.email || "",
      }));
    }
  }, [user]);

  // Live Conflict & Duplicate Checker for Manual Mode
  useEffect(() => {
    if (creationMode !== "MANUAL") return;
    if (!formData.date || !formData.title || formData.title.trim().length < 3) {
      setConflictResult(null);
      return;
    }

    const timer = setTimeout(async () => {
      setConflictChecking(true);
      try {
        const res = await fetch("/api/organizer/check-conflicts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: formData.title,
            date: formData.date,
            startTime: formData.startTime,
            endTime: formData.endTime,
            venue: formData.venue,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setConflictResult(data);
        }
      } catch (err) {
        console.error("Conflict check error:", err);
      } finally {
        setConflictChecking(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [
    creationMode,
    formData.title,
    formData.date,
    formData.startTime,
    formData.endTime,
    formData.venue,
  ]);

  const analyzingSteps = [
    "Reading event poster typography & imagery...",
    "Extracting calendar dates and time windows...",
    "Identifying campus venue and room numbers...",
    "Verifying organizer affiliations...",
    "Generating anti-hallucinated description & tags...",
  ];

  // Handle Drag & Drop / File Input for AI Mode
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

  // Handle Thumbnail File Upload for Manual Mode
  const handleManualThumbnailFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (JPG, PNG, WebP).");
      return;
    }

    setPosterFile(file);
    setSelectedPresetId(null);
    setCustomThumbnailUrl("");
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setPosterPreview(base64);
    };
    reader.readAsDataURL(file);
  };

  // Select Curated Preset Thumbnail
  const handleSelectPresetThumbnail = (preset: (typeof PRESET_THUMBNAILS)[0]) => {
    setSelectedPresetId(preset.id);
    setPosterFile(null);
    setCustomThumbnailUrl("");
    setPosterPreview(preset.url);
    if (!formData.category) {
      setFormData((prev) => ({ ...prev, category: preset.category }));
    }
  };

  // Handle 1-click Sample Poster selection for AI Mode
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

  // Submit for Campus Manager Verification
  const handleSubmitForVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    // Validation
    if (!formData.title.trim()) {
      setErrorMsg("Event title is required.");
      setSubmitting(false);
      return;
    }
    if (!formData.date.trim()) {
      setErrorMsg("Event date is required.");
      setSubmitting(false);
      return;
    }
    if (!formData.startTime.trim() || !formData.endTime.trim()) {
      setErrorMsg("Both start time and end time are required.");
      setSubmitting(false);
      return;
    }
    if (!formData.venue.trim()) {
      setErrorMsg("Event venue is required.");
      setSubmitting(false);
      return;
    }

    // Determine final poster/thumbnail URL
    const finalPoster =
      posterPreview ||
      customThumbnailUrl ||
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80";

    const payloadConfidences =
      creationMode === "MANUAL"
        ? {
            isManualEntry: true,
            title: "MANUAL",
            date: "MANUAL",
            startTime: "MANUAL",
            endTime: "MANUAL",
            venue: "MANUAL",
            organizerName: "MANUAL",
            category: "MANUAL",
            registrationUrl: "MANUAL",
          }
        : confidences;

    try {
      const res = await fetch("/api/organizer/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          posterUrl: finalPoster,
          confidences: payloadConfidences,
          duplicatesDetected: duplicateWarning || conflictResult,
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
      {/* ========================================================= */}
      {/* MODE 1: MANUAL EVENT ENTRY */}
      {/* ========================================================= */}
      {creationMode === "MANUAL" && (
        <div className="space-y-8 animate-fade-in">

          {/* Live Conflict & Duplicate Advisory */}
          {conflictResult?.hasConflict && (
            <div className="p-4 rounded-2xl bg-kalvium-warning-tint dark:bg-kalvium-dark-warning-tint border border-kalvium-warning-border dark:border-kalvium-dark-warning-border flex items-start gap-3 animate-slide-down">
              <AlertTriangle className="w-5 h-5 text-kalvium-warning shrink-0 mt-0.5" />
              <div className="text-xs text-kalvium-warning">
                <p className="font-bold">
                  {conflictResult.type === "VENUE_CLASH"
                    ? "Schedule Collision Warning"
                    : "Potential Duplicate Event Detected"}
                </p>
                <p className="mt-0.5 opacity-90">{conflictResult.reason}</p>
                <p className="text-[11px] mt-1 opacity-75">
                  You can still submit; the Campus Manager will see this conflict alert during moderation.
                </p>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 rounded-2xl bg-kalvium-coral-tint dark:bg-kalvium-dark-surface-alt border border-kalvium-coral/30 dark:border-kalvium-coral/40 text-xs text-kalvium-coral">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmitForVerification} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Thumbnail / Poster Artwork Setup */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border rounded-3xl p-6 shadow-soft-sm space-y-5">
                <div>
                  <h4 className="text-sm font-display font-bold text-kalvium-text dark:text-kalvium-dark-text flex items-center gap-2 mb-1">
                    <ImageIcon className="w-4 h-4 text-kalvium-coral" />
                    Event Thumbnail / Poster
                  </h4>
                  <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted">
                    Upload custom artwork, paste an image URL, or pick from curated campus banners.
                  </p>
                </div>

                {/* Thumbnail Preview Box */}
                <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border group">
                  {posterPreview ? (
                    <>
                      <img
                        src={posterPreview}
                        alt="Event Thumbnail Preview"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPosterPreview(null);
                          setPosterFile(null);
                          setSelectedPresetId(null);
                          setCustomThumbnailUrl("");
                        }}
                        className="absolute top-2.5 right-2.5 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors shadow-sm"
                        title="Remove thumbnail"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-[10px] text-white font-medium">
                        Live Card Preview
                      </div>
                    </>
                  ) : (
                    <div
                      onClick={() => manualFileInputRef.current?.click()}
                      className="w-full h-full flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:bg-kalvium-coral-tint/20 transition-colors"
                    >
                      <Upload className="w-8 h-8 text-kalvium-coral mb-2" />
                      <p className="text-xs font-bold text-kalvium-text dark:text-kalvium-dark-text">
                        Upload Thumbnail Image
                      </p>
                      <p className="text-[11px] text-kalvium-muted dark:text-kalvium-dark-muted mt-1">
                        PNG, JPG, WebP up to 6MB
                      </p>
                    </div>
                  )}

                  <input
                    type="file"
                    ref={manualFileInputRef}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleManualThumbnailFile(e.target.files[0]);
                      }
                    }}
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    className="hidden"
                  />
                </div>

                {/* Direct Image URL Option */}
                <div>
                  <label className="block text-[11px] font-bold text-kalvium-muted dark:text-kalvium-dark-muted uppercase tracking-wider mb-1">
                    Or Enter Direct Image URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={customThumbnailUrl}
                      onChange={(e) => {
                        setCustomThumbnailUrl(e.target.value);
                        if (e.target.value.trim().startsWith("http")) {
                          setPosterPreview(e.target.value.trim());
                          setSelectedPresetId(null);
                        }
                      }}
                      placeholder="https://images.unsplash.com/..."
                      className="flex-1 bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border rounded-xl px-3 py-2 text-xs text-kalvium-text dark:text-kalvium-dark-text focus:outline-none focus:border-kalvium-coral"
                    />
                    {posterPreview && (
                      <button
                        type="button"
                        onClick={() => manualFileInputRef.current?.click()}
                        className="px-3 py-2 rounded-xl border border-kalvium-border dark:border-kalvium-dark-border text-xs font-semibold hover:border-kalvium-coral transition-colors"
                      >
                        Change
                      </button>
                    )}
                  </div>
                </div>

                {/* Curated Preset Campus Banners */}
                <div className="space-y-2 pt-2 border-t border-kalvium-border dark:border-kalvium-dark-border">
                  <span className="text-[11px] font-bold text-kalvium-muted uppercase tracking-wider block">
                    Or Pick from Campus Preset Banners:
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {PRESET_THUMBNAILS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectPresetThumbnail(preset)}
                        className={`group relative rounded-xl overflow-hidden aspect-[4/3] border transition-all text-left ${
                          selectedPresetId === preset.id
                            ? "border-kalvium-coral ring-2 ring-kalvium-coral/30"
                            : "border-kalvium-border dark:border-kalvium-dark-border hover:border-kalvium-coral/50"
                        }`}
                      >
                        <img
                          src={preset.url}
                          alt={preset.label}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-1.5 flex items-end">
                          <span className="text-[9px] font-bold text-white line-clamp-1 leading-tight">
                            {preset.label}
                          </span>
                        </div>
                        {selectedPresetId === preset.id && (
                          <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-kalvium-coral text-white flex items-center justify-center shadow">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Real-time Schedule Conflict Status Pill */}
              <div className="p-4 rounded-2xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border shadow-soft-xs text-xs space-y-1">
                <span className="font-bold text-kalvium-text dark:text-kalvium-dark-text flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-kalvium-coral" />
                  Live Schedule & Venue Status
                </span>
                {conflictChecking ? (
                  <p className="text-[11px] text-kalvium-muted animate-pulse">
                    Checking calendar for venue and time collisions...
                  </p>
                ) : conflictResult?.hasConflict ? (
                  <p className="text-[11px] text-kalvium-warning font-semibold">
                    ⚠ Warning: {conflictResult.reason}
                  </p>
                ) : formData.date && formData.startTime ? (
                  <p className="text-[11px] text-kalvium-success font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-kalvium-success" />
                    No conflicting events found for this date and time.
                  </p>
                ) : (
                  <p className="text-[11px] text-kalvium-muted dark:text-kalvium-dark-muted">
                    Enter date, time, and venue to automatically verify schedule availability.
                  </p>
                )}
              </div>
            </div>

            {/* Right Column: Event Form Details */}
            <div className="lg:col-span-7 space-y-5 bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border rounded-3xl p-6 shadow-soft-sm">
              <h3 className="text-base font-display font-bold text-kalvium-text dark:text-kalvium-dark-text border-b border-kalvium-border dark:border-kalvium-dark-border pb-3">
                Event Details & Registration
              </h3>

              {/* Event Title */}
              <div>
                <label className="block text-xs font-bold text-kalvium-muted dark:text-kalvium-dark-muted uppercase tracking-wider mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. National Autonomous Drone Challenge 2026"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border rounded-xl px-4 py-2.5 text-sm text-kalvium-text dark:text-kalvium-dark-text focus:outline-none focus:border-kalvium-coral"
                />
              </div>

              {/* Date & Time Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-kalvium-muted dark:text-kalvium-dark-muted uppercase tracking-wider mb-1">
                    Date *
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

              {/* Time Slot Quick Presets */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider text-kalvium-muted mr-1">
                  Time Presets:
                </span>
                {TIME_SLOT_PRESETS.map((slot) => (
                  <button
                    key={slot.label}
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        startTime: slot.start,
                        endTime: slot.end,
                      })
                    }
                    className="text-[10px] px-2 py-0.5 rounded-full border border-kalvium-border dark:border-kalvium-dark-border bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt hover:border-kalvium-coral/50 text-kalvium-muted hover:text-kalvium-text transition-colors"
                  >
                    {slot.label}
                  </button>
                ))}
              </div>

              {/* Venue & Category Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-kalvium-muted dark:text-kalvium-dark-muted uppercase tracking-wider mb-1">
                    Venue / Campus Room *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Main Auditorium"
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

              {/* Quick Venue Suggestions */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider text-kalvium-muted mr-1">
                  Common Venues:
                </span>
                {COMMON_VENUES.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setFormData({ ...formData, venue: v })}
                    className="text-[10px] px-2 py-0.5 rounded-full border border-kalvium-border dark:border-kalvium-dark-border bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt hover:border-kalvium-coral/50 text-kalvium-muted hover:text-kalvium-text transition-colors"
                  >
                    {v}
                  </button>
                ))}
              </div>

              {/* Organizer Name */}
              <div>
                <label className="block text-xs font-bold text-kalvium-muted dark:text-kalvium-dark-muted uppercase tracking-wider mb-1">
                  Hosting Society / Club Name
                </label>
                <input
                  type="text"
                  value={formData.organizerName}
                  onChange={(e) => setFormData({ ...formData, organizerName: e.target.value })}
                  placeholder="e.g. Robotics & AI Society"
                  className="w-full bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border rounded-xl px-4 py-2.5 text-sm text-kalvium-text dark:text-kalvium-dark-text focus:outline-none focus:border-kalvium-coral"
                />
              </div>

              {/* Short Summary */}
              <div>
                <label className="block text-xs font-bold text-kalvium-muted dark:text-kalvium-dark-muted uppercase tracking-wider mb-1">
                  1-2 Sentence Summary (Discovery Card Teaser)
                </label>
                <input
                  type="text"
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="Concise high-level preview displayed on student feed"
                  className="w-full bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border rounded-xl px-4 py-2 text-sm text-kalvium-text dark:text-kalvium-dark-text focus:outline-none focus:border-kalvium-coral"
                />
              </div>

              {/* Full Description */}
              <div>
                <label className="block text-xs font-bold text-kalvium-muted dark:text-kalvium-dark-muted uppercase tracking-wider mb-1">
                  Full Event Description & Agenda *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide complete event details, team guidelines, prize pool, or speaker lineup..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border rounded-xl px-4 py-2.5 text-sm text-kalvium-text dark:text-kalvium-dark-text focus:outline-none focus:border-kalvium-coral leading-relaxed"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-bold text-kalvium-muted dark:text-kalvium-dark-muted uppercase tracking-wider mb-1">
                  Tags (Comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="Coding, Innovation, Hardware, Prizes"
                  className="w-full bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border rounded-xl px-4 py-2 text-sm text-kalvium-text dark:text-kalvium-dark-text focus:outline-none focus:border-kalvium-coral"
                />
              </div>

              {/* Registration Link & Contact Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-kalvium-muted dark:text-kalvium-dark-muted uppercase tracking-wider">
                      Registration Link
                    </label>
                    {formData.registrationUrl && formData.registrationUrl.startsWith("http") && (
                      <a
                        href={formData.registrationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-kalvium-coral hover:underline flex items-center gap-0.5 font-semibold"
                      >
                        Test link <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <input
                    type="url"
                    value={formData.registrationUrl}
                    onChange={(e) => setFormData({ ...formData, registrationUrl: e.target.value })}
                    placeholder="https://unstop.com/... or Google Form"
                    className="w-full bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border rounded-xl px-4 py-2 text-sm text-kalvium-text dark:text-kalvium-dark-text focus:outline-none focus:border-kalvium-coral"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-kalvium-muted dark:text-kalvium-dark-muted uppercase tracking-wider mb-1">
                    Contact Email or Phone
                  </label>
                  <input
                    type="text"
                    value={formData.contactInfo}
                    onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                    placeholder="organizer@campus.edu"
                    className="w-full bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border rounded-xl px-4 py-2 text-sm text-kalvium-text dark:text-kalvium-dark-text focus:outline-none focus:border-kalvium-coral"
                  />
                </div>
              </div>

              {/* Submission Button */}
              <div className="pt-4 border-t border-kalvium-border dark:border-kalvium-dark-border flex items-center justify-between">
                <span className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted">
                  Submits to <span className="font-bold text-kalvium-warning">Pending Campus Review</span>.
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
                      <span>Submit Event for Approval</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODE 2: AI POSTER EXTRACTION */}
      {/* ========================================================= */}
      {creationMode === "AI" && (
        <>
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
                  Drop your event poster flyer here
                </h3>
                <p className="relative z-10 text-sm text-kalvium-muted dark:text-kalvium-dark-muted mb-4">
                  or <span className="text-kalvium-coral font-semibold underline underline-offset-2">browse from your computer</span>
                </p>
                <p className="relative z-10 text-xs text-kalvium-muted uppercase tracking-wider font-sans font-semibold">
                  SUPPORTS JPG, JPEG, PNG, WEBP (UP TO 6MB)
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
                    <h3 className="text-sm font-bold text-kalvium-text dark:text-kalvium-dark-text">
                      Review AI-Generated Event Details
                    </h3>
                    <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted">
                      Inspect extracted fields, make any necessary adjustments, and submit for Campus Manager approval.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
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
                <div className="p-4 rounded-2xl bg-kalvium-coral-tint dark:bg-kalvium-dark-surface-alt border border-kalvium-coral/30 dark:border-kalvium-coral/40 text-xs text-kalvium-coral">
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
                      <span className="text-[11px] font-sans text-kalvium-coral font-bold uppercase tracking-wider">
                        AI OCR ENGINE
                      </span>
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
                        Date *
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
        </>
      )}
    </div>
  );
}

function renderConfidenceBadge(level?: ConfidenceLevel | string) {
  if (level === "MANUAL") {
    return (
      <span className="text-[11px] font-semibold text-kalvium-coral bg-kalvium-coral-tint dark:bg-kalvium-dark-surface-alt border border-kalvium-coral/30 dark:border-kalvium-dark-border px-2.5 py-0.5 rounded-full">
        ✍️ Manual Entry
      </span>
    );
  }
  if (level === "HIGH") {
    return (
      <span className="text-[11px] font-semibold text-kalvium-success bg-kalvium-success-tint dark:bg-kalvium-dark-surface-alt border border-kalvium-success-border dark:border-kalvium-dark-border px-2.5 py-0.5 rounded-full">
        ✓ High confidence
      </span>
    );
  }
  if (level === "MEDIUM") {
    return (
      <span className="text-[11px] font-semibold text-kalvium-warning bg-kalvium-warning-tint dark:bg-kalvium-dark-surface-alt border border-kalvium-warning-border dark:border-kalvium-dark-border px-2.5 py-0.5 rounded-full">
        ⚠ Medium confidence
      </span>
    );
  }
  return (
    <span className="text-[11px] font-semibold text-kalvium-coral bg-kalvium-coral-tint dark:bg-kalvium-dark-surface-alt border border-kalvium-coral/30 dark:border-kalvium-dark-border px-2.5 py-0.5 rounded-full">
      ⚠ Low confidence (Check poster)
    </span>
  );
}
