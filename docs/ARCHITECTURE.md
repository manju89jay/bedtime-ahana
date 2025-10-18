# Architecture Overview

## System Context
- **Framework**: Next.js 14 App Router with TypeScript client and server components for UI and API handlers.【F:package.json†L1-L32】【F:app/layout.tsx†L1-L27】
- **Persistence**: Local filesystem JSON and asset blobs managed via `lib/storage.ts`, storing structured book data in `data/books` and generated media in `public/generated`.【F:lib/storage.ts†L5-L57】
- **Generation Stubs**: Deterministic text, image, and TTS generators under `lib/ai/*` emulate AI services for outline/page text, illustration prompts, and audio assets.【F:lib/ai/text.ts†L1-L159】【F:lib/ai/image.ts†L1-L47】【F:lib/ai/tts.ts†L1-L41】
- **Compliance Guardrails**: Simple token scanning in `lib/compliance.ts` plus prompt templates in `lib/prompts.ts` enforce IP safety themes.【F:lib/compliance.ts†L3-L22】【F:lib/prompts.ts†L1-L20】

## Module Responsibilities
| Area | Files | Responsibility |
| --- | --- | --- |
| Layout & Shell | `app/layout.tsx`, `app/globals.css` | Shared HTML shell, typography, and Tailwind primitives.【F:app/layout.tsx†L1-L27】【F:app/globals.css†L1-L14】 |
| Landing & Listing | `app/page.tsx` | Lists stored books and links into the create flow and reader.【F:app/page.tsx†L1-L51】 |
| Create Flow | `app/create/page.tsx`, `components/Form.tsx`, `components/Progress.tsx`, `components/PageCard.tsx`, `components/Banner.tsx` | Client-side orchestration of outline/text/image/tts generation, status display, and preview cards.【F:app/create/page.tsx†L21-L165】【F:components/Form.tsx†L15-L129】【F:components/Progress.tsx†L3-L10】【F:components/PageCard.tsx†L1-L16】【F:components/Banner.tsx†L5-L23】 |
| Reader & Export | `app/reader/[bookId]/page.tsx`, `components/ReaderNav.tsx` | Server-side book loading and client reader UI with editing, compliance surfacing, and PDF export.【F:app/reader/[bookId]/page.tsx†L1-L29】【F:components/ReaderNav.tsx†L15-L167】 |
| API Surface | `app/api/{outline,page,image,tts,book,export}/route.ts` | Route handlers invoking deterministic generation and storage helpers in the Node runtime.【F:app/api/outline/route.ts†L1-L20】【F:app/api/page/route.ts†L1-L11】【F:app/api/image/route.ts†L1-L11】【F:app/api/tts/route.ts†L1-L11】【F:app/api/book/route.ts†L1-L12】【F:app/api/export/route.ts†L1-L15】 |
| Domain Types | `types/book.ts` | Shared `Book`, `Page`, and `CharacterCard` contracts across UI and APIs.【F:types/book.ts†L1-L24】 |
| Testing & Tooling | `tests/*.test.ts`, `scripts/run-coverage.mjs`, `scripts/report-coverage.mjs`, `vitest.config.ts` | Vitest suites covering storage, compliance, and generators with custom coverage reporting pipeline.【F:tests/storage.test.ts†L9-L115】【F:tests/outline.test.ts†L1-L49】【F:tests/pageText.test.ts†L1-L45】【F:tests/image.test.ts†L1-L62】【F:tests/tts.test.ts†L1-L42】【F:scripts/run-coverage.mjs†L1-L46】【F:scripts/report-coverage.mjs†L1-L233】【F:vitest.config.ts†L1-L13】 |

## Data & Control Flow
1. **Create Flow**
   1. Client submits personalization via `components/Form.tsx` into `handleCreate` (`app/create/page.tsx`).【F:components/Form.tsx†L15-L129】【F:app/create/page.tsx†L27-L134】
   2. The page sequentially calls `/api/outline`, `/api/page`, `/api/image`, and `/api/tts`, gathering deterministic outputs for each page beat before persisting via `/api/book`.【F:app/create/page.tsx†L39-L126】
   3. Each API handler proxies into `lib/ai/*` helpers and `lib/storage.ts` for persistence, ensuring directories exist and writing JSON/assets locally.【F:app/api/outline/route.ts†L7-L19】【F:app/api/page/route.ts†L7-L10】【F:app/api/image/route.ts†L7-L10】【F:app/api/tts/route.ts†L7-L10】【F:app/api/book/route.ts†L8-L11】【F:lib/storage.ts†L9-L57】

2. **Reader & Export**
   1. The dynamic reader route loads stored books from disk and exposes server actions for persistence/export into the `ReaderNav` client component.【F:app/reader/[bookId]/page.tsx†L10-L29】
   2. `ReaderNav` manages navigation, inline editing, compliance warnings, and triggers PDF generation via `jspdf` before calling the export server action for disk writes.【F:components/ReaderNav.tsx†L22-L164】

3. **Home Listing**
   - `app/page.tsx` queries `lib/storage.listBooks()` on the server and renders the recent books list with links back into the reader.【F:app/page.tsx†L7-L48】【F:lib/storage.ts†L34-L49】

## Dependencies & Integrations
- **UI/Styling**: Tailwind config extends brand colors; components rely on class utilities for layout.【F:tailwind.config.ts†L1-L20】【F:components/Form.tsx†L36-L128】
- **PDF Generation**: `jspdf` is bundled client-side in `ReaderNav` to produce exportable PDFs saved via the export server action.【F:components/ReaderNav.tsx†L61-L163】
- **Testing Stack**: Vitest with Node environment and custom coverage reporter ensures deterministic module behavior and coverage gating.【F:vitest.config.ts†L1-L13】【F:scripts/run-coverage.mjs†L1-L46】【F:scripts/report-coverage.mjs†L1-L233】
- **CI**: GitHub Actions install dependencies, run lint, and execute the coverage pipeline on push/PR.【F:.github/workflows/ci.yml†L1-L19】

## Data Model & Seeds
- Book schema enumerated in `types/book.ts` with required metadata and optional audio per page.【F:types/book.ts†L1-L24】
- Sample seeds available under `data/seeds/*.json` for default content and testing references.【F:data/seeds/ahana-helps-baby.json†L1-L25】

## Diagram
```mermaid
flowchart TD
  subgraph Browser[Browser UI (Next.js App Router)]
    home[Home listing\napp/page.tsx]
    create[Create flow\napp/create/page.tsx]
    reader[Reader UI\ncomponents/ReaderNav.tsx]
  end
  subgraph Server[Next.js Server Runtime (Node.js)]
    outlineAPI[POST /api/outline\napp/api/outline/route.ts]
    pageAPI[POST /api/page\napp/api/page/route.ts]
    imageAPI[POST /api/image\napp/api/image/route.ts]
    ttsAPI[POST /api/tts\napp/api/tts/route.ts]
    bookAPI[POST /api/book\napp/api/book/route.ts]
    exportAPI[POST /api/export\napp/api/export/route.ts]
  end
  subgraph Storage[Local Filesystem]
    books[data/books/*.json\nlib/storage.ts]
    assets[public/generated/*\nlib/storage.ts]
  end

  home --> create
  create -->|fetch personalization| outlineAPI
  create -->|page text| pageAPI
  create -->|image prompt| imageAPI
  create -->|tts stub| ttsAPI
  create -->|persist book| bookAPI
  bookAPI --> books
  imageAPI --> assets
  ttsAPI --> assets
  reader -->|load/save| books
  reader -->|export pdf| exportAPI
  exportAPI --> assets
  home -->|listBooks| books
```
