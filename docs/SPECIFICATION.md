# Bedtime Ahana — Project Specification

**Version:** 1.0 (Draft)
**Date:** 2026-03-24
**Status:** In Review

---

## 1. Project Overview

**Bedtime Ahana** is a personalized, bilingual bedtime book generator for children aged 3–6. It creates copyright-safe, illustrated storybooks with optional audio narration, designed around a calming "wind-down arc" structure.

**Target Users:**
- Indian parents seeking screen-light bedtime routines in English + a home language
- Gift givers (birthdays, festivals, return gifts)
- Schools/libraries wanting bilingual, calm-reading material
- Diaspora families (Germany/EU next)

**Core Value Proposition:**
- Bedtime-first story engine (calm cadence, proven wind-down arc)
- Bilingual by design (EN-HI at launch; DE, regional languages later)
- Family voice narration via QR code
- Festival editions for natural gifting moments
- Copyright-safe, no franchise IP

---

## 2. Current State (What Exists Today)

### 2.1 Architecture
- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS with custom brand colors (`brand-primary: #4a5fc1`, `brand-secondary: #f2b5d4`)
- **Storage:** Local JSON files (`/data/books/{bookId}.json`) + filesystem assets (`/public/generated/{bookId}/`)
- **Testing:** Vitest with 7 test files covering core logic
- **Build:** npm scripts + shell scripts for CI (Unix & Windows)

### 2.2 Implemented Features (Working)

| Feature | Status | Notes |
|---------|--------|-------|
| Create book form | **Complete** | Name, age (3–8), tone (calm/adventurous), language (EN/DE), story idea |
| 6-page outline generation | **Complete** | Deterministic via xorshift PRNG seeded by input hash |
| Page text generation | **Complete** | 100–140 words/page, deterministic, bedtime-calm cadence |
| Image prompt generation | **Complete** | Template-based prompts with character/scene substitution |
| Placeholder images | **Complete** | SVG placeholders with prompt text embedded |
| Silent audio stubs | **Complete** | Valid MP3 files (silent) written to disk |
| Book persistence | **Complete** | JSON save/load with directory management |
| Reader UI | **Complete** | 2-column layout, page nav, inline text editing, auto-save |
| PDF export | **Complete** | A5 landscape via jsPDF (title page + 6 content pages) |
| IP compliance checking | **Complete** | Forbidden token detection with UI warnings |
| Book listing | **Complete** | Home page lists recent books sorted by `updatedAt` |
| Sample book generation | **Complete** | CLI script runs on postbuild |
| Test suite | **Complete** | compliance, id, outline, pageText, image, tts, storage |

### 2.3 Stub/Placeholder Features (Scaffolded but not functional)

| Feature | Current State | What's Missing |
|---------|--------------|----------------|
| AI text generation | Deterministic template strings | Real LLM integration (Claude/GPT) |
| Image generation | SVG placeholders with text | Real image API (DALL-E, Midjourney, Flux, etc.) |
| TTS / Audio narration | Silent MP3 files | Real TTS engine (ElevenLabs, Google Cloud TTS, etc.) |
| Audio playback in reader | Player exists, plays silence | Depends on real TTS |
| Voice upload | "Coming soon" message | Upload flow, trimming, normalization |

### 2.4 Not Started (Roadmap only)

- Bilingual EN-HI text rendering and toggle
- Festival editions (Diwali, Raksha Bandhan, Onam, Eid, Christmas)
- Reading levels (L0–L2)
- QR code on back cover
- Character reference images / consistent art style
- User authentication / accounts
- Cloud storage for assets
- Print-on-demand integration
- Analytics (privacy-respecting)
- Payment / e-commerce

---

## 3. Data Model

