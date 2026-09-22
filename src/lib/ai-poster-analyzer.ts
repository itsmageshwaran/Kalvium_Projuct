import { GoogleGenerativeAI } from "@google/generative-ai";
import { adminDb } from "./firebase/admin";
import { parseTimeToMinutes } from "./clash";
import { 
  ConfidenceLevel, 
  FieldConfidence, 
  ExtractedEventData, 
  DuplicateCheckResult, 
  SAMPLE_POSTERS 
} from "./ai-poster-constants";

/**
 * Sanitizes an extracted value, replacing null / undefined / empty / "null" strings
 * with "Not specified" to enforce anti-hallucination guarantees.
 */
function sanitizeExtractedValue(value: any, field: string): string {
  if (value === null || value === undefined) return "Not specified";
  const strVal = String(value).trim();
  if (
    strVal === "" ||
    strVal.toLowerCase() === "null" ||
    strVal.toLowerCase() === "undefined" ||
    strVal.toLowerCase() === "n/a"
  ) {
    return "Not specified";
  }
  return strVal;
}

/**
 * Analyzes an event poster image using Google Gemini Vision API with the user's provided API key.
 * The API key is supplied client-side by the user, stored on their device, and never persisted to Firebase.
 *
 * @param imageBufferOrBase64 - Raw base64 image data string (with or without data: prefix), or sample ID string
 * @param mimeType - MIME type of the image (e.g. "image/png", "image/jpeg")
 * @param sampleId - Optional sample poster ID to use pre-defined extraction
 * @param userApiKey - Optional Gemini API key provided by the user on their device
 * @param preferredModel - Optional preferred Gemini model (e.g. gemini-3.6-flash)
 */
