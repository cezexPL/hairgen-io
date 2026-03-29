import { inngest } from "./inngest";
import { getProvider } from "./providers/factory";
import { updateGenerationStatus } from "./db/generations";
import { uploadToR2, generateR2Key, deleteFromR2 } from "./r2";

export const generateHairstyle = inngest.createFunction(
  { id: "generate-hairstyle", retries: 2 },
  { event: "hairstyle/generate.requested" },
  async ({ event, step }) => {
    const { generationId, userId, sourceImageUrl, prompt } = event.data;

    // Phase 1: Analyzing
    await step.run("update-status-analyzing", async () => {
      await updateGenerationStatus(generationId, "analyzing");
    });

    // Phase 2: Styling
    await step.run("update-status-styling", async () => {
      await updateGenerationStatus(generationId, "styling");
    });

    // Phase 3: Generating via AI provider
    const result = await step.run("generate-image", async () => {
      await updateGenerationStatus(generationId, "generating");
      const provider = getProvider();
      return provider.generate({
        sourceImageUrl,
        prompt,
        styleId: event.data.styleId,
      });
    });

    // Phase 4: Finishing — upload result to R2
    const finalUrl = await step.run("upload-result", async () => {
      await updateGenerationStatus(generationId, "finishing");

      // Fetch the generated image
      const response = await fetch(result.imageUrl);
      const buffer = Buffer.from(await response.arrayBuffer());

      const r2Key = generateR2Key("result", userId, generationId);
      const uploadedUrl = await uploadToR2(r2Key, buffer, "image/webp");

      await updateGenerationStatus(generationId, "completed", {
        resultImageUrl: uploadedUrl,
        resultR2Key: r2Key,
        falRequestId: result.requestId,
        processingTimeMs: result.processingTimeMs,
      });

      return uploadedUrl;
    });

    return { generationId, resultUrl: finalUrl };
  }
);

export const cleanupR2Object = inngest.createFunction(
  { id: "cleanup-r2-object" },
  { event: "r2/cleanup.scheduled" },
  async ({ event, step }) => {
    await step.sleep("wait-24h", "24h");
    await step.run("delete-from-r2", async () => {
      await deleteFromR2(event.data.r2Key);
    });
  }
);

export const inngestFunctions = [generateHairstyle, cleanupR2Object];
