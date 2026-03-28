# bedtime-ahana — Claude Code Autonomous Delegation Kit

## How This Works

Each session below is a **self-contained prompt** you paste into Claude Code.
Claude will work autonomously until it either:
1. **Completes all acceptance criteria** → commits and reports done
2. **Gets stuck** → writes the blocker to `BLOCKED.md` and stops

Your workflow:
```
1. Open terminal
2. cd into bedtime-ahana
3. Paste session prompt
4. Walk away
5. Come back when notification says done (or check BLOCKED.md)
6. Review the git diff, approve or give feedback
7. Paste next session prompt
```

---

## PREREQUISITE: One-Time Setup (5 minutes, you do this manually)

```bash
# Clone your repo
git clone https://github.com/manju89jay/bedtime-ahana.git
cd bedtime-ahana

# Create the delegation infrastructure files
# (paste the CLAUDE.md, tasks.md, and .claude/ configs below into the repo)

# Install dependencies
pnpm install

# Set environment variables
cp .env.example .env.local
# Fill in: ANTHROPIC_API_KEY, REPLICATE_API_TOKEN (or leave blank for stubs)
```

Then copy the three files below into your repo before starting any session.

---

## FILE 1: CLAUDE.md (paste into project root)

```markdown
# CLAUDE.md — bedtime-ahana

## What This Project Is
AI-personalized children's micro-books (Pixi-style, 10x10cm, 24 pages).
Next.js 14 + TypeScript + Tailwind. The child is the main character.

## Autonomous Work Rules

### When you finish a task
- Run `pnpm lint && pnpm test && pnpm build`
- If all pass: `git add -A && git commit -m "feat(sessionN): description"`
- If any fail: fix the issue, do not ask me, try up to 3 times
- If still failing after 3 attempts: write the error to BLOCKED.md and stop

### When you're stuck
- Write to BLOCKED.md: what you tried, what failed, exact error
- Do NOT guess or hallucinate a workaround for external service issues
- Do NOT skip a failing test — fix it or document why it's blocked
- Stop working and wait for me

### When you're NOT stuck (handle it yourself)
- Missing npm package → install it
- Type error → fix the type
- Test failing because implementation changed → update the test
- Lint error → fix it
- File doesn't exist yet → create it
- Import path wrong → correct it

## Architecture Rules
- All AI calls go through /lib/ai/*.ts adapters with this signature:
  `export async function generateX(input: XInput): Promise<XOutput>`
- Every adapter checks `process.env.USE_STUBS === 'true'` and returns mock data if so
- Types in /types/ are source of truth — read them before implementing anything
- Never hardcode strings — use i18n pattern (EN/DE object)
- Image generation is async (queued) — never await inline in API routes
- All API inputs validated with Zod

## Code Style
- TypeScript strict, no `any`, no untyped `as` casts
- `const` arrow functions for React components
- Prefer named exports
- One component per file
- Tests: happy path + one error case minimum

## File Naming
- Components: PascalCase.tsx
- Services/utils: kebab-case.ts
- Types: kebab-case.ts
- API routes: route.ts inside folder matching endpoint

## Copyright — CRITICAL
- NEVER use the word "Pixi" in any generated content or UI text
- NEVER reference Conni, her family names, her visual traits
- NEVER reproduce specific story plots from any published children's book
- Our stories are ORIGINAL "first experiences" — inspired by the genre, not any specific work
- Run compliance check before any content generation commit

## Common Mistakes Log
(UPDATE THIS AFTER EVERY FIX — append, never delete)
- [empty — will be populated as sessions run]
```

---

## FILE 2: BLOCKED.md (create empty in project root)

```markdown
# BLOCKED.md — Issues Requiring Human Input

(Claude Code writes here when stuck. Human reads and resolves.)
```

---

## FILE 3: .claude/commands/verify.md

```markdown
Run the full verification suite:
1. `pnpm lint` — fix any errors found
2. `pnpm test` — fix any failing tests (up to 3 attempts)
3. `pnpm build` — fix any build errors
4. If all pass, report "VERIFIED ✅"
5. If stuck after 3 fix attempts on any step, write to BLOCKED.md and report "BLOCKED ❌"
```

---

## FILE 4: .claude/commands/done.md

