# bedtime-ahana v2.0 — Full Product Specification

## "Mein Abenteuer" — AI-Personalized Pixi-Style Micro-Books

**Document Version:** 2.0
**Author:** Manjunath (Product/Backend)
**Date:** 2026-03-27
**Status:** POC → MVP Specification

---

## 1. EXECUTIVE SUMMARY

### What We're Building

A platform that generates personalized, character-consistent, illustrated children's micro-books in the style of Pixi Bücher — where YOUR child is the main character, in YOUR city, with YOUR family. Stories follow real-life "first experiences" (like Conni), delivered as both digital interactive readers and physical print-on-demand softcover books.

### Why This Will Win

The children's audiobook and story app market is valued at ~$1.79B in 2026, projected to reach $4B by mid-2030s at 9.4% annual growth. Every existing AI story app (BedtimeStory.ai, Oscar, Sleepytale, Nighty AI) generates **throwaway digital stories** with inconsistent art. None deliver:

1. **Character consistency** — the child looks the SAME across every page and every book
2. **Physical books** — print-on-demand delivery that sits on a shelf next to real Pixi books
3. **Collectibility** — monthly subscription = growing personal book series
4. **Cultural depth** — bilingual EN/DE by default, with Indian mythology story packs

The Pixi model proves this works: 10x10cm, 24 pages, €0.95, 14 million copies/year since 1954. Conni proves the character model works: 220+ books, 3 million copies/year in DACH. We combine both with AI personalization.

### The Gap No One Fills

| Feature | Pixi/Conni | BedtimeStory.ai | Oscar Stories | **bedtime-ahana** |
|---------|-----------|-----------------|---------------|-------------------|
| Consistent character | ✅ (fixed) | ❌ | ❌ | ✅ (YOUR child) |
| Physical book | ✅ | ❌ | ❌ | ✅ (print-on-demand) |
| Personalized to child | ❌ | ✅ (name only) | ✅ (name only) | ✅ (face, city, family) |
| Bilingual | ❌ | Partial | Partial | ✅ (EN/DE native) |
| Collectible series | ✅ | ❌ | ❌ | ✅ (monthly) |
| Interactive digital reader | ❌ | ✅ | ✅ | ✅ |
| Slice-of-life templates | ✅ | ❌ (random prompts) | ❌ | ✅ |
| Print-ready export | N/A | ❌ | ❌ | ✅ (300 DPI, CMYK) |

---

## 2. PRODUCT VISION

### The One-Liner

> "Your child's own Pixi book series — AI-generated, character-consistent, delivered to your door."

### Target Users

**Primary:** Parents of children aged 2-6 in Germany (DACH region), particularly:
- Expat families wanting bilingual content (huge underserved market)
- Indian families in Germany wanting cultural storytelling (mythology, festivals)
- Parents who already buy Pixi/Conni and want something MORE personal

**Secondary:**
- Grandparents ordering personalized books as gifts
- Kindergärten wanting classroom-personalized story sets

### Core Value Proposition

1. **For the child:** "That's ME in the book!" — emotional connection no mass-produced book can match
2. **For the parent:** Guilt-free screen time (educational, personalized) + physical keepsake
3. **For the gift-giver:** The most thoughtful gift possible — a book starring the recipient

---

## 3. PRODUCT CONCEPT — "FIRST EXPERIENCES" LIBRARY

### Why "First Experiences" (Not Fantasy)

Children aged 2-6 process their world through stories about recognizable situations. The Conni formula proves this: Conni goes to the dentist, Conni starts Kindergarten, Conni gets a cat. These stories help children prepare for and process real-life events. Fantasy stories entertain; first-experience stories **help**.

### Story Template Library (Launch Set — 12 Stories)

Each template is a structured narrative with:
- Fixed page count (24 pages, matching Pixi format)
- Pre-defined narrative arc with customizable slots
- Per-page illustration prompts with character reference anchoring
- Moral/learning outcome
- Age-appropriate vocabulary (adjustable for 2-3, 3-4, 4-6)

#### Tier 1 — Universal (Launch)

| # | Title Template | Theme | Moral |
|---|---------------|-------|-------|
| 1 | {Name} kommt in den Kindergarten | First day at Kindergarten | Courage in new situations |
| 2 | {Name} beim Zahnarzt | First dentist visit | Bravery, self-care |
| 3 | {Name} lernt Fahrrad fahren | Learning to ride a bike | Persistence, practice |
| 4 | {Name} bekommt ein Geschwisterchen | New baby sibling | Sharing love, being a helper |
| 5 | {Name} im Schwimmbad | First swimming pool visit | Water safety, trying new things |
| 6 | {Name} und die Müllabfuhr | Garbage truck day | Community helpers, environment |

#### Tier 2 — Cultural (Month 2-3)

| # | Title Template | Theme | Moral |
|---|---------------|-------|-------|
| 7 | {Name} feiert Diwali | Festival of lights celebration | Cultural pride, sharing joy |
| 8 | {Name} auf dem Weihnachtsmarkt | Christmas market visit | Wonder, togetherness |
| 9 | {Name} kocht mit {Großeltern} | Cooking with grandparent | Family traditions, patience |
| 10 | {Name} und der erste Schnee | First snow experience | Nature, seasonal wonder |

#### Tier 3 — Therapeutic/Transition

| # | Title Template | Theme | Moral |
|---|---------------|-------|-------|
| 11 | {Name} schläft woanders | First sleepover | Independence, it's okay to miss home |
| 12 | {Name} sagt Tschüss | Moving to a new city/saying goodbye | Change is okay, memories stay |

### Customization Parameters Per Story

```typescript
interface StoryConfig {
  // Child identity
  childName: string;
  childAge: 2 | 3 | 4 | 5 | 6;
  childGender: 'girl' | 'boy' | 'neutral';
  characterRefId: string; // Reference to generated character sheet

  // Family
  familyMembers: FamilyMember[]; // name, role (Papa, Mama, Oma, sister, etc.)
  petName?: string;
  petType?: 'cat' | 'dog' | 'bunny' | 'hamster' | 'none';

  // Location
  city: string; // e.g., "Ulm"
  kindergartenName?: string;
  favoritePlayground?: string;

  // Companion object (like Ahana's plush bunny)
  companionObject?: string; // e.g., "plush bunny named Hoppel"

  // Story preferences
  language: 'en' | 'de' | 'bilingual';
  tonePreset: 'gentle' | 'adventurous' | 'funny';
  ageVocabulary: 'toddler' | 'preschool' | 'early-reader';
}
```