### 3.1 Book
```typescript
interface Book {
  bookId: string;              // "book-{base36_timestamp}-{random6}"
  title: string;               // Generated or edited title
  language: "en" | "de";       // Book language (expand to "hi" etc.)
  characters: CharacterCard[]; // At least one protagonist
  pages: Page[];               // Exactly 6 pages
  createdAt: string;           // ISO 8601 timestamp
  updatedAt: string;           // ISO 8601 timestamp
  moral?: string;              // One-line moral/theme
}
```

### 3.2 Page
```typescript
interface Page {
  pageNo: number;       // 1–6
  text: string;         // 100–140 words, bedtime-calm tone
  imagePrompt: string;  // Detailed prompt for illustration generation
  imageUrl: string;     // Path to generated/placeholder image
  audioUrl?: string;    // Path to generated/placeholder audio
}
```

### 3.3 CharacterCard
```typescript
interface CharacterCard {
  name: string;          // "Ahana"
  age: number;           // 3–8
  home: string;          // "Ulm, Germany"
  family?: string[];     // ["Papa", "baby sister Shreya"]
  traits: string[];      // ["curious", "kind", "gentle helper"]
  sidekick?: string;     // "plush bunny"
  visualStyle: string;   // "soft watercolor, warm light, comfy jumper"
}
```

### 3.4 Story Structure (Bedtime Arc — 6 pages)

| Page | Beat | Purpose |
|------|------|---------|
| 1 | **Setup** | Introduce setting & character's calm mood |
| 2 | **Decision** | Character encounters a small, non-threatening situation |
| 3 | **Preparation** | Character gathers support or resources |
| 4 | **Small Challenge** | A gentle conflict or hesitation (never scary) |
| 5 | **Resolution** | Calm, positive resolution |
| 6 | **Cozy Close** | Affirmation, gratitude, wind-down ending |

**Tone constraints:**
- No violence, danger, or high-stakes conflict
- Vocabulary appropriate for ages 3–6
- Sentences get shorter/simpler toward page 6
- Final page ends with a sleep-ready affirmation

---

## 4. API Routes

### 4.1 Existing Endpoints

| Endpoint | Method | Input | Output | Integration Status |
|----------|--------|-------|--------|--------------------|
| `POST /api/outline` | POST | name, age, tone, language, storyIdea, characterCard | `{title, moral, pages[6]}` | Stub (deterministic) |
| `POST /api/page` | POST | pageNo, language, age, beat_summary, characterCard | `{text}` | Stub (deterministic) |
| `POST /api/image` | POST | pageNo, characterVisuals, sceneSummary, bookId | `{prompt, imageUrl}` | Stub (SVG placeholder) |
| `POST /api/tts` | POST | bookId, pageNo, text, language, voice | `{audioUrl}` | Stub (silent MP3) |
| `POST /api/book` | POST | Book JSON | `{ok: true}` | **Complete** |
| `POST /api/export` | POST | bookId, pdfBase64 | `{url}` | **Complete** |

### 4.2 New Endpoints Needed

| Endpoint | Purpose | Priority |
|----------|---------|----------|
| `POST /api/narration/upload` | Upload family voice recording | P1 |
| `GET /api/books` | List books (move from direct `listBooks()` import) | P2 |
| `GET /api/books/:id` | Get single book | P2 |
| `DELETE /api/books/:id` | Delete a book | P2 |
| `POST /api/compliance/check` | Run compliance check via API | P3 |

---

## 5. Feature Specifications

### 5.1 P0 — Core Loop Completion (MVP)

#### 5.1.1 Real AI Text Generation
**Goal:** Replace deterministic stubs with LLM-powered story generation.

- **Provider:** Claude API (Anthropic) — preferred for safety/tone control
- **Outline generation:** Send character card + story seed to LLM; enforce 6-beat structure via structured output/system prompt
- **Page text generation:** Generate 100–140 words per page; enforce vocabulary level, calm tone, word count limits
- **Prompt templates:** Already defined in `lib/prompts.ts` — use as system prompts
- **Fallback:** Keep deterministic generation as offline/free-tier fallback
- **Acceptance criteria:**
  - Generated stories follow the 6-beat bedtime arc
  - Word count per page is 100–140
  - No franchise IP in output
  - Stories are coherent and age-appropriate