```markdown
Session completion checklist:
1. Run /verify
2. If verified: `git add -A && git commit -m "feat: [describe what was built]"`
3. Write a 3-line summary of what was completed to the console
4. List any warnings or things that need attention (but aren't blockers)
```

---

# THE 10 SESSION PROMPTS

Copy-paste one at a time. Each is fully self-contained.

---

## SESSION 1 — Project Foundation

```
You are building bedtime-ahana autonomously. Read CLAUDE.md first.

GOAL: Set up the project foundation — clean up existing code, establish
the new architecture, and prepare for all subsequent sessions.

DO THE FOLLOWING IN ORDER:

1. Read the entire existing codebase (all files in /app, /components, /lib, /types, /data, /scripts, /tests)
2. Read docs/product_spec_v2.md if it exists
3. Keep what's useful, refactor what needs updating to match the target architecture

4. Create/update these files:
   /types/book.ts — Book, Page, ComplianceResult interfaces
   /types/character.ts — ChildProfile, CharacterSheet, FamilyMember, OutfitConfig
   /types/user.ts — User, Subscription types
   /types/template.ts — StoryTemplate, Beat, StoryConfig interfaces
   /types/api.ts — API request/response types for all endpoints

5. Create Zod schemas in /lib/validation/ matching every type above

6. Create API route stubs (return mock 200 responses with typed data):
   POST /api/character — accepts photos, returns character sheet
   POST /api/generate/outline — accepts StoryConfig, returns outline
   POST /api/generate/page — accepts outline + page number, returns page text
   POST /api/generate/image — accepts page + character ref, returns image URL
   POST /api/generate/tts — accepts page text, returns audio URL
   POST /api/export — accepts book ID, returns PDF URL

7. Create /data/templates/kindergarten-first-day.json with all 24 beats
   (see the story template structure — page beats for "Erster Tag im Kindergarten")

8. Migrate existing templates in /data/templates/templates.json:
   - The current file has 5 templates in a flat format (id, name, prompt string).
     These must be migrated to the new 24-beat structured format.
   - Fully migrate "bedtime-routine" to a new file /data/templates/bedtime-routine.json
     with complete 24 beats, 3-act structure, moral, and vocabulary_constraints
   - For the remaining 4 (adventure-quest, creative-day, friendship, nature-walk):
     create skeleton JSON files with the beat structure (page numbers and short
     beat descriptions) but mark them as "status": "skeleton" — detailed beat
     text can be fleshed out in later sessions
   - Rename the original templates.json to templates-v1-archived.json
   - Create a new /data/templates/index.ts that exports a list of all available
     templates by scanning the template directory for *.json files

9. Update /tests/ with:
   - Type validation tests (Zod schemas accept valid data, reject invalid)
   - Template loading test (can load and parse kindergarten template)
   - API stub tests (each route returns 200 with correct shape)
   - Template migration: all 6 template JSON files load and validate against schema
   - Template index returns at least 6 templates
   - Skeleton templates have status field set to "skeleton"

10. Update tasks.md: mark Session 1 items as [x], note any issues found

11. Run /verify then /done

ACCEPTANCE CRITERIA (all must pass):
- [ ] pnpm build succeeds
- [ ] pnpm test has 0 failures
- [ ] pnpm lint has 0 errors
- [ ] All 6 API routes return 200 with typed mock data
- [ ] Kindergarten template JSON is valid and loadable
- [ ] Types compile with strict mode, no `any`
- [ ] Existing 5 templates archived as templates-v1-archived.json
- [ ] "bedtime-routine" template fully migrated to 24-beat format
- [ ] 4 skeleton templates exist with valid structure (loadable, marked as skeleton)
- [ ] Template index exports all available templates

If you get stuck on anything, write to BLOCKED.md and stop.
Do not ask me questions — make reasonable decisions and document them
in a DECISIONS.md file.
```

---

## SESSION 2 — Story Generation Engine

