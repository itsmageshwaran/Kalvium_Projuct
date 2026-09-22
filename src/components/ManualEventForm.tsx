"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Clock,
  FileCheck,
  ArrowRight,
  ImageIcon,
  Trash2,
  Check,
  Upload,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const CATEGORIES = [
  "Workshop", "Hackathon", "Cultural", "Technical",
  "Sports", "Seminar", "Competition", "Fest", "Club",
];

const PRESET_THUMBNAILS = [
  { id: "t1", label: "Tech Summit", url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80" },
  { id: "t2", label: "Hackathon", url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80" },
  { id: "t3", label: "Workshop", url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80" },
  { id: "t4", label: "Cultural", url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80" },
  { id: "t5", label: "Sports", url: "https://images.unsplash.com/photo-1519766304817-4f37bda74b38?w=800&auto=format&fit=crop&q=80" },
  { id: "t6", label: "Seminar", url: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=80" },
];

interface ManualEventFormProps {
  onComplete?: () => void;
}

export default function ManualEventForm({ onComplete }: ManualEventFormProps) {
  const { user } = useAuth();
  const router = useRouter();

  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [customThumbnailUrl, setCustomThumbnailUrl] = useState<string>("");
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);

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

  const [conflictChecking, setConflictChecking] = useState(false);
  const [conflictResult, setConflictResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const manualFileInputRef = useRef<HTMLInputElement>(null);

  // Auto-fill organizer info from session
  useEffect(() => {
    if (user && !formData.organizerName) {
      setFormData((prev) => ({
        ...prev,
        organizerName: user.name || "",
        contactInfo: prev.contactInfo || user.email || "",
      }));
    }
  }, [user]);

  // Live conflict checker
  useEffect(() => {
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
  }, [formData.title, formData.date, formData.startTime, formData.endTime, formData.venue]);

  const handleManualThumbnailFile = (file: File) => {
    setPosterFile(file);
    setCustomThumbnailUrl("");
    setSelectedPresetId(null);
    // Use FileReader to get a persistent base64 data URL (blob: URLs are ephemeral)
    const reader = new FileReader();
    reader.onload = (e) => {
      setPosterPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPresetThumbnail = (presetId: string, imgUrl: string) => {
    setSelectedPresetId(presetId);
    setPosterPreview(imgUrl);
    setPosterFile(null);
    setCustomThumbnailUrl("");
  };

  const handleSubmitForVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    if (!formData.title.trim()) { setErrorMsg("Event title is required."); setSubmitting(false); return; }
    if (!formData.date.trim()) { setErrorMsg("Event date is required."); setSubmitting(false); return; }
    if (!formData.startTime.trim() || !formData.endTime.trim()) { setErrorMsg("Both start time and end time are required."); setSubmitting(false); return; }
    if (!formData.venue.trim()) { setErrorMsg("Event venue is required."); setSubmitting(false); return; }

    const finalPoster =
      posterPreview ||
      customThumbnailUrl ||
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80";

    const payloadConfidences = {
      isManualEntry: true,
      title: "MANUAL", date: "MANUAL", startTime: "MANUAL", endTime: "MANUAL",
      venue: "MANUAL", organizerName: "MANUAL", category: "MANUAL", registrationUrl: "MANUAL",
    };

    try {
      const res = await fetch("/api/organizer/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          posterUrl: finalPoster,
          confidences: payloadConfidences,
          duplicatesDetected: conflictResult,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");

      if (onComplete) {
        setPosterPreview(null);
        setPosterFile(null);
        onComplete();
      } else {
        if (user?.role?.toUpperCase() === "STUDENT") {
          router.push("/dashboard/student");
        } else {
          router.push("/dashboard/organizer");
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit event. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Conflict warning */}
      {conflictResult?.hasConflict && (
        <div className="p-4 rounded-2xl bg-kalvium-warning-tint dark:bg-kalvium-dark-warning-tint border border-kalvium-warning-border dark:border-kalvium-dark-warning-border flex items-start gap-3 animate-slide-down">
          <AlertTriangle className="w-5 h-5 text-kalvium-warning shrink-0 mt-0.5" />
          <div className="text-xs text-kalvium-warning">
            <p className="font-bold">
              {conflictResult.type === "VENUE_CLASH" ? "Schedule Collision Warning" : "Potential Duplicate Event Detected"}
            </p>
            <p className="mt-0.5 opacity-90">{conflictResult.reason}</p>
            <p className="text-[11px] mt-1 opacity-75">
              You can still submit; the Campus Manager will see this conflict alert during moderation.
            </p>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-kalvium-coral-tint dark:bg-kalvium-dark-surface-alt border border-kalvium-coral/30 text-xs text-kalvium-coral">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmitForVerification} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Thumbnail selector */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border rounded-3xl p-6 shadow-soft-sm space-y-5">
            <div>
              <h4 className="text-sm font-display font-bold text-kalvium-text dark:text-kalvium-dark-text flex items-center gap-2 mb-1">
                <ImageIcon className="w-4 h-4 text-kalvium-coral" />
                Event Poster / Banner
              </h4>
              <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted">
                Upload your event poster — this image will appear on the public event card and detail page.
              </p>
            </div>

            {/* Thumbnail Preview Box */}
            <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border group">
              {posterPreview ? (
                <>
                  <img src={posterPreview} alt="Event Poster Preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
                  <button
                    type="button"
                    onClick={() => { setPosterPreview(null); setPosterFile(null); setSelectedPresetId(null); setCustomThumbnailUrl(""); }}
                    className="absolute top-2.5 right-2.5 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors shadow-sm"
                    title="Remove poster"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <div className={`absolute bottom-2 left-2 px-2 py-0.5 rounded-md text-[10px] text-white font-medium ${
                    posterFile ? "bg-kalvium-coral/90" : "bg-black/60"
                  }`}>
                    {posterFile ? "✓ Event Poster · Uploaded" : "Preset Banner · Preview"}
                  </div>
                </>
              ) : (
                <div
                  onClick={() => manualFileInputRef.current?.click()}
                  className="w-full h-full flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:bg-kalvium-coral-tint/20 transition-colors"
                >
                  <Upload className="w-8 h-8 text-kalvium-coral mb-2" />
                  <p className="text-xs font-bold text-kalvium-text dark:text-kalvium-dark-text">Upload Event Poster</p>
                  <p className="text-[11px] text-kalvium-muted dark:text-kalvium-dark-muted mt-1">This becomes the public event image · PNG, JPG, WebP up to 6MB</p>
                </div>
              )}
              <input
                type="file"
                ref={manualFileInputRef}
                onChange={(e) => { if (e.target.files && e.target.files[0]) handleManualThumbnailFile(e.target.files[0]); }}
                accept="image/png,image/jpeg,image/jpg,image/webp"
                className="hidden"
              />
            </div>

            {/* Direct Image URL */}
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

            {/* Preset Banners */}
            <div className="space-y-2 pt-2 border-t border-kalvium-border dark:border-kalvium-dark-border">
              <span className="text-[11px] font-bold text-kalvium-muted uppercase tracking-wider block">Or Pick from Campus Preset Banners:</span>
              <div className="grid grid-cols-3 gap-2">
                {PRESET_THUMBNAILS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPresetThumbnail(preset.id, preset.url)}
                    className={`group relative rounded-xl overflow-hidden aspect-[4/3] border transition-all text-left ${
                      selectedPresetId === preset.id
                        ? "border-kalvium-coral ring-2 ring-kalvium-coral/30"
                        : "border-kalvium-border dark:border-kalvium-dark-border hover:border-kalvium-coral/50"
                    }`}
                  >
                    <img src={preset.url} alt={preset.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-1.5 flex items-end">
                      <span className="text-[9px] font-bold text-white line-clamp-1 leading-tight">{preset.label}</span>
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

          {/* Live Schedule Status */}
          <div className="p-4 rounded-2xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border shadow-soft-xs text-xs space-y-1">
            <span className="font-bold text-kalvium-text dark:text-kalvium-dark-text flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-kalvium-coral" />
              Live Schedule & Venue Status
            </span>
            {conflictChecking ? (
              <p className="text-[11px] text-kalvium-muted animate-pulse">Checking calendar for venue and time collisions...</p>
            ) : conflictResult?.hasConflict ? (
              <p className="text-[11px] text-kalvium-warning font-semibold">⚠ Warning: {conflictResult.reason}</p>
            ) : formData.date && formData.startTime ? (
              <p className="text-[11px] text-kalvium-success font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-kalvium-success" />
                No conflicting events found for this date and time.
              </p>
            ) : (
              <p className="text-[11px] text-kalvium-muted dark:text-kalvium-dark-muted">Enter date, time, and venue to automatically verify schedule availability.</p>
            )}
          </div>
        </div>

        {/* Right: Event Details Form */}
        <div className="lg:col-span-7 space-y-5 bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border rounded-3xl p-6 shadow-soft-sm">
          <h3 className="text-base font-display font-bold text-kalvium-text dark:text-kalvium-dark-text border-b border-kalvium-border dark:border-kalvium-dark-border pb-3">
            Event Details & Registration
          </h3>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-kalvium-muted dark:text-kalvium-dark-muted uppercase tracking-wider mb-1">Event Title *</label>
            <input type="text" required placeholder="e.g. National Autonomous Drone Challenge 2026" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border rounded-xl px-4 py-2.5 text-sm text-kalvium-text dark:text-kalvium-dark-text focus:outline-none focus:border-kalvium-coral" />
          </div>

          {/* Date + Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-kalvium-muted dark:text-kalvium-dark-muted uppercase tracking-wider mb-1">Date *</label>
              <input type="date" required value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border rounded-xl px-4 py-2.5 text-sm text-kalvium-text dark:text-kalvium-dark-text focus:outline-none focus:border-kalvium-coral" />
            </div>
            <div>
              <label className="block text-xs font-bold text-kalvium-muted dark:text-kalvium-dark-muted uppercase tracking-wider mb-1">Category *</label>
              <select required value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border rounded-xl px-4 py-2.5 text-sm text-kalvium-text dark:text-kalvium-dark-text focus:outline-none focus:border-kalvium-coral">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Start + End Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-kalvium-muted dark:text-kalvium-dark-muted uppercase tracking-wider mb-1">Start Time * (e.g. 10:00 AM)</label>
              <input type="text" required placeholder="10:00 AM" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border rounded-xl px-4 py-2.5 text-sm text-kalvium-text dark:text-kalvium-dark-text focus:outline-none focus:border-kalvium-coral" />
            </div>
            <div>
              <label className="block text-xs font-bold text-kalvium-muted dark:text-kalvium-dark-muted uppercase tracking-wider mb-1">End Time * (e.g. 01:00 PM)</label>
              <input type="text" required placeholder="01:00 PM" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border rounded-xl px-4 py-2.5 text-sm text-kalvium-text dark:text-kalvium-dark-text focus:outline-none focus:border-kalvium-coral" />
            </div>
          </div>

          {/* Venue */}
          <div>
            <label className="block text-xs font-bold text-kalvium-muted dark:text-kalvium-dark-muted uppercase tracking-wider mb-1">Venue *</label>
            <input type="text" required placeholder="e.g. Main Auditorium, CS Block" value={formData.venue} onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              className="w-full bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border rounded-xl px-4 py-2.5 text-sm text-kalvium-text dark:text-kalvium-dark-text focus:outline-none focus:border-kalvium-coral" />
          </div>

          {/* Organizer */}
          <div>
            <label className="block text-xs font-bold text-kalvium-muted dark:text-kalvium-dark-muted uppercase tracking-wider mb-1">Organizer / Club Name</label>
            <input type="text" placeholder="e.g. IEEE Student Chapter" value={formData.organizerName} onChange={(e) => setFormData({ ...formData, organizerName: e.target.value })}
              className="w-full bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border rounded-xl px-4 py-2.5 text-sm text-kalvium-text dark:text-kalvium-dark-text focus:outline-none focus:border-kalvium-coral" />
          </div>

          {/* Summary */}
          <div>
            <label className="block text-xs font-bold text-kalvium-muted dark:text-kalvium-dark-muted uppercase tracking-wider mb-1">Short Summary</label>
            <textarea rows={2} placeholder="A concise 1-2 sentence summary..." value={formData.summary} onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              className="w-full bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border rounded-xl px-4 py-2.5 text-sm text-kalvium-text dark:text-kalvium-dark-text focus:outline-none focus:border-kalvium-coral resize-none" />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-kalvium-muted dark:text-kalvium-dark-muted uppercase tracking-wider mb-1">Full Description</label>
            <textarea rows={4} placeholder="Full details, schedule, requirements..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border rounded-xl px-4 py-2.5 text-sm text-kalvium-text dark:text-kalvium-dark-text focus:outline-none focus:border-kalvium-coral resize-none" />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-kalvium-muted dark:text-kalvium-dark-muted uppercase tracking-wider mb-1">Tags (comma-separated)</label>
            <input type="text" placeholder="AI, Robotics, Workshop" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border rounded-xl px-4 py-2.5 text-sm text-kalvium-text dark:text-kalvium-dark-text focus:outline-none focus:border-kalvium-coral" />
          </div>

          {/* Registration URL */}
          <div>
            <label className="block text-xs font-bold text-kalvium-muted dark:text-kalvium-dark-muted uppercase tracking-wider mb-1">Registration Link</label>
            <input type="url" placeholder="https://forms.gle/..." value={formData.registrationUrl} onChange={(e) => setFormData({ ...formData, registrationUrl: e.target.value })}
              className="w-full bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border rounded-xl px-4 py-2.5 text-sm text-kalvium-text dark:text-kalvium-dark-text focus:outline-none focus:border-kalvium-coral" />
          </div>

          {/* Contact Info */}
          <div>
            <label className="block text-xs font-bold text-kalvium-muted dark:text-kalvium-dark-muted uppercase tracking-wider mb-1">Contact Info</label>
            <input type="text" placeholder="organizer@campus.edu or WhatsApp number" value={formData.contactInfo} onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
              className="w-full bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border rounded-xl px-4 py-2.5 text-sm text-kalvium-text dark:text-kalvium-dark-text focus:outline-none focus:border-kalvium-coral" />
          </div>

          {/* Submit */}
          <div className="pt-2 border-t border-kalvium-border dark:border-kalvium-dark-border">
            <button type="submit" disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-kalvium-coral text-white font-bold text-sm rounded-2xl hover:bg-kalvium-coral/90 active:scale-[0.98] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed shadow-soft-sm">
              {submitting ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /> {user?.role?.toUpperCase() === "STUDENT" ? "Submitting Event Request..." : "Submitting..."}</>
              ) : (
                <><FileCheck className="w-4 h-4" /> {user?.role?.toUpperCase() === "STUDENT" ? "Submit Event Request for Campus Verification" : "Submit for Campus Manager Verification"} <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
            <p className="text-center text-[11px] text-kalvium-muted dark:text-kalvium-dark-muted mt-2">
              {user?.role?.toUpperCase() === "STUDENT"
                ? "Your event proposal stays private until a Campus Manager reviews and approves it."
                : "Your event stays private until a Campus Manager reviews and approves it."}
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
