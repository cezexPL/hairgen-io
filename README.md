# hairgen.io — AI Hairstyle Try-On

AI-powered hairstyle try-on SaaS. Upload your photo, choose from 24 hairstyles + 8 colors + 6 beard styles (or describe your own), and get a photorealistic preview in seconds.

## Features

- **Hairstyle Catalog** — 24 curated styles (female/male), filterable by gender, length, and type
- **Hair Color** — 8 color options from Natural Black to Rose Gold
- **Beard Editing** — 6 facial hair styles (unique — no competitor does this)
- **Text-to-Style** — Describe any hairstyle in your own words
- **Before/After Slider** — Draggable comparison slider (keyboard accessible)
- **4-Phase Progress** — Real-time status: Analyzing → Styling → Generating → Finishing
- **GDPR Compliant** — Consent dialog, 24h auto-delete, data deletion endpoint
- **Credit System** — Free tier (3 generations), credit packs, monthly subscriptions

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 App Router + React 19 |
| UI | shadcn/ui + Tailwind CSS (dark theme, #a855f7 accent) |
| Auth | Clerk (magic link + Google OAuth) |
| AI | fal.ai (`fal-ai/image-apps-v2/hair-change`) with provider abstraction |
| Queue | Inngest (event-driven, serverless) |
| Storage | Cloudflare R2 (zero egress) |
| Payments | Stripe (credit packs + subscriptions) |
| Database | PostgreSQL (Neon-compatible) |
| Deploy | Docker (multi-stage ARM64) + Kubernetes |

## Quick Start

```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Copy environment variables
cp .env.example .env.local
# Fill in all values in .env.local

# 3. Initialize database
psql $DATABASE_URL < db/schema.sql

# 4. Run development server
npm run dev

# 5. (Optional) Run Inngest dev server
npm run inngest
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── layout.tsx            # Root layout (Clerk + dark theme)
│   ├── try/page.tsx          # Main try-on flow
│   ├── gallery/page.tsx      # Example gallery
│   ├── pricing/page.tsx      # Credit packs & subscriptions
│   ├── dashboard/page.tsx    # User history & data management
│   ├── sign-in/              # Clerk sign-in
│   ├── sign-up/              # Clerk sign-up
│   └── api/
│       ├── generate/         # POST: create generation, GET: poll status
│       ├── upload/           # Presigned R2 upload URLs
│       ├── credits/checkout/ # Stripe checkout sessions
│       ├── user/             # User profile & data deletion
│       └── webhooks/         # Stripe, Clerk, Inngest webhooks
├── components/
│   ├── ui/                   # shadcn/ui base components
│   └── shared/               # App-specific components
├── lib/
│   ├── providers/            # AI provider abstraction (fal.ai, extensible)
│   ├── db/                   # PostgreSQL queries
│   ├── catalog.ts            # Hairstyle + beard catalog data
│   ├── stripe.ts             # Stripe helpers
│   ├── r2.ts                 # Cloudflare R2 helpers
│   ├── inngest.ts            # Inngest client + event types
│   └── inngest-functions.ts  # Queue worker functions
└── middleware.ts              # Clerk auth middleware
```

## Docker Build

```bash
# Build for ARM64
docker buildx build --platform linux/arm64 \
  -t ghcr.io/cezexpl/hairgen-web:latest \
  --push .

# Run locally
docker run -p 3000:3000 --env-file .env.local \
  ghcr.io/cezexpl/hairgen-web:latest
```

## Kubernetes Deployment

```bash
# Apply manifests (namespace: hairgen, NodePort: 30320)
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secret.yaml    # Edit secrets first!
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml

# Initialize database schema
kubectl create configmap hairgen-db-schema \
  --from-file=schema.sql=db/schema.sql \
  -n hairgen --dry-run=client -o yaml | kubectl apply -f -
kubectl apply -f k8s/init-db-job.yaml

# Access: http://152.53.116.238:30320
```

## AI Provider Abstraction

The app uses a provider abstraction layer for easy migration:

```
BaseProvider (abstract)
├── FalProvider      ← current (fal.ai)
├── ReplicateProvider  ← future
└── ModalProvider      ← future
```

To add a new provider, implement `BaseProvider` and register in `ProviderFactory`.

## Environment Variables

See [`.env.example`](./.env.example) for all required variables.

## GDPR Compliance

- Explicit consent dialog before any photo upload
- Source photos auto-deleted from R2 after 24 hours
- `DELETE /api/user/delete-data` — full account & data deletion
- Biometric data processing disclaimer in consent flow

## License

Proprietary. All rights reserved.
