import { NextRequest, NextResponse } from "next/server";
import { analyzeEventPoster } from "@/lib/ai-poster-analyzer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageData, mimeType, posterUrl } = body;
    
    console.log("TEST OCR hit!");

    // Run AI poster analysis
    const extractedData = await analyzeEventPoster(
      imageData || posterUrl || "",
      mimeType || "image/png"
    );

    return NextResponse.json({
      success: true,
      extractedData,
    });
  } catch (error: any) {
    console.error("Test OCR analysis route error:", error);
    return NextResponse.json(
      { error: error.message || "Error" },
      { status: 500 }
    );
  }
}
