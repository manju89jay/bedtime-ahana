# Bedtime Ahana — Product Specification v2

**Version:** 2.0
**Date:** 2026-03-24
**Status:** In Review

---

## 1. What This Product Is

A web app where a parent enters their child's name, age, and interests — and gets a personalized bedtime storybook as a downloadable PDF. Later, they can order a printed copy.

**That's it.** Everything else is a later problem.

---

## 2. Honest Assessment of Current State

The repo has a working skeleton (Next.js 14, TypeScript, Tailwind) with the full
Create → Generate → Read → Export flow wired up. But it's all fake:

- **Text generation** is string concatenation with a PRNG — no AI, produces robotic sentences
- **Images** are SVG rectangles with the prompt text written on them
- **Audio** is a silent MP3
- **The PDF** is a plain-text dump — not something you'd give a child

What *is* solid:
- File structure and build tooling
- Type definitions (Book, Page, CharacterCard)
- Storage layer (JSON persistence, asset path management)
- Test suite (7 files, good coverage of utilities)
- Compliance checking (IP/franchise token detection)

What was premature:
- Market research, unit economics, festival editions, Germany expansion, print-on-demand
  pricing, bilingual support, family voice upload — none of this matters until the app
  can produce one good story with one good picture.

---

## 3. The Product I'd Build

### 3.1 User Flow (POC)

```
┌─────────────────────────────────────────────────────────┐
│                     STEP 1: CHILD INFO                   │
│                                                          │
│  Child's name: [Ahana        ]                          │
│  Age:          [4 ▼]                                     │
│  Interests:    [dinosaurs, painting, her baby sister]    │
│                                                          │
│                              [Next →]                    │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   STEP 2: PICK YOUR STORY                │
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ 🌙 Bedtime  │  │ 🦕 Adventure│  │ 🎨 Creative │     │
│  │   Routine   │  │   Quest     │  │   Day       │     │
│  │             │  │             │  │             │     │
│  │ A calm wind-│  │ A gentle    │  │ Making some-│     │
│  │ down story  │  │ exploration │  │ thing new   │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
│                                                          │
│  ── OR ──                                               │
│                                                          │
│  Tell us your story idea:                               │
│  [Ahana finds a tiny dragon egg in the garden and      ]│
│  [has to keep it warm until it hatches                  ]│
│                                                          │
│                              [Create Book →]             │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  STEP 3: GENERATING...                    │
│                                                          │
│  ✓ Writing your story...                                │
│  ● Creating illustrations...  (page 3 of 8)            │
│  ○ Assembling your book...                              │
│                                                          │
│  [Preview available below ↓]                            │
│                                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│  │ Page 1   │ │ Page 2   │ │ Page 3   │  ...          │
│  │ [thumb]  │ │ [thumb]  │ │ [generating]             │
│  └──────────┘ └──────────┘ └──────────┘               │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   STEP 4: YOUR BOOK                      │
│                                                          │
│  ┌────────────────────────────────────┐                 │
│  │                                    │                 │
│  │     [Book page spread preview]     │                 │
│  │     ← Page 3 of 8 →               │                 │
│  │                                    │                 │
│  └────────────────────────────────────┘                 │
│                                                          │
│  [✏️ Edit Text]  [🔄 Regenerate Page]                   │
│                                                          │
│  [📥 Download PDF]        [🛒 Order Printed Book]       │
│                           (coming soon)                  │
└─────────────────────────────────────────────────────────┘
```

### 3.2 Key Design Decisions

**Templates + Custom = Best of both worlds.**
- 3–5 story templates (Bedtime Routine, Adventure Quest, Creative Day, Friendship, Nature)
  give parents who don't know what to write a one-click starting point.
- Free-text story idea field lets creative parents describe exactly what they want.
- Both paths feed into the same LLM pipeline. Templates are just pre-written prompts.