---

## 4. TECHNICAL ARCHITECTURE

### System Overview

```
┌─────────────────────────────────────────────────┐
│                  FRONTEND (Next.js 14)           │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │ Onboard  │ │ Create   │ │ Interactive      │ │
│  │ & Upload │ │ Book     │ │ Reader           │ │
│  │ Photos   │ │ Wizard   │ │ (page-turn, TTS) │ │
│  └────┬─────┘ └────┬─────┘ └────────┬─────────┘ │
│       │            │                │            │
│  ┌────┴────────────┴────────────────┴──────────┐ │
│  │          State Management (Zustand)          │ │
│  └──────────────────┬──────────────────────────┘ │
└─────────────────────┼───────────────────────────┘
                      │ API Routes
┌─────────────────────┼───────────────────────────┐
│              BACKEND (Next.js API Routes)         │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │ /api/    │ │ /api/    │ │ /api/            │ │
│  │ character│ │ generate │ │ export           │ │
│  │          │ │          │ │ (PDF + print)    │ │
│  └────┬─────┘ └────┬─────┘ └────────┬─────────┘ │
└───────┼────────────┼────────────────┼────────────┘
        │            │                │
┌───────┼────────────┼────────────────┼────────────┐
│       │   AI SERVICES LAYER         │            │
│  ┌────┴─────┐ ┌────┴─────┐ ┌───────┴──────────┐ │
│  │ Character│ │ Story    │ │ Image            │ │
│  │ Sheet    │ │ Generator│ │ Generator        │ │
│  │ (IP-Adap)│ │ (Claude) │ │ (SDXL/Flux+LoRA)│ │
│  └──────────┘ └──────────┘ └──────────────────┘ │
│  ┌──────────┐ ┌──────────────────────────────┐   │
│  │ TTS      │ │ Print-on-Demand              │   │
│  │ (Eleven  │ │ (Gelato/Peecho API)          │   │
│  │  Labs)   │ │                              │   │
│  └──────────┘ └──────────────────────────────┘   │
└──────────────────────────────────────────────────┘
        │
┌───────┴──────────────────────────────────────────┐
│              STORAGE                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │
│  │ PostgreSQL│ │ S3/R2   │ │ Redis            │  │
│  │ (users,  │ │ (images, │ │ (generation      │  │
│  │  books)  │ │  PDFs)   │ │  queue, cache)   │  │
│  └──────────┘ └──────────┘ └──────────────────┘  │
└──────────────────────────────────────────────────┘
```

### 4.1 Character Consistency Engine (THE MOAT)

This is the hardest technical problem and the single biggest differentiator. Every other AI story app fails here.

**Approach: IP-Adapter-FaceID + Style LoRA**

```
Parent uploads 2-3 photos of child
          │
          ▼
  ┌───────────────────┐
  │ Face Detection     │ ← InsightFace / MediaPipe
  │ & Embedding        │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │ Character Sheet    │ ← IP-Adapter-FaceID-Plus v2
  │ Generation         │   + "soft watercolor children's
  │ (6 canonical poses)│     book illustration" style LoRA
  └────────┬──────────┘
           │ Produces:
           │ - Front view (neutral)
           │ - 3/4 left, 3/4 right
           │ - Walking, sitting, pointing
           │ - With companion object
           ▼
  ┌───────────────────┐
  │ Character Ref ID   │ ← Stored in user profile
  │ (embedding + sheet)│   Reused for EVERY book
  └───────────────────┘
```

**Critical design decisions:**
- **Watercolor style, NOT photorealistic** — serves both aesthetics (matches Pixi/Conni feel) and GDPR (no identifiable photo reproduction of minors)
- **Consistent outfit per character** — like Conni's red headband, each child gets a "signature look" (e.g., yellow raincoat, star t-shirt) chosen at onboarding
- **Companion object in every scene** — the plush bunny/teddy in frame anchors consistency even when face rendering varies slightly

**Model stack (POC):**
- Stable Diffusion XL + IP-Adapter-FaceID-Plus-v2 (open source, self-hostable)
- Style LoRA: fine-tuned on 200 watercolor children's book illustrations (public domain + licensed)
- Background LoRA: "warm European small-city" environments

**Model stack (Production):**
- Flux.1 Dev + IP-Adapter (better consistency, faster)
- OR Midjourney v7 character consistency API (if budget allows, best quality)
- Fallback: DALL-E 3 with detailed character description (least consistent, but cheapest)

### 4.2 Story Generation Engine

**Model:** Claude API (Sonnet 4.6 for speed, Opus 4.6 for quality)

**Pipeline:**

```
StoryConfig + TemplateId
        │
        ▼
┌───────────────────────┐
│ 1. OUTLINE GENERATOR  │
│  Input: template +    │
│  customization params │
│  Output: 24-page      │
│  outline with beats   │
│  (JSON structured)    │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│ 2. PAGE TEXT GENERATOR│
│  Input: outline +     │
│  age vocabulary level │
│  Output: per-page text│
│  (100-140 words/page) │
│  EN and/or DE         │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│ 3. IMAGE PROMPT GEN   │
│  Input: page text +   │
│  character sheet ref + │
│  scene description    │
│  Output: per-page     │
│  image generation     │
│  prompt with character│
│  anchoring tags       │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│ 4. COMPLIANCE CHECK   │
│  - No IP names/phrases│
│  - Age-appropriate    │
│  - No franchise motifs│
│  - Cultural sensitivity│
│  - GDPR image check   │
└───────────────────────┘
```

**Story template structure (example: "Erster Tag im Kindergarten"):**