```
You are building bedtime-ahana autonomously. Read CLAUDE.md first.
Check git log to see what Session 1 completed. Read tasks.md.

GOAL: Build the complete story generation pipeline using Claude API
(Anthropic). In stub mode, return pre-written content. In live mode,
call the API.

DO THE FOLLOWING IN ORDER:

1. Read /types/template.ts and /types/book.ts for data contracts
2. Read /data/templates/kindergarten-first-day.json for the template format

3. Implement /lib/ai/outline.ts:
   - Input: StoryConfig + template
   - Output: 24-page outline with per-page beat text
   - Stub mode: return the template beats with {name} replaced
   - Live mode: call Anthropic API to expand beats into detailed scene descriptions
   - System prompt must enforce: age-appropriate language, no IP references,
     consistent character description across pages

4. Implement /lib/ai/page-text.ts:
   - Input: outline + page number + language (en/de/bilingual)
   - Output: page text (100-140 words for preschool, adjust for age)
   - Stub mode: return hardcoded sample text for each page
   - Live mode: call Anthropic API with vocabulary constraints
   - Must support bilingual output (both EN and DE in one call)

5. Implement /lib/ai/image-prompt.ts:
   - Input: page text + page number + character description + scene
   - Output: detailed image generation prompt string
   - Must include: character appearance (from profile), outfit, companion object,
     scene setting, lighting ("warm watercolor"), mood, camera angle
   - Must NEVER include: brand names, IP references, photorealistic instructions
   - Stub mode: return pre-written prompts

6. Implement /lib/ai/compliance.ts:
   - Input: generated text + image prompts
   - Checks: no IP names (Conni, Pixi, etc.), age-appropriate content,
     no franchise motifs, cultural sensitivity
   - Returns: ComplianceResult with pass/fail and specific warnings
   - This should work in both stub and live mode (it's rule-based, not AI)

7. Implement /lib/services/book-service.ts:
   - Orchestrates: load template → generate outline → generate page texts →
     generate image prompts → run compliance → save book JSON
   - Status tracking: updates book.status through the pipeline
   - Error handling: if any step fails, set status to 'error' with details
   - Default sample generation should use language='bilingual' to exercise the full path

8. Wire up API routes:
   POST /api/generate/outline — calls outline.ts
   POST /api/generate/page — calls page-text.ts

9. Write tests:
   - Outline generator produces 24 pages with correct structure
   - Page text respects word count constraints per age group
   - Image prompts contain character description and exclude banned terms
   - Compliance checker catches "Conni" and "Pixi" in text
   - Book service orchestrates full pipeline in stub mode
   - Bilingual mode: page text output contains both `en` and `de` fields with distinct content

10. Run /verify then /done

ACCEPTANCE CRITERIA:
- [ ] `pnpm test` passes with all new tests
- [ ] In stub mode: can generate a complete 24-page book JSON from kindergarten template
- [ ] Book JSON contains: text (en + de), image prompts, compliance result
- [ ] Compliance checker rejects text containing "Conni" or "Pixi"
- [ ] No hardcoded API keys anywhere (all from env vars)
- [ ] In stub mode with language='bilingual': each page contains both EN and DE text fields populated
- [ ] Test verifies bilingual output has non-empty text in BOTH languages (not just one)

DECISIONS TO MAKE YOURSELF:
- Anthropic model: use claude-sonnet-4-20250514 for speed
- Temperature: 0.7 for text, 0.3 for outlines
- If Anthropic SDK isn't installed, install @anthropic-ai/sdk
```

---

## SESSION 3 — Character Sheet & Image Generation (Stub Mode)

