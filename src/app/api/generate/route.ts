import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { getUserById, deductCredit, setGdprConsent } from "@/lib/db/users";
import { createGeneration } from "@/lib/db/generations";
import { uploadFile, generateStorageKey } from "@/lib/storage";
import { enqueueGeneration } from "@/lib/queue";
import { getStyleById } from "@/lib/catalog";

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { styleId, prompt: customPrompt, sourceImageBase64, gdprConsent } = body;

    if (!sourceImageBase64 && !body.sourceImageUrl) {
      return NextResponse.json({ error: "No source image provided" }, { status: 400 });
    }

    if (!styleId && !customPrompt) {
      return NextResponse.json({ error: "Style or prompt required" }, { status: 400 });
    }

    const user = await getUserById(authUser.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Handle GDPR consent
    if (gdprConsent) {
      await setGdprConsent(user.id);
    }

    if (!user.gdpr_consent && !gdprConsent) {
      return NextResponse.json({ error: "GDPR consent required" }, { status: 403 });
    }

    // Deduct credit
    const deducted = await deductCredit(user.id);
    if (!deducted) {
      return NextResponse.json(
        { error: "Insufficient credits", creditsBalance: user.credits_balance },
        { status: 402 }
      );
    }

    // Determine prompt
    let finalPrompt = customPrompt || "";
    let styleCategory: string | undefined;
    if (styleId) {
      const style = getStyleById(styleId);
      if (style) {
        finalPrompt = style.prompt;
        styleCategory = style.category;
      }
    }

    // Generate a temp ID for storage key
    const tempId = crypto.randomUUID();

    // Upload source image to MinIO
    let sourceImageUrl: string;
    let sourceStorageKey: string;

    if (sourceImageBase64) {
      const buffer = Buffer.from(sourceImageBase64, "base64");
      sourceStorageKey = generateStorageKey("source", user.id, tempId);
      sourceImageUrl = await uploadFile(sourceStorageKey, buffer, "image/webp");
    } else {
      sourceImageUrl = body.sourceImageUrl;
      sourceStorageKey = `external/${tempId}`;
    }

    // Determine watermark
    const hasWatermark = user.subscription_tier === "free";

    // Create generation record
    const generation = await createGeneration({
      userId: user.id,
      styleId: styleId || undefined,
      styleCategory,
      prompt: finalPrompt,
      sourceImageUrl,
      sourceStorageKey,
      hasWatermark,
    });

    // Enqueue BullMQ job
    await enqueueGeneration({
      generationId: generation.id,
      userId: user.id,
      sourceImageUrl,
      prompt: finalPrompt,
      styleId,
      styleCategory,
    });

    return NextResponse.json({
      generationId: generation.id,
      status: "pending",
      creditsRemaining: user.credits_balance - 1,
    });
  } catch (error) {
    console.error("Generate API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
