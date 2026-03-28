# DECISIONS.md — Session 1

## Decision 1: Legacy types for backward compatibility
**Context:** The new type system (Book, Page, ChildProfile, etc.) has different shapes from the v1 types used by existing components and lib code.
**Decision:** Created `types/legacy.ts` with the old types aliased as `LegacyBook`, `LegacyPage`, etc. Existing components/lib code import from legacy.ts. New code (API stubs, stores, templates) uses the new types.
**Rationale:** Avoids rewriting all existing components (planned for Sessions 4-5) while keeping the new type system clean as source of truth.

## Decision 2: Zustand SSR-safe storage
**Context:** Zustand persist middleware needs sessionStorage, which doesn't exist on the server during SSR.
**Decision:** Used a conditional: if `typeof window === 'undefined'`, provide a no-op storage adapter. Otherwise use `sessionStorage`.
**Rationale:** Prevents SSR crashes while maintaining client-side persistence.

## Decision 3: Template JSON structure
**Context:** The spec defines a template structure with beats, acts, moral, and vocabulary constraints.
**Decision:** Used the exact structure from spec section 4.2 with `{name}`, `{parent}`, `{city}`, `{companion}` personalization slots. All 6 templates have exactly 24 beats with consistent act structure (1-6, 7-18, 19-24).
**Rationale:** Direct alignment with spec ensures consistency and makes template validation straightforward.

## Decision 4: API route stubs validate input
**Context:** Task requires API stubs that return mock 200 responses.
**Decision:** Each stub validates input with Zod schemas and returns 400 on invalid input, 200 with typed mock data on valid input.
**Rationale:** Validates the schema definitions work correctly and provides proper error handling from the start.

## Decision 5: Removed deprecated serverActions config (Session 1)
**Context:** `next.config.js` had `experimental: { serverActions: true }` which Next.js 14 warns about.
**Decision:** Removed the deprecated config since server actions are stable in Next.js 14.
**Rationale:** Eliminates build warning.

---

# Session 2

## Decision 6: Lazy env check for USE_STUBS
**Context:** AI adapter modules (outline, page-text, image-prompt, tts) need to check `process.env.USE_STUBS` to decide between stub and live mode.
**Decision:** Used `const isStubMode = () => process.env.USE_STUBS === 'true'` (lazy function) instead of `const USE_STUBS = process.env.USE_STUBS === 'true'` (eager constant).
**Rationale:** Eager evaluation captures the env value at module load time, which breaks in tests where env is set after import. Lazy evaluation reads at call time. Also avoids ESLint `react-hooks/rules-of-hooks` false positive (function names starting with `use`).

## Decision 7: Compliance check as standalone module
**Context:** The existing `lib/compliance.ts` works with legacy `Book` type. Session 2 needs a new compliance check working with the new `Page[]` + `StoryConfig` types.
**Decision:** Created `lib/ai/compliance-check.ts` as a new module using new types, with all 6 checks (IP names, franchise motifs, age-appropriate, GDPR, cultural sensitivity, generic experiences). Kept the old `lib/compliance.ts` for legacy code.
**Rationale:** Clean separation between old and new code. The new module implements the full `ComplianceResult` interface from `types/book.ts`.

## Decision 8: Sequential page text generation
**Context:** The `generateAllPageTexts` function could generate all 24 pages in parallel or sequentially.
**Decision:** Used sequential generation (for-loop) instead of `Promise.all`.
**Rationale:** In live mode, parallel calls to Claude would hit rate limits. Sequential is safer and allows context from earlier pages to inform later ones. In stub mode, the overhead is negligible.
