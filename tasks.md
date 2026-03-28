# tasks.md — bedtime-ahana Build Progress

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Complete
- [!] Blocked

## SESSION 1: Project Foundation
- [x] Read existing codebase and understand current state
- [x] Read docs/bedtime-ahana-spec-v2.md
- [x] Create/update all TypeScript interfaces in /types/ (book, character, user, template, api, order)
- [x] Create Zod schemas in /lib/validation/ matching every type
- [x] Create API route stubs for all 6 endpoints (character, outline, page, image, tts, export)
- [x] Set up Zustand stores (book-store, user-store) with sessionStorage persistence
- [x] Create i18n utility (/lib/utils/i18n.ts) with EN/DE translations
- [x] Create kindergarten-first-day.json template (24 beats from spec)
- [x] Create 5 more Tier 1 templates: zahnarzt, fahrrad, geschwisterchen, schwimmbad, muellabfuhr
- [x] Archive old templates.json as templates-v1-archived.json
- [x] Create template index (/data/templates/index.ts)
- [x] Write tests: type validation, template loading, API stubs, Zustand, i18n
- [x] pnpm build succeeds, pnpm test passes, pnpm lint clean

## SESSION 2: Story Generation Engine
- [x] Implement /lib/ai/outline.ts (stub + live mode)
- [x] Implement /lib/ai/page-text.ts with bilingual EN/DE support
- [x] Implement /lib/ai/image-prompt.ts with character anchoring
- [x] Implement /lib/ai/compliance-check.ts (rule-based, 6 checks)
- [x] Implement /lib/ai/tts.ts (stub: silent MP3, live: ElevenLabs)
- [x] Implement /lib/services/book-service.ts (full pipeline orchestration)
- [x] Wire API routes: /api/generate/outline, /page, /tts
- [x] Write tests: outline structure, word counts, compliance, bilingual, TTS
- [x] Stub mode generates complete 24-page bilingual book JSON with audioUrls

## SESSION 3: Character Sheet & Image Generation (Stub Mode)
- [x] Implement /lib/ai/face-detect.ts (stub)
- [x] Implement /lib/ai/character-sheet.ts (stub, 6 SVG poses)
- [x] Implement /lib/ai/image-gen.ts (stub, SVG placeholders)
- [x] Implement /lib/services/asset-storage.ts (filesystem, S3-swappable interface)
- [x] Wire API route: POST /api/character
- [x] Update book-service to generate images via image-gen
- [x] Write tests: face detection, character sheet, image gen, storage, full pipeline
- [x] Full book generation produces 24 page images on disk

## SESSION 4: Interactive Book Reader
- [ ] Build PageView.tsx (square 1:1, full-bleed illustration, zoom on tap)
- [ ] Build PageTurn.tsx (Framer Motion animation, swipe + arrows)
- [ ] Build TextOverlay.tsx (semi-transparent, bilingual toggle, inline text editing)
- [ ] Build AudioPlayer.tsx (placeholder, wired to TTS audioUrl)
- [ ] Build BookReader.tsx (navigation, night mode, inline editing, save edits)
- [ ] Build reader page at /app/reader/[bookId]/page.tsx
- [ ] Build Bookshelf component at /components/bookshelf/Bookshelf.tsx
- [ ] Write tests: reader navigation, night mode, bookshelf, editing, zoom
- [ ] Mobile responsive at 375px width

## SESSION 5: Book Creation Wizard
- [ ] Build ChildProfileStep.tsx (name, age, gender, city, photo, companion, outfit, language)
- [ ] Build FamilyStep.tsx (dynamic family members, pet)
- [ ] Build StorySelectStep.tsx (grid of 6 templates)
- [ ] Build CustomizeStep.tsx (story-specific fields, tone selector)
- [ ] Build GenerateStep.tsx (API calls, progress bar, completion)
- [ ] Build page at /app/create/page.tsx
- [ ] Add navigation links (landing -> create, reader -> create, bookshelf -> create)
- [ ] Form validation (name required, template selected, family member required)
- [ ] Write tests: wizard flow, validation, template grid, generation, redirect
- [ ] Outfit selector with predefined options and visual preview

## SESSION 6: PDF Export & Print Pipeline
- [ ] Implement exportScreenPDF (A5, 150 DPI, watermark for free tier)
- [ ] Implement exportPrintPDF for 10x10cm (300 DPI, 3mm bleed, trim marks)
- [ ] Implement exportPrintPDF for 15x15cm (300 DPI, 3mm bleed, trim marks)
- [ ] Wire API route: POST /api/export (screen, print-10x10, print-15x15)
- [ ] Add export dropdown to reader (3 options)
- [ ] Implement /lib/services/print-order.ts (Gelato stub)
- [ ] Write tests: PDF magic bytes, page dimensions, watermark, print order
- [ ] Free tier PDFs have watermark, paid tier PDFs don't

## SESSION 7: Auth, Payments & Landing Page
- [ ] Set up NextAuth.js (email/password, JWT sessions)
- [ ] Protected routes middleware (/dashboard, /create, /reader)
- [ ] Login and register pages
- [ ] Stripe integration stub (4 subscription tiers, webhook handler)
- [ ] Landing page: hero, how-it-works, sample spread, pricing, FAQ, footer
- [ ] Dashboard: bookshelf, subscription tier, "Create New Book" button
- [ ] Write tests: auth flow, protected routes, landing page sections, pricing
- [ ] Responsive landing page (375px and 1280px)

## SESSION 8: Integration & Full Flow Test
- [ ] Navigate and fix all pages end-to-end
- [ ] Fix integration issues (types, navigation, loading/error states)
- [ ] Create /scripts/generate-sample.ts (Ahana, bilingual, kindergarten)
- [ ] Write Playwright E2E test (full happy path)
- [ ] Update README.md
- [ ] Update .github/workflows/ci.yml (pnpm, lint, test, build)
- [ ] Review CLAUDE.md and lessons.md
- [ ] Final verification: lint + test + build + E2E all pass
