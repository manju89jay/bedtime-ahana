# bedtime-ahana — Custom Bedtime Book POC

Turn a child’s name + a short prompt (or voice transcript) into a **6-page, illustrated bedtime book** with optional narration — centered on **Ahana** (lives in Ulm, Germany). This POC is **copyright-safe**: it’s inspired by everyday “first experiences” stories (slice-of-life), but does **not** copy names, characters, plots, art styles, or trade dress from existing series.

> **Why this exists**  
> Ideas are easy; shipping is hard. This repo proves the core loop end-to-end: **Create → Generate → Read → Export**. From here, we can iterate toward a real product.

## ✨ MVP Features
- Create Book form (name(s), age, tone, language EN/DE, optional story idea, optional voice upload placeholder)
- Generate: outline → page text (100–140 words/page) → image prompt per page (character-consistent) → optional TTS stub
- Reader: page-by-page viewer, inline text edit, Export to PDF (A5 landscape)
- Local storage: JSON under `/data/books/<bookId>.json`; assets under `/public/generated/<bookId>/`
- Compliance check before export

## 🧱 Tech Stack
Next.js 14 (App Router) + TypeScript • Tailwind • Vitest • ESLint+Prettier • `jspdf` for client PDF • Deterministic AI stubs

## 🚀 Quick Start
```bash
pnpm i
pnpm dev
# open http://localhost:3000
Scripts: pnpm build, pnpm start, pnpm lint, pnpm test

🧩 Data Model
See /types/book.ts.

🔌 API (local stubs)
POST /api/outline • POST /api/page • POST /api/image • POST /api/tts • POST /api/export

👧 Default Character: Ahana
Age ~4–5 (born 19 Apr 2021), Ulm (Germany), baby sister Shreya, Papa. Traits: curious, kind, gentle helper. Sidekick: plush bunny. Visuals: soft watercolor, warm light, simple non-derivative outfits.

🌱 Seed Stories
EN: Ahana Helps With Baby Shreya — Moral: Small helpers make big differences.
DE (outline): Ahana im Regen-Museum

✅ Safety & Compliance
We’re inspired by slice-of-life “first experiences”, but never reproduce specific expression from existing works.
Checklist: no known IP names/phrases/outfits/pets; generic experiences only; art prompts avoid franchise-like motifs; titles/metadata are original.

🌍 Localization
Languages: EN, DE. Age-appropriate vocabulary; avoid tricky idioms.

🧪 Testing
Includes tests for storage, compliance, and outline structure.

🧭 Flow
Create → Generate → Reader → Export (PDF). Target time-to-first-book < 3 minutes.

🔁 Replace Stubs With Real AI (Later)
Swap /lib/ai/* with adapters for LLM, image gen, TTS; keep function signatures.

🗺️ Roadmap
Character reference images • Real TTS • Print-on-demand • Auth • Analytics • Pricing tests • Accessibility

👥 Roles
Me (product/backend), KCK (art/style), BJ (pricing/outreach), Lemon (ops/content/localization/privacy).

📄 License
MIT
