import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { getGenerationById } from "@/lib/db/generations";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const generation = await getGenerationById(id);
    if (!generation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Verify ownership
    if (generation.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      id: generation.id,
      status: generation.status,
      sourceImageUrl: generation.source_image_url,
      resultImageUrl: generation.result_image_url,
      hasWatermark: generation.has_watermark,
      styleId: generation.style_id,
      prompt: generation.prompt,
      errorMessage: generation.error_message,
      processingTimeMs: generation.processing_time_ms,
      createdAt: generation.created_at,
    });
  } catch (error) {
    console.error("Get generation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
