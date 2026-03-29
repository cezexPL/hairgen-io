# hairgen.io — Refactor Brief: Full On-Premise Stack

## Cel
Zastąp wszystkie zewnętrzne SaaS dependency własnym self-hosted stackiem.
ZACHOWAJ fal.ai jako jedyny zewnętrzny serwis (AI generation).

## Co usuwamy → czym zastępujemy

| Było | Zastąp przez |
|------|-------------|
| Clerk (auth) | Własny JWT auth (jsonwebtoken + bcrypt + PostgreSQL) |
| Cloudflare R2 (storage) | MinIO (self-hosted S3-compatible, już w k8s) |
| Inngest (queue) | BullMQ + Redis (self-hosted) |
| Stripe (payments) | Usuń na razie — prosty credits system w DB |

## Zachowujemy
- fal.ai provider (`src/lib/providers/fal.ts`) — NIEZMIENIONY
- ProviderFactory pattern — NIEZMIENIONY  
- Cała UI (pages, components) — NIEZMIENIONY
- PostgreSQL schema — rozszerzyć o auth tabele

## Nowa architektura auth (JWT)

### Tabele do dodania w schema.sql:
```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dodaj do users:
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
```

### API routes auth:
- `POST /api/auth/register` — email + password → JWT token
- `POST /api/auth/login` — email + password → JWT token  
- `POST /api/auth/logout` — invalidate token
- `GET /api/auth/me` — get current user from token
- `POST /api/auth/magic-link` — (opcjonalnie) wyślij magic link emailem

### Middleware auth:
Stwórz `src/lib/auth.ts`:
```typescript
export async function getAuthUser(req: NextRequest): Promise<User | null>
export function requireAuth(handler): NextResponse  
export function createToken(userId: string): string
export function verifyToken(token: string): { userId: string } | null
```

Token jako httpOnly cookie (`hairgen_session`) + Bearer header fallback.

## MinIO setup

### K8s deployment (dodaj do k8s/):
```yaml
# k8s/minio.yaml
- Deployment: minio/minio:latest
- env: MINIO_ROOT_USER, MINIO_ROOT_PASSWORD
- args: server /data --console-address ":9001"
- PVC: 10Gi
- Service: ClusterIP port 9000 (API) + 9001 (console)
- NodePort: 30900 (console UI)
```

### Integracja w kodzie:
Zastąp `src/lib/r2.ts` nowym `src/lib/storage.ts`:
```typescript
// Używa @aws-sdk/client-s3 z endpoint = MinIO
// MINIO_ENDPOINT=http://minio:9000
// MINIO_ACCESS_KEY, MINIO_SECRET_KEY, MINIO_BUCKET=hairgen
export async function uploadFile(key, buffer, contentType): Promise<string>
export async function getSignedUploadUrl(key): Promise<string>
export async function deleteFile(key): Promise<void>
export function getPublicUrl(key): string  // http://152.53.116.238:30900/hairgen/key
```

## BullMQ setup (zastąp Inngest)

Redis już mamy w namespace nas-platform. Użyj go lub dodaj własny Redis do namespace hairgen.

### Zastąp Inngest:
Usuń `src/lib/inngest.ts` i `src/lib/inngest-functions.ts`.

Stwórz `src/lib/queue.ts`:
```typescript
import { Queue, Worker } from 'bullmq';
export const generationQueue = new Queue('hair-generation', { connection: redisConnection });
```

Stwórz `src/worker/index.ts` — osobny proces który:
1. Consumes z kolejki BullMQ
2. Wywołuje fal.ai (lub mock)
3. Uploaduje wynik do MinIO
4. Aktualizuje DB (status = done, result_image_url)
5. Emituje przez SSE

Worker uruchamiany jako osobny Deployment w K8s (hairgen-worker).

## Usuwamy z package.json
```
@clerk/nextjs
@clerk/themes  
@aws-sdk/client-s3 (zostaje! używamy dla MinIO)
inngest
@fal-ai/serverless-client (zostaje!)
stripe (zostaje w package.json ale routes wyłączone)
```

## Dodajemy do package.json
```
jsonwebtoken
bcryptjs
bullmq
ioredis
nodemailer (opcjonalnie — magic link)
@types/jsonwebtoken
@types/bcryptjs
```

## Zaktualizowane .env.example
```env
# Database
DATABASE_URL=postgresql://hairgen:hairgen_secret@hairgen-db:5432/hairgen

# Auth
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d

# MinIO (self-hosted S3)
MINIO_ENDPOINT=http://minio:9000
MINIO_ACCESS_KEY=hairgen-admin
MINIO_SECRET_KEY=hairgen-secret-2026
MINIO_BUCKET=hairgen
MINIO_PUBLIC_URL=http://152.53.116.238:30900

# Redis (BullMQ)
REDIS_URL=redis://hairgen-redis:6379

# AI Provider
FAL_KEY=your-fal-ai-key
# REPLICATE_API_TOKEN=your-replicate-token  # fallback

# App
NEXT_PUBLIC_APP_URL=http://152.53.116.238:30320
NODE_ENV=production
```

## K8s changes
- Dodaj `k8s/minio.yaml`
- Dodaj `k8s/redis.yaml` (własny Redis dla hairgen namespace)
- Dodaj `k8s/worker.yaml` (BullMQ worker deployment)
- Zaktualizuj `k8s/secret.yaml` z nowymi env vars
- Usuń referencje do Clerk/Inngest/Stripe z configmap

## Co ma być dostarczone
1. Cały refactored kod (auth, storage, queue)
2. Zaktualizowane k8s manifesty
3. Zaktualizowane db/schema.sql
4. Zaktualizowany Dockerfile (multi-stage, worker stage)
5. docker-compose.yml z MinIO + Redis
6. git add -A && git commit -m "refactor: full on-premise stack (JWT+MinIO+BullMQ)" && git push origin main
7. Na końcu: openclaw system event --text "hairgen.io refactor complete — on-premise stack ready" --mode now
