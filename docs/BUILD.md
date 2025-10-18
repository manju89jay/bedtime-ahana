# Build & Run Guide

## Prerequisites
- Node.js 20 (matches CI runtime).【F:.github/workflows/ci.yml†L9-L18】
- npm 9+ (lockfile present) or an equivalent package manager. Install dependencies before running commands.【F:package-lock.json†L1-L8】
- Local filesystem write access to `data/` and `public/generated/` for JSON and asset outputs.【F:lib/storage.ts†L5-L57】

## Environment Variables
- Copy `.env.example` to `.env.local` if you need to add provider keys later. The POC runs without secrets today.【F:.env.example†L1-L2】

## Install Dependencies
```bash
npm install
```

## Run the App Locally
```bash
npm run dev
# Visit http://localhost:3000
```
- The dev server compiles the Next.js App Router UI with Tailwind styling and server routes.【F:package.json†L6-L17】【F:tailwind.config.ts†L1-L20】

## Build for Production
```bash
npm run build
npm run start
# Default port: 3000 (override with NEXT_PORT/NEXT_PUBLIC_PORT as needed)
```
- `next build` bundles server components and API routes; `next start` serves the compiled output.

## Tests & Quality Gates
```bash
npm run lint      # ESLint with Next.js config
npm run test      # Vitest unit suites
npm run coverage  # Deterministic coverage report under coverage/
```
- Tests validate storage, compliance, and deterministic AI stubs; coverage tooling enforces full coverage on `lib/**` sources.【F:tests/storage.test.ts†L9-L115】【F:tests/outline.test.ts†L1-L49】【F:scripts/run-coverage.mjs†L1-L46】【F:scripts/report-coverage.mjs†L1-L233】

## Data Reset & Seeds
- Generated books persist as JSON under `data/books/*.json` and media assets in `public/generated/<bookId>/`. Delete these folders to reset state.【F:lib/storage.ts†L5-L57】
- Optional sample stories live in `data/seeds/` for manual inspection or bootstrapping content.【F:data/seeds/ahana-helps-baby.json†L1-L25】

## Troubleshooting
- **EACCES when saving books/assets**: Ensure the process has write permissions to `data/` and `public/generated/`. The server handlers rely on local filesystem writes.【F:app/api/book/route.ts†L8-L11】【F:app/api/export/route.ts†L8-L14】
- **Coverage script fails with “No V8 coverage reports were generated”**: This indicates Vitest exited early; rerun `npm run coverage` after addressing failing tests.【F:scripts/report-coverage.mjs†L42-L76】
- **Missing assets in reader**: Verify the book ID directory exists under `public/generated/`—`createImageAsset` and `createTTSAsset` populate SVG/MP3 placeholders during generation.【F:lib/ai/image.ts†L40-L46】【F:lib/ai/tts.ts†L23-L40】