```json
{
  "templateId": "kindergarten-first-day",
  "pages": 24,
  "structure": {
    "act1_setup": [1, 2, 3, 4, 5, 6],
    "act2_adventure": [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
    "act3_resolution": [19, 20, 21, 22, 23, 24]
  },
  "beats": [
    { "page": 1, "beat": "Title page — {name} with backpack, looking excited/nervous" },
    { "page": 2, "beat": "Morning routine — getting dressed, breakfast with {family}" },
    { "page": 3, "beat": "Walking/driving to Kindergarten in {city}" },
    { "page": 4, "beat": "Arriving at {kindergartenName} — big door, other children" },
    { "page": 5, "beat": "Saying goodbye to {parent} — a hug, companion object for comfort" },
    { "page": 6, "beat": "Exploring the room — cubbies, toys, art supplies" },
    { "page": 7, "beat": "Meeting the teacher — friendly, welcoming" },
    { "page": 8, "beat": "Circle time — everyone introduces themselves" },
    { "page": 9, "beat": "Conflict/challenge — feeling shy, missing {parent}" },
    { "page": 10, "beat": "Companion object provides comfort" },
    { "page": 11, "beat": "Another child approaches — potential friend" },
    { "page": 12, "beat": "Playing together — building blocks, painting" },
    { "page": 13, "beat": "Snack time — sharing food, learning table manners" },
    { "page": 14, "beat": "Outdoor play — playground, sandbox" },
    { "page": 15, "beat": "Discovery — finding something interesting (bug, flower, puddle)" },
    { "page": 16, "beat": "Helping someone — sharing a toy, comforting a crying child" },
    { "page": 17, "beat": "Story time — teacher reads aloud, {name} listens with new friend" },
    { "page": 18, "beat": "Singing/music — learning a new song" },
    { "page": 19, "beat": "Making something to take home — drawing for {parent}" },
    { "page": 20, "beat": "Cleanup time — everyone helps" },
    { "page": 21, "beat": "{parent} arrives for pickup — {name} runs to hug" },
    { "page": 22, "beat": "Showing the drawing to {parent} — pride" },
    { "page": 23, "beat": "Walking home — talking about the day, excited for tomorrow" },
    { "page": 24, "beat": "Bedtime — {name} tells companion object about Kindergarten, falls asleep happy" }
  ],
  "moral": "New beginnings are scary, but brave children find friends and joy",
  "vocabulary_constraints": {
    "toddler": "max 8 words per sentence, 3-4 sentences per page",
    "preschool": "max 12 words per sentence, 4-5 sentences per page",
    "early-reader": "max 15 words per sentence, 5-7 sentences per page"
  }
}
```

### 4.3 Interactive Reader

**Design Principles:**
- Square aspect ratio (matching 10x10cm Pixi format)
- Page-turn animation (swipe on mobile, click on desktop)
- Warm, soft background texture (aged paper feel)
- Text overlaid on illustration in a semi-transparent box at bottom
- Font: rounded, child-friendly (Nunito or similar)
- Narration button per page (TTS or parent voice recording)

**Reader Features (POC):**
- Page-by-page navigation with swipe/click
- Inline text editing (parent can tweak wording)
- Zoom on illustration
- Audio play/pause per page

