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
  ShieldCheck,
  Layers,
  XCircle,
  FileText,
  Key,
  Eye,
  EyeOff,
  Shield,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { auth as firebaseClientAuth } from "@/lib/firebase/client";
import { ConfidenceLevel, SAMPLE_POSTERS } from "@/lib/ai-poster-constants";

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
  const [conflictChecking, setConflictChecking] = useState(false);
  const [conflictResult, setConflictResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // User on-device Gemini API Key (stored strictly in browser localStorage, never saved to Firebase DB)
  const [userApiKey, setUserApiKey] = useState<string>("");
  const [apiKeyInput, setApiKeyInput] = useState<string>("");
  const [showApiKeySecret, setShowApiKeySecret] = useState<boolean>(false);
  const [isEditingKey, setIsEditingKey] = useState<boolean>(false);
  const [keySaveMessage, setKeySaveMessage] = useState<string | null>(null);
  const [keyModalOpen, setKeyModalOpen] = useState<boolean>(false);
  const [modalKeyInput, setModalKeyInput] = useState<string>("");
  const [showModalKeySecret, setShowModalKeySecret] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<string>("gemini-3.6-flash");
  const [pendingUploadPayload, setPendingUploadPayload] = useState<{
    imageData?: string;
    mimeType?: string;
  } | null>(null);

  // Load API key and model preference from local device storage on mount
  useEffect(() => {
    try {
      const savedKey = localStorage.getItem("campushub_gemini_api_key");
      if (savedKey) {
        setUserApiKey(savedKey);
        setApiKeyInput(savedKey);
        setModalKeyInput(savedKey);
      }
      const savedModel = localStorage.getItem("campushub_gemini_model");
      if (savedModel) {
        setSelectedModel(savedModel);
      }
    } catch {
      // LocalStorage unavailable in certain sandbox environments
    }
  }, []);

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    try {
      localStorage.setItem("campushub_gemini_model", model);
    } catch {
      // LocalStorage unavailable
    }
  };

  const handleSaveApiKey = (keyToSave?: string): boolean => {
    const key = (keyToSave !== undefined ? keyToSave : apiKeyInput).trim();
    if (!key) {
      alert("Please enter a valid Gemini API key.");
      return false;
    }
    try {
      localStorage.setItem("campushub_gemini_api_key", key);
      setUserApiKey(key);
      setApiKeyInput(key);
      setModalKeyInput(key);
      setIsEditingKey(false);
      setErrorMsg(null);
      setKeySaveMessage("API key saved on your device!");
      setTimeout(() => setKeySaveMessage(null), 3000);
      return true;
    } catch (err) {
      console.error("Failed to save API key to localStorage:", err);
      return false;
    }
  };

  const handleRemoveApiKey = () => {
    try {
      localStorage.removeItem("campushub_gemini_api_key");
    } catch (err) {
      console.error("Failed to remove API key from localStorage:", err);
    }
    setUserApiKey("");
    setApiKeyInput("");
    setModalKeyInput("");
    setIsEditingKey(false);
    setKeySaveMessage("API key removed from this device.");
    setTimeout(() => setKeySaveMessage(null), 3000);
  };

  const handleModalSaveAndAnalyze = () => {
    const key = modalKeyInput.trim();
    if (!key) {
      alert("Please enter a valid Gemini API key to proceed with AI analysis.");
      return;
    }
    const saved = handleSaveApiKey(key);
    if (saved) {
      setKeyModalOpen(false);
      if (pendingUploadPayload) {
        startAnalysis(pendingUploadPayload, key);
        setPendingUploadPayload(null);
      }
    }
  };

  const analyzingSteps = [
    "Reading event poster typography & imagery...",
    "Extracting calendar dates and time windows...",
    "Identifying campus venue and room numbers...",
    "Verifying organizer affiliations...",
    "Generating anti-hallucinated description & tags...",
  ];

  // Auto-fill organizer name/email from session on mount
  useEffect(() => {
    if (user && !formData.organizerName) {
      setFormData((prev) => ({
        ...prev,
        organizerName: user.name || "",
        contactInfo: prev.contactInfo || user.email || "",
      }));
    }
  }, [user]);

  // Live Conflict & Duplicate Checker (fires while user edits review form)
  useEffect(() => {
    if (step !== "REVIEW") return;
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
    formData.title,
    formData.date,
    formData.startTime,
    formData.endTime,
    formData.venue,
    step,
  ]);

  // Compress & optimize image on client before sending to AI (ensures sub-1MB size & high OCR clarity)
  const compressImageForAnalysis = (file: File): Promise<{ base64: string; mimeType: string }> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const rawData = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          const MAX_DIM = 1600;
          let { width, height } = img;
          if (width > MAX_DIM || height > MAX_DIM) {
            if (width > height) {
              height = Math.round((height * MAX_DIM) / width);
              width = MAX_DIM;
            } else {
              width = Math.round((width * MAX_DIM) / height);
              height = MAX_DIM;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL("image/jpeg", 0.85);
            resolve({ base64: compressed, mimeType: "image/jpeg" });
            return;
          }
          resolve({ base64: rawData, mimeType: file.type });
        };
        img.onerror = () => {
          resolve({ base64: rawData, mimeType: file.type });
        };
        img.src = rawData;
      };
      reader.readAsDataURL(file);
    });
  };

  // Handle Drag & Drop / File Input
  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (JPG, PNG, WebP).");
      return;
    }

    setPosterFile(file);
    try {
      const { base64, mimeType } = await compressImageForAnalysis(file);
      setPosterPreview(base64);
      if (!userApiKey) {
        setPendingUploadPayload({ imageData: base64, mimeType });
        setKeyModalOpen(true);
      } else {
        startAnalysis({ imageData: base64, mimeType });
      }
    } catch (err) {
      console.error("Image processing error:", err);
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setPosterPreview(base64);
        if (!userApiKey) {
          setPendingUploadPayload({ imageData: base64, mimeType: file.type });
          setKeyModalOpen(true);
        } else {
          startAnalysis({ imageData: base64, mimeType: file.type });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Core AI Analysis Flow
  const startAnalysis = async (
    payload: {
      imageData?: string;
      mimeType?: string;
      posterUrl?: string;
      sampleId?: string;
    },
    explicitApiKey?: string
  ) => {
    setStep("ANALYZING");
    setAnalyzingStepIndex(0);
    setErrorMsg(null);
    setConflictResult(null);

    const activeKey = explicitApiKey || userApiKey;

    // Animate analyzing steps
    let stepIdx = 0;
    const interval = setInterval(() => {
      stepIdx = Math.min(stepIdx + 1, analyzingSteps.length - 1);
      setAnalyzingStepIndex((prev) => {
        if (prev < analyzingSteps.length - 1) return prev + 1;
        return prev;
      });
    }, 600);

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (activeKey) {
        headers["x-gemini-api-key"] = activeKey;
      }
      if (selectedModel) {
        headers["x-gemini-model"] = selectedModel;
      }
      try {
        const idToken = await firebaseClientAuth.currentUser?.getIdToken();
        if (idToken) {
          headers["Authorization"] = `Bearer ${idToken}`;
        }
      } catch {
        // Continue with session cookie
      }

      const res = await fetch("/api/ai/analyze-poster", {
        method: "POST",
        headers,
        body: JSON.stringify({
          ...payload,
          apiKey: activeKey,
          model: selectedModel,
        }),
      });

      clearInterval(interval);

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "AI analysis failed");
      }

      const data = await res.json();
      const extracted = data.extractedData;

      setFormData({
        title: extracted.title === "Not specified" ? "" : (extracted.title || ""),
        date: extracted.date === "Not specified" ? "" : (extracted.date || ""),
        startTime: extracted.startTime === "Not specified" ? "" : (extracted.startTime || ""),
        endTime: extracted.endTime === "Not specified" ? "" : (extracted.endTime || ""),
        venue: extracted.venue === "Not specified" ? "" : (extracted.venue || ""),
        organizerName: extracted.organizerName === "Not specified" ? (user?.name || "") : (extracted.organizerName || user?.name || ""),
        category: extracted.category === "Not specified" ? "Technical" : (extracted.category || "Technical"),
        summary: extracted.summary === "Not specified" ? "" : (extracted.summary || ""),
        description: extracted.description === "Not specified" ? "" : (extracted.description || ""),
        tags: Array.isArray(extracted.tags) ? extracted.tags.join(", ") : (extracted.tags || ""),
        registrationUrl: extracted.registrationUrl === "Not specified" ? "" : (extracted.registrationUrl || ""),
        contactInfo: extracted.contactInfo === "Not specified" ? (user?.email || "") : (extracted.contactInfo || user?.email || ""),
      });

      setConfidences(extracted.confidences || {});
      setDuplicateWarning(data.duplicateCheck?.hasPotentialDuplicate ? data.duplicateCheck : null);
      setStep("REVIEW");
    } catch (err: any) {
      clearInterval(interval);
      console.warn("AI analysis note:", err.message);
      setErrorMsg(err.message || "Could not analyze poster. Please check your API key or fill details manually.");
      setStep("UPLOAD");
    }
  };

  // Submit for Manager Verification
  const handleSubmitForVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

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
        if (user?.role?.toUpperCase() === "STUDENT") {
          router.push("/dashboard/student");
        } else if (user?.role?.toUpperCase() === "CAMPUS_MANAGER") {
          router.push("/dashboard/manager");
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

  const confidenceBadge = (field: string) => {
    const level = confidences[field];
    if (!level) return null;
    const colors: Record<ConfidenceLevel, string> = {
      HIGH: "bg-kalvium-success/10 text-kalvium-success border-kalvium-success/30",
      MEDIUM: "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700/40",
      LOW: "bg-kalvium-coral-tint dark:bg-kalvium-dark-surface-alt text-kalvium-coral border-kalvium-coral/30",
    };
    return (
      <span className={`ml-2 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded border ${colors[level]}`}>
        {level}
      </span>
    );
  };

  return (
    <div className="space-y-6">

      {/* ─── STAGE 1: UPLOAD POSTER ─── */}
      {step === "UPLOAD" && (
        <div className="space-y-8 animate-fade-in">
          {/* Analysis Note / Error Banner */}
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 text-xs text-rose-700 dark:text-rose-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-slide-down shadow-soft-xs">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Poster Analysis Note</p>
                  <p className="mt-0.5 text-xs opacity-90">{errorMsg}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {posterPreview && (
                  <button
                    type="button"
                    onClick={() => {
                      if (posterFile) {
                        const reader = new FileReader();
                        reader.onload = () => {
                          startAnalysis({ imageData: reader.result as string, mimeType: posterFile.type });
                        };
                        reader.readAsDataURL(posterFile);
                      } else {
                        startAnalysis({ posterUrl: posterPreview });
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-kalvium-coral text-white font-bold text-[11px] hover:bg-kalvium-coral/90 transition-colors shadow-soft-xs"
                  >
                    Retry Analysis
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setStep("REVIEW");
                  }}
                  className="px-3 py-1.5 rounded-xl border border-rose-300 dark:border-rose-700/60 hover:bg-rose-100 dark:hover:bg-rose-900/40 font-bold text-[11px] transition-colors"
                >
                  Fill Details Manually →
                </button>
              </div>
            </div>
          )}

          {/* On-Device Gemini API Key Card (Zero Database Persistence) */}
          <div className="p-5 rounded-3xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border shadow-soft-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-kalvium-border/60 dark:border-kalvium-dark-border/60">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-kalvium-coral/10 dark:bg-kalvium-coral/20 text-kalvium-coral flex items-center justify-center shrink-0">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-kalvium-text dark:text-kalvium-dark-text">
                      Gemini Vision API Key
                    </h4>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-kalvium-dark-surface-alt text-kalvium-muted border border-slate-200 dark:border-kalvium-dark-border">
                      <Shield className="w-2.5 h-2.5 text-emerald-500" />
                      Stored On-Device Only
                    </span>
                  </div>
                  <p className="text-[11px] text-kalvium-muted dark:text-kalvium-dark-muted">
                    Saved in your browser&apos;s localStorage for OCR analysis. Never saved to Firebase database.
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="shrink-0 flex items-center gap-2">
                {userApiKey ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Key Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Key Required for Custom Posters
                  </span>
                )}
              </div>
            </div>

            {/* Key Saved / Removed message notification */}
            {keySaveMessage && (
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30 text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-2 animate-fade-in">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{keySaveMessage}</span>
              </div>
            )}

            {userApiKey && !isEditingKey ? (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border/80 dark:border-kalvium-dark-border/80">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold tracking-wider text-kalvium-text dark:text-kalvium-dark-text">
                    {showApiKeySecret ? userApiKey : `••••••••••••••••••••••••${userApiKey.slice(-4)}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowApiKeySecret(!showApiKeySecret)}
                    className="text-kalvium-muted hover:text-kalvium-coral text-xs transition-colors p-1"
                    title={showApiKeySecret ? "Hide API key" : "Show API key"}
                  >
                    {showApiKeySecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setApiKeyInput(userApiKey);
                      setIsEditingKey(true);
                    }}
                    className="px-3 py-1.5 text-xs font-bold rounded-xl border border-kalvium-border dark:border-kalvium-dark-border hover:border-kalvium-coral text-kalvium-text dark:text-kalvium-dark-text transition-colors"
                  >
                    Change Key
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveApiKey}
                    className="px-3 py-1.5 text-xs font-bold rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showApiKeySecret ? "text" : "password"}
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      placeholder="Paste your Google Gemini API key (e.g. AIzaSy...)"
                      className="w-full bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border rounded-xl px-3.5 py-2 text-xs font-mono text-kalvium-text dark:text-kalvium-dark-text focus:outline-none focus:border-kalvium-coral pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKeySecret(!showApiKeySecret)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-kalvium-muted hover:text-kalvium-coral text-xs p-1"
                      title={showApiKeySecret ? "Hide API key" : "Show API key"}
                    >
                      {showApiKeySecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSaveApiKey()}
                      className="px-4 py-2 bg-kalvium-coral text-white text-xs font-bold rounded-xl hover:bg-kalvium-coral/90 transition-colors shadow-soft-xs"
                    >
                      Save on Device
                    </button>
                    {isEditingKey && (
                      <button
                        type="button"
                        onClick={() => setIsEditingKey(false)}
                        className="px-3 py-2 border border-kalvium-border dark:border-kalvium-dark-border text-xs font-bold rounded-xl text-kalvium-muted hover:text-kalvium-text transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-kalvium-muted">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    Zero server storage · Free tier eligible
                  </span>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-kalvium-coral font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    <span>Get free Gemini API Key</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}

            {/* Flash Model Selector */}
            <div className="pt-3 border-t border-kalvium-border/60 dark:border-kalvium-dark-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-kalvium-coral" />
                <span className="text-xs font-bold text-kalvium-text dark:text-kalvium-dark-text">
                  Vision Model:
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40">
                  ⚡ Flash Optimized
                </span>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedModel}
                  onChange={(e) => handleModelChange(e.target.value)}
                  className="bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border rounded-xl px-3 py-1.5 text-xs font-semibold text-kalvium-text dark:text-kalvium-dark-text focus:outline-none focus:border-kalvium-coral cursor-pointer shadow-soft-xs"
                >
                  <option value="gemini-3.6-flash">Gemini 3.6 Flash (Fastest · Recommended)</option>
                  <option value="gemini-3.1-flash">Gemini 3.1 Flash</option>
                  <option value="gemini-3.0-flash">Gemini 3.0 Flash</option>
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                  <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                  <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro Preview (Fallback)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Dropzone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFile(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            className="group relative border-2 border-dashed border-kalvium-border dark:border-kalvium-dark-border hover:border-kalvium-coral dark:hover:border-kalvium-coral bg-white dark:bg-kalvium-dark-surface rounded-3xl p-10 text-center transition-all duration-300 cursor-pointer overflow-hidden shadow-soft-sm hover:shadow-soft-md active:scale-[0.995]"
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

            <div className="relative z-10 w-16 h-16 rounded-2xl bg-kalvium-coral/10 dark:bg-kalvium-coral/20 border border-kalvium-coral/20 text-kalvium-coral flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-all duration-300 shadow-sm">
              <Upload className="w-7 h-7 group-hover:-translate-y-0.5 transition-transform duration-300" />
            </div>

            <h3 className="relative z-10 text-xl font-display font-bold text-kalvium-text dark:text-kalvium-dark-text mb-1 tracking-tight">
              Drop your event poster here
            </h3>
            <p className="relative z-10 text-sm text-kalvium-muted dark:text-kalvium-dark-muted mb-4">
              or <span className="text-kalvium-coral font-semibold underline underline-offset-2">browse from your computer</span>
            </p>
            <p className="relative z-10 text-xs text-kalvium-muted uppercase tracking-wider font-bold">
              SUPPORTS JPG, JPEG, PNG, WEBP (UP TO 10MB)
            </p>
          </div>

          {/* Sample Posters Quick-Start (Works Without API Key) */}
          <div className="p-5 rounded-3xl bg-slate-50/80 dark:bg-kalvium-dark-surface/60 border border-dashed border-kalvium-border dark:border-kalvium-dark-border space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-kalvium-coral" />
                <h4 className="text-xs font-bold text-kalvium-text dark:text-kalvium-dark-text uppercase tracking-wider">
                  Or Test Instantly with Sample Posters
                </h4>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30">
                No API Key Required
              </span>
            </div>

            <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted">
              Don&apos;t have an API key or poster image right now? Click any pre-calibrated campus poster below to test the extraction and verification flow immediately:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {SAMPLE_POSTERS.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => {
                    setPosterPreview(sample.previewUrl);
                    startAnalysis({ sampleId: sample.id, posterUrl: sample.previewUrl });
                  }}
                  className="group relative flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border hover:border-kalvium-coral dark:hover:border-kalvium-coral text-left transition-all duration-200 hover:shadow-soft-sm active:scale-[0.98]"
                >
                  <img
                    src={sample.previewUrl}
                    alt={sample.name}
                    className="w-12 h-14 object-cover rounded-lg border border-kalvium-border dark:border-kalvium-dark-border shrink-0 group-hover:scale-105 transition-transform"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="block text-xs font-bold text-kalvium-text dark:text-kalvium-dark-text truncate group-hover:text-kalvium-coral transition-colors">
                      {sample.name}
                    </span>
                    <span className="block text-[10px] text-kalvium-muted dark:text-kalvium-dark-muted mt-0.5">
                      {sample.category} · 1-Click Test
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Product Guide: How to Use & Poster Upload Rules */}
          <div className="pt-8 border-t border-kalvium-border/60 dark:border-kalvium-dark-border/60 space-y-8">
            
            {/* 1. How to Use Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-kalvium-coral/10 dark:bg-kalvium-coral/20 border border-kalvium-coral/20 text-kalvium-coral text-[11px] font-bold uppercase tracking-wider mb-1.5">
                    <Sparkles className="w-3 h-3" />
                    <span>How to Use</span>
                  </div>
                  <h3 className="text-lg font-display font-bold text-kalvium-text dark:text-kalvium-dark-text tracking-tight">
                    3 Simple Steps to Publish an Event
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border shadow-soft-xs">
                  <div className="w-9 h-9 rounded-xl bg-kalvium-coral/10 dark:bg-kalvium-coral/20 border border-kalvium-coral/20 text-kalvium-coral flex items-center justify-center font-bold text-sm mb-3.5">
                    1
                  </div>
                  <h4 className="text-sm font-bold text-kalvium-text dark:text-kalvium-dark-text mb-1">
                    Upload Event Poster
                  </h4>
                  <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted leading-relaxed">
                    Drop your club or department poster in the upload box above. Multimodal AI scans and extracts all event details automatically.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border shadow-soft-xs">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm mb-3.5">
                    2
                  </div>
                  <h4 className="text-sm font-bold text-kalvium-text dark:text-kalvium-dark-text mb-1">
                    Review & Edit Fields
                  </h4>
                  <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted leading-relaxed">
                    Verify the auto-filled title, dates, timings, venue, and summary. You can freely edit or correct any field before proceeding.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border shadow-soft-xs">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm mb-3.5">
                    3
                  </div>
                  <h4 className="text-sm font-bold text-kalvium-text dark:text-kalvium-dark-text mb-1">
                    Submit for Campus Verification
                  </h4>
                  <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted leading-relaxed">
                    Submit your request to the Campus Manager. Once certified against the original poster, your event goes live on the campus calendar.
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Poster Upload Rules & Requirements */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Requirements & Specs */}
              <div className="p-6 rounded-3xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border shadow-soft-xs">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-kalvium-coral/10 dark:bg-kalvium-coral/20 text-kalvium-coral flex items-center justify-center">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-kalvium-text dark:text-kalvium-dark-text">
                      Poster Image Requirements
                    </h4>
                    <p className="text-[11px] text-kalvium-muted dark:text-kalvium-dark-muted">
                      Ensure your poster meets these standards for accurate extraction
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mt-4 text-xs">
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt/60">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-kalvium-text dark:text-kalvium-dark-text">Supported File Formats: </span>
                      <span className="text-kalvium-muted dark:text-kalvium-dark-muted">JPG, JPEG, PNG, or WebP files up to 10MB in size.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt/60">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-kalvium-text dark:text-kalvium-dark-text">High-Resolution Graphics: </span>
                      <span className="text-kalvium-muted dark:text-kalvium-dark-muted">Direct digital exports (e.g. Canva, Figma, Illustrator) are recommended over photos of physical printouts.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt/60">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-kalvium-text dark:text-kalvium-dark-text">Legible Typography: </span>
                      <span className="text-kalvium-muted dark:text-kalvium-dark-muted">Text must be sharp with clear contrast against poster backgrounds for accurate OCR.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* What to Include vs Avoid */}
              <div className="p-6 rounded-3xl bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border shadow-soft-xs">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Info className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-kalvium-text dark:text-kalvium-dark-text">
                      Must-Have Poster Content
                    </h4>
                    <p className="text-[11px] text-kalvium-muted dark:text-kalvium-dark-muted">
                      Mandatory event details required for Campus Manager approval
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
                  <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/30">
                    <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block mb-1">
                      ✓ What to Include
                    </span>
                    <ul className="space-y-1.5 text-kalvium-muted dark:text-kalvium-dark-muted text-[11px]">
                      <li>• Official event title & club name</li>
                      <li>• Exact date (DD/MM/YYYY)</li>
                      <li>• Start & end times</li>
                      <li>• Specific campus venue / room</li>
                      <li>• Registration URL or QR code</li>
                    </ul>
                  </div>

                  <div className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-800/30">
                    <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider block mb-1">
                      ✗ What to Avoid
                    </span>
                    <ul className="space-y-1.5 text-kalvium-muted dark:text-kalvium-dark-muted text-[11px]">
                      <li>• Blurry photos of paper prints</li>
                      <li>• Undefined "TBD" venues</li>
                      <li>• Missing timings or dates</li>
                      <li>• Unofficial commercial ads</li>
                      <li>• Duplicate submissions</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Campus Verification Policy Banner */}
            <div className="p-4 rounded-2xl bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-kalvium-coral/10 dark:bg-kalvium-coral/20 text-kalvium-coral flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-kalvium-text dark:text-kalvium-dark-text">
                    Campus Manager Verification Policy
                  </h5>
                  <p className="text-[11px] text-kalvium-muted dark:text-kalvium-dark-muted">
                    Every submission is verified against the original poster and active campus room bookings to prevent timetable clashes and spam.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ─── STAGE 2: AI ANALYZING ANIMATION ─── */}
      {step === "ANALYZING" && (
        <div className="py-12 text-center max-w-lg mx-auto animate-fade-in">
          {/* Poster preview while scanning */}
          {posterPreview && (
            <div className="relative mx-auto w-48 aspect-[3/4] rounded-2xl overflow-hidden border border-kalvium-border dark:border-kalvium-dark-border shadow-soft-md mb-6 bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt">
              <img
                src={posterPreview}
                alt="Scanning poster"
                className="w-full h-full object-cover opacity-90"
              />
              {/* Scan line animation */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute w-full h-0.5 bg-kalvium-coral/70 shadow-[0_0_12px_3px_rgba(232,73,45,0.5)] animate-[scan_1.8s_ease-in-out_infinite]" />
              </div>
            </div>
          )}

          <div className="w-14 h-14 rounded-2xl bg-kalvium-coral/10 dark:bg-kalvium-coral/20 border border-kalvium-coral/20 text-kalvium-coral flex items-center justify-center mx-auto mb-5">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>

          <h3 className="text-lg font-display font-bold text-kalvium-text dark:text-kalvium-dark-text mb-2">
            AI Analyzing Your Poster
          </h3>
          <p className="text-sm text-kalvium-muted dark:text-kalvium-dark-muted mb-6">
            Gemini Vision is extracting structured event data with anti-hallucination verification.
          </p>

          {/* Animated step list */}
          <div className="text-left space-y-2 bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border rounded-2xl p-5 shadow-soft-sm">
            {analyzingSteps.map((s, i) => (
              <div key={i} className={`flex items-center gap-2.5 text-xs transition-opacity duration-300 ${i <= analyzingStepIndex ? "opacity-100" : "opacity-30"}`}>
                {i < analyzingStepIndex ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-kalvium-success shrink-0" />
                ) : i === analyzingStepIndex ? (
                  <RefreshCw className="w-3.5 h-3.5 text-kalvium-coral shrink-0 animate-spin" />
                ) : (
                  <Clock className="w-3.5 h-3.5 text-kalvium-muted shrink-0" />
                )}
                <span className={i === analyzingStepIndex ? "text-kalvium-text dark:text-kalvium-dark-text font-semibold" : "text-kalvium-muted dark:text-kalvium-dark-muted"}>
                  {s}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── STAGE 3: REVIEW & EDIT EXTRACTED DATA ─── */}
      {step === "REVIEW" && (
        <div className="space-y-6 animate-fade-in">

          {/* Header with poster preview + back option */}
          <div className="flex items-start gap-4 p-4 bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border rounded-2xl shadow-soft-sm">
            {posterPreview && (
              <img
                src={posterPreview}
                alt="Analyzed poster"
                className="w-20 h-24 object-cover rounded-xl border border-kalvium-border dark:border-kalvium-dark-border shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <FileCheck className="w-4 h-4 text-kalvium-success" />
                <span className="text-xs font-bold text-kalvium-success uppercase tracking-wider">
                  AI Extraction Complete
                </span>
              </div>
              <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted">
                Review and correct the extracted fields below. Confidence badges show AI certainty per field. The Campus Manager will verify against the original poster.
              </p>
              <button
                type="button"
                onClick={() => {
                  setStep("UPLOAD");
                  setPosterPreview(null);
                  setPosterFile(null);
                  setFormData({
                    title: "", date: "", startTime: "", endTime: "", venue: "",
                    organizerName: user?.name || "", category: "Workshop",
                    summary: "", description: "", tags: "",
                    registrationUrl: "", contactInfo: user?.email || "",
                  });
                  setConfidences({});
                  setDuplicateWarning(null);
                  setConflictResult(null);
                  setErrorMsg(null);
                }}
                className="mt-2 text-[11px] text-kalvium-coral font-semibold hover:underline flex items-center gap-1"
              >
                ← Analyze a different poster
              </button>
            </div>
          </div>

          {/* Duplicate warning */}
          {duplicateWarning?.hasPotentialDuplicate && (
            <div className="p-4 rounded-2xl bg-kalvium-warning-tint dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700/40 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-yellow-800 dark:text-yellow-300">Potential Duplicate Event Detected</p>
                <p className="mt-0.5 text-yellow-700 dark:text-yellow-400 opacity-90">{duplicateWarning.reason}</p>
                <p className="text-[11px] mt-1 text-yellow-600 dark:text-yellow-500 opacity-75">
                  You can still submit; the Campus Manager will see this alert during moderation.
                </p>
              </div>
            </div>
          )}

          {/* Live conflict warning */}
          {conflictResult?.hasConflict && (
            <div className="p-4 rounded-2xl bg-kalvium-coral-tint dark:bg-kalvium-dark-surface-alt border border-kalvium-coral/30 flex items-start gap-3 animate-slide-down">
              <AlertTriangle className="w-5 h-5 text-kalvium-coral shrink-0 mt-0.5" />
              <div className="text-xs text-kalvium-coral">
                <p className="font-bold">
                  {conflictResult.type === "VENUE_CLASH" ? "Schedule Collision Warning" : "Potential Duplicate Event Detected"}
                </p>
                <p className="mt-0.5 opacity-90">{conflictResult.reason}</p>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 rounded-2xl bg-kalvium-coral-tint dark:bg-kalvium-dark-surface-alt border border-kalvium-coral/30 text-xs text-kalvium-coral">
              {errorMsg}
            </div>
          )}

          {/* AI Disclaimer */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border">
            <Info className="w-4 h-4 text-kalvium-muted shrink-0 mt-0.5" />
            <p className="text-[11px] text-kalvium-muted dark:text-kalvium-dark-muted leading-relaxed">
              AI confidence badges show extraction certainty only. A Campus Manager will cross-verify each field against your original poster before publishing to students.
            </p>
          </div>

          {/* Event Form */}
          <form onSubmit={handleSubmitForVerification} className="space-y-5 bg-white dark:bg-kalvium-dark-surface border border-kalvium-border dark:border-kalvium-dark-border rounded-3xl p-6 shadow-soft-sm">
            <h3 className="text-base font-display font-bold text-kalvium-text dark:text-kalvium-dark-text border-b border-kalvium-border dark:border-kalvium-dark-border pb-3">
              Review & Edit Extracted Details
            </h3>

            {/* Title */}
            <div>
              <label className="flex items-center text-xs font-bold text-kalvium-muted dark:text-kalvium-dark-muted uppercase tracking-wider mb-1">
                Event Title * {confidenceBadge("title")}
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. National Autonomous Drone Challenge 2026"
                className="w-full bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border rounded-xl px-4 py-2.5 text-sm text-kalvium-text dark:text-kalvium-dark-text focus:outline-none focus:border-kalvium-coral"
              />
            </div>

            {/* Date + Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center text-xs font-bold text-kalvium-muted dark:text-kalvium-dark-muted uppercase tracking-wider mb-1">
                  <Calendar className="w-3 h-3 mr-1" /> Date * {confidenceBadge("date")}
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border rounded-xl px-4 py-2.5 text-sm text-kalvium-text dark:text-kalvium-dark-text focus:outline-none focus:border-kalvium-coral"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-kalvium-muted dark:text-kalvium-dark-muted uppercase tracking-wider mb-1">
                  Category *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border rounded-xl px-4 py-2.5 text-sm text-kalvium-text dark:text-kalvium-dark-text focus:outline-none focus:border-kalvium-coral"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Start + End Time */}
            <div>
              <label className="flex items-center text-xs font-bold text-kalvium-muted dark:text-kalvium-dark-muted uppercase tracking-wider mb-2">
                <Clock className="w-3 h-3 mr-1" /> Time Slot *
                {confidenceBadge("startTime")}
              </label>
              {/* Quick time presets */}
              <div className="flex flex-wrap gap-2 mb-2">
                {TIME_SLOT_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setFormData({ ...formData, startTime: preset.start, endTime: preset.end })}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-colors ${
                      formData.startTime === preset.start && formData.endTime === preset.end
                        ? "border-kalvium-coral bg-kalvium-coral/10 text-kalvium-coral"
                        : "border-kalvium-border dark:border-kalvium-dark-border text-kalvium-muted dark:text-kalvium-dark-muted hover:border-kalvium-coral/50"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  placeholder="10:00 AM"
                  className="bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border rounded-xl px-4 py-2.5 text-sm text-kalvium-text dark:text-kalvium-dark-text focus:outline-none focus:border-kalvium-coral"
                />
                <input
                  type="text"
                  required
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  placeholder="01:00 PM"
                  className="bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border rounded-xl px-4 py-2.5 text-sm text-kalvium-text dark:text-kalvium-dark-text focus:outline-none focus:border-kalvium-coral"
                />
              </div>
            </div>

            {/* Venue */}
            <div>
              <label className="flex items-center text-xs font-bold text-kalvium-muted dark:text-kalvium-dark-muted uppercase tracking-wider mb-1">
                <MapPin className="w-3 h-3 mr-1" /> Venue * {confidenceBadge("venue")}
              </label>
              <input
                type="text"
                required
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                placeholder="e.g. Main Auditorium, CS Block"
                list="venue-suggestions"
                className="w-full bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border rounded-xl px-4 py-2.5 text-sm text-kalvium-text dark:text-kalvium-dark-text focus:outline-none focus:border-kalvium-coral"
              />
              <datalist id="venue-suggestions">
                {COMMON_VENUES.map((v) => <option key={v} value={v} />)}
              </datalist>
            </div>

            {/* Schedule conflict status */}
            <div className="p-3 rounded-xl bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border text-xs space-y-1">
              <span className="font-bold text-kalvium-text dark:text-kalvium-dark-text flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-kalvium-coral" />
                Live Schedule & Venue Status
              </span>
              {conflictChecking ? (
                <p className="text-[11px] text-kalvium-muted animate-pulse">Checking calendar for collisions...</p>
              ) : conflictResult?.hasConflict ? (
                <p className="text-[11px] text-kalvium-warning font-semibold">⚠ {conflictResult.reason}</p>
              ) : formData.date && formData.startTime ? (
                <p className="text-[11px] text-kalvium-success font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> No conflicting events found for this slot.
                </p>
              ) : (
                <p className="text-[11px] text-kalvium-muted dark:text-kalvium-dark-muted">Enter date, time, and venue to check availability.</p>
              )}
            </div>

            {/* Organizer Name */}
            <div>
              <label className="flex items-center text-xs font-bold text-kalvium-muted dark:text-kalvium-dark-muted uppercase tracking-wider mb-1">
                Organizer / Club Name {confidenceBadge("organizerName")}
              </label>
              <input
                type="text"
                value={formData.organizerName}
                onChange={(e) => setFormData({ ...formData, organizerName: e.target.value })}
                placeholder="e.g. IEEE Student Chapter"
                className="w-full bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border rounded-xl px-4 py-2.5 text-sm text-kalvium-text dark:text-kalvium-dark-text focus:outline-none focus:border-kalvium-coral"
              />
            </div>

            {/* Summary */}
            <div>
              <label className="block text-xs font-bold text-kalvium-muted dark:text-kalvium-dark-muted uppercase tracking-wider mb-1">
                Short Summary (1-2 sentences)
              </label>
              <textarea
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                rows={2}
                placeholder="A concise summary of the event..."
                className="w-full bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border rounded-xl px-4 py-2.5 text-sm text-kalvium-text dark:text-kalvium-dark-text focus:outline-none focus:border-kalvium-coral resize-none"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-kalvium-muted dark:text-kalvium-dark-muted uppercase tracking-wider mb-1">
                Full Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                placeholder="Full details about the event, activities, requirements..."
                className="w-full bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border rounded-xl px-4 py-2.5 text-sm text-kalvium-text dark:text-kalvium-dark-text focus:outline-none focus:border-kalvium-coral resize-none"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="flex items-center text-xs font-bold text-kalvium-muted dark:text-kalvium-dark-muted uppercase tracking-wider mb-1">
                <Tag className="w-3 h-3 mr-1" /> Tags (comma-separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="AI, Robotics, Workshop, Hardware"
                className="w-full bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border rounded-xl px-4 py-2.5 text-sm text-kalvium-text dark:text-kalvium-dark-text focus:outline-none focus:border-kalvium-coral"
              />
            </div>

            {/* Registration URL */}
            <div>
              <label className="flex items-center text-xs font-bold text-kalvium-muted dark:text-kalvium-dark-muted uppercase tracking-wider mb-1">
                <LinkIcon className="w-3 h-3 mr-1" /> Registration Link {confidenceBadge("registrationUrl")}
              </label>
              <input
                type="url"
                value={formData.registrationUrl}
                onChange={(e) => setFormData({ ...formData, registrationUrl: e.target.value })}
                placeholder="https://forms.gle/..."
                className="w-full bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border rounded-xl px-4 py-2.5 text-sm text-kalvium-text dark:text-kalvium-dark-text focus:outline-none focus:border-kalvium-coral"
              />
            </div>

            {/* Contact Info */}
            <div>
              <label className="flex items-center text-xs font-bold text-kalvium-muted dark:text-kalvium-dark-muted uppercase tracking-wider mb-1">
                <Mail className="w-3 h-3 mr-1" /> Contact Info {confidenceBadge("contactInfo")}
              </label>
              <input
                type="text"
                value={formData.contactInfo}
                onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                placeholder="organizer@campus.edu or WhatsApp number"
                className="w-full bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border rounded-xl px-4 py-2.5 text-sm text-kalvium-text dark:text-kalvium-dark-text focus:outline-none focus:border-kalvium-coral"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2 border-t border-kalvium-border dark:border-kalvium-dark-border">
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-kalvium-coral text-white font-bold text-sm rounded-2xl hover:bg-kalvium-coral/90 active:scale-[0.98] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed shadow-soft-sm"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    {user?.role?.toUpperCase() === "CAMPUS_MANAGER"
                      ? "Sending to Verification Studio..."
                      : user?.role?.toUpperCase() === "STUDENT"
                      ? "Submitting Event Request..."
                      : "Submitting for Verification..."}
                  </>
                ) : (
                  <>
                    <FileCheck className="w-4 h-4" />
                    {user?.role?.toUpperCase() === "CAMPUS_MANAGER"
                      ? "Send to Verification Studio for Approval"
                      : user?.role?.toUpperCase() === "STUDENT"
                      ? "Submit Event Request for Campus Verification"
                      : "Submit for Campus Manager Verification"}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
              <p className="text-center text-[11px] text-kalvium-muted dark:text-kalvium-dark-muted mt-2">
                {user?.role?.toUpperCase() === "CAMPUS_MANAGER"
                  ? "This event will be placed in your Verification Studio queue so you can review details, double-check venue availability, and stamp it approved."
                  : user?.role?.toUpperCase() === "STUDENT"
                  ? "Your event proposal will be reviewed by the Campus Manager before publishing to students."
                  : "Your event will remain private until a Campus Manager reviews and approves it."}
              </p>
            </div>
          </form>
        </div>
      )}

      {/* ─── ON-DEVICE GEMINI API KEY MODAL ─── */}
      {keyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-kalvium-dark-surface rounded-3xl border border-kalvium-border dark:border-kalvium-dark-border shadow-soft-xl p-6 space-y-5">
            <button
              type="button"
              onClick={() => {
                setKeyModalOpen(false);
                setPendingUploadPayload(null);
              }}
              className="absolute right-4 top-4 p-1.5 rounded-xl text-kalvium-muted hover:text-kalvium-text hover:bg-kalvium-surface-alt transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-kalvium-coral/10 dark:bg-kalvium-coral/20 text-kalvium-coral flex items-center justify-center shrink-0">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-display font-bold text-kalvium-text dark:text-kalvium-dark-text">
                  Provide Your Gemini API Key
                </h3>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold inline-flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Stored only on your device (Zero DB storage)
                </span>
              </div>
            </div>

            <p className="text-xs text-kalvium-muted dark:text-kalvium-dark-muted leading-relaxed">
              To analyze custom posters with Google Gemini Vision, please provide your personal API key. Your key will be saved strictly in your browser&apos;s localStorage and used only for requests from your device.
            </p>

            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-kalvium-muted uppercase tracking-wider">
                Google Gemini API Key
              </label>
              <div className="relative">
                <input
                  type={showModalKeySecret ? "text" : "password"}
                  value={modalKeyInput}
                  onChange={(e) => setModalKeyInput(e.target.value)}
                  placeholder="AIzaSy..."
                  autoFocus
                  className="w-full bg-kalvium-surface-alt dark:bg-kalvium-dark-surface-alt border border-kalvium-border dark:border-kalvium-dark-border rounded-xl px-3.5 py-2.5 text-xs font-mono text-kalvium-text dark:text-kalvium-dark-text focus:outline-none focus:border-kalvium-coral pr-9"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleModalSaveAndAnalyze();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowModalKeySecret(!showModalKeySecret)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-kalvium-muted hover:text-kalvium-coral text-xs p-1"
                >
                  {showModalKeySecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="text-kalvium-muted">Takes 30 seconds to get</span>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-kalvium-coral font-semibold hover:underline inline-flex items-center gap-1"
                >
                  <span>Get free Gemini API Key ↗</span>
                </a>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setKeyModalOpen(false);
                  setPendingUploadPayload(null);
                }}
                className="px-4 py-2.5 rounded-xl border border-kalvium-border dark:border-kalvium-dark-border text-xs font-bold text-kalvium-muted hover:text-kalvium-text transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleModalSaveAndAnalyze}
                className="px-5 py-2.5 rounded-xl bg-kalvium-coral text-white text-xs font-bold hover:bg-kalvium-coral/90 transition-colors shadow-soft-xs flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Save Key &amp; Analyze Poster</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
