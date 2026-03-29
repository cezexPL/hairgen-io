import { query, queryOne } from "./index";

export interface DbGeneration {
  id: string;
  user_id: string;
  status: string;
  style_id: string | null;
  style_category: string | null;
  prompt: string | null;
  source_image_url: string;
  result_image_url: string | null;
  source_r2_key: string;
  result_r2_key: string | null;
  has_watermark: boolean;
  fal_request_id: string | null;
  error_message: string | null;
  processing_time_ms: number | null;
  created_at: Date;
  updated_at: Date;
}

export async function createGeneration(params: {
  userId: string;
  styleId?: string;
  styleCategory?: string;
  prompt?: string;
  sourceImageUrl: string;
  sourceR2Key: string;
  hasWatermark: boolean;
}): Promise<DbGeneration> {
  const rows = await query<DbGeneration>(
    `INSERT INTO generations (user_id, style_id, style_category, prompt, source_image_url, source_r2_key, has_watermark, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
     RETURNING *`,
    [
      params.userId,
      params.styleId ?? null,
      params.styleCategory ?? null,
      params.prompt ?? null,
      params.sourceImageUrl,
      params.sourceR2Key,
      params.hasWatermark,
    ]
  );
  return rows[0];
}

export async function updateGenerationStatus(
  id: string,
  status: string,
  extra?: { resultImageUrl?: string; resultR2Key?: string; falRequestId?: string; errorMessage?: string; processingTimeMs?: number }
): Promise<DbGeneration | null> {
  const sets: string[] = ["status = $2"];
  const params: unknown[] = [id, status];
  let idx = 3;

  if (extra?.resultImageUrl) {
    sets.push(`result_image_url = $${idx}`);
    params.push(extra.resultImageUrl);
    idx++;
  }
  if (extra?.resultR2Key) {
    sets.push(`result_r2_key = $${idx}`);
    params.push(extra.resultR2Key);
    idx++;
  }
  if (extra?.falRequestId) {
    sets.push(`fal_request_id = $${idx}`);
    params.push(extra.falRequestId);
    idx++;
  }
  if (extra?.errorMessage) {
    sets.push(`error_message = $${idx}`);
    params.push(extra.errorMessage);
    idx++;
  }
  if (extra?.processingTimeMs !== undefined) {
    sets.push(`processing_time_ms = $${idx}`);
    params.push(extra.processingTimeMs);
    idx++;
  }

  return queryOne<DbGeneration>(
    `UPDATE generations SET ${sets.join(", ")} WHERE id = $1 RETURNING *`,
    params
  );
}

export async function getGenerationById(id: string): Promise<DbGeneration | null> {
  return queryOne<DbGeneration>("SELECT * FROM generations WHERE id = $1", [id]);
}

export async function getUserGenerations(userId: string, limit = 50, offset = 0): Promise<DbGeneration[]> {
  return query<DbGeneration>(
    "SELECT * FROM generations WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3",
    [userId, limit, offset]
  );
}

export async function getRecentPublicGenerations(limit = 20): Promise<DbGeneration[]> {
  return query<DbGeneration>(
    `SELECT * FROM generations
     WHERE status = 'completed' AND result_image_url IS NOT NULL
     ORDER BY created_at DESC LIMIT $1`,
    [limit]
  );
}