#### 5.1.2 Real Image Generation
**Goal:** Replace SVG placeholders with actual illustrations.

- **Style:** Soft watercolor, warm lighting, cozy palette (as defined in prompts)
- **Consistency:** Same character appearance across all 6 pages (character reference sheet approach)
- **Provider options:** DALL-E 3, Flux, Midjourney API, or fine-tuned SD model
- **Storage:** Save generated images as PNG/WebP to `/public/generated/{bookId}/`
- **Acceptance criteria:**
  - Character visually consistent across pages
  - Art style matches "soft watercolor, warm light" direction
  - No franchise-resembling characters
  - Images are child-appropriate

#### 5.1.3 Real TTS / Audio Narration
**Goal:** Replace silent MP3 stubs with actual narration audio.

- **Provider options:** ElevenLabs, Google Cloud TTS, Amazon Polly
- **Voice requirements:** Warm, soothing, child-appropriate voices
- **Languages:** EN at launch; HI next
- **Storage:** MP3 files at `/public/generated/{bookId}/p{N}.mp3`
- **Acceptance criteria:**
  - Audio matches the page text exactly
  - Voice tone is calm and bedtime-appropriate
  - Playback works in the reader UI

### 5.2 P1 — Bilingual & Personalization

#### 5.2.1 Bilingual EN-HI Support
- Dual-text rendering: English + Hindi on same page or toggle
- Both language versions in the Book JSON (`text_en`, `text_hi` or `translations` map)
- TTS in both languages
- UI language toggle in reader

#### 5.2.2 Enhanced Personalization
- Expand character card: Ajja/Ayi/Amama family roles (Indian family context)
- Sibling names, pet names, favorite things
- City-specific references (landmarks, weather, food)
- Keep personalization to ~10–15% of content for print-quality stability

#### 5.2.3 Family Voice Upload
- Secure audio upload endpoint
- Audio trimming/normalization (server-side)
- Replace TTS with family recording per page
- QR code generation on PDF back cover linking to audio

### 5.3 P2 — Festival Editions & Reading Levels

#### 5.3.1 Festival Editions
- **Editions:** Diwali, Raksha Bandhan, Onam, Eid, Christmas
- **Per edition:** Art motifs/palette, 2–3 text swaps (greetings, settings), cover art variant
- **Data structure:** `data/festivals/{festival}.json` with palette, motifs, text overrides
- **Limited drops:** Seasonal availability for gifting moments

#### 5.3.2 Reading Levels
- **L0 (age 3–4):** Very simple sentences, 60–80 words/page, large text
- **L1 (age 4–5):** Current default, 100–140 words/page
- **L2 (age 5–6):** Slightly more complex vocabulary, 120–160 words/page
- Level selector in create form; affects word caps and vocabulary constraints

### 5.4 P3 — Platform & Scale

#### 5.4.1 User Authentication
- Email/password or social login (Google)
- Book library per user
- Parental consent gating for child data

#### 5.4.2 Cloud Storage
- Move from local filesystem to S3/GCS/R2
- CDN for generated assets (images, audio, PDFs)
- Database (PostgreSQL or similar) for book metadata

#### 5.4.3 Print-on-Demand
- Integration with POD provider (India-based)
- A5 softcover (₹799–999) and hardcover (₹1,499–1,799) options
- Order management, tracking, delivery

#### 5.4.4 Payment Integration
- Razorpay (India) for INR payments
- Stripe (global) for international
- Pricing tiers: PDF ₹299, Softcover ₹799–999, Hardcover ₹1,499–1,799

#### 5.4.5 Analytics
- Privacy-first, no third-party trackers
- Metrics: completion rate, language usage, narration attach rate, festival purchase %
- Parent self-report: "fell asleep before page X"

---

