import { Queue } from "bullmq";
import IORedis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://hairgen-redis:6379";

let _connection: IORedis | null = null;

export function getRedisConnection(): IORedis {
  if (!_connection) {
    _connection = new IORedis(REDIS_URL, {
      maxRetriesPerRequest: null,
    });
  }
  return _connection;
}

let _generationQueue: Queue | null = null;

export function getGenerationQueue(): Queue {
  if (!_generationQueue) {
    _generationQueue = new Queue("hair-generation", {
      connection: getRedisConnection(),
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
        removeOnComplete: { count: 1000 },
        removeOnFail: { count: 500 },
      },
    });
  }
  return _generationQueue;
}

export interface GenerationJobData {
  generationId: string;
  userId: string;
  sourceImageUrl: string;
  prompt: string;
  styleId?: string;
  styleCategory?: string;
}

export async function enqueueGeneration(data: GenerationJobData): Promise<string> {
  const queue = getGenerationQueue();
  const job = await queue.add("generate-hairstyle", data, {
    jobId: data.generationId,
  });
  return job.id!;
}
