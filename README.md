# bedtime-ahana

AI-personalized children's micro-books (10x10cm, 24 pages) where YOUR child is the main character. Built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- **5-step creation wizard**: child profile, family, story selection (6 templates), customization, generation
- **6 "first experiences" story templates**: kindergarten, dentist, bike riding, new sibling, swimming pool, garbage truck day
- **Bilingual**: every story in English, German, or both
- **Interactive reader**: page-turn animations (Framer Motion), night mode, bilingual toggle, inline text editing, audio player
- **PDF export**: screen (A5, 150 DPI), print 10x10cm and 15x15cm (300 DPI, 3mm bleed, trim marks)
- **Character consistency**: face detection + 6-pose character sheet generation (stub mode)
- **Print-on-demand**: Gelato integration stub for physical book orders
- **Auth**: NextAuth.js with email/password, JWT sessions, protected routes
- **Payments**: Stripe integration stub with 4 subscription tiers
- **Compliance**: 6-check rule-based system (IP names, franchise motifs, age-appropriate, GDPR, cultural sensitivity)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| State | Zustand (sessionStorage persistence) |
| Auth | NextAuth.js (JWT) |
| Validation | Zod |
| PDF | jsPDF |
| Testing | Vitest + Testing Library |
| CI | GitHub Actions (pnpm, lint, test, build) |

## Quick Start

```bash
pnpm install
pnpm dev
# open http://localhost:3000
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Production build (+ generates sample book) |
| `pnpm test` | Run all tests |
| `pnpm lint` | Lint with ESLint |
| `pnpm format` | Format with Prettier |

## Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
|----------|----------|-------------|
| `USE_STUBS` | No | Set to `true` for mock AI responses |
| `ANTHROPIC_API_KEY` | For live mode | Claude API for story generation |
| `OPENAI_API_KEY` | For live mode | DALL-E for image generation |
| `ELEVENLABS_API_KEY` | No | TTS narration |
| `NEXTAUTH_SECRET` | Production | JWT signing secret |
| `GELATO_API_KEY` | No | Print-on-demand orders |
| `STRIPE_SECRET_KEY` | No | Payment processing |

## Project Structure

```
app/                    # Next.js App Router pages & API routes
  api/                  # API endpoints (auth, character, generate, export, stripe)
  create/               # 5-step book creation wizard
  dashboard/            # User dashboard with bookshelf
  login/                # Authentication
  reader/[bookId]/      # Interactive book reader
  register/             # User registration
components/
  bookshelf/            # Bookshelf grid component
  reader/               # PageView, PageTurn, TextOverlay, AudioPlayer, BookReader, ExportDropdown
  wizard/               # ChildProfileStep, FamilyStep, StorySelectStep, CustomizeStep, GenerateStep
data/templates/         # 6 story template JSON files (24 beats each)
lib/
  ai/                   # AI adapters: outline, page-text, image-prompt, image-gen, character-sheet, face-detect, tts, compliance
  auth/                 # NextAuth configuration
  payments/             # Stripe stub with pricing plans
  services/             # book-service, asset-storage, pdf-export, print-order
  store/                # Zustand stores (book, user)
  utils/                # i18n utility
  validation/           # Zod schemas for all types
types/                  # TypeScript interfaces (book, character, user, template, api, order)
tests/                  # 297 tests across 32 test files
```

## Story Templates

| Template | Theme | Moral |
|----------|-------|-------|
| kindergarten-first-day | First day at Kindergarten | Courage in new situations |
| zahnarzt | First dentist visit | Bravery, self-care |
| fahrrad | Learning to ride a bike | Persistence, practice |
| geschwisterchen | New baby sibling | Sharing love, being a helper |
| schwimmbad | First swimming pool visit | Water safety, trying new things |
| muellabfuhr | Garbage truck day | Community helpers, environment |

## License

MIT