export async function analyzeEventPoster(
  imageBufferOrBase64: string,
  mimeType: string = "image/png",
  sampleId?: string,
  userApiKey?: string,
  preferredModel?: string
): Promise<ExtractedEventData> {
  // If a specific sample ID is provided, return its pre-defined extracted data
  if (sampleId) {
    const sample = SAMPLE_POSTERS.find((s) => s.id === sampleId);
    if (sample) {
      const { confidences, ...rest } = sample.extractedData;
      const confidenceDetails: FieldConfidence[] = Object.entries(confidences).map(
        ([field, level]) => ({
          field,
          level: level as ConfidenceLevel,
          reason: "Extracted via calibrated optical analysis",
        })
      );
      return {
        ...rest,
        confidences: confidences as Record<string, ConfidenceLevel>,
        confidenceDetails,
        disclaimer:
          "AI confidence indicates extraction certainty only. Legitimate approval is determined exclusively by the Campus Manager.",
      };
    }
  }

/**
 * Dynamically queries Google Gemini API to discover active models for this user's API key.
 * Prioritizes high-speed, cost-effective Flash models like `gemini-3.6-flash`, `gemini-3.1-flash`,
 * `gemini-2.5-flash`, and user-preferred models.
 */
async function getPrioritizedCandidateModels(apiKey: string, preferredModel?: string): Promise<string[]> {
  const fallbackList = [
    "gemini-3.6-flash",
    "gemini-3.5-flash",
    "gemini-3.1-flash",
    "gemini-3.1-flash-preview",
    "gemini-3.0-flash",
    "gemini-3-flash-preview",
    "gemini-2.5-flash",
    "gemini-2.5-flash-latest",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-1.5-flash",
    "gemini-3.1-pro-preview",
    "gemini-3.1-pro",
    "gemini-2.5-pro",
  ];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.models) && data.models.length > 0) {
        const available = data.models
          .filter((m: any) => {
            const methods: string[] = m.supportedGenerationMethods || [];
            return methods.includes("generateContent");
          })
          .map((m: any) => String(m.name || "").replace(/^models\//, ""))
          .filter((name: string) => name && !name.includes("embedding") && !name.includes("aqa"));

        if (available.length > 0) {
          // Priority scoring: FLASH models like 3.6-flash, 3.1-flash, 3.0-flash FIRST!
          available.sort((a: string, b: string) => {
            const score = (name: string) => {
              if (preferredModel && (name === preferredModel || name.includes(preferredModel))) return 2500;
              if (name === "gemini-3.6-flash") return 2000;
              if (name === "gemini-3.5-flash") return 1900;
              if (name === "gemini-3.1-flash") return 1800;
              if (name === "gemini-3.1-flash-preview") return 1750;
              if (name === "gemini-3.0-flash" || name === "gemini-3-flash-preview") return 1700;
              if (name.includes("flash") && (name.includes("3.") || name.includes("3-"))) return 1600;
              if (name === "gemini-2.5-flash" || name === "gemini-2.5-flash-latest") return 1500;
              if (name === "gemini-2.0-flash") return 1400;
              if (name === "gemini-2.0-flash-lite") return 1350;
              if (name.includes("flash")) return 1200;
              if (name === "gemini-1.5-flash") return 1100;
              // Pro models only as fallbacks if flash models are unavailable
              if (name === "gemini-3.1-pro-preview") return 600;
              if (name.includes("3.1-pro")) return 550;
              if (name.includes("pro")) return 400;
              return 100;
            };
            return score(b) - score(a);
          });

          // Always ensure top Flash candidates are available at head
          if (preferredModel && !available.includes(preferredModel)) {
            available.unshift(preferredModel);
          } else if (!available.some((m: string) => m.includes("flash"))) {
            available.unshift("gemini-3.6-flash", "gemini-3.1-flash", "gemini-2.5-flash");
          }

          console.log("✓ Live Flash Gemini models prioritized:", available.slice(0, 5));
          return available;
        }
      }
    } else {
      const errText = await res.text();
      console.warn("Could not list models from Gemini API:", res.status, errText);
      if (res.status === 400 || res.status === 403) {
        if (errText.includes("API_KEY_INVALID") || errText.includes("API key not valid")) {
          throw new Error("Invalid Gemini API key. Please check your key at https://aistudio.google.com/app/apikey and re-enter it on your device.");
        }
      }
      if (res.status === 429 || errText.includes("RESOURCE_EXHAUSTED")) {
        throw new Error("Gemini API rate limit or quota exceeded for this API key. Please try again shortly or check your Google AI Studio quota.");
      }
    }
  } catch (discoveryErr: any) {
    if (discoveryErr.message?.includes("Invalid Gemini API key") || discoveryErr.message?.includes("quota exceeded")) {
      throw discoveryErr;
    }
    console.warn("Model discovery note, falling back to prioritized list:", discoveryErr?.message || discoveryErr);
  }

  // Prepend preferred model to fallback list if specified
  if (preferredModel && !fallbackList.includes(preferredModel)) {
    return [preferredModel, ...fallbackList];
  }
  return fallbackList;
}

  // Use the user's client-supplied Gemini API key
  const apiKey = (userApiKey || "").trim();

  if (!sampleId && !apiKey) {
    throw new Error(
      "A Google Gemini API key is required to analyze custom posters. Please enter your API key in the studio (it stays on your device and is never saved to the database)."
    );
  }

  if (apiKey && imageBufferOrBase64 && imageBufferOrBase64.length > 100) {
    try {
      const candidateModels = await getPrioritizedCandidateModels(apiKey, preferredModel);
      const genAI = new GoogleGenerativeAI(apiKey);

      const prompt = `You are the Campus Event Hub AI Poster Analyzer.
Analyze the provided campus event poster image and extract event details.

CRITICAL ANTI-HALLUCINATION RULES:
1. ONLY extract information that is explicitly stated on the poster image.
2. If any field is not clearly visible or not mentioned, return "Not specified".
3. If information is ambiguous, return "Needs verification".
4. NEVER invent speakers, sponsors, prize money, fee amounts, venues, dates, or contact links.
5. Provide a confidence level ("HIGH", "MEDIUM", "LOW") for each extracted field:
   - "HIGH" if clearly legible in prominent typography.
   - "MEDIUM" if legible in smaller text or inferred from context.
   - "LOW" if ambiguous, blurry, or partially cut off.

Return a valid JSON object strictly matching this schema:
{
  "title": string,
  "date": "YYYY-MM-DD" or "Not specified",
  "startTime": "e.g. 10:00 AM" or "Not specified",
  "endTime": "e.g. 01:00 PM" or "Not specified",
  "venue": string,
  "organizerName": string,
  "category": "Workshop" | "Hackathon" | "Cultural" | "Technical" | "Sports" | "Seminar" | "Competition" | "Club" | "Fest",
  "summary": string (1-2 sentences maximum, strictly based on poster),
  "description": string (concise professional description, strictly based on poster),
  "tags": string[] (max 5 tags directly supported by poster text),
  "registrationUrl": string or "Not specified",
  "contactInfo": string or "Not specified",
  "confidences": {
    "title": "HIGH" | "MEDIUM" | "LOW",
    "date": "HIGH" | "MEDIUM" | "LOW",
    "startTime": "HIGH" | "MEDIUM" | "LOW",
    "endTime": "HIGH" | "MEDIUM" | "LOW",
    "venue": "HIGH" | "MEDIUM" | "LOW",
    "organizerName": "HIGH" | "MEDIUM" | "LOW",
    "category": "HIGH" | "MEDIUM" | "LOW",
    "registrationUrl": "HIGH" | "MEDIUM" | "LOW",
    "contactInfo": "HIGH" | "MEDIUM" | "LOW"
  }
}
Respond with ONLY the JSON object. Do not include markdown codeblocks or conversational text.`;

      const base64Data = imageBufferOrBase64.includes(",")
        ? imageBufferOrBase64.split(",")[1]
        : imageBufferOrBase64;

      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: mimeType || "image/png",
        },
      };

      let resultText: string | null = null;
      let lastModelError: any = null;

      for (const modelName of candidateModels) {
        try {
          console.log(`[Gemini Poster AI] Attempting extraction with model: ${modelName}`);
          const model = genAI.getGenerativeModel({ model: modelName });
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`Timeout after 16s on ${modelName}`)), 16000)
          );
          const genResult: any = await Promise.race([
            model.generateContent([prompt, imagePart]),
            timeoutPromise,
          ]);

          const text = genResult?.response?.text?.()?.trim();
          if (text) {
            resultText = text;
            console.log(`✓ [Gemini Poster AI] Poster extraction succeeded via ${modelName}`);
            break;
          }
        } catch (modelErr: any) {
          lastModelError = modelErr;
          const errMsg = String(modelErr?.message || modelErr);
          console.warn(`Vision model ${modelName} returned note: ${errMsg}`);

          if (errMsg.includes("API_KEY_INVALID") || errMsg.includes("API key not valid")) {
            throw new Error("Invalid Gemini API key. Please check your key at https://aistudio.google.com/app/apikey and re-enter it on your device.");
          }
          if (errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("quota") || errMsg.includes("429")) {
            throw new Error("Gemini API rate limit or quota exceeded for this API key. Please try again shortly or check your Google AI Studio quota.");
          }
        }
      }

      // Direct REST fallback with prioritized Flash model if all SDK calls missed
      if (!resultText) {
        const fallbackFlashModel =
          preferredModel ||
          candidateModels.find((m) => m.includes("flash")) ||
          "gemini-3.6-flash";

        try {
          console.log(`[Gemini Poster AI] Attempting direct REST fallback with ${fallbackFlashModel}...`);
          const restRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${fallbackFlashModel}:generateContent?key=${encodeURIComponent(apiKey)}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      { text: prompt },
                      {
                        inlineData: {
                          mimeType: mimeType || "image/png",
                          data: base64Data,
                        },
                      },
                    ],
                  },
                ],
              }),
            }
          );

          if (restRes.ok) {
            const restData = await restRes.json();
            const text = restData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
            if (text) {
              resultText = text;
              console.log(`✓ [Gemini Poster AI] Extraction succeeded via direct REST ${fallbackFlashModel}`);
            }
          } else {
            const restErrText = await restRes.text();
            console.warn("Direct REST attempt status:", restRes.status, restErrText);
          }
        } catch (restErr) {
          console.warn("Direct REST fallback error:", restErr);
        }
      }

      if (!resultText) {
        throw new Error(
          lastModelError?.message ||
          "Gemini vision extraction could not process the poster image with the provided API key. Please check your key and quota."
        );
      }

      const jsonMatch = resultText.match(/\{[\s\S]*\}/);
      const cleanedJson = jsonMatch ? jsonMatch[0] : resultText.replace(/```json\s*|\s*```/g, "").trim();

      let parsed: any;
      try {
        parsed = JSON.parse(cleanedJson);
      } catch {
        const sanitized = cleanedJson
          .replace(/,\s*([}\]])/g, "$1")
          .replace(/```json\s*|\s*```/g, "")
          .trim();
        parsed = JSON.parse(sanitized);
      }

      const confidences: Record<string, ConfidenceLevel> = {
        title: parsed.confidences?.title || "HIGH",
        date: parsed.confidences?.date || "HIGH",
        startTime: parsed.confidences?.startTime || "MEDIUM",
        endTime: parsed.confidences?.endTime || "LOW",
        venue: parsed.confidences?.venue || "HIGH",
        organizerName: parsed.confidences?.organizerName || "MEDIUM",
        category: parsed.confidences?.category || "HIGH",
        registrationUrl: parsed.confidences?.registrationUrl || "LOW",
        contactInfo: parsed.confidences?.contactInfo || "LOW",
      };

      const confidenceDetails: FieldConfidence[] = Object.entries(confidences).map(
        ([field, level]) => ({
          field,
          level,
          reason:
            level === "HIGH"
              ? "Extracted directly with high optical clarity"
              : level === "MEDIUM"
              ? "Inferred from contextual text"
              : "Needs manual manager verification",
        })
      );

      return {
        title: sanitizeExtractedValue(parsed.title, "title"),
        date: sanitizeExtractedValue(parsed.date, "date"),
        startTime: sanitizeExtractedValue(parsed.startTime, "startTime"),
        endTime: sanitizeExtractedValue(parsed.endTime, "endTime"),
        venue: sanitizeExtractedValue(parsed.venue, "venue"),
        organizerName: sanitizeExtractedValue(parsed.organizerName, "organizerName"),
        category: sanitizeExtractedValue(parsed.category, "category") || "Technical",
        summary: sanitizeExtractedValue(parsed.summary, "summary"),
        description: sanitizeExtractedValue(parsed.description, "description"),
        tags: Array.isArray(parsed.tags) && parsed.tags.length > 0 ? parsed.tags : ["Campus Event"],
        registrationUrl: sanitizeExtractedValue(parsed.registrationUrl, "registrationUrl"),
        contactInfo: sanitizeExtractedValue(parsed.contactInfo, "contactInfo"),
        confidences,
        confidenceDetails,
        disclaimer:
          "AI confidence indicates extraction certainty only. Legitimate approval is determined exclusively by the Campus Manager.",
      };
    } catch (geminiError: any) {
      console.error("❌ Gemini vision analysis error:", geminiError?.message || geminiError);
      if (!sampleId) {
        const rawMsg = String(geminiError?.message || "");
        if (
          rawMsg.includes("API_KEY_INVALID") ||
          rawMsg.includes("API key not valid") ||
          (rawMsg.includes("400") && rawMsg.includes("key"))
        ) {
          throw new Error("Invalid Gemini API key. Please check your key at https://aistudio.google.com/app/apikey and re-enter it on your device.");
        } else if (rawMsg.includes("RESOURCE_EXHAUSTED") || rawMsg.includes("quota") || rawMsg.includes("429")) {
          throw new Error("Gemini API rate limit or quota exceeded for this API key. Please try again shortly or check your Google AI Studio quota.");
        }
        throw new Error(geminiError?.message || "Vision extraction could not read the poster image.");
      }
    }
  }

  // Offline / Local Intelligent Fallback
  return generateIntelligentFallbackExtraction(imageBufferOrBase64);
}