```
You are building bedtime-ahana autonomously. Read CLAUDE.md first.
Check git log for recent sessions. Read tasks.md.

GOAL: Build the character sheet and image generation pipeline in STUB
MODE only. We will NOT call real image AI APIs in this session.
The goal is to get the data flow and storage working end-to-end.

DO THE FOLLOWING IN ORDER:

1. Read /types/character.ts for CharacterSheet interface

2. Implement /lib/ai/face-detect.ts (STUB ONLY):
   - Input: image file (Buffer or base64)
   - Output: { detected: boolean, faceCount: number, bounds: Rectangle }
   - Stub: always returns detected=true with centered face bounds
   - Later: will use InsightFace or MediaPipe

3. Implement /lib/ai/character-sheet.ts (STUB ONLY):
   - Input: face image + OutfitConfig + companion object description
   - Output: CharacterSheet with 6 reference image URLs
   - Stub: copy 6 placeholder watercolor character images to
     /public/generated/{childId}/character/ and return those paths
   - Create 6 simple SVG placeholder images (front, 3/4 left, 3/4 right,
     walking, sitting, with-companion) — just colored silhouettes with
     the child's name label, different pose each

4. Implement /lib/ai/image-gen.ts (STUB ONLY):
   - Input: image prompt string + character sheet reference
   - Output: generated image URL
   - Stub: return a placeholder illustration image
   - Create 1 nice SVG placeholder that says "Page {n} illustration —
     {first 50 chars of prompt}" with a watercolor-style background gradient
   - Later: will use SDXL + IP-Adapter or Flux

5. Implement /lib/services/storage.ts:
   - saveCharacterSheet(childId, images): saves to /public/generated/{childId}/character/
   - savePageImage(bookId, pageNumber, image): saves to /public/generated/{bookId}/
   - getCharacterSheet(childId): retrieves paths
   - getPageImage(bookId, pageNumber): retrieves path
   - For now: filesystem storage. Interface must support swapping to S3/R2 later.

6. Wire up API routes:
   POST /api/character — accepts image upload (multipart/form-data),
     runs face-detect, generates character sheet, stores, returns sheet

7. Update /lib/services/book-service.ts:
   - After generating image prompts, call image-gen for each page
   - Store resulting images via storage service
   - Book JSON now includes imageUrl per page (pointing to generated files)

8. Write tests:
   - Face detection stub returns correct structure
   - Character sheet generation creates 6 files on disk
   - Image generation creates placeholder per page
   - Storage service reads back what it wrote
   - Full pipeline: create profile → generate book → all 24 images exist on disk

9. Run /verify then /done

ACCEPTANCE CRITERIA:
- [ ] POST /api/character with a test image returns a CharacterSheet JSON
- [ ] Character sheet has 6 image URLs that resolve to actual files
- [ ] Full book generation produces 24 page images on disk
- [ ] All file paths are relative to /public/ (servable by Next.js)
- [ ] Storage service interface is abstract enough to swap to S3 later
- [ ] No real AI API calls — everything works with USE_STUBS=true

IMPORTANT: Do not try to install or call Stable Diffusion, Replicate,
or any GPU-dependent service. STUB MODE ONLY for this session.
If you think something needs a real AI call, write it to BLOCKED.md.
```

---

## SESSION 4 — Interactive Book Reader

```
You are building bedtime-ahana autonomously. Read CLAUDE.md first.
Check git log for recent sessions. Read tasks.md.

GOAL: Build a beautiful interactive book reader that feels like holding
a real children's book. This is the user-facing showcase piece.

DO THE FOLLOWING IN ORDER:

1. Read /types/book.ts for Page and Book interfaces
2. Check what exists in /components/ and /app/reader/

3. Install framer-motion if not already installed: pnpm add framer-motion

4. Build these components in /components/reader/:

   PageView.tsx:
   - Square aspect ratio container (1:1) — this is critical, books are 10x10
   - Full-bleed illustration as background
   - Text overlay at bottom: semi-transparent white/cream rounded box
   - Font: system-ui or Nunito (install @fontsource/nunito if available)
   - Text size responsive to container
   - Page number in bottom corner (small, subtle)

   PageTurn.tsx:
   - Wraps PageView with page-turn animation
   - Swipe left/right on mobile (touch events)
   - Left/right arrow buttons on desktop (positioned outside the book)
   - Framer Motion: slide + slight 3D perspective rotation on turn
   - Preload adjacent pages for smooth transitions

   TextOverlay.tsx:
   - Semi-transparent background (rgba white, 0.85 opacity)
   - Rounded corners (16px)
   - Padding: comfortable reading space
   - Language toggle button if bilingual (small flag icons: 🇬🇧 🇩🇪)
   - Text: dark warm gray (#2B2B2B), line-height 1.6

   AudioPlayer.tsx:
   - Small play/pause button in the text overlay area
   - Progress bar (thin, matches accent color)
   - Auto-advances to next page when audio finishes (optional toggle)
   - For now: placeholder — shows button but logs "TTS not yet connected"

   BookReader.tsx:
   - Main component: loads book JSON, manages current page state
   - Navigation: page dots at bottom, keyboard arrows, swipe
   - Header: book title, close button
   - Night mode toggle (shifts to warm amber tones, reduces brightness)
   - Loading state: skeleton with pulsing book shape

5. Build the reader page at /app/reader/[bookId]/page.tsx:
   - Loads book from /data/books/{bookId}.json (or API)
   - Renders BookReader with full book data
   - If book not found: friendly 404 with link to create a new book

6. Build a Bookshelf component at /components/bookshelf/Bookshelf.tsx:
   - Grid of book covers (page 1 illustration as cover)
   - Book title below each cover
   - Click opens reader
   - Empty state: "No books yet — create your first story!"
   - Wire to /app/dashboard/page.tsx

7. VISUAL QUALITY CHECK — after building, open the reader at
   http://localhost:3000/reader/sample-ahana (using existing sample data)
   and verify:
   - Square aspect ratio is maintained on mobile (375px) and desktop (1280px)
   - Page turn animation is smooth (no jank)
   - Text is readable over illustrations
   - Night mode changes colors appropriately

8. Write tests:
   - BookReader renders correct number of pages
   - Navigation: next/prev changes page
   - Night mode toggles class/styles
   - Bookshelf renders book cards from data
   - Reader 404s gracefully for missing book

9. Run /verify then /done

ACCEPTANCE CRITERIA:
- [ ] Reader displays at square 1:1 aspect ratio on all viewport sizes
- [ ] Page turn animation works (swipe on mobile viewport, arrows on desktop)
- [ ] Text overlay is readable over any illustration background
- [ ] Night mode visually changes the reader appearance
- [ ] Bookshelf shows book covers in a grid
- [ ] Reader loads sample-ahana book (or any book JSON in /data/books/)
- [ ] Mobile responsive: usable at 375px width

DESIGN DIRECTION: Warm, soft, parent-friendly. Think Scandinavian
children's app — not Silicon Valley tech demo. Muted warm colors,
rounded corners, gentle shadows. The reader should feel cozy.
```

