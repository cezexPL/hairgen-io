import { BaseProvider, type GenerationRequest, type GenerationResult } from "./base";

/**
 * Google Nano Banana Pro (gemini nano-banana-pro-preview) provider.
 * Uses image-to-image editing — same face, only hair/beard changed.
 */
export class GoogleProvider extends BaseProvider {
  readonly name = "Google Nano Banana Pro";

  private async callGemini(parts: object[]): Promise<string> {
    const key = process.env.GOOGLE_AI_API_KEY;
    if (!key) throw new Error("GOOGLE_AI_API_KEY not set");

    const payload = {
      contents: [{ parts }],
      generationConfig: { responseModalities: ["IMAGE", "TEXT"] },
    };

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/nano-banana-pro-preview:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Google API error ${res.status}: ${err}`);
    }

    const data = await res.json();
    const responseParts = data?.candidates?.[0]?.content?.parts ?? [];

    for (const part of responseParts) {
      if (part.inlineData) {
        // Return as data URL
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }

    throw new Error("No image in Google API response: " + JSON.stringify(data).slice(0, 300));
  }

  async generate(request: GenerationRequest): Promise<GenerationResult> {
    const startTime = Date.now();

    // If no API key — return mock
    if (!process.env.GOOGLE_AI_API_KEY) {
      await new Promise((r) => setTimeout(r, 1500));
      return {
        imageUrl: request.sourceImageUrl,
        requestId: `mock-${Date.now()}`,
        processingTimeMs: Date.now() - startTime,
      };
    }

    // Build optimized edit prompt
    const editPrompt = this.buildPrompt(request.prompt);

    let imageDataUrl: string;

    if (request.sourceImageUrl) {
      // Fetch source image and encode as base64
      const imgRes = await fetch(request.sourceImageUrl);
      if (!imgRes.ok) throw new Error(`Cannot fetch source image: ${request.sourceImageUrl}`);
      const buffer = await imgRes.arrayBuffer();
      const b64 = Buffer.from(buffer).toString("base64");
      const mimeType = imgRes.headers.get("content-type") || "image/jpeg";

      // Image-to-image: send both text prompt and source image
      imageDataUrl = await this.callGemini([
        { text: editPrompt },
        { inline_data: { mime_type: mimeType, data: b64 } },
      ]);
    } else {
      // Text-to-image fallback
      imageDataUrl = await this.callGemini([{ text: editPrompt }]);
    }

    return {
      imageUrl: imageDataUrl,
      requestId: `google-${Date.now()}`,
      processingTimeMs: Date.now() - startTime,
    };
  }

  private buildPrompt(customPrompt: string): string {
    // Base instruction — critical for identity preservation
    const base =
      "Keep the exact same face, skin tone, facial features, expression, lighting and background. Do not change clothing. Only modify the hair or facial hair as described below. Photorealistic, high quality, Canon 5D portrait.";

    if (customPrompt) {
      return `${customPrompt}. ${base}`;
    }

    // Fallback
    return `Change the hairstyle as requested. ${base}`;
  }

  async checkHealth(): Promise<boolean> {
    return !!process.env.GOOGLE_AI_API_KEY;
  }
}