**8 pages, not 6 or 24.**
- 6 feels thin for a "book." 24–32 is a production print target, not a POC.
- 8 pages = cover + 6 story spreads + back cover. Feels like a real small book.
- Each story page: full illustration on top/left, 3–5 sentences below/right.
- ~50–80 words per page (not 100–140 — that's too much for ages 3–5).

**Start with simple illustrations, upgrade later.**
- POC: Use a single consistent illustration style via DALL-E 3 or Flux
- Simple, charming, slightly cartoonish — think "digital crayon" not "watercolor masterpiece"
- Character consistency is hard. For POC: describe character in every prompt, accept minor
  variations. For v2: character reference sheet / IP adapter approach.

**PDF first, print later.**
- POC output is a nicely formatted A5 landscape PDF
- Real layout: illustration fills most of the page, text at bottom in a readable font
- Not a jsPDF text dump — use a proper PDF template or HTML-to-PDF pipeline

---

## 4. Data Model (Simplified)

### 4.1 ChildProfile
```typescript
interface ChildProfile {
  name: string;           // "Ahana"
  age: number;            // 3–8
  interests: string[];    // ["dinosaurs", "painting", "baby sister Shreya"]
  // That's it. No address, no family tree, no visual style.
  // The LLM infers everything else from these three fields.
}
```

### 4.2 StoryTemplate
```typescript
interface StoryTemplate {
  id: string;             // "bedtime-routine"
  name: string;           // "Bedtime Routine"
  icon: string;           // "🌙"
  description: string;    // "A calm wind-down story about getting ready for bed"
  prompt: string;         // The actual LLM prompt for this template
  tone: "calm" | "adventurous" | "playful";
}
```

### 4.3 Book
```typescript
interface Book {
  bookId: string;
  childProfile: ChildProfile;
  templateId?: string;        // null if custom story idea
  storyIdea?: string;         // null if using template
  title: string;
  pages: Page[];              // 8 pages (cover + 6 story + back)
  createdAt: string;
  updatedAt: string;
}
```

### 4.4 Page
```typescript
interface Page {
  pageNo: number;             // 0 = cover, 1–6 = story, 7 = back cover
  type: "cover" | "story" | "back";
  text: string;               // 50–80 words for story pages
  imagePrompt: string;        // Generated prompt sent to image API
  imageUrl: string;           // URL of generated/placeholder image
}
```

**What changed from current model:**
- Dropped `CharacterCard` — over-engineered. `ChildProfile` with 3 fields is enough.
- Dropped `moral` — the LLM can weave in a theme naturally, no need to force it.
- Dropped `audioUrl` — audio is a later feature, not POC.
- Added `StoryTemplate` — the template concept that was missing.
- Added `type` to Page — cover and back cover are different from story pages.
- Changed to 8 pages.

---

## 5. Story Structure

### 5.1 The Bedtime Arc (6 story pages)

| Page | Beat | What Happens | Words |
|------|------|-------------|-------|
| 1 | **Opening** | Set the scene. Child is in a familiar place. Something small catches their attention. | 50–80 |
| 2 | **Curiosity** | Child decides to explore/help/try something. Low stakes. | 50–80 |
| 3 | **Action** | Child does the thing. Describe what they see/feel/do. | 50–80 |
| 4 | **Surprise** | Something unexpected but gentle happens. A small twist. | 50–80 |
| 5 | **Warmth** | The moment resolves into something cozy. Connection with someone they love. | 50–80 |
| 6 | **Sleep** | Wind down. Yawns, soft blankets, closing eyes. Ends with the child drifting off. | 40–60 |

**Rules:**
- No villains. No danger. No scary moments.
- The "surprise" is always pleasant or funny, never threatening.
- Page 6 always ends sleepy — this is a bedtime book.
- Use the child's actual name throughout.
- Weave in their interests naturally (if the child likes dinosaurs, maybe they find a toy dinosaur, not a real one chasing them).
- Vocabulary matches age. Age 3: very simple. Age 6: slightly richer.

### 5.2 Templates

| Template | Tone | Prompt Gist |
|----------|------|-------------|
| **Bedtime Routine** | Calm | Getting ready for bed, brushing teeth, finding favorite stuffed animal, goodnight rituals |
| **Adventure Quest** | Adventurous | Exploring the backyard/park, discovering something small and magical |
| **Creative Day** | Playful | Making something (art, a fort, cookies) with a family member |
| **Friendship** | Warm | Helping a friend or making a new one |
| **Nature Walk** | Calm | Noticing beautiful things outdoors — leaves, bugs, clouds, rain |

---

## 6. Technical Plan

### 6.1 What to Keep from Current Repo
- Next.js 14 + TypeScript + Tailwind (framework is fine)
- `lib/storage.ts` (JSON persistence — fine for POC)
- `lib/id.ts` (book ID generation)
- `lib/compliance.ts` (IP checking)
- Test infrastructure (Vitest)
- Build scripts

### 6.2 What to Rewrite
- **`app/create/page.tsx`** — New 2-step flow (child info → template picker / story idea)
- **`components/Form.tsx`** — Simplified: name, age, interests (not tone/language/family tree)
- **`components/ReaderNav.tsx`** — Better book preview with real images, edit + regenerate per page
- **`lib/ai/text.ts`** — Replace PRNG strings with real Claude API calls
- **`lib/ai/image.ts`** — Replace SVG placeholders with real image generation
- **`app/api/outline/route.ts`** — Wire to Claude API
- **`app/api/page/route.ts`** — Wire to Claude API
- **`app/api/image/route.ts`** — Wire to image API
- **PDF export** — Replace jsPDF text dump with proper layout (image + text)

### 6.3 What to Delete / Defer
- `lib/ai/tts.ts` and `/api/tts` — not for POC
- `lib/prompts.ts` — merge into the actual API route handlers; separate file adds indirection
- `components/Progress.tsx` — rewrite with proper streaming UX
- `data/seeds/` — replace with `data/templates/`
- `docs/market_research.md` — keep but it's not driving product decisions
- `docs/product_overview.md` — superseded by this spec

### 6.4 New Things to Build

| Component | Purpose |
|-----------|---------|
| `data/templates/*.json` | 5 story templates with prompts |
| `components/TemplatePicker.tsx` | Card grid for choosing story template |
| `components/BookPreview.tsx` | Page-by-page book preview with images |
| `components/PageEditor.tsx` | Edit text + regenerate single page |
| `lib/ai/client.ts` | Thin wrapper for Claude API calls |
| `lib/ai/imageClient.ts` | Thin wrapper for image generation API |
| `lib/pdf/layout.ts` | Proper PDF layout with images + styled text |

### 6.5 API Design (Simplified)

| Endpoint | Purpose | Notes |
|----------|---------|-------|
| `POST /api/generate` | Generate complete story (outline + all page text) | Single call, returns full story JSON. Uses Claude API. |
| `POST /api/generate/page` | Regenerate a single page's text | For when user wants to retry one page |
| `POST /api/image` | Generate image for one page | Calls DALL-E/Flux. Returns image URL. |
| `POST /api/book` | Save book | Keep as-is |
| `POST /api/export` | Export PDF | Rewrite with proper layout |

**Simplified from 6 endpoints to 5.** The separate `/api/outline` and `/api/page` endpoints
were over-split. Generate the whole story in one LLM call — it's faster, cheaper, and
produces more coherent narratives than page-by-page generation.

---

## 7. Implementation Phases

### Phase 1: POC — "One Good Book" (Target: working end-to-end)

**Goal:** A parent can enter child info, get a real story with real (basic) pictures,
download a nice-looking PDF.

1. **Story templates** — Create 5 template JSON files with curated prompts
2. **New create flow UI** — 2-step: child info → template or custom idea
3. **Claude API integration** — Generate complete 6-page story in one call
4. **Basic image generation** — DALL-E 3 for simple illustrations (accept inconsistency for now)
5. **PDF layout** — Proper A5 layout: big image, styled text, readable fonts
6. **Preview & edit** — View generated book, edit text per page, regenerate any page
7. **Download** — PDF export that looks like an actual children's book

**What "done" looks like:** You can show the PDF to a real parent and they'd say
"this is a cute little book" — not "this is a tech demo."

### Phase 2: Polish — "Make It Good"

1. **Image consistency** — Character reference approach or consistent style prompting
2. **Better illustrations** — Explore Flux/SDXL with style LoRAs for warmer art
3. **Reading level adjustment** — Simpler words for age 3, richer for age 6
4. **Book library** — Home page shows previously created books
5. **Regenerate with guidance** — "Make this page funnier" / "Make this calmer"
6. **Cover design** — Generate a proper book cover with title and child's name

### Phase 3: Product — "Make It Real"

1. **User accounts** — Sign up, save books to account
2. **Print ordering** — Integration with POD provider
3. **Payment** — Razorpay (India), Stripe (global)
4. **Audio narration** — TTS for read-along
5. **Bilingual** — EN + one more language
6. **Sharing** — Share book link with family

---

## 8. Environment Variables (POC)

```env
# Required for POC
ANTHROPIC_API_KEY=           # Claude API — story generation
OPENAI_API_KEY=              # DALL-E 3 — image generation

# That's it for POC. No TTS, no cloud, no payments.
```

---

## 9. Quality Requirements

### Content Safety (non-negotiable)
- No violence, fear, or danger in stories
- No real-world brand/franchise characters
- Age-appropriate vocabulary
- Compliance check runs on every generated story before showing to user

### PDF Quality
- Looks like a real children's book, not a Word document
- Readable font (rounded, friendly — something like Nunito or Quicksand)
- Image takes up majority of page space
- Text is large enough for a parent to read to a child
- Cover page with title and "A story for {name}"

---

## 10. What Success Looks Like

**POC success (Phase 1):**
- Generate a book in under 2 minutes
- Story is coherent and age-appropriate
- Images are charming (even if not perfectly consistent)
- PDF looks like something you'd actually read to a child
- 5 out of 5 test parents say "this is cute, I'd use this"

**Product success (Phase 3):**
- Parents come back to make more books (repeat usage)
- Books get shared with family members
- Print orders happen without prompting
- Children ask for "their book" at bedtime

---

## 11. What This Product is NOT

- Not a general-purpose AI story generator (bedtime stories only)
- Not a professional illustration tool (charming > beautiful)
- Not a publishing platform (one book at a time for one child)
- Not an audiobook app (PDF-first, audio is an enhancement)
- Not a marketplace (we make the books, parents customize them)

---

## Appendix A: Current Repo — What to Keep vs. Rewrite vs. Delete

| File/Module | Verdict | Reason |
|-------------|---------|--------|
| `app/layout.tsx` | **Keep** | Basic layout, works fine |
| `app/page.tsx` | **Rewrite** | New home page with book library + create CTA |
| `app/create/page.tsx` | **Rewrite** | New 2-step flow |
| `app/reader/[bookId]/page.tsx` | **Rewrite** | New book preview with real images |
| `app/api/outline/route.ts` | **Replace** | Merge into `/api/generate` |
| `app/api/page/route.ts` | **Replace** | Merge into `/api/generate` |
| `app/api/image/route.ts` | **Rewrite** | Wire to real image API |
| `app/api/tts/route.ts` | **Defer** | Not POC scope |
| `app/api/book/route.ts` | **Keep** | Works fine |
| `app/api/export/route.ts` | **Rewrite** | Proper PDF layout |
| `components/Banner.tsx` | **Keep** | Reusable alert component |
| `components/Form.tsx` | **Rewrite** | Simplified child info form |
| `components/PageCard.tsx` | **Rewrite** | Real image previews |
| `components/Progress.tsx` | **Rewrite** | Better generation UX |
| `components/ReaderNav.tsx` | **Rewrite** | New book preview component |
| `lib/ai/text.ts` | **Rewrite** | Claude API integration |
| `lib/ai/image.ts` | **Rewrite** | Real image API |
| `lib/ai/tts.ts` | **Defer** | Not POC scope |
| `lib/compliance.ts` | **Keep** | IP checking works |
| `lib/storage.ts` | **Keep** | JSON persistence works for POC |
| `lib/id.ts` | **Keep** | ID generation works |
| `lib/prompts.ts` | **Delete** | Inline prompts into API handlers |
| `types/book.ts` | **Rewrite** | Simplified data model |
| `tests/*` | **Update** | Update to match new implementations |
| `data/seeds/` | **Replace** | New `data/templates/` |
| `docs/product_overview.md` | **Keep** | Historical reference |
| `docs/market_research.md` | **Keep** | Historical reference |
| `scripts/generate-sample-book.ts` | **Rewrite** | Generate with real AI |

---

## Appendix B: LLM Prompt Strategy

### Story Generation (single call)

```
System: You are a children's bedtime story author. You write warm, gentle stories
that help children fall asleep. Your stories are simple, loving, and always end
with the child character drifting off to sleep feeling safe and happy.

User: Write a bedtime story for {name}, age {age}.
Their interests: {interests}.
{template_prompt OR custom_story_idea}

Output a JSON object with this structure:
{
  "title": "...",
  "pages": [
    {"pageNo": 1, "text": "...", "imageDescription": "..."},
    ...6 pages...
  ]
}

Rules:
- Exactly 6 story pages
- 50–80 words per page (shorter for younger ages)
- Use {name} as the main character throughout
- Page 6 must end with {name} falling asleep or close to sleep
- No scary content, no villains, no danger
- Weave in their interests naturally
- Each imageDescription should be a single scene description (no style directions)
- Keep vocabulary appropriate for age {age}
```

### Image Generation (per page)

```
A children's book illustration in a simple, warm, slightly cartoonish style.
{imageDescription from story generation}.
The main character is a {age}-year-old child named {name}.
Soft lighting, gentle colors, cozy atmosphere.
```

This keeps image prompts simple and consistent. The style direction stays the same
across all pages; only the scene changes.