---

## SESSION 5 — Book Creation Wizard

```
You are building bedtime-ahana autonomously. Read CLAUDE.md first.
Check git log for recent sessions. Read tasks.md.

GOAL: Build the multi-step book creation wizard — the main user flow
from "I want to make a book" to "my book is generating."

DO THE FOLLOWING IN ORDER:

1. Read /types/ for all relevant interfaces
2. Read existing components in /components/wizard/ if any

3. Build the wizard at /components/wizard/CreateWizard.tsx:
   Multi-step form with progress indicator. Steps:

   Step 1 — ChildProfileStep.tsx: "Tell us about your child"
   - Name (text input, required)
   - Age (select: 2, 3, 4, 5, 6)
   - Gender (select: girl, boy, prefer not to say)
   - City (text input, default "Ulm")
   - Photo upload (drag-and-drop zone, accepts jpg/png, max 5MB)
     Show preview of uploaded photo
     Label: "Upload 1-3 photos of your child (used to create their book character)"
   - Companion object: name + type (text + select: bunny, teddy, cat, dog, dinosaur, other)
   - Language preference (select: English, Deutsch, Both)

   Step 2 — FamilyStep.tsx: "Who's in the family?"
   - Dynamic list of family members
   - Each: name (text) + role (select: Mama, Papa, Oma, Opa, sister, brother, friend)
   - Add/remove buttons
   - Pet: name + type (optional)
   - Pre-populate with Papa and one sibling if data exists

   Step 3 — StorySelectStep.tsx: "Choose a story"
   - Grid of available story templates (load from /data/templates/)
   - Each card: illustration placeholder, title, short description, recommended age
   - Selected state: highlighted border
   - If only 1 template exists, auto-select it but still show it
   - Templates with "status": "skeleton" should show a "Coming Soon" badge
     and be non-selectable (grayed out)

   Step 4 — CustomizeStep.tsx: "Make it yours"
   - Story-specific fields (loaded from template metadata):
     e.g., for Kindergarten: kindergarten name, best friend's name
   - Tone selector (gentle / adventurous / funny) — radio buttons with emoji
   - Preview: show first beat with personalization applied

   Step 5 — GenerateStep.tsx: "Creating your book..."
   - Calls POST /api/generate/outline, then page texts, then images
   - Progress bar showing: "Writing the story..." → "Creating illustrations..." → "Almost done..."
   - Each step updates progress (rough estimate: 5s for text, 30s for images in stub mode)
   - On complete: "Your book is ready!" with button to open reader
   - On error: friendly message + retry button

4. Build the page at /app/create/page.tsx:
   - Renders CreateWizard
   - On completion: redirects to /reader/{bookId}

5. Add navigation:
   - From landing page/dashboard: "Create a Book" button → /create
   - From reader: "Create Another" button → /create
   - From bookshelf: "+" card → /create

6. Validation:
   - Step 1: name required, photo recommended (warn but don't block)
   - Step 2: at least 1 family member
   - Step 3: template must be selected
   - Step 4: no validation (all optional customization)
   - Cannot advance to next step until current step validates

7. Write tests:
   - Wizard renders all 5 steps
   - Cannot advance from step 1 without name
   - Step 3 shows available templates
   - Generate step calls API and shows progress
   - Completion redirects to reader

8. Run /verify then /done

ACCEPTANCE CRITERIA:
- [ ] Full wizard flow works: profile → family → story → customize → generate
- [ ] Photo upload shows preview
- [ ] Template grid loads from /data/templates/
- [ ] Generation progress shows realistic steps
- [ ] Completed book opens in the reader
- [ ] Form validation prevents empty required fields
- [ ] Mobile responsive (usable at 375px)

DESIGN: Same warm, cozy feel as the reader. Step indicator at top
with numbered circles. Soft transitions between steps.
```

