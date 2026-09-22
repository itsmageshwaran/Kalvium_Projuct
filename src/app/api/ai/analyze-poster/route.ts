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
    const { sampleId, imageData, mimeType, posterUrl } = body;

    if (!sampleId && !imageData && !posterUrl) {
      return NextResponse.json(
        { error: "No poster provided. Please upload an event poster image." },
        { status: 400 }
      );
    }

    // Run AI poster analysis
    const extractedData = await analyzeEventPoster(
      imageData || posterUrl || "",
      mimeType || "image/png",
      sampleId
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
    return NextResponse.json(
      { error: error?.message || "AI analysis could not process the poster. Please review fields manually." },
      { status: 500 }
    );
  }
}
