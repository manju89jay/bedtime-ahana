# CLAUDE.md — bedtime-ahana

## What This Project Is
AI-personalized children's micro-books (Pixi-style, 10x10cm, 24 pages).
Next.js 14 + TypeScript + Tailwind. The child is the main character.

## Autonomous Work Rules

### When you finish a task
- Run `pnpm lint && pnpm test && pnpm build`
- If all pass: `git add -A && git commit -m "feat(sessionN): description"`
- If any fail: fix the issue, do not ask me, try up to 3 times
- If still failing after 3 attempts: write the error to BLOCKED.md and stop

### When you're stuck
- Write to BLOCKED.md: what you tried, what failed, exact error
- Do NOT guess or hallucinate a workaround for external service issues
- Do NOT skip a failing test — fix it or document why it's blocked
- Stop working and wait for me

### When you're NOT stuck (handle it yourself)
- Missing npm package → install it
- Type error → fix the type
- Test failing because implementation changed → update the test
- Lint error → fix it
- File doesn't exist yet → create it
- Import path wrong → correct it

## Architecture Rules
- All AI calls go through /lib/ai/*.ts adapters with this signature:
  `export async function generateX(input: XInput): Promise<XOutput>`
- Every adapter checks `process.env.USE_STUBS === 'true'` and returns mock data if so
- Types in /types/ are source of truth — read them before implementing anything
- Never hardcode strings — use i18n pattern (EN/DE object)
- Image generation is async (queued) — never await inline in API routes
- All API inputs validated with Zod

## Code Style
- TypeScript strict, no `any`, no untyped `as` casts
- `const` arrow functions for React components
- Prefer named exports
- One component per file
- Tests: happy path + one error case minimum

## File Naming
- Components: PascalCase.tsx
- Services/utils: kebab-case.ts
- Types: kebab-case.ts
- API routes: route.ts inside folder matching endpoint

## Copyright — CRITICAL
- NEVER use the word "Pixi" in any generated content or UI text
- NEVER reference Conni, her family names, her visual traits
- NEVER reproduce specific story plots from any published children's book
- Our stories are ORIGINAL "first experiences" — inspired by the genre, not any specific work
- Run compliance check before any content generation commit

## Common Mistakes Log
(UPDATE THIS AFTER EVERY FIX — append, never delete)
- [empty — will be populated as sessions run]
