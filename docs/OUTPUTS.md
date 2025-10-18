# Expected Outputs

| Artifact | Location | Produced By | Verification |
| --- | --- | --- | --- |
| Compiled Next.js build | `.next/` | `npm run build` | `npm run start` serves UI on port 3000; check logs and visit home/reader flows.【F:package.json†L6-L17】 |
| Server bundle manifest | `.next/server/` | `npm run build` | Inspect `server/app/create/page.js` to confirm route compilation (optional). |
| Generated book data | `data/books/<bookId>.json` | `/api/book` via create flow or reader save | Open JSON to confirm metadata/pages persisted.【F:lib/storage.ts†L9-L49】 |
| Generated media assets | `public/generated/<bookId>/{pN.svg,pN.mp3,book.pdf}` | `/api/image`, `/api/tts`, `/api/export` | Access `/generated/<bookId>/p1.svg` in browser; PDF link returned after export.【F:lib/ai/image.ts†L40-L46】【F:lib/ai/tts.ts†L23-L40】【F:app/api/export/route.ts†L8-L14】 |
| Coverage reports | `coverage/lcov.info`, `coverage/v8/*.json` | `npm run coverage` | Review console summary; ensure script exits 0 only when coverage thresholds met.【F:scripts/run-coverage.mjs†L1-L46】【F:scripts/report-coverage.mjs†L155-L214】 |
| Test results | Stdout from `npm run test` | `npm run test` | Vitest summary should report passing suites for storage, outline, page text, image, and TTS modules.【F:tests/*.test.ts†L1-L115】 |

## Spot Checks
- **Recent books list**: After generating a book, revisit `/` to confirm the entry appears with updated timestamp (ensures `listBooks` order works).【F:app/page.tsx†L27-L44】【F:lib/storage.ts†L34-L49】
- **Compliance banner**: Modify a page to include “Conni” and confirm the warning banner appears in the reader (validates compliance guard).【F:components/ReaderNav.tsx†L22-L91】【F:lib/compliance.ts†L3-L22】
- **PDF export**: Trigger Export to PDF and verify the status updates with the saved URL returned from the server action.【F:components/ReaderNav.tsx†L61-L164】【F:app/reader/[bookId]/page.tsx†L21-L27】
