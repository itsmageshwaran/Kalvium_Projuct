import { NextRequest, NextResponse } from "next/server";
import { analyzeEventPoster, detectDuplicateEvent } from "@/lib/ai-poster-analyzer";
import { getAuthUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    // Organizers or Managers can run AI poster extraction
    if (!auth || (auth.role !== "ORGANIZER" && auth.role !== "CAMPUS_MANAGER")) {
      return NextResponse.json(
        { error: "Only organizers or campus managers can analyze event posters." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { sampleId, imageData, mimeType, posterUrl } = body;

    if (!sampleId && !imageData && !posterUrl) {
      return NextResponse.json(
        { error: "No poster provided. Please upload an image or select a sample poster." },
        { status: 400 }
      );
    }

    if (imageData && typeof imageData === "string" && imageData.length > 8 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image size exceeds 6MB limit. Please upload a smaller image file." },
        { status: 413 }
      );
    }

    if (posterUrl && typeof posterUrl === "string" && posterUrl.length > 8 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Poster URL payload exceeds size limit." },
        { status: 413 }
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
  } catch (error) {
    console.error("AI poster analysis route error:", error);
    return NextResponse.json(
      { error: "AI analysis could not process the poster. Please review fields manually." },
      { status: 500 }
    );
  }
}