---

## SESSION 6 — PDF Export & Print Pipeline

```
You are building bedtime-ahana autonomously. Read CLAUDE.md first.
Check git log for recent sessions. Read tasks.md.

GOAL: Export books as downloadable PDFs — both screen quality and
print-ready format. Set up the Gelato print-on-demand integration stub.

DO THE FOLLOWING IN ORDER:

1. Read /types/book.ts for Book/Page structure

2. Install PDF library: pnpm add pdfkit
   (NOT jsPDF — it doesn't support CMYK which we need for print)

3. Implement /lib/services/pdf-export.ts:

   exportScreenPDF(book: Book): Promise<Buffer>
   - A5 landscape (210x148mm) at 150 DPI
   - Page 1: cover page (full illustration + title + child name)
   - Pages 2-23: illustration top half, text bottom half
   - Page 24: back cover ("A bedtime-ahana book, made for {name}")
   - Font: embedded (use Helvetica built-in for now)
   - Text: dark gray, 14pt, centered in text area

   exportPrintPDF(book: Book): Promise<Buffer>
   - 100x100mm (Pixi format) at 300 DPI
   - 3mm bleed on all sides (total: 106x106mm per page)
   - Full-bleed illustrations (image fills entire page including bleed)
   - Text overlaid on illustration (white semi-transparent box, same as reader)
   - Color space: RGB for now (note: CMYK conversion needed for production —
     add TODO comment, don't block on this)
   - Page 1: front cover
   - Pages 2-23: content pages
   - Page 24: back cover with small logo/credit
   - Trim marks at corners

4. Wire up API route:
   POST /api/export — accepts { bookId, format: 'screen' | 'print' }
   Returns PDF as downloadable file (Content-Disposition: attachment)

5. Add export buttons to the reader:
   - "Download PDF" button in reader header
   - Dropdown: "Screen Quality (A5)" and "Print Quality (10x10cm)"
   - Shows loading spinner while generating
   - Triggers browser download on complete

6. Implement /lib/services/print-order.ts (STUB):
   - createOrder(bookId, format, address): returns mock order ID
   - getOrderStatus(orderId): returns mock status
   - Stub mode: returns { orderId: 'mock-123', status: 'pending', estimatedDelivery: '3-5 days' }
   - Interface matches Gelato API contract (research their API structure)
   - Add TODO comments for real Gelato API integration points

7. Write tests:
   - Screen PDF generates valid PDF buffer (check magic bytes: %PDF)
   - Print PDF has correct page dimensions (100x100mm + bleed)
   - Export API returns PDF with correct content-type
   - Print order stub returns expected structure

8. Run /verify then /done

ACCEPTANCE CRITERIA:
- [ ] Screen PDF downloads from reader and opens in any PDF viewer
- [ ] Print PDF has correct 100x100mm dimensions (verify in PDF metadata)
- [ ] Both PDFs contain all 24 pages with text and image references
- [ ] Export buttons in reader work and trigger download
- [ ] Print order stub returns mock order data
- [ ] No real external API calls — everything works offline

NOTE: If pdfkit gives trouble with image embedding from local files,
use the file paths from storage.ts. If images are SVG placeholders,
convert to PNG first using sharp (pnpm add sharp).
If this becomes too complex, use a simpler approach and document
the limitation in BLOCKED.md.
```

