# Architecture Rationale

## Next.js App Router with Server Actions
- Using the App Router keeps routing, API handlers, and React Server Components co-located, which simplifies data fetching and composition for a compact proof of concept.【F:app/page.tsx†L1-L51】【F:app/api/outline/route.ts†L1-L20】
- Server Actions are enabled (`experimental.serverActions`) so the reader can call filesystem persistence without a separate API round-trip, balancing ergonomics and security in the POC scope.【F:next.config.js†L1-L8】【F:app/reader/[bookId]/page.tsx†L16-L27】
- **Trade-off**: Server Actions are still experimental; production hardening would require feature flags or fallbacks.

## Deterministic Generation Stubs
- Text, image, and TTS helpers generate repeatable outputs seeded by input parameters, enabling reliable tests and demos without third-party AI calls.【F:lib/ai/text.ts†L67-L156】【F:lib/ai/image.ts†L13-L46】【F:lib/ai/tts.ts†L12-L40】
- Vitest suites assert determinism and coverage gates the helpers, reducing regression risk when swapping to real providers later.【F:tests/outline.test.ts†L17-L48】【F:tests/pageText.test.ts†L13-L42】【F:tests/image.test.ts†L33-L61】【F:tests/tts.test.ts†L17-L41】【F:scripts/report-coverage.mjs†L1-L233】
- **Trade-off**: Deterministic placeholders do not surface latency or quota issues; integration phases must revisit error handling.

## Filesystem Persistence
- Books and generated assets live under `data/books` and `public/generated`, minimizing dependencies while demonstrating the persistence shape.【F:lib/storage.ts†L5-L57】
- Tests isolate filesystem side effects by patching `process.cwd()` and operating in temp directories, proving local storage can be mocked cleanly.【F:tests/storage.test.ts†L39-L115】
- **Trade-off**: Local disk is not horizontally scalable; future iterations should consider S3/object storage and a database once concurrency or multi-instance deploys are required.

## Tailwind Utility Styling
- Tailwind provides rapid iteration across form, card, and layout components without bespoke CSS, aligning with the POC timeline.【F:tailwind.config.ts†L1-L20】【F:components/Form.tsx†L36-L128】
- Reusable UI primitives (`Banner`, `Progress`, `PageCard`) encapsulate repeated patterns to keep the create/reader flows focused on orchestration logic.【F:components/Banner.tsx†L5-L23】【F:components/Progress.tsx†L3-L10】【F:components/PageCard.tsx†L1-L16】
- **Trade-off**: Utility-heavy markup can hinder theming; migrating to design tokens or CSS variables would help at scale.

## PDF Export on the Client
- `jspdf` runs in the reader to produce shareable PDFs without backend rendering, illustrating the export surface and enabling instant feedback.【F:components/ReaderNav.tsx†L61-L163】
- The export server action persists the binary under `public/generated` so the same asset pipeline serves both images, audio, and PDFs.【F:app/reader/[bookId]/page.tsx†L21-L27】【F:lib/storage.ts†L9-L57】
- **Trade-off**: Browser-based PDF creation relies on the user’s device performance and fonts; production-grade exports may require a headless render service.

## CI & Coverage Enforcement
- The GitHub Actions workflow installs Node 20, runs lint, and executes the coverage script, catching style issues and enforcing the custom coverage policy before merge.【F:.github/workflows/ci.yml†L1-L19】【F:scripts/run-coverage.mjs†L1-L46】
- Custom coverage aggregation focuses on `lib/**` TypeScript sources, reinforcing confidence in the deterministic adapters that will later interface with real services.【F:scripts/report-coverage.mjs†L35-L161】
- **Trade-off**: Coverage gating on library code only may miss UI regressions; future work could add Playwright or component-level tests once the UI stabilizes.

## Considered Alternatives
- **Serverless Functions + External Storage**: Deploying APIs to serverless runtimes with S3 storage would scale better but add configuration complexity inappropriate for this stage. The current file-based persistence keeps the focus on demonstrating the core flow.
- **Direct Database Integration (SQLite/Prisma)**: A relational schema could model books and revisions but would introduce migrations and hosting considerations without immediate benefit over JSON blobs.
- **Real AI Providers**: Integrating LLM/image/TTS APIs would validate latency and quality but requires credentials, safety reviews, and cost management. The deterministic adapters smooth the path to future provider-specific modules sharing the same interface.
