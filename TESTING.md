# Testing bedtime-ahana Locally

## Prerequisites

- **Node.js 20+** ([nodejs.org](https://nodejs.org))
- **pnpm** — install with `npm install -g pnpm`
- **OpenAI API key** (optional, for real illustrations) — get one at [platform.openai.com](https://platform.openai.com)

## Setup

```bash
# 1. Clone and checkout
git clone https://github.com/manju89jay/bedtime-ahana.git
cd bedtime-ahana
git checkout claude/setup-project-foundation-GPac2

# 2. Install dependencies
pnpm install

# 3. Create environment file
cp .env.example .env.local
```

## Environment Configuration

Edit `.env.local`:

```bash
# --- STUB MODE (free, no API calls, placeholder images) ---
USE_STUBS=true
NEXTAUTH_SECRET=any-random-string-here
NEXTAUTH_URL=http://localhost:3000

# --- LIVE MODE (real DALL-E illustrations, ~$1 per book) ---
# USE_STUBS=false
# OPENAI_API_KEY=sk-your-key-here
# NEXTAUTH_SECRET=any-random-string-here
# NEXTAUTH_URL=http://localhost:3000
```

**Important:** Never commit `.env.local` — it's in `.gitignore`.

## Running

```bash
# Build first (generates sample book)
pnpm build

# Start development server
pnpm dev

# Open in browser
open http://localhost:3000
```

## Testing Walkthrough

### 1. Landing Page — `http://localhost:3000`

You'll see:
- Hero section with gradient background
- "How It Works" (3 steps)
- Sample book spread
- Pricing (Free / Starter / Family / Premium)
- FAQ (4 questions)
- Footer with navigation links

### 2. Register — click "Sign Up Free"

- Enter any email and password (min 6 characters)
- You'll be redirected to the dashboard
- **Demo account:** `demo@bedtime-ahana.com` / `demo1234`

### 3. Dashboard — `http://localhost:3000/dashboard`

- Shows your subscription tier (Free)
- Empty bookshelf with "Create your first book" link
- "Create New Book" button in header

### 4. Create a Book — click "Create New Book"

**Step 1: Child Profile**
- Name: `Ahana` (required)
- Age: select `4`
- Gender: select `Girl`
- City: `Ulm` (required)
- Companion: `plush bunny Hoppel`
- Language: `Bilingual`
- Outfit color: pick yellow
- Outfit style: pick "Star T-Shirt"

**Step 2: Family**
- First member: name `Mama`, role `Mama`
- Click "+ Add family member"
- Second member: name `Papa`, role `Papa`
- Pet: None

**Step 3: Choose Story**
- Pick any of the 6 templates (e.g., "kindergarten-first-day")
- Each shows theme and moral

**Step 4: Customize**
- Tone: Gentle (default)
- Vocabulary: Preschool (auto-selected for age 4)
- Optional: kindergarten name, playground

**Step 5: Generate**
- Progress bar shows 5 steps
- In **stub mode**: completes in ~2 seconds
- In **live mode** (DALL-E): takes 2-5 minutes (24 images generated)
- On completion, redirects to the reader

### 5. Reader — `http://localhost:3000/reader/{bookId}`

- **Page navigation**: click arrows or swipe
- **Night mode**: toggle button in top-right
- **Bilingual toggle**: switch between EN/DE below the illustration
- **Inline editing**: click "Edit" to modify text
- **Audio player**: play/pause button (stub URLs in stub mode)
- **Export PDF**: dropdown with 3 options (Screen, Print 10x10, Print 15x15)
- **Thumbnails**: click any page number at the bottom

### 6. Pre-built Sample — `http://localhost:3000/reader/sample-ahana`

A legacy 6-page sample book (built during `pnpm build`) is always available.

## What You'll See

### Stub Mode (`USE_STUBS=true`)

| Element | Appearance |
|---------|------------|
| Page illustrations | Colored gradient boxes with "Page N" text |
| Character sheet | Simple geometric SVG stick figures |
| Page text | Template-based stub text with child's name |
| Audio | Placeholder URLs (no actual audio) |
| PDFs | Text-only with cover/back pages |

### Live Mode (`USE_STUBS=false` + `OPENAI_API_KEY`)

| Element | Appearance |
|---------|------------|
| Page illustrations | **Real DALL-E 3 watercolor-style children's book illustrations** |
| Character sheet | Still geometric SVGs (IP-Adapter not yet integrated) |
| Page text | Still template-based (Claude API not connected for text) |
| Audio | Still placeholder URLs |
| PDFs | Text-only (images not embedded in PDF yet) |

## Cost Estimates (Live Mode)

| Action | Cost |
|--------|------|
| 1 page illustration (DALL-E 3, 1024x1024, standard) | ~$0.04 |
| Full 24-page book | ~$0.96 |
| 10 books for testing | ~$9.60 |

## Running Tests

```bash
# Run all 300+ tests
pnpm test -- --run

# Run specific test file
pnpm test -- --run tests/image-gen.test.ts

# Run with coverage
pnpm coverage
```

## Running Lint & Build

```bash
pnpm lint     # ESLint — should show 0 errors
pnpm build    # Next.js production build
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "NEXTAUTH_SECRET is not set" | Add `NEXTAUTH_SECRET=any-string` to `.env.local` |
| Redirected to /login on every page | You need to register/login first, or the middleware is active |
| "OPENAI_API_KEY is required" | Set `USE_STUBS=true` in `.env.local` or add your API key |
| Images show "Page N" placeholders | You're in stub mode — set `USE_STUBS=false` + add API key for real images |
| Book generation takes forever | Live mode generates 24 DALL-E images sequentially (~5-10s each) |
| Reader shows "not found" | The book JSON must exist in `data/books/{bookId}.json` |