---

## SESSION 7 — Auth, Payments & Landing Page

```
You are building bedtime-ahana autonomously. Read CLAUDE.md first.
Check git log for recent sessions. Read tasks.md.

GOAL: Add authentication, Stripe payment stubs, and a landing page.
This makes the app feel like a real product.

DO THE FOLLOWING IN ORDER:

1. Install: pnpm add next-auth @auth/prisma-adapter
   (If Prisma isn't set up yet, use a simple JSON file store for users)

2. Implement auth:
   - /app/api/auth/[...nextauth]/route.ts
   - Providers: Credentials (email/password) for now
     (Google OAuth can be added later — needs client ID we don't have)
   - Session strategy: JWT
   - User type from /types/user.ts
   - Simple user store: /data/users.json in dev (swap to DB later)

3. Protected routes:
   - /dashboard, /create, /reader/* — require auth
   - /app/middleware.ts: redirect to /login if not authenticated
   - /app/(auth)/login/page.tsx: email + password form, clean design
   - /app/(auth)/register/page.tsx: name + email + password form

4. Stripe integration (STUB MODE):
   - /lib/services/stripe.ts:
     createSubscription(userId, tier): returns mock subscription
     createPaymentIntent(amount, bookId): returns mock payment intent
     handleWebhook(event): logs event type
   - Pricing tiers from spec: Free, Starter (€4.99), Family (€9.99), Premium (€14.99)
   - /app/api/webhooks/stripe/route.ts: stub webhook handler
   - UI: pricing cards on landing page, "Subscribe" buttons that log "Stripe not connected"

5. Landing page at /app/page.tsx:
   Design a compelling landing page with these sections:

   Hero: "Your child's own book series"
   - Subtitle: "AI creates personalized, illustrated story books starring YOUR child"
   - CTA button: "Create Your First Book — Free"
   - Hero image: mockup of an open book (use CSS/SVG, not real images)

   How It Works (3 steps):
   - "1. Tell us about your child" (upload icon)
   - "2. Pick a story" (book grid icon)
   - "3. Read, print, collect" (stack of books icon)

   Sample spread:
   - Show 2 facing pages from the sample Ahana book
   - Quote: "Ahana couldn't wait to tell Papa about her first day!"

   Pricing:
   - 4 tier cards matching the spec
   - Free tier highlighted as "Start Here"

   FAQ:
   - "How does character consistency work?"
   - "Can I print real books?"
   - "Is my child's data safe?" (→ GDPR answer)
   - "What languages are supported?"

   Footer: © 2026 bedtime-ahana. Links: Privacy, Terms, Contact

6. Dashboard update:
   - Show user's bookshelf
   - Show subscription tier
   - "Create New Book" prominent button

7. Write tests:
   - Auth: login with valid credentials succeeds
   - Auth: protected route redirects unauthenticated users
   - Landing page renders all sections
   - Pricing cards show correct tier info

8. Run /verify then /done

ACCEPTANCE CRITERIA:
- [ ] Can register, login, and access protected dashboard
- [ ] Unauthenticated users redirected to login from /dashboard
- [ ] Landing page renders all sections (hero, how-it-works, pricing, FAQ)
- [ ] Landing page is responsive (test at 375px and 1280px)
- [ ] Pricing cards show 4 tiers with correct prices
- [ ] Overall design feels warm and professional (not default Tailwind)
```

---

## SESSION 8 — Integration & Full Flow Test