## 6. Technical Architecture (Target)

```
┌─────────────────────────────────────────────────────┐
│                    Next.js Frontend                   │
│  Home → Create Flow → Reader → Export                │
└──────────┬──────────────────────────┬────────────────┘
           │                          │
    ┌──────▼──────┐          ┌────────▼────────┐
    │  API Routes  │          │  Server Actions  │
    │  /api/*      │          │  (persist, export)│
    └──────┬──────┘          └────────┬────────┘
           │                          │
    ┌──────▼──────────────────────────▼────────┐
    │              Service Layer                 │
    │  lib/ai/text.ts   (LLM adapter)          │
    │  lib/ai/image.ts  (Image API adapter)    │
    │  lib/ai/tts.ts    (TTS adapter)          │
    │  lib/compliance.ts (Safety checks)       │
    │  lib/storage.ts   (Persistence)          │
    └──────┬──────────────────────────┬────────┘
           │                          │
    ┌──────▼──────┐          ┌────────▼────────┐
    │  External    │          │  Storage         │
    │  APIs        │          │  (Local JSON →   │
    │  Claude      │          │   Cloud DB+S3)   │
    │  Image API   │          │                  │
    │  TTS API     │          │                  │
    └─────────────┘          └──────────────────┘
```

---

## 7. File Structure (Current → Target additions marked with +)

```
bedtime-ahana/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── create/page.tsx
│   ├── reader/[bookId]/page.tsx
│   └── api/
│       ├── outline/route.ts
│       ├── page/route.ts
│       ├── image/route.ts
│       ├── tts/route.ts
│       ├── book/route.ts
│       ├── export/route.ts
│       ├── + narration/upload/route.ts
│       └── + books/route.ts
├── components/
│   ├── Banner.tsx
│   ├── Form.tsx
│   ├── PageCard.tsx
│   ├── Progress.tsx
│   ├── ReaderNav.tsx
│   ├── + LanguageToggle.tsx
│   └── + FestivalPicker.tsx
├── lib/
│   ├── ai/
│   │   ├── text.ts          (+ LLM adapter)
│   │   ├── image.ts         (+ Image API adapter)
│   │   └── tts.ts           (+ TTS adapter)
│   ├── compliance.ts
│   ├── storage.ts           (+ cloud adapter)
│   ├── id.ts
│   ├── prompts.ts
│   └── + qr.ts
├── data/
│   ├── books/
│   ├── seeds/
│   ├── + templates/bedtime_v1.json
│   └── + festivals/
│       ├── + diwali.json
│       ├── + raksha.json
│       └── + christmas.json
├── types/
│   └── book.ts              (+ expand for bilingual, festivals)
├── tests/
├── scripts/
├── docs/
│   ├── product_overview.md
│   ├── market_research.md
│   └── SPECIFICATION.md     (this file)
└── public/
    └── generated/
```

---

## 8. Environment Variables (Required for full implementation)

```env
# AI Text Generation
ANTHROPIC_API_KEY=           # Claude API key for story generation

# Image Generation (choose one)
OPENAI_API_KEY=              # For DALL-E 3
# or
REPLICATE_API_TOKEN=         # For Flux/SD models

# TTS (choose one)
ELEVENLABS_API_KEY=          # ElevenLabs TTS
# or
GOOGLE_CLOUD_TTS_KEY=        # Google Cloud TTS

# Storage (P3 — cloud migration)
# AWS_ACCESS_KEY_ID=
# AWS_SECRET_ACCESS_KEY=
# S3_BUCKET=

# Payment (P3)
# RAZORPAY_KEY_ID=
# RAZORPAY_KEY_SECRET=
```

---

## 9. Quality & Safety Requirements

### 9.1 Content Safety
- No violence, danger, or fear-inducing content
- No franchise IP (names, outfits, characters, logos)
- Age-appropriate vocabulary (ages 3–6)
- No advertisements or product placements
- Profanity/inappropriate content filters on all generated text

