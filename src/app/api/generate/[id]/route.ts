import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getGenerationById } from "@/lib/db/generations";
import { getUserByClerkId } from "@/lib/db/users";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const generation = await getGenerationById(id);
    if (!generation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Verify ownership
    const user = await getUserByClerkId(clerkId);
    if (!user || generation.user_id !== user.id) {
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
      processingTimeMs: generation.processing_time_ms,
      createdAt: generation.created_at,
    });
  } catch (error) {
    console.error("Get generation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