```
You are building bedtime-ahana autonomously. Read CLAUDE.md first.
Check git log for ALL previous sessions. Read tasks.md and BLOCKED.md.

GOAL: Wire everything together into a complete working flow.
Fix any broken connections between sessions. Run full E2E verification.

DO THE FOLLOWING IN ORDER:

1. Start the dev server: pnpm dev
   Navigate through every page and fix anything broken:
   - Landing page loads
   - Register → Login works
   - Dashboard shows bookshelf
   - Create wizard completes all 5 steps
   - Book generates (stub mode)
   - Reader opens and displays all 24 pages
   - PDF export downloads

2. Fix integration issues:
   - API routes return data in the format components expect
   - Types are consistent across all modules
   - Navigation links work (no 404s between pages)
   - Loading states show while async operations run
   - Error states show friendly messages (not stack traces)

3. Improve the sample book:
   - Update /data/books/sample-ahana.json with:
     All 24 pages having proper text (EN + DE)
     Image prompt strings (even if images are placeholders)
     Compliance result: passed
   - Run the generation pipeline in stub mode to create a fresh sample:
     node scripts/generate-sample.ts (update this script if needed)

4. Create /scripts/generate-sample.ts:
   - Uses the book-service to generate a complete book for Ahana
   - Config: name="Ahana", age=4, city="Ulm", template="kindergarten-first-day"
   - Family: Papa, baby sister Shreya
   - Companion: plush bunny named Hoppel
   - Language: bilingual (both EN and DE)
   - Saves to /data/books/sample-ahana.json
   - Generates placeholder images to /public/generated/sample-ahana/

5. Write Playwright E2E test (/tests/e2e/full-flow.spec.ts):
   Install if needed: pnpm add -D @playwright/test && npx playwright install chromium

   Test the happy path:
   - Visit landing page → click "Create Your First Book"
   - (Skip auth for E2E — add test bypass or auto-login fixture)
   - Fill wizard step 1: name "TestChild", age 4
   - Skip photo upload (optional)
   - Add family: "TestPapa" as Papa
   - Select kindergarten template
   - Click generate
   - Wait for generation to complete
   - Verify reader opens with 24 pages
   - Navigate to page 5 (verify navigation works)
   - Click "Download PDF"
   - Verify PDF file downloads

6. Update README.md:
   - Project description matching the new spec
   - Quick start instructions
   - Screenshots section (placeholder text for now)
   - Tech stack list
   - Contributing guidelines (basic)

7. Review CLAUDE.md and lessons.md:
   - Add any new mistakes discovered during integration
   - Update tasks.md with final status of all sessions

8. Update .github/workflows/ci.yml:
   - Use pnpm (not npm) — add pnpm install step with caching
   - Jobs: lint (pnpm lint), test (pnpm test), build (pnpm build)
   - Node version: 20
   - Trigger: push to main + pull requests
   - Ensure the workflow matches what /verify runs locally

9. Final verification:
   - pnpm lint (0 errors)
   - pnpm test (0 failures)
   - pnpm build (succeeds)
   - E2E test passes
   - Commit everything with: "feat: full integration and E2E verification"

10. Run /done

ACCEPTANCE CRITERIA:
- [ ] Complete flow works: landing → register → create → generate → read → export
- [ ] Sample book has all 24 pages with text in EN and DE
- [ ] E2E test passes the happy path
- [ ] No TypeScript errors, no lint errors, build succeeds
- [ ] README accurately describes the project
- [ ] BLOCKED.md documents any remaining issues for real AI integration
- [ ] .github/workflows/ci.yml runs lint, test, and build using pnpm

This is the final session for the POC. After this, the app should be
demoable: someone can visit the site, create a book, read it, and
download a PDF. All with stub/placeholder AI — but the full flow works.
```

---

# QUICK REFERENCE: Running the Sessions

```bash
# Terminal workflow for each session:

# 1. Start Claude Code
cd bedtime-ahana
claude

# 2. Paste the session prompt (copy from above)

# 3. Claude works autonomously
#    - It will install packages, create files, run tests
#    - If it needs permissions, approve them (or use --dangerously-skip-permissions for trusted sessions)

# 4. When done, Claude commits and reports
#    Check: git log --oneline -5

# 5. If blocked, read BLOCKED.md

# 6. Move to next session
```

## Session Dependencies (What Can Run in Parallel)

```
SESSION 1 (Foundation) ──── MUST BE FIRST
    │
    ├── SESSION 2 (Story Gen) ──┐
    ├── SESSION 3 (Images)  ────┤── Can run in parallel
    ├── SESSION 4 (Reader)  ────┘
    │
    ├── SESSION 5 (Wizard) ─── Needs 2+3+4 done
    ├── SESSION 6 (Export) ─── Needs 2+3 done
    ├── SESSION 7 (Auth) ───── Independent, run anytime after 1
    │
    └── SESSION 8 (Integration) ── Needs ALL above done
```

**Maximum parallelism:** After Session 1, run Sessions 2, 3, 4, and 7
simultaneously on separate branches. Then merge and run 5+6. Then 8.

**Estimated total Claude Code time:** ~8-12 hours across all sessions
**Estimated your time:** ~2-3 hours total (setup + reviews + unblocking)
