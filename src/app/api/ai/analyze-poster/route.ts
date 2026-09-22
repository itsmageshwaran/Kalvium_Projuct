import { NextRequest, NextResponse } from "next/server";
import { analyzeEventPoster, detectDuplicateEvent } from "@/lib/ai-poster-analyzer";
import { getAuthUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    // Students, Organizers, or Managers can run AI poster extraction
    if (!auth || !["STUDENT", "ORGANIZER", "CAMPUS_MANAGER"].includes(auth.role)) {
      return NextResponse.json(
        { error: "Authentication required to analyze event posters." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { sampleId, imageData, mimeType, posterUrl, apiKey: bodyApiKey, model: bodyModel } = body;
    const headerApiKey = req.headers.get("x-gemini-api-key") || undefined;
    const headerModel = req.headers.get("x-gemini-model") || undefined;
    const apiKey = (bodyApiKey || headerApiKey || "").trim();
    const preferredModel = (bodyModel || headerModel || "").trim();

    if (!sampleId && !imageData && !posterUrl) {
      return NextResponse.json(
        { error: "No poster provided. Please upload an event poster image." },
        { status: 400 }
      );
    }

    if (!sampleId && !apiKey) {
      return NextResponse.json(
        { error: "Gemini API key is required to analyze custom posters. Please enter your API key on your device (it stays on your device and is never saved to Firebase)." },
        { status: 400 }
      );
    }

    // Run AI poster analysis using the user's on-device API key and preferred Flash model
    const extractedData = await analyzeEventPoster(
      imageData || posterUrl || "",
      mimeType || "image/png",
      sampleId,
      apiKey,
      preferredModel || undefined
    );

    // Run duplicate event detection
    const duplicateCheck = await detectDuplicateEvent(
      extractedData.title,
      extractedData.date,
      extractedData.startTime,
      extractedData.venue
    );

    return NextResponse.json({
      success: true,
      extractedData,
      duplicateCheck,
    });
  } catch (error: any) {
    console.error("AI poster analysis route error:", error);
    const msg = error?.message || "AI analysis could not process the poster. Please review fields manually.";
    const isClientError =
      msg.includes("API key") ||
      msg.includes("quota") ||
      msg.includes("rate limit") ||
      msg.includes("No poster");

    return NextResponse.json(
      { error: msg },
      { status: isClientError ? 400 : 500 }
    );
  }
}
