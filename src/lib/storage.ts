import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const minioClient = new S3Client({
  region: "us-east-1",
  endpoint: process.env.MINIO_ENDPOINT || "http://minio:9000",
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || "hairgen-admin",
    secretAccessKey: process.env.MINIO_SECRET_KEY || "hairgen-secret-2026",
  },
});

const BUCKET = process.env.MINIO_BUCKET || "hairgen";

export async function getUploadPresignedUrl(key: string, contentType: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(minioClient, command, { expiresIn: 3600 });
}

export async function uploadFile(key: string, body: Buffer, contentType: string): Promise<string> {
  await minioClient.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
  return getPublicUrl(key);
}

export async function deleteFile(key: string): Promise<void> {
  await minioClient.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
  );
}

export function getPublicUrl(key: string): string {
  const publicUrl = process.env.MINIO_PUBLIC_URL || process.env.MINIO_ENDPOINT || "http://minio:9000";
  return `${publicUrl}/${BUCKET}/${key}`;
}

export function generateStorageKey(type: "source" | "result", userId: string, generationId: string): string {
  const date = new Date().toISOString().split("T")[0];
  return `${type}/${date}/${userId}/${generationId}.webp`;
}
