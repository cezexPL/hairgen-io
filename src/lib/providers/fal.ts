import * as fal from "@fal-ai/serverless-client";
import { BaseProvider, type GenerationRequest, type GenerationResult } from "./base";

fal.config({
  credentials: process.env.FAL_KEY,
});

interface FalHairChangeResult {
  image: { url: string };
  request_id?: string;
}

export class FalProvider extends BaseProvider {
  readonly name = "fal.ai";

  async generate(request: GenerationRequest): Promise<GenerationResult> {
    const startTime = Date.now();

    // If no FAL_KEY, return mock result for development
    if (!process.env.FAL_KEY) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return {
        imageUrl: request.sourceImageUrl,
        requestId: `mock-${Date.now()}`,
        processingTimeMs: Date.now() - startTime,
      };
    }

    const result = await fal.subscribe("fal-ai/image-apps-v2/hair-change", {
      input: {
        image_url: request.sourceImageUrl,
        prompt: request.prompt,
      },
      logs: false,
    }) as FalHairChangeResult;

    return {
      imageUrl: result.image.url,
      requestId: result.request_id || `fal-${Date.now()}`,
      processingTimeMs: Date.now() - startTime,
    };
  }

  async checkHealth(): Promise<boolean> {
    if (!process.env.FAL_KEY) return true;
    try {
      return true;
    } catch {
      return false;
    }
  }
}
