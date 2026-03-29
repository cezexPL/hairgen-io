import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getOrCreateUser, deductCredit, setGdprConsent } from "@/lib/db/users";
import { createGeneration } from "@/lib/db/generations";
import { getUploadPresignedUrl, generateR2Key, getPublicUrl } from "@/lib/r2";
import { inngest } from "@/lib/inngest";
import { getStyleById } from "@/lib/catalog";

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
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

    // Get or create user
    const user = await getOrCreateUser(clerkId, body.email || "unknown@hairgen.io");

    // Handle GDPR consent
    if (gdprConsent) {
      await setGdprConsent(user.id);
    }

    if (!user.gdpr_consent && !gdprConsent) {
      return NextResponse.json({ error: "GDPR consent required" }, { status: 403 });
    }

    // Deduct credit (optimistic)
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

    // Generate a temp generation ID to use for R2 key
    const tempId = crypto.randomUUID();

    // Upload source image to R2
    let sourceImageUrl: string;
    let sourceR2Key: string;

    if (sourceImageBase64) {
      const buffer = Buffer.from(sourceImageBase64, "base64");
      sourceR2Key = generateR2Key("source", user.id, tempId);
      const presignedUrl = await getUploadPresignedUrl(sourceR2Key, "image/webp");

      // Upload via presigned URL
      await fetch(presignedUrl, {
        method: "PUT",
        body: buffer,
        headers: { "Content-Type": "image/webp" },
      });

      sourceImageUrl = getPublicUrl(sourceR2Key);
    } else {
      sourceImageUrl = body.sourceImageUrl;
      sourceR2Key = `external/${tempId}`;
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
      sourceR2Key,
      hasWatermark,
    });

    // Send to Inngest queue
    await inngest.send({
      name: "hairstyle/generate.requested",
      data: {
        generationId: generation.id,
        userId: user.id,
        sourceImageUrl,
        prompt: finalPrompt,
        styleId,
        styleCategory,
      },
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