**Reader Features (MVP):**
- Read-along highlighting (text highlights as TTS speaks)
- "Tap the picture" interactions (tap the bunny → it wiggles)
- Night mode (dimmer colors, slower page transitions)
- Bookshelf view (all your child's books in a collection)

### 4.4 Export & Print Pipeline

**Digital Export:**
- PDF (A5 landscape, 150 DPI for screen)
- EPUB (for e-readers)
- Image sequence (for sharing individual pages)

**Print Export:**
- PDF/X-4 (300 DPI, CMYK color space)
- Bleed: 3mm on all sides
- Format: 10x10cm (Pixi standard) OR 15x15cm (Conni size)
- Paper: 170gsm matte coated
- Binding: saddle-stitch (24 pages)
- Cover: 300gsm card, matte laminate

**Print-on-Demand Integration:**
- Primary: Gelato API (EU fulfillment, German warehouse)
- Fallback: Peecho API
- Fulfillment time: 3-5 business days within Germany
- Target print cost: €2.50-3.50 per book (sell at €6.99-8.99)

### 4.5 Data Model

```typescript
// Core entities

interface User {
  id: string;
  email: string;
  subscription: 'free' | 'starter' | 'family' | 'premium';
  language: 'en' | 'de';
  createdAt: Date;
}

interface ChildProfile {
  id: string;
  userId: string;
  name: string;
  birthDate: Date; // for age calculation
  gender: 'girl' | 'boy' | 'neutral';
  characterSheetId: string;
  signatureOutfit: OutfitConfig;
  companionObject: { name: string; type: string; description: string };
  city: string;
  familyMembers: FamilyMember[];
  createdAt: Date;
}

interface CharacterSheet {
  id: string;
  childProfileId: string;
  faceEmbedding: Float32Array; // IP-Adapter embedding
  referenceImages: {
    front: string;      // S3 URL
    threeQuarterLeft: string;
    threeQuarterRight: string;
    walking: string;
    sitting: string;
    withCompanion: string;
  };
  styleLoraId: string;
  version: number;
  createdAt: Date;
}

interface Book {
  id: string;
  childProfileId: string;
  templateId: string;
  config: StoryConfig;
  status: 'draft' | 'generating' | 'ready' | 'exported' | 'ordered';
  pages: Page[];
  language: 'en' | 'de' | 'bilingual';
  complianceCheck: ComplianceResult;
  createdAt: Date;
  generatedAt?: Date;
}

interface Page {
  pageNumber: number;
  text: { en?: string; de?: string };
  imagePrompt: string;
  imageUrl: string;         // generated illustration
  audioUrl?: string;        // TTS narration
  interactionHints?: InteractionHint[];
}

interface PrintOrder {
  id: string;
  bookId: string;
  userId: string;
  format: '10x10' | '15x15';
  quantity: number;
  shippingAddress: Address;
  printProvider: 'gelato' | 'peecho';
  providerOrderId?: string;
  status: 'pending' | 'printing' | 'shipped' | 'delivered';
  trackingUrl?: string;
  createdAt: Date;
}
```

---

## 5. PRICING MODEL

### Freemium + Subscription + Physical Books

| Tier | Price | What You Get |
|------|-------|-------------|
| **Free** | €0 | 1 child profile, 1 story/month, digital only, watermark |
| **Starter** | €4.99/mo | 1 child, 3 stories/month, no watermark, PDF export |
| **Family** | €9.99/mo | 3 children, unlimited digital, 1 printed book/month included |
| **Premium** | €14.99/mo | 5 children, unlimited everything, 2 printed books/month, priority generation |

### À la carte

| Item | Price |
|------|-------|
| Additional printed book (10x10) | €6.99 + shipping |
| Additional printed book (15x15) | €8.99 + shipping |
| Gift set (3 books, gift box) | €19.99 + shipping |
| Voice cloning add-on (parent narration) | €4.99/one-time |

### Revenue Math (Conservative)

Target: 1,000 paying users by Month 6
- 600 Starter × €4.99 = €2,994/mo
- 300 Family × €9.99 = €2,997/mo
- 100 Premium × €14.99 = €1,499/mo
- Print orders: ~500 books/mo × €4 margin = €2,000/mo
- **Total MRR: ~€9,500 by Month 6**

---

## 6. COPYRIGHT & COMPLIANCE

### What's SAFE (We CAN Do)

- Small-format illustrated children's books (a format, not IP)
- Slice-of-life "first experiences" stories (a genre, not IP)
- A consistent child character with signature visual traits (a concept, not IP)
- Watercolor illustration style (a medium, not IP)
- 24-page structure (a format decision, not IP)
- Bilingual stories (a feature, not IP)

### What's NOT SAFE (We MUST Avoid)

- The word "Pixi" (trademark of Carlsen Verlag)
- Conni's specific visual traits (red-striped headband, specific outfit designs)
- Any Carlsen trade dress (the Pixi character, bowl display, specific layouts)
- Reproducing or closely adapting any specific story plot from Conni/Pixi
- Art style that could be confused with specific illustrators (Eva Wenzel-Bürger, Dorothea Tust)
- Using names of Conni's family (Mama, Papa, Jakob, Kater Mau — use generic equivalents)

### Automated Compliance Checks

```typescript
interface ComplianceResult {
  passed: boolean;
  checks: {
    noKnownIPNames: boolean;     // No "Conni", "Pixi", character names
    noFranchiseMotifs: boolean;  // No red headband, specific pets
    genericExperiences: boolean; // Story is universal, not adapted from specific source
    ageAppropriate: boolean;     // Content safety
    gdprCompliant: boolean;      // No photorealistic child images
    culturalSensitivity: boolean;// No stereotypes, respectful representation
  };
  warnings: string[];
  blockers: string[];
}
```

---

## 7. MVP SCOPE & PHASED ROADMAP

### Phase 0 — POC (Current State + This Sprint)

**Goal:** Prove the core loop with 1 story template and AI-generated consistent illustrations

**Deliverables:**
- [ ] Character sheet generation from 2 photos → 6 canonical poses (watercolor style)
- [ ] 1 complete story template ("Erster Tag im Kindergarten") with all 24 beats
- [ ] AI text generation filling template slots with personalization
- [ ] 24 AI-generated illustrations with character consistency across pages
- [ ] Interactive reader with page-turn animation (square format)
- [ ] PDF export (screen quality)
- [ ] Compliance check on generated content

**Timeline:** 2-3 weeks with Claude Code

### Phase 1 — MVP (Months 1-2)

- [ ] User auth (email/password + Google)
- [ ] Child profile creation with photo upload
- [ ] Character sheet generation pipeline (automated)
- [ ] 6 story templates (Tier 1 — Universal)
- [ ] Full interactive reader with TTS (ElevenLabs)
- [ ] Print-ready PDF export (300 DPI, CMYK)
- [ ] Basic Gelato print-on-demand integration
- [ ] Stripe payment (subscription + one-time print orders)
- [ ] Landing page with demo

### Phase 2 — Growth (Months 3-4)

- [ ] 12 story templates (adding Tiers 2 & 3)
- [ ] Bilingual toggle (EN/DE simultaneous generation)
- [ ] Monthly subscription with auto-delivery
- [ ] Gift flow (buy a book set for someone else)
- [ ] Parent voice recording for narration
- [ ] Bookshelf view (collectible shelf UI)
- [ ] Basic analytics (which stories are popular)

### Phase 3 — Scale (Months 5-8)

- [ ] Custom story creation (parent writes prompt, AI builds full book)
- [ ] Voice cloning (parent's voice for TTS narration)
- [ ] "Tap to interact" reader features
- [ ] Referral program (gift a free book, get a free book)
- [ ] Kindergarten/group accounts
- [ ] Additional languages (Turkish, Spanish, Hindi)
- [ ] Indian mythology story pack (Ganesha, Hanuman, Diwali stories)
- [ ] iOS/Android native app (React Native)

---

## 8. TECH STACK (FINAL)

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | Next.js 14 (App Router) + TypeScript | Already in place, SSR for SEO |
| **Styling** | Tailwind CSS + Framer Motion | Animations for page turns |
| **State** | Zustand | Lightweight, TypeScript-native |
| **Auth** | NextAuth.js / Auth.js | Google + email, session management |
| **Database** | PostgreSQL (Supabase) | Relational, good for structured book data |
| **Object Storage** | Cloudflare R2 / AWS S3 | Images, PDFs, character sheets |
| **Queue** | BullMQ + Redis | Generation jobs (image gen takes 30-60s) |
| **Story AI** | Anthropic Claude API (Sonnet 4.6) | Best for structured creative text |
| **Image AI** | Stable Diffusion XL + IP-Adapter | Open source, self-hostable, character consistency |
| **TTS** | ElevenLabs API | Natural, multilingual |
| **PDF** | `@react-pdf/renderer` or `pdfkit` | Print-ready PDF generation |
| **Print-on-Demand** | Gelato API | EU fulfillment, German warehouse |
| **Payments** | Stripe | Subscriptions + one-time |
| **Deployment** | Vercel (frontend) + Railway/Fly.io (GPU workers) | Fast, cheap, auto-scale |
| **Testing** | Vitest + Playwright | Unit + E2E |

---

---

# PART 2: CLAUDE CODE BUILD GUIDE

## Building bedtime-ahana End-to-End with Claude Code (Autonomous Cloud Workflow)

---

## 9. WHY CLAUDE CODE FOR THIS PROJECT

This project is ideal for Claude Code because:
- **Multi-file coordination** — frontend, backend, AI services, types all need to stay in sync
- **Structured templates** — story templates, data models, API contracts are well-defined
- **Iterative refinement** — image prompts, story text, UI polish all benefit from AI iteration
- **Long autonomous sessions** — each phase can run 2-7 hours with minimal supervision

---

## 10. TOP 10 SHIPPED PRODUCTS & THEIR WORKFLOW PATTERNS

These real products were built end-to-end with Claude Code. Each teaches a workflow principle we'll apply:

### 1. **Context (macOS MCP Debugger)** — by Indragie Karunaratne
20,000 lines of Swift, shipped to production. ~1,000 lines written by hand.
**Workflow lesson:** Separate research from implementation. Use Plan Mode first. Screenshot-driven UI refinement ("make it more beautiful" after first pass).

### 2. **Little Explorer (iOS family places app)** — by Ondrej Machart
Native iOS app, App Store published, subscription model, 100+ monthly users.
**Workflow lesson:** Non-developer (PM) built it solo over 2 months of evenings. Start with a working prototype, then iterate toward production quality. Don't fight AI non-determinism — embrace it for creative work.

### 3. **Tobi Lutke's MRI Viewer** — Shopify CEO
Browser-based medical image viewer, built from a USB stick of DICOM files.
**Workflow lesson:** Give Claude the raw materials + a clear goal. Let it figure out the implementation path. "Reflexively reach for AI" — the mental shift matters more than the code.

### 4. **Pietro Schirano's DNA Analyzer** — ex-Anthropic engineer
Processed raw AncestryDNA file into health insights.
**Workflow lesson:** Claude Code excels at "pipeline" tasks — take input A, process through steps B-C-D, produce output E. Each step is a clear, testable unit.

### 5. **8-Shot Brand Video Generator** — Community project
Full video production: script → voiceover (ElevenLabs) → visuals (Veo 3) → music → editing (ffmpeg).
**Workflow lesson:** Multi-service orchestration. Define the pipeline, let Claude wire up each API integration step by step. Each service call is one subagent task.

### 6. **Boris Cherny's 300 PRs/month workflow** — Creator of Claude Code, Anthropic Staff Engineer
5+ parallel Claude sessions, subagents for code-simplifier and verify-app.
**Workflow lesson:** Run parallel sessions. One task per subagent. After ANY correction, update CLAUDE.md so the mistake never repeats. Commit every hour.

### 7. **Everything Claude Code** — Affaan Mustafa
108K GitHub stars, 28 agents, 119 skills, 60 slash commands.
**Workflow lesson:** Invest in skills and agents upfront. A /commit-push-pr slash command saves hundreds of manual git operations. Build verification skills.

### 8. **Opus 4.0 Multi-Million Line Codebase Migration** — Anthropic internal
7 hours of nonstop autonomous work, 99.9% accuracy.
**Workflow lesson:** For large migrations, Claude plans upfront, adapts strategy as it learns, and maintains consistency across files. Trust the autonomous loop for well-defined tasks.

### 9. **Hand-Tracking Physics Simulation** — Community (Avery)
Three.js + MediaPipe, browser-based, webcam input.
**Workflow lesson:** Claude Code handles complex library integrations well when given clear examples. WebGL/Canvas work benefits from screenshot → refine loops.

### 10. **Fintech Platform Full Dev Cycle** — Enterprise (unnamed, $1M+ ARR)
Full development cycle with quality standards maintained.
**Workflow lesson:** Start with CI/CD and testing infrastructure. Claude Code's value compounds when there's a test suite to validate against.

---

## 11. THE OPTIMAL SESSION STRATEGY

### The Master Principle

> **"Research → Plan → Execute → Verify → Ship"**
> (From Boris Cherny's workflow, validated across all top projects)

### Context Window Management

Claude Code's context window fills up fast. Performance degrades as it fills. The solution:

1. **One feature per session** — don't try to build everything in one sitting
2. **CLAUDE.md as persistent memory** — every lesson learned goes here
3. **Git as checkpoint** — commit after every completed feature, branch per session
4. **Subagents for isolated tasks** — keep main context clean

### Session Architecture for bedtime-ahana

```
SESSION 1 (Research + Planning)
├── Read existing codebase
├── Generate implementation plan
├── Create CLAUDE.md with project rules
├── Create tasks.md with all features
└── Commit: "chore: project setup and planning"

SESSION 2 (Data Model + Types)
├── Read plan from SESSION 1
├── Implement all TypeScript types
├── Database schema (Prisma/Drizzle)
├── API route stubs
└── Commit: "feat: data model and API stubs"

SESSION 3 (Character Sheet Pipeline)
├── Read types from SESSION 2
├── Implement face detection service
├── IP-Adapter character generation
├── Character sheet storage
├── Tests
└── Commit: "feat: character consistency engine"

SESSION 4 (Story Generation Engine)
├── Read types and API stubs
├── Implement story template system
├── Claude API integration for text gen
├── Image prompt generation
├── Compliance checker
├── Tests
└── Commit: "feat: story generation pipeline"

SESSION 5 (Image Generation Pipeline)
├── Read story generation output format
├── SDXL + IP-Adapter integration
├── Per-page image generation with character ref
├── Image quality validation
├── Queue system (BullMQ)
├── Tests
└── Commit: "feat: AI image generation"

SESSION 6 (Interactive Reader)
├── Read page data model
├── Square-format page viewer component
├── Page-turn animation (Framer Motion)
├── Text overlay with typography
├── Audio playback per page
├── Mobile-responsive
├── Tests
└── Commit: "feat: interactive book reader"

SESSION 7 (Create Book Wizard)
├── Read all components
├── Multi-step form (child profile → story selection → customization → generate)
├── Photo upload with preview
├── Generation progress UI
├── Error handling
├── Tests
└── Commit: "feat: book creation wizard"

SESSION 8 (Export + Print Pipeline)
├── Read book data model
├── PDF generation (screen quality + print quality)
├── Print-ready PDF (300 DPI, CMYK, bleed)
├── Gelato API integration
├── Order tracking
├── Tests
└── Commit: "feat: PDF export and print-on-demand"

SESSION 9 (Auth + Payments)
├── NextAuth.js setup
├── User/subscription models
├── Stripe integration (subscriptions + one-time)
├── Protected routes
├── Tests
└── Commit: "feat: auth and payments"

SESSION 10 (Polish + Deploy)
├── Landing page
├── Bookshelf view
├── Error boundaries
├── Performance optimization
├── Playwright E2E tests
├── Vercel deployment config
├── Final review
└── Commit: "feat: polish and deploy"
```

---

## 12. CLAUDE.md — THE PROJECT BRAIN

This file goes in the project root. It's the most important file for Claude Code quality.

```markdown
# CLAUDE.md — bedtime-ahana

## Project Overview
AI-personalized children's micro-books. Next.js 14 + TypeScript.
Target: Pixi-style (10x10cm, 24 pages) personalized story books.

## Architecture Rules
- All AI service calls go through /lib/ai/*.ts adapters (never call APIs directly from components)
- Types are the source of truth — always check /types/ before implementing
- Every API route has a corresponding type in /types/api.ts
- Image generation is async (queued via BullMQ) — never block on it
- All text content must support EN and DE — use i18n keys, never hardcode strings
- Character sheet embedding is immutable after creation — new photos = new sheet version

## Code Style
- TypeScript strict mode — no `any`, no `as` casts without comment explaining why
- Prefer `const` arrow functions for components
- Use Zod for all API input validation
- Error handling: Result type pattern (never throw from services, only from API routes)
- Tests: Vitest for unit, Playwright for E2E. Minimum: test the happy path + one error case

## File Structure
- /app — Next.js pages and API routes
- /components — React components (one folder per feature)
- /lib/ai — AI service adapters (character, story, image, tts, compliance)
- /lib/services — Business logic (book creation, export, orders)
- /types — All TypeScript interfaces
- /data/templates — Story templates (JSON)
- /public/generated — Generated assets (gitignored in prod)
- /tests — Test files mirroring /lib and /components structure

## AI Service Adapters
All adapters in /lib/ai/ follow this pattern:
- Export a single async function
- Accept typed input, return typed output
- Have a local stub mode (for development without API keys)
- Log all API calls with timing

## Testing Commands
- `pnpm test` — run all tests
- `pnpm test:unit` — Vitest only
- `pnpm test:e2e` — Playwright only
- `pnpm lint` — ESLint + Prettier check
- `pnpm build` — production build (also runs postbuild sample generation)

## Common Mistakes (UPDATE THIS AFTER EVERY FIX)
- DO NOT use `fs` in client components — it's server-only
- DO NOT hardcode localhost URLs — use environment variables
- Image generation takes 30-60s — always use the queue, never await inline
- PDF generation for print MUST use CMYK — jsPDF doesn't support this, use pdfkit
- Character sheet generation requires GPU — stub it in dev, use cloud GPU in prod
- NEVER reproduce Pixi/Conni specific visual elements — see /docs/compliance.md

## Git Conventions
- Branch per feature: `feat/session-N-feature-name`
- Commit format: `type: description` (feat, fix, chore, test, docs)
- Squash merge to main
- Tag releases: `v0.1.0`, `v0.2.0`, etc.
```

---

## 13. tasks.md — THE FEATURE CHECKLIST

This file tracks what's done and what's next. Claude Code reads this at the start of every session.

```markdown
# tasks.md — bedtime-ahana Build Progress

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Complete
- [!] Blocked

## SESSION 1: Planning ✅
- [x] Read existing codebase and understand current state
- [x] Create CLAUDE.md with project rules
- [x] Create this tasks.md
- [x] Create implementation plan document
- [x] Set up branch strategy

## SESSION 2: Data Model + Types
- [ ] Define all TypeScript interfaces in /types/
- [ ] Set up Prisma with PostgreSQL schema
- [ ] Create API route stubs for all endpoints
- [ ] Seed data for 1 story template
- [ ] Tests for type validation (Zod schemas)

## SESSION 3: Character Sheet Pipeline
- [ ] Face detection service (/lib/ai/face-detect.ts)
- [ ] IP-Adapter integration (/lib/ai/character-sheet.ts)
- [ ] Character sheet storage service
- [ ] Local stub mode for dev (returns pre-made character sheet)
- [ ] Tests: face detection, sheet generation, storage

## SESSION 4: Story Generation
- [ ] Story template loader (/lib/services/template-loader.ts)
- [ ] Outline generator (/lib/ai/outline.ts) — Claude API
- [ ] Page text generator (/lib/ai/page-text.ts) — Claude API
- [ ] Image prompt generator (/lib/ai/image-prompt.ts) — Claude API
- [ ] Compliance checker (/lib/ai/compliance.ts)
- [ ] Tests: template loading, outline structure, compliance

## SESSION 5: Image Generation
- [ ] SDXL + IP-Adapter pipeline (/lib/ai/image-gen.ts)
- [ ] BullMQ queue setup for async generation
- [ ] Image storage to R2/S3
- [ ] Generation progress tracking
- [ ] Local stub mode (returns placeholder images)
- [ ] Tests: queue processing, image storage

## SESSION 6: Interactive Reader
- [ ] Square-format PageView component
- [ ] Page-turn animation (Framer Motion)
- [ ] Text overlay component with typography
- [ ] Audio player per page
- [ ] Mobile-responsive layout
- [ ] Bookshelf grid view
- [ ] Tests: reader navigation, responsive layout

## SESSION 7: Book Creation Wizard
- [ ] Step 1: Child profile form + photo upload
- [ ] Step 2: Story template selection (grid with previews)
- [ ] Step 3: Customization (family names, city, preferences)
- [ ] Step 4: Generate + progress indicator
- [ ] Step 5: Preview in reader → confirm or regenerate
- [ ] Tests: form validation, wizard flow

## SESSION 8: Export + Print
- [ ] Screen-quality PDF export (A5 landscape, 150 DPI)
- [ ] Print-quality PDF export (10x10cm, 300 DPI, CMYK, bleed)
- [ ] Gelato API integration
- [ ] Order creation + tracking
- [ ] Tests: PDF generation, print specs validation

## SESSION 9: Auth + Payments
- [ ] NextAuth.js setup (Google + email/password)
- [ ] User model + session management
- [ ] Stripe subscription integration (4 tiers)
- [ ] Stripe one-time payment (print orders)
- [ ] Protected routes + middleware
- [ ] Tests: auth flow, payment webhooks

## SESSION 10: Polish + Deploy
- [ ] Landing page (hero + demo + pricing + FAQ)
- [ ] SEO metadata
- [ ] Error boundaries + loading states
- [ ] Performance: image lazy loading, code splitting
- [ ] Playwright E2E: full flow (create profile → generate book → read → export)
- [ ] Vercel deployment config
- [ ] Environment variable setup
- [ ] README update
```

---

## 14. PROMPT TEMPLATES FOR EACH SESSION

### Starting a New Session

Always begin with:

```
Read CLAUDE.md and tasks.md. Check git log for recent changes.
Identify the next incomplete session from tasks.md.
Read the relevant existing code before making changes.
Create a plan for this session, then implement it.
```

### Session-Specific Prompts

**SESSION 2 — Data Model:**
```
We're building the data model for bedtime-ahana. Read the product spec
in docs/product_spec.md, especially section 4.5 (Data Model).

1. Create all TypeScript interfaces in /types/
2. Set up Prisma schema matching these types
3. Create Zod validation schemas for API inputs
4. Stub all API routes with proper typing
5. Write a seed script for the "kindergarten-first-day" template

Use strict TypeScript. No `any`. Validate everything with Zod.
```

**SESSION 3 — Character Sheet:**
```
We're building the character consistency engine. This is the technical moat.

Read /types/character.ts for the data model.
Read docs/product_spec.md section 4.1 for the architecture.

For the POC, implement:
1. A face detection stub that accepts an image and returns face bounds
2. A character sheet generator stub that produces 6 canonical poses
3. Storage service that saves sheets to the filesystem (swap to S3 later)
4. An API route POST /api/character that orchestrates the pipeline

Use the adapter pattern — real AI calls will be swapped in later.
Every adapter function must have a LOCAL_STUB mode controlled by env var.
```

**SESSION 6 — Interactive Reader:**
```
Build the interactive book reader. This is what parents see.

Requirements:
- Square aspect ratio container (1:1)
- Page-turn animation: swipe on mobile, click arrows on desktop
- Each page shows: full-bleed illustration + text overlay at bottom
- Text in semi-transparent rounded box, child-friendly font (Nunito)
- Navigation: arrows, swipe, page dots
- Audio button per page (play/pause)
- Night mode toggle (warmer colors, dimmer)

Use Framer Motion for animations.
Make it feel like holding a real book — warm, tactile, not "app-like".
Test on mobile viewport (375px wide).
```

---

## 15. PARALLEL SESSION STRATEGY

For maximum speed, run sessions in parallel where dependencies allow:

```
Week 1:
  ┌── SESSION 1 (Planning) ──────────────────────┐
  └── Commit → Branch per feature ──────────────── ┘
       │
       ├── SESSION 2 (Data Model) ← must be first
       │        │
       │        ├── SESSION 3 (Character) ← needs types
       │        ├── SESSION 4 (Story Gen) ← needs types
       │        └── SESSION 6 (Reader UI) ← needs types
       │
Week 2:
       ├── SESSION 5 (Image Gen) ← needs story gen output
       ├── SESSION 7 (Wizard) ← needs all components
       │
Week 3:
       ├── SESSION 8 (Export) ← needs book data
       ├── SESSION 9 (Auth) ← independent, can run parallel
       │
       └── SESSION 10 (Polish + Deploy) ← needs everything
```

**Parallel execution rules:**
- Max 3-5 Claude Code sessions simultaneously (per Boris Cherny's workflow)
- Each session on its own git branch
- Merge to main after each session passes tests
- If sessions conflict on the same file, the earlier session's version wins

---

## 16. LESSONS.md — LIVING DOCUMENT

Create this file. Update it after EVERY session. Claude reads it to avoid repeating mistakes.

```markdown
# lessons.md — What We've Learned

## Session 1 — [DATE]
- (Add after session 1)

## Session 2 — [DATE]
- (Add after session 2)

## General Rules Discovered
- (Add as they come up)
```

---

## 17. VERIFICATION STRATEGY

**Before marking ANY task complete:**

1. **Unit test passes** — `pnpm test:unit`
2. **Lint passes** — `pnpm lint`
3. **Build succeeds** — `pnpm build`
4. **Manual check** — can you see it working in the browser?
5. **Compliance check** — no IP violations in generated content

**End-to-end verification (Session 10):**

```
Prove the full flow works:
1. Create a child profile with the name "Ahana", age 4, city "Ulm"
2. Upload a test face image
3. Generate a character sheet
4. Select "Erster Tag im Kindergarten" template
5. Fill in: Kindergarten="Spatzennest", Papa, baby sister "Shreya"
6. Generate the book
7. Read through all 24 pages in the reader
8. Export as PDF
9. Verify PDF is print-ready (check dimensions, DPI, bleed)
10. Screenshot each step
```

---

## 18. DEPLOYMENT CHECKLIST

```
- [ ] Environment variables set in Vercel
  - [ ] ANTHROPIC_API_KEY
  - [ ] REPLICATE_API_TOKEN (for SDXL)
  - [ ] ELEVENLABS_API_KEY
  - [ ] GELATO_API_KEY
  - [ ] STRIPE_SECRET_KEY
  - [ ] STRIPE_WEBHOOK_SECRET
  - [ ] DATABASE_URL (Supabase)
  - [ ] R2_ACCESS_KEY / R2_SECRET_KEY
  - [ ] REDIS_URL
- [ ] Database migrations run
- [ ] Stripe products/prices created (4 subscription tiers)
- [ ] Gelato account configured (EU delivery)
- [ ] Domain connected (bedtime-ahana.com or similar)
- [ ] SSL verified
- [ ] Sentry error tracking enabled
- [ ] Analytics (Plausible or PostHog)
- [ ] GDPR: Privacy policy, cookie consent, data deletion flow
```

---

## APPENDIX A: KEY COMMANDS FOR CLAUDE CODE

```bash
# Start a session
claude

# Plan mode (research, don't change anything)
# Press Escape, then type /plan or use Ctrl+Shift+P

# Run parallel sessions (number your tabs 1-5)
# Tab 1: Session N (main feature)
# Tab 2: Session N+1 (independent feature)
# Tab 3: Tests and verification

# Useful slash commands to create in .claude/commands/
# /commit-push — git add, commit, push
# /verify — run tests + lint + build
# /check-compliance — run compliance checker on latest book

# Subagents (keep main context clean)
# Use for: code-simplifier, test-writer, verify-app

# CLAUDE.md auto-update after mistakes
# "Add to CLAUDE.md: [lesson learned]"
```

---

## APPENDIX B: DIRECTORY STRUCTURE (TARGET)

```
bedtime-ahana/
├── .claude/
│   ├── settings.json         # Claude Code config
│   ├── commands/             # Slash commands
│   │   ├── commit-push.md
│   │   ├── verify.md
│   │   └── check-compliance.md
│   └── skills/               # Domain skills
│       ├── story-generation.md
│       └── image-consistency.md
├── CLAUDE.md                 # Project brain
├── tasks.md                  # Feature checklist
├── lessons.md                # Mistake log
├── app/
│   ├── page.tsx              # Landing page
│   ├── layout.tsx            # Root layout
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── dashboard/
│   │   ├── page.tsx          # Bookshelf view
│   │   └── children/
│   │       ├── page.tsx      # Child profiles
│   │       └── [id]/page.tsx
│   ├── create/
│   │   └── page.tsx          # Book creation wizard
│   ├── reader/
│   │   └── [bookId]/page.tsx # Interactive reader
│   ├── orders/
│   │   └── page.tsx          # Print order tracking
│   └── api/
│       ├── character/
│       │   └── route.ts      # POST: generate character sheet
│       ├── generate/
│       │   ├── outline/route.ts
│       │   ├── page/route.ts
│       │   ├── image/route.ts
│       │   └── tts/route.ts
│       ├── export/
│       │   └── route.ts      # POST: generate PDF
│       ├── order/
│       │   └── route.ts      # POST: create print order
│       └── webhooks/
│           ├── stripe/route.ts
│           └── gelato/route.ts
├── components/
│   ├── reader/
│   │   ├── BookReader.tsx
│   │   ├── PageView.tsx
│   │   ├── PageTurn.tsx
│   │   ├── TextOverlay.tsx
│   │   └── AudioPlayer.tsx
│   ├── wizard/
│   │   ├── CreateWizard.tsx
│   │   ├── ChildProfileStep.tsx
│   │   ├── StorySelectStep.tsx
│   │   ├── CustomizeStep.tsx
│   │   └── GenerateStep.tsx
│   ├── bookshelf/
│   │   ├── Bookshelf.tsx
│   │   └── BookCard.tsx
│   └── shared/
│       ├── PhotoUpload.tsx
│       └── ProgressBar.tsx
├── lib/
│   ├── ai/
│   │   ├── character-sheet.ts  # IP-Adapter integration
│   │   ├── face-detect.ts      # Face detection
│   │   ├── outline.ts          # Story outline (Claude API)
│   │   ├── page-text.ts        # Page text (Claude API)
│   │   ├── image-prompt.ts     # Image prompt gen (Claude API)
│   │   ├── image-gen.ts        # SDXL image generation
│   │   ├── tts.ts              # ElevenLabs TTS
│   │   └── compliance.ts       # Content safety checks
│   ├── services/
│   │   ├── book-service.ts     # Book CRUD + generation orchestration
│   │   ├── template-loader.ts  # Load story templates
│   │   ├── pdf-export.ts       # PDF generation (screen + print)
│   │   ├── print-order.ts      # Gelato API integration
│   │   └── storage.ts          # R2/S3 file storage
│   ├── queue/
│   │   ├── worker.ts           # BullMQ worker
│   │   └── jobs.ts             # Job definitions
│   └── utils/
│       ├── i18n.ts
│       └── validation.ts
├── types/
│   ├── book.ts
│   ├── character.ts
│   ├── user.ts
│   ├── api.ts
│   └── template.ts
├── data/
│   ├── templates/
│   │   ├── kindergarten-first-day.json
│   │   ├── zahnarzt.json
│   │   ├── fahrrad.json
│   │   ├── geschwisterchen.json
│   │   ├── schwimmbad.json
│   │   └── muellabfuhr.json
│   └── books/                  # Generated books (dev)
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── tests/
│   ├── unit/
│   │   ├── ai/
│   │   ├── services/
│   │   └── components/
│   └── e2e/
│       └── full-flow.spec.ts
├── docs/
│   ├── product_spec.md         # This document
│   ├── product_overview.md     # Existing
│   └── compliance.md           # IP compliance rules
├── public/
│   └── generated/              # Generated assets (gitignored)
├── scripts/
│   ├── generate-sample.ts
│   ├── build-all.sh
│   └── seed-templates.ts
├── .env.example
├── .github/workflows/
│   └── ci.yml
├── next.config.js
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

---

**End of Specification v2.0**

*Next step: Copy this to `docs/product_spec_v2.md` in the bedtime-ahana repo, then start SESSION 1 in Claude Code.*
