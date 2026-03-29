# =============================================================================
# hairgen.io — Multi-stage Dockerfile (ARM64-ready)
# =============================================================================
# Build: docker buildx build --platform linux/arm64 -t ghcr.io/cezexpl/hairgen-web:latest .
# Run:   docker run -p 3000:3000 --env-file .env.local ghcr.io/cezexpl/hairgen-web:latest

# --- Stage 1: Dependencies ---
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# --- Stage 2: Build ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time env vars (dummy values for build, real values injected at runtime)
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV NEXT_PUBLIC_APP_URL=http://localhost:3000

RUN npm run build

# --- Stage 3: Production runner (web) ---
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy public/ from builder (COPY . . in builder stage includes public/gallery/*.jpg)
RUN mkdir -p ./public/gallery
COPY --from=builder /app/public/gallery/ ./public/gallery/
RUN chown -R nextjs:nodejs ./public

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]

# --- Stage 4: Worker (BullMQ) ---
FROM node:20-alpine AS worker
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 worker

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/package.json ./package.json

USER worker

CMD ["npx", "tsx", "src/worker/index.ts"]
