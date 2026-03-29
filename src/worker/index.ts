import { Worker, type Job } from "bullmq";
import IORedis from "ioredis";
import { Pool, type QueryResultRow } from "pg";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import * as fal from "@fal-ai/serverless-client";

// ─── Config ──────────────────────────────────────────────────────────────────

const REDIS_URL = process.env.REDIS_URL || "redis://hairgen-redis:6379";
const DATABASE_URL = process.env.DATABASE_URL || "postgresql://hairgen:hairgen_secret@hairgen-db:5432/hairgen";
const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || "http://minio:9000";
const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY || "hairgen-admin";
const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY || "hairgen-secret-2026";
const MINIO_BUCKET = process.env.MINIO_BUCKET || "hairgen";
const MINIO_PUBLIC_URL = process.env.MINIO_PUBLIC_URL || MINIO_ENDPOINT;

fal.config({ credentials: process.env.FAL_KEY });

// ─── Clients ─────────────────────────────────────────────────────────────────

const redis = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });

const pool = new Pool({
  connectionString: DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

const s3 = new S3Client({
  region: "us-east-1",
  endpoint: MINIO_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: MINIO_ACCESS_KEY,
    secretAccessKey: MINIO_SECRET_KEY,
  },
});

// ─── DB helpers ──────────────────────────────────────────────────────────────

async function dbQuery<T extends QueryResultRow>(text: string, params?: unknown[]): Promise<T[]> {
  const result = await pool.query<T>(text, params);
  return result.rows;
}

async function updateStatus(
  id: string,
  status: string,
  extra?: Record<string, unknown>
): Promise<void> {
  const sets: string[] = ["status = $2"];
  const params: unknown[] = [id, status];
  let idx = 3;

  if (extra) {
    for (const [col, val] of Object.entries(extra)) {
      if (val !== undefined) {
        sets.push(`${col} = $${idx}`);
        params.push(val);
        idx++;
      }
    }
  }

  await dbQuery(
    `UPDATE generations SET ${sets.join(", ")} WHERE id = $1`,
    params
  );
}

// ─── Storage helpers ─────────────────────────────────────────────────────────

function generateStorageKey(type: string, userId: string, generationId: string): string {
  const date = new Date().toISOString().split("T")[0];
  return `${type}/${date}/${userId}/${generationId}.webp`;
}

function getPublicUrl(key: string): string {
  return `${MINIO_PUBLIC_URL}/${MINIO_BUCKET}/${key}`;
}

async function uploadToStorage(key: string, body: Buffer, contentType: string): Promise<string> {
  await s3.send(
    new PutObjectCommand({
      Bucket: MINIO_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
  return getPublicUrl(key);
}

// ─── fal.ai types ────────────────────────────────────────────────────────────

interface FalHairChangeResult {
  image: { url: string };
  request_id?: string;
}

// ─── Job processor ───────────────────────────────────────────────────────────

interface GenerationJobData {
  generationId: string;
  userId: string;
  sourceImageUrl: string;
  prompt: string;
  styleId?: string;
  styleCategory?: string;
}

async function processGeneration(job: Job<GenerationJobData>): Promise<{ generationId: string; resultUrl: string }> {
  const { generationId, userId, sourceImageUrl, prompt } = job.data;
  const startTime = Date.now();

  console.log(`[worker] Processing generation ${generationId}`);

  // Phase 1: Analyzing
  await updateStatus(generationId, "analyzing");
  await job.updateProgress(25);

  // Phase 2: Styling
  await updateStatus(generationId, "styling");
  await job.updateProgress(40);

  // Phase 3: Generate via fal.ai (or mock)
  await updateStatus(generationId, "generating");

  let imageUrl: string;
  let requestId: string;

  if (!process.env.FAL_KEY) {
    // Mock mode for development
    await new Promise((resolve) => setTimeout(resolve, 2000));
    imageUrl = sourceImageUrl;
    requestId = `mock-${Date.now()}`;
  } else {
    const result = await fal.subscribe("fal-ai/image-apps-v2/hair-change", {
      input: {
        image_url: sourceImageUrl,
        prompt,
      },
      logs: false,
    }) as FalHairChangeResult;

    imageUrl = result.image.url;
    requestId = result.request_id || `fal-${Date.now()}`;
  }

  await job.updateProgress(75);

  // Phase 4: Upload result to MinIO
  await updateStatus(generationId, "finishing");

  const response = await fetch(imageUrl);
  const buffer = Buffer.from(await response.arrayBuffer());

  const storageKey = generateStorageKey("result", userId, generationId);
  const uploadedUrl = await uploadToStorage(storageKey, buffer, "image/webp");

  const processingTimeMs = Date.now() - startTime;

  await updateStatus(generationId, "completed", {
    result_image_url: uploadedUrl,
    result_storage_key: storageKey,
    fal_request_id: requestId,
    processing_time_ms: processingTimeMs,
  });

  await job.updateProgress(100);

  console.log(`[worker] Generation ${generationId} completed in ${processingTimeMs}ms`);

  return { generationId, resultUrl: uploadedUrl };
}

// ─── Error handler ───────────────────────────────────────────────────────────

async function handleFailedJob(job: Job<GenerationJobData> | undefined, err: Error): Promise<void> {
  if (!job) return;
  console.error(`[worker] Generation ${job.data.generationId} failed:`, err.message);

  try {
    await updateStatus(job.data.generationId, "failed", {
      error_message: err.message,
    });
  } catch (dbErr) {
    console.error("[worker] Failed to update error status:", dbErr);
  }
}

// ─── Start worker ────────────────────────────────────────────────────────────

const worker = new Worker<GenerationJobData>("hair-generation", processGeneration, {
  connection: redis,
  concurrency: 2,
  removeOnComplete: { count: 1000 },
  removeOnFail: { count: 500 },
});

worker.on("completed", (job) => {
  console.log(`[worker] Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  handleFailedJob(job, err);
});

worker.on("error", (err) => {
  console.error("[worker] Worker error:", err);
});

console.log("[worker] hairgen.io BullMQ worker started, waiting for jobs...");

// ─── Graceful shutdown ──────────────────────────────────────────────────────

async function shutdown() {
  console.log("[worker] Shutting down...");
  await worker.close();
  await pool.end();
  redis.disconnect();
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
