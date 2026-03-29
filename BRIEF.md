# hairgen.io — Build Brief

## Czym jest
AI Hairstyle Try-On SaaS. Web-first, mobile-responsive.
Użytkownik uploaduje zdjęcie twarzy → wybiera fryzurę z katalogu lub wpisuje prompt tekstowy → AI generuje fotorealistyczny wynik → before/after slider.

## Unikalne cechy (żaden konkurent nie ma wszystkich 3 naraz):
1. Katalog fryzur (browse) — szybki podgląd
2. Text-to-style (własny prompt) — elastyczność
3. Beard/facial hair editing — niedostępne u konkurencji

## Stack (ŚCIŚLE wg researchu)
- **Frontend**: Next.js 15 App Router + shadcn/ui + Tailwind CSS
- **Auth**: Clerk (magic link + Google OAuth)
- **Storage**: Cloudflare R2 (zero egress fees)
- **Payments**: Stripe (credit packs + subscriptions)
- **AI inference**: fal.ai API (fal-ai/image-apps-v2/hair-change) jako MVP backend
  - Provider abstraction layer: BaseProvider + ProviderFactory (łatwa migracja na Replicate/Modal)
- **Queue**: Inngest (event-driven, no Redis needed)
- **DB**: PostgreSQL (Neon connection string)
- **Deploy**: Docker + Kubernetes (namespace: hairgen, cluster 152.53.116.238 ARM64)

## Kluczowe strony
1. `/` — Landing page: hero z before/after przykładami, CTA "Try Free"
2. `/try` — Główna funkcja: upload → katalog → generowanie → wynik
3. `/gallery` — Przykłady wyników (social proof)
4. `/pricing` — Cennik (credit packs + subscriptions)
5. `/dashboard` — Historia generacji zalogowanego użytkownika

## UI/UX (kluczowe elementy)
- Dark theme z accent color #a855f7 (fioletowy — beauty/style)
- Upload: drag-and-drop + "Take Photo" button (mobile)
- Client-side face validation po upload (MediaPipe lub prosta heurystyka)
- Katalog fryzur: filter chips (Płeć / Długość / Styl / Kolor), 2-col mobile, 4-col desktop
- Before/after: react-compare-slider (draggable, keyboard accessible)
- Progress states: 4 fazy ("Analizuję zdjęcie..." → "Przygotowuję styl..." → "Generuję fryzurę..." → "Wykańczam...")
- Watermark na darmowych wynikach

## Model biznesowy
**Free tier**: 3 generacje, watermark, standard quality
**Credit packs**:
- Try It: 10 credits / $4.99
- Explorer: 30 credits / $9.99
- Style Pro: 100 credits / $24.99
- Bulk: 300 credits / $49.99
**Subscriptions**:
- Starter: $7.99/mies → 20 credits, no watermark
- Pro: $14.99/mies → 60 credits + text prompts + beard
- Unlimited: $29.99/mies → 200 credits + batch + priority

## GDPR
- Auto-delete uploaded face photos po 24h (R2 lifecycle rules)
- Explicit consent dialog przed uploadem
- /api/user/delete-data endpoint
- Biometric data disclaimer

## AI Pipeline (fal.ai)
```
POST /api/generate
  → validate credits (deduct optimistically)
  → upload to R2 (presigned URL)
  → inngest.send("hairstyle/generate.requested")
  → [inngest worker] call fal.ai hair-change API
  → post-process + upload result to R2
  → update DB (job status = done)
  → SSE push to client
```

## Katalog fryzur (hardcoded dla MVP, 24 stylów)
Kobiety: Bob krótki, Pixie cut, Long waves, Beach waves, French bob, Balayage long, Curly afro, Sleek straight
Mężczyźni: Crew cut, Undercut, Fade, Buzz cut, Pompadour, Slick back, Textured crop, Long curly
Kolory: Natural Black, Dark Brown, Chestnut, Golden Blonde, Platinum Blonde, Fiery Red, Rose Gold, Balayage
Brody (nowa sekcja): Clean shave, 5 o'clock shadow, Short beard, Full beard, Van Dyke, Goatee

## K8s deployment
- Namespace: hairgen (już istnieje na 152.53.116.238)
- Serwisy: hairgen-web (Next.js), hairgen-db (PostgreSQL)
- NodePort: 30320 (frontend)
- ARM64 images (buildx --platform linux/arm64)
- ghcr.io/cezexpl/hairgen-web:latest

## Co ma być dostarczone
1. Kompletny kod Next.js 15 (frontend + API routes)
2. Dockerfile (multi-stage, ARM64-ready)
3. k8s/ manifesty (namespace: hairgen)
4. db/schema.sql
5. .env.example z wszystkimi wymaganymi zmiennymi
6. README.md
7. git add -A && git commit -m "feat: initial hairgen.io build" && git push origin main

## Ważne
- Pełny działający kod — ZERO placeholderów
- fal.ai API key: env var FAL_KEY (użyj mock jeśli brak klucza — zwróć sample image URL)
- Clerk: env vars NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY + CLERK_SECRET_KEY
- Wszystkie teksty w UI po polsku i angielsku (i18n-ready, domyślnie angielski)
- Na końcu: git push && openclaw system event --text "hairgen.io build complete" --mode now