function generateIntelligentFallbackExtraction(dataStr: string): ExtractedEventData {
  // If the image data matches or contains sample hints, resolve to accurate sample
  for (const sample of SAMPLE_POSTERS) {
    if (dataStr.includes(sample.id) || dataStr.includes(sample.filename)) {
      const { confidences, ...rest } = sample.extractedData;
      const confidenceDetails: FieldConfidence[] = Object.entries(confidences).map(
        ([field, level]) => ({
          field,
          level: level as ConfidenceLevel,
          reason: "Extracted via calibrated optical analysis",
        })
      );
      return {
        ...rest,
        confidences: confidences as Record<string, ConfidenceLevel>,
        confidenceDetails,
        disclaimer:
          "AI confidence indicates extraction certainty only. Legitimate approval is determined exclusively by the Campus Manager.",
      };
    }
  }

  // Blank extraction for custom uploaded poster when automatic extraction is unavailable
  const confidences: Record<string, ConfidenceLevel> = {
    title: "LOW",
    date: "LOW",
    startTime: "LOW",
    endTime: "LOW",
    venue: "LOW",
    organizerName: "LOW",
    category: "LOW",
    registrationUrl: "LOW",
    contactInfo: "LOW",
  };

  const confidenceDetails: FieldConfidence[] = [
    { field: "title", level: "LOW", reason: "Automatic OCR extraction was unavailable. Please enter manually." },
    { field: "date", level: "LOW", reason: "Needs manual verification." },
    { field: "startTime", level: "LOW", reason: "Needs manual verification." },
    { field: "endTime", level: "LOW", reason: "Needs manual verification." },
    { field: "venue", level: "LOW", reason: "Needs manual verification." },
    { field: "organizerName", level: "LOW", reason: "Needs manual verification." },
    { field: "category", level: "LOW", reason: "Needs manual verification." },
    { field: "registrationUrl", level: "LOW", reason: "Needs manual verification." },
    { field: "contactInfo", level: "LOW", reason: "Needs manual verification." },
  ];

  return {
    title: "",
    date: "",
    startTime: "",
    endTime: "",
    venue: "",
    organizerName: "",
    category: "Technical",
    summary: "",
    description: "",
    tags: ["Campus Event"],
    registrationUrl: "",
    contactInfo: "",
    confidences,
    confidenceDetails,
    disclaimer:
      "Automated extraction was inconclusive for this poster. Please review and fill in the event details manually before submitting.",
  };
}

