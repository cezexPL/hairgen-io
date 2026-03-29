import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/lib/db/users";
import { getUserGenerations } from "@/lib/db/generations";

export async function GET(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserByClerkId(clerkId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const generations = await getUserGenerations(user.id, limit, offset);

    return NextResponse.json({
      generations: generations.map((g) => ({
        id: g.id,
        status: g.status,
        styleId: g.style_id,
        styleCategory: g.style_category,
        prompt: g.prompt,
        sourceImageUrl: g.source_image_url,
        resultImageUrl: g.result_image_url,
        hasWatermark: g.has_watermark,
        processingTimeMs: g.processing_time_ms,
        createdAt: g.created_at,
      })),
    });
  } catch (error) {
    console.error("Generations API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