### 9.2 Data Privacy
- Parental consent required before collecting child data
- Data minimization — only collect what's needed
- Ad-free by design
- GDPR-compliant for EU/Germany market
- No third-party analytics trackers

### 9.3 Compliance Checks (automated)
- Forbidden token scan on all generated text and prompts
- Word count enforcement per page
- Image prompt negative-prompt enforcement (no franchise look-alikes)
- Post-generation review flag for manual QA (early releases)

---

## 10. Success Metrics

| Metric | Target | How Measured |
|--------|--------|-------------|
| Story completion rate | >80% of started books are exported | Server-side event |
| Bedtime fit | >70% parents report "calming" | Survey/self-report |
| Narration attach rate | >40% of books have audio | Book JSON audit |
| Language stickiness | >30% use bilingual mode | Language field in books |
| Edit-after-generate rate | <20% (quality signal) | Track save events with diffs |
| Festival purchase % | Seasonal spike tracking | Order data |
| NPS for calmness | >50 | Parent survey |

---

## 11. Implementation Priority & Phases

### Phase 1: MVP (Core Loop with Real AI)
1. Integrate Claude API for text generation (outline + page text)
2. Integrate image generation API
3. Integrate TTS API
4. Polish reader UI (real images, real audio playback)
5. End-to-end testing with real generated content

### Phase 2: Bilingual & Personalization
1. EN-HI bilingual text generation and rendering
2. Enhanced character card / personalization fields
3. Family voice upload flow
4. QR code on PDF back cover
5. Reading level selector (L0/L1/L2)

### Phase 3: Festival Editions & Growth
1. Festival edition data + templates
2. Festival-themed art and text variants
3. User authentication
4. Cloud storage migration
5. Payment integration + PDF sales

### Phase 4: Scale
1. Print-on-demand integration
2. Regional language expansion
3. Analytics dashboard
4. Germany market launch (DE localization QA)
5. Content ecosystem partnerships

---

## 12. Open Questions

1. **LLM choice:** Claude API (preferred for safety) vs OpenAI — need to evaluate cost per book generation
2. **Image consistency:** How to maintain character consistency across 6 pages? Character reference sheet? LoRA fine-tuning?
3. **TTS voice selection:** Which provider offers the best warm, soothing child-appropriate voices in both EN and HI?
4. **24–32 pages vs 6 pages:** Product overview mentions 24–32 pages but current implementation is 6. What's the final page count?
5. **Offline/free tier:** Should deterministic generation remain as a free tier, or is it only for development?
6. **Print layout:** Current PDF is simple text. For POD, need professional layout — use a design tool or template engine?
7. **Family data storage:** Where to draw the line on child data collection vs. personalization depth?
8. **Festival calendar:** Which festivals in year 1? Just the 5 listed (Diwali, Raksha, Onam, Eid, Christmas)?

---

## Appendix A: Existing Prompt Templates

### Outline Prompt
> System: You are a children's-bedtime-book author. Given a character card and an optional story idea, produce a 6-page outline. Each page has a beat title and a one-sentence summary. The arc follows: Setup → Decision → Preparation → Small Challenge → Resolution → Cozy Close. Keep the tone calm and the conflict gentle.

### Page Text Prompt
> System: Write exactly one page of a bedtime story. Target 100–140 words. Use short sentences, age-appropriate vocabulary (ages 3–6), and a calm, soothing cadence. The page should match the beat summary provided.

### Image Prompt Template
> Soft watercolor illustration, cozy warm lighting, children's book style. Page {pageNo}. Character: {characterVisuals}. Scene: {oneLineScene}. Negative: low-res, text, watermark, signature, known-franchise look-alikes.

### Compliance Checklist
> 1. No known IP names, phrases, outfits, or pets.
> 2. Plots are generic "first experiences" — not retellings.
> 3. Art prompts avoid trademark motifs.
> 4. Metadata/tags/titles are original.