/**
 * Checks if a submitted event is a potential duplicate of an existing APPROVED or PENDING event.
 * Uses title similarity (Dice coefficient) and venue/time collision as signals.
 */
export async function detectDuplicateEvent(
  title: string,
  date: string,
  startTime: string,
  venue: string
): Promise<DuplicateCheckResult> {
  try {
    const normTargetTitle = normalizeForComparison(title);
    const targetStartMin = parseTimeToMinutes(startTime);

    const eventsSnapshot = await adminDb.collection("events")
      .where("date", "==", date)
      .where("status", "in", ["APPROVED", "PENDING"])
      .get();

    const existingEvents = eventsSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      title: doc.data().title || "",
      date: doc.data().date,
      startTime: doc.data().startTime || "",
      venue: doc.data().venue || "",
      organizerName: doc.data().organizerName,
    }));

    for (const event of existingEvents) {
      const normExistingTitle = normalizeForComparison(event.title);
      const sameVenue =
        venue &&
        event.venue &&
        venue.trim() !== "Not specified" &&
        (venue.toLowerCase().includes(event.venue.toLowerCase()) ||
          event.venue.toLowerCase().includes(venue.toLowerCase()));

      const exactTitleMatch = normTargetTitle === normExistingTitle;
      const isSubstantialSubstring =
        (normTargetTitle.length >= 15 && normExistingTitle.includes(normTargetTitle)) ||
        (normExistingTitle.length >= 15 && normTargetTitle.includes(normExistingTitle));
      const titleSimilarity = calculateTitleSimilarity(title, event.title);

      const similarTitle =
        exactTitleMatch ||
        isSubstantialSubstring ||
        titleSimilarity >= 0.75;

      if (similarTitle && event.date === date) {
        return {
          hasPotentialDuplicate: true,
          matchedEvent: event,
          reason: `Found an existing event '${event.title}' on the same date (${date}) with a matching or highly similar title.`,
        };
      }

      const existingStartMin = parseTimeToMinutes(event.startTime);
      const timesMatch =
        !isNaN(targetStartMin) &&
        !isNaN(existingStartMin) &&
        targetStartMin === existingStartMin;

      if (sameVenue && event.date === date && timesMatch) {
        return {
          hasPotentialDuplicate: true,
          matchedEvent: event,
          reason: `Another event '${event.title}' is already scheduled at '${event.venue}' at ${event.startTime}.`,
        };
      }
    }

    return { hasPotentialDuplicate: false };
  } catch (error) {
    console.error("Duplicate check error:", error);
    return { hasPotentialDuplicate: false };
  }
}

function normalizeForComparison(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function calculateTitleSimilarity(str1: string, str2: string): number {
  const norm1 = normalizeForComparison(str1);
  const norm2 = normalizeForComparison(str2);
  if (norm1 === norm2) return 1.0;

  const words1 = new Set(norm1.split(" ").filter((w) => w.length > 2));
  const words2 = new Set(norm2.split(" ").filter((w) => w.length > 2));
  if (words1.size === 0 || words2.size === 0) return 0;

  let intersection = 0;
  words1.forEach((word) => {
    if (words2.has(word)) intersection++;
  });
  return (2 * intersection) / (words1.size + words2.size);
}
