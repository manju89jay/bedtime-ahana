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

## Decision 5: Removed deprecated serverActions config
**Context:** `next.config.js` had `experimental: { serverActions: true }` which Next.js 14 warns about.
**Decision:** Removed the deprecated config since server actions are stable in Next.js 14.
**Rationale:** Eliminates build warning.
