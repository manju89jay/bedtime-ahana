# Production Architecture Spec — Ahana Bedtime Story v3
# Final Decisions (All 7 Layers)

## Context

The POC works end-to-end but has three fundamental architectural problems:
1. **Character consistency doesn't exist** — every page generates an independent image from scratch
2. **Story quality is shallow** — text and images are AI-generated with no page-to-page coherence
3. **Runtime AI generation is expensive, slow, and unpredictable** — ~$1/book, 5 min, inconsistent quality

The new architecture shifts to a **pre-produced storybook engine**:
- Templates are fully illustrated at development time (layered: backgrounds + characters)
- Text is pre-written in variants (tone × age × language) with name placeholders
- At runtime, books are assembled from pre-made assets (<1 second, zero API cost)
- Premium tier: re-render character layers with the child's likeness from uploaded photos

### Style Reference (from genre analysis — NO content copied)
Quality benchmark: German children's Pixi-format books (10×10cm, 24 pages). We study only structural patterns — never copy content, characters, or plots. Our stories are entirely original.

### Style Guide (derived from genre analysis)

**Illustration technique:**
- **Ink outlines + watercolor fill** — NOT pure soft watercolor. Clear dark outlines on all characters and key objects. Watercolor wash for color fill. This is the defining look.
- Backgrounds are rendered with softer/lighter watercolor washes (less outline detail than characters)
- Characters have MORE rendering detail than environments

**Color palette:**
- Warm, cheerful but not neon: soft yellows, warm greens, sky blues, pink/red accents
- Backgrounds tend toward warm yellows/creams for indoor scenes, soft greens for outdoor
- Character clothing uses brighter, more saturated colors for visual pop against softer backgrounds

**Page layout:**
- **Full-bleed illustration** — every page is edge-to-edge art, no white borders
- Text occupies ~20-25% of page area, placed along top or bottom edge
- Text sits on a **softened/lightened area** within the illustration — the art fades to accommodate text, not a hard panel
- Each page = one complete scene/moment

**Text density (by age level, per page):**
- Toddler (2-3): 2-3 short sentences, ~20-30 words
- Preschool (3-5): 4-6 sentences, ~40-70 words (benchmark density)
- Early reader (5-6): 6-8 sentences, ~60-100 words

**Text style:**
- Present tense, action-driven: "Ahana walks into the room. She sees the other children."
- Named characters throughout (not "the mother" but "Mama")
- Includes dialogue quotes within prose: "Almost there!" says Mama.
- Concrete and visual — describes what the child sees, does, feels

**Character design rules:**
- Main character has ONE signature outfit worn throughout the entire book
- Signature outfit must be visually distinctive (specific color + pattern/style)
- Same face shape, hair style, body proportions on every page
- Companion object (stuffed animal, blanket) appears in most scenes
- Supporting characters also wear consistent clothing across pages
- Adults are proportionally taller (not cartoonishly so)

**Scene composition:**
- **Eye-level perspective** — camera at child's height (~100cm), not adult or bird's-eye
- Group scenes show 4-8 children interacting (kindergarten, playground)
- Characters interact with environment: sitting at tables, climbing playground, running in hallways
- Emotional expressions are clear and slightly exaggerated: visible smiles, worried brows, excited gestures
- Key story objects are prominent in frame: backpack, lunchbox, companion toy
- Depth: foreground figures larger, background figures smaller
- Indoor scenes show furniture, wall decorations, toys — detailed but not cluttered

**Scene consistency rules (CRITICAL):**
- Same room must look the same across multiple pages (same wall color, same furniture placement, same window)
- Outdoor playground: same equipment, same trees, same fence across pages
- These are fixed backgrounds — they don't change between pages showing the same location

**What to AVOID (compliance + quality):**
- Never reproduce any specific published character's visual traits
- No text/words rendered inside illustrations (text is overlaid separately)
- No photorealistic rendering — always illustrated/watercolor style
- No dark/scary imagery — everything warm, safe, gentle
- No cultural stereotypes or insensitive depictions

---

## Layer 1: Content Model

| Decision | Choice |
|----------|--------|
| Text matrix | 3 tones (gentle/adventurous/funny) × 3 age levels (toddler/preschool/early-reader) = **9 variants per page per language** |
| Languages | EN and DE as **separate books** (no in-book toggle) |
| Text per template | 24 pages × 9 variants × 2 languages = **432 text blocks** |
| Total across 6 standard templates | **2,592 text blocks** |
| Cover | **Separate from 24 story pages**. Fixed illustration per template + dynamic title text overlay at runtime |
| Placeholders | `{name}`, `{city}`, `{parent1}`, `{parent2}`, `{sibling}`, `{companion}`, `{kindergartenName}`, `{petName}` |
| Missing placeholder values | **Required per template** (wizard enforces). Optional ones (`{sibling}`, `{petName}`) use generic fallback ("a friend", omitted) |
| Audio | **Removed entirely.** No TTS feature. |

---

## Layer 2: Illustration Pipeline

| Decision | Choice |
|----------|--------|
| Style | **Soft watercolor** children's book illustration (start here, may refine after Conni analysis) |
| Format | **Square 1024×1024** (matches 10×10cm physical book) |
| Production method | **AI-generated (GPT Image) + manual touchup** |
| Touchup process | Generate **best-of-N** variants per page, pick best, then **AI inpainting** for fixes |
| Storage | **Git repo** (`data/templates/`) now, migrate to cloud later |
| Structure | **Layered**: background PNG + character PNGs (transparent) per page |
| **Gender variants** | **Two complete character sets per template** — one girl, one boy. Backgrounds are shared. |

### Gender-based illustration model

**Backgrounds are gender-neutral and shared.** A kindergarten hallway, a dentist's office, a street — these don't change based on the child's gender. Only the **character layers** differ.

Per template:
- **24 background images** (shared between boy/girl) = 24 assets
- **24 × N character layers for GIRL default** (Ahana set) = ~40-60 assets
- **24 × N character layers for BOY default** = ~40-60 assets
- **24 composited flat images × 2 genders** = 48 assets (for PDF/preview)

Total illustration assets per template: ~130-170 files
Total across 6 standard templates: ~800-1,000 files

### Layered illustration structure:
```
data/templates/{templateId}/illustrations/
  /backgrounds/
    p01.webp ... p24.webp                    # Shared (gender-neutral)
  /characters/
    /girl/                                    # Default girl (Ahana) character set
      p01_child.webp                          # Child pose, transparent BG
      p01_parent1.webp                        # Parent (shared or gender-specific)
      ...
    /boy/                                     # Default boy character set
      p01_child.webp
      p01_parent1.webp
      ...
  /composited/
    /girl/
      p01.webp ... p24.webp                  # Pre-composited girl version
    /boy/
      p01.webp ... p24.webp                  # Pre-composited boy version
  /thumb/
    /girl/
      p01.webp ... p24.webp
    /boy/
      p01.webp ... p24.webp
  cover.webp                                  # Cover illustration (shared)
```

### Key insight: Backgrounds are the expensive part, characters are the variable part
- 24 backgrounds per template = **144 backgrounds total** (one-time)
- Character layers are smaller, faster to generate, and are what change per gender/premium tier
- This makes premium tier efficient too — only regenerate character layers, reuse backgrounds

---

## Layer 3: Character System

| Decision | Choice |
|----------|--------|
| Default tier | **Two character sets**: girl (Ahana) and boy (TBD name). Backgrounds shared. |
| Premium method | **Background + character compositing** (regenerate only character layers) |
| Photos needed | **2-3 per person** (recommended) |
| Who gets personalized (premium) | **Full family** — child + all family members from uploaded photos |
| Gender selection | Wizard asks gender → system selects matching default character set |

### Default character sets:

**Girl default (Ahana-based) — from real photos:**
| Character | Signature Look | Visual Traits | Source |
|-----------|---------------|---------------|--------|
| Ahana | **Pink top** (every page) | ~4yo Indian girl, black wavy/curly hair (shoulder-length), large dark brown eyes, round face, big smile with dimples, petite build | 10 reference photos |
| Papa | **Glasses + dark t-shirt** | ~30s Indian man, short styled black hair, rectangular/aviator glasses, oval face, defined jaw, tall/athletic build | 6 reference photos |
| Mama | **Light-colored top** | ~30s Indian woman, long straight black hair (sometimes tied back), dark brown eyes, warm smile, medium build | 7 reference photos |
| Shriya | **Pink outfit** (baby) | ~8-month-old baby girl, short wispy dark hair, huge round dark eyes, chubby round face, big open-mouth smile | 12 reference photos |
| Companion | **Soft toy cat** | Plush cat, carried by Ahana in most scenes — tucked under arm, sitting beside her, on her bed | Illustrated (no photo) |

**Boy default (generic — no photos, AI-designed):**
| Character | Signature Look | Visual Traits | Source |
|-----------|---------------|---------------|--------|
| Boy child | **Blue t-shirt with star** | ~4yo generic European boy, light brown hair, friendly face | AI-designed |
| Papa | **Polo shirt** | ~30s, short brown hair, friendly | AI-designed |
| Mama | **Light sweater** | ~30s, medium brown hair | AI-designed |
| Brother | **Green t-shirt** (toddler) | ~2yo boy, chubby, light brown hair | AI-designed |
| Companion | **Stuffed bear** | Classic teddy bear, carried by boy | Illustrated |

**Shared across both sets** (if applicable per template):
- Oma, Opa: Can be reused between girl/boy sets (grandparents are grandparents)
- Background characters (other children, teachers): Shared

**Decision needed later**: How different should the boy family look from the girl family? Family members like Oma/Opa could be shared. The child and sibling must be different.

### Pose library (fixed set, reusable across templates):
- `standing-front`, `standing-side`
- `walking`, `running`
- `sitting`, `sitting-floor`
- `waving`, `pointing`
- `happy`, `scared`, `crying`, `sleeping`
- `with-companion` (holding companion object)
- `hugging` (two characters)
- Custom per-template poses as needed for key moments

### Character production priority:
1. **First**: Ahana (girl) + her family from real photos → girl default set
2. **Second**: Generic boy child + family → boy default set
3. **Third**: Arav + India family (special Ahana-only content)

---

## Layer 3b: Ahana-Specific Content (Extended Family / India Templates)

This is **bespoke content for Ahana only** — not offered to general users.

### Concept: "Ahana Visits India"
Ahana has a cousin **Arav** who lives in **Bangalore** with his family (Uncle, Aunt, Grandfather, Grandmother). When Ahana visits India, there are 1-2 special templates for this.

| Decision | Choice |
|----------|--------|
| Scope | 1-2 special templates (e.g., "Ahana Visits Arav in Bangalore", "Ahana's Diwali") |
| Characters | Arav, Uncle (Bangalore), Aunt (Bangalore), Grandfather (Bangalore), Grandmother (Bangalore) |
| Backgrounds | **Indian settings**: Arav's house, Bangalore streets, temple, park, market |
| Customization | **None** — these are fixed Ahana stories, not user-facing templates |
| Text | Fixed text (still 3 tones × 3 ages × 2 languages), but `{name}` is always "Ahana" |
| Availability | Only visible to Ahana's account (or as a special showcase) |

### How it fits the architecture:
- These are just additional templates with their own backgrounds + character sets
- They use the same layered illustration structure
- They use the same text variant system
- The only difference: they're not shown in the general template picker
- New characters (Arav, etc.) are added to the character library

### Asset production:
- New backgrounds: ~24-48 (1-2 templates × 24 pages)
- New character illustrations: Arav, Uncle, Aunt, Bangalore grandparents (~5 characters × pose library)
- These are produced after the main 6 templates are done

---

## Layer 4: Template Spec Format

| Decision | Choice |
|----------|--------|
| Character positioning | **Zone-based** (`left-foreground`, `center`, `right-background`, etc.) |
| Pose references | **Fixed pose library** (template references pose by name) |
| Template depth | **Full storyboard in template JSON** (one source of truth) |
| Gender handling | Template JSON is gender-neutral. Character assets are loaded by gender at runtime. |

### Zone positions:
```
left-far      center-far      right-far        (background layer)
left-mid      center-mid      right-mid        (middle ground)
left-near     center-near     right-near       (foreground)
```

### Template JSON format (per page):
```json
{
  "pageNumber": 3,
  "act": 1,
  "scene": {
    "location": "Tree-lined street in {city}",
    "timeOfDay": "morning",
    "lighting": "warm golden hour",
    "composition": "Medium shot from behind, kindergarten visible ahead",
    "emotion": "anxious anticipation",
    "keyObjects": ["backpack", "trees", "other families"],
    "backgroundPrompt": "A tree-lined European residential street in morning sunlight, soft watercolor style, warm golden colors, a colorful kindergarten building visible at the end. No people."
  },
  "characters": [
    { "role": "child", "pose": "walking", "zone": "center-near", "emotion": "nervous" },
    { "role": "parent1", "pose": "walking", "zone": "left-near", "emotion": "reassuring" },
    { "role": "companion", "pose": "held", "zone": "center-near", "emotion": "neutral" }
  ],
  "placeholders": ["{name}", "{parent1}", "{companion}"],
  "textVariants": {
    "gentle": {
      "toddler": { "en": "...", "de": "..." },
      "preschool": { "en": "...", "de": "..." },
      "early-reader": { "en": "...", "de": "..." }
    },
    "adventurous": { "..." : "..." },
    "funny": { "..." : "..." }
  }
}
```

**Gender is NOT in the template JSON.** The template defines roles ("child", "parent1") and poses. At runtime, the system loads the correct character assets based on the child's gender from their profile.

---

## Layer 5: Runtime Engine

| Decision | Choice |
|----------|--------|
| Reader rendering | **Client-side compositing** (browser layers background + characters via CSS/Canvas) |
| PDF export | **Flat composited images** (server-side composite at export time) |
| Audio | **Removed** |
| Book assembly | Instant for default tier. Server loads template + applies personalization. |
| Gender routing | Book config includes `gender` → system loads `girl/` or `boy/` character assets |

### Runtime asset resolution:
```
Given: book.templateId = "kindergarten-first-day", book.gender = "girl", book.tier = "default"

Background: /data/templates/kindergarten-first-day/illustrations/backgrounds/p03.webp
Characters: /data/templates/kindergarten-first-day/illustrations/characters/girl/p03_child.webp
            /data/templates/kindergarten-first-day/illustrations/characters/girl/p03_parent1.webp

If tier = "premium" and custom illustrations exist:
Characters: /data/characters/{childId}/scenes/kindergarten-first-day/p03_child.webp
            /data/characters/{childId}/scenes/kindergarten-first-day/p03_parent1.webp
(backgrounds still shared from template)
```

### Reader compositing approach:
```html
<!-- Each page rendered as stacked layers -->
<div class="page" style="position: relative; width: 1024px; height: 1024px;">
  <img src="/backgrounds/p03.webp" style="position: absolute; inset: 0;" />
  <img src="/characters/girl/p03_parent1.webp" style="position: absolute; left: 15%; top: 30%;" />
  <img src="/characters/girl/p03_child.webp" style="position: absolute; left: 45%; top: 35%;" />
</div>
```

---

## Layer 6: Data Model

| Decision | Choice |
|----------|--------|
| Book storage | **Reference-based** — book is a small config pointing to template, text derived at read time |
| User data | **JSON files on disk** |

### Book type (simplified):
```typescript
type Book = {
  id: string;
  userId: string;
  childProfileId: string;
  templateId: string;
  tone: 'gentle' | 'adventurous' | 'funny';
  ageLevel: 'toddler' | 'preschool' | 'early-reader';
  language: 'en' | 'de';
  gender: 'girl' | 'boy';
  tier: 'default' | 'premium';
  personalization: {
    childName: string;
    city: string;
    parent1Name: string;
    parent2Name?: string;
    siblingName?: string;
    companionName?: string;
    kindergartenName?: string;
    petName?: string;
  };
  customIllustrationSetId?: string; // premium only
  createdAt: string;
};
```

No `pages` array in the Book — pages are derived from template at read time.
`gender` field determines which character asset set to load.

### ChildProfile type:
```typescript
type ChildProfile = {
  id: string;
  userId: string;
  name: string;
  age: number;
  gender: 'girl' | 'boy' | 'neutral';
  city: string;
  photos?: string[];                    // URLs (premium)
  referenceSheetUrl?: string;           // AI-illustrated ref (premium)
  familyMembers: Array<{
    name: string;
    role: string;
    photoUrls?: string[];               // premium
    referenceSheetUrl?: string;          // premium
  }>;
  companion?: { name: string; type: string; };
  generatedScenes?: Record<string, {    // premium cache, keyed by templateId
    status: 'pending' | 'generating' | 'ready';
    generatedAt?: string;
  }>;
};
```

### Gender "neutral" handling:
If parent selects "neutral" gender, the wizard asks which illustration set they prefer (girl or boy). The `gender` on the Book is always `girl` or `boy` for illustration routing — `neutral` only affects text pronouns (a separate text consideration for future iteration).

---

## Layer 7: User Flow

| Decision | Choice |
|----------|--------|
| Profile | **Create once, reuse.** Pick templates for existing profiles. |
| Wizard | **5 steps with preview**: 1. Child details (incl. gender) 2. Pick template 3. Tone + language 4. Preview sample page 5. Confirm |
| Default tier | **Instant** book creation (no generation wait) |
| Premium tier | Photo upload → ~5 min generation wait (one-time per child per template) |
| Preview | Show 1-2 sample pages with child's name + **gender-correct illustrations** before creating |

### Default flow:
```
1. Create profile (name, age, gender, city, family, companion) → saved, reusable
   Gender → determines which default illustration set is used
2. Pick template from grid (6 standard options; Ahana-specific India templates shown only for Ahana)
3. Pick tone (gentle/adventurous/funny) + language (EN/DE)
   Age level auto-detected from profile age
4. Preview: see 2 sample pages with name swapped in + gender-matched default illustrations
5. Confirm → book created instantly → redirect to reader
```

### Premium flow:
```
1. Create profile + upload 2-3 photos per family member
2. Pick template
3. Pick tone + language
4. Preview with default illustrations + "Upgrade to personalized illustrations" CTA
5. If premium: generate custom character illustrations (~5 min wait, one-time)
6. Book ready with personalized illustrations (backgrounds shared, characters custom)
```

---

## Production Numbers Summary

### Standard templates (6):
| Asset type | Per template | Total (6 templates) |
|-----------|-------------|-------------------|
| Background images | 24 | **144** |
| Girl character layers | ~40-60 | ~240-360 |
| Boy character layers | ~40-60 | ~240-360 |
| Composited flat (girl) | 24 | 144 |
| Composited flat (boy) | 24 | 144 |
| Thumbnails | 48 (24×2 genders) | 288 |
| Cover illustrations | 1 | 6 |
| Text blocks | 432 (24pg × 9var × 2lang) | **2,592** |

### Ahana-specific India templates (1-2, Phase 7):
| Asset type | Per template | Total (2 templates) |
|-----------|-------------|-------------------|
| Background images (Indian settings) | 24 | 48 |
| Ahana character layers | ~40-60 | ~80-120 |
| India family character layers | ~30-50 | ~60-100 |
| Text blocks | 432 | 864 |

---

## Implementation Phases

### Phase 1: Style Reference Analysis
- Analyze uploaded Conni book PDF for: page layout, text density, illustration style, text-to-image ratio, pacing
- Document findings as style guide constraints
- **No code changes**

### Phase 2: Template Storyboarding (NO CODE)
- Define pose library (standard poses)
- Write detailed storyboard for `kindergarten-first-day` (24 pages)
- Write all text variants: 9 variants × 2 languages × 24 pages = 432 text blocks
- Define zone positions and character placement per page
- Define required vs optional placeholders per template

### Phase 3: Character Production
- Collect Ahana family photos
- Generate AI-illustrated girl character set (Ahana family) in watercolor style
- Generate AI-illustrated boy character set (generic) in same style
- Generate pose library for each character
- Define style guide (color palette, line weight, rendering rules)

### Phase 4: Illustration Production (start with kindergarten template)
- Generate 24 shared background images from storyboard prompts
- Generate girl character layers per page (Ahana set)
- Generate boy character layers per page (generic boy set)
- Generate pre-composited flat versions for both genders
- Best-of-N selection + AI inpainting touchup
- Quality review: consistency across all 24 pages, both genders

### Phase 5: Engine Rebuild
- New types: `TemplateSpec`, `Book` (reference-based with gender), `ChildProfile`
- `lib/services/book-assembly.ts` — template loader + personalization + gender routing
- Reader: client-side layer compositing (CSS positioned images)
- PDF: server-side compositing with Sharp/Canvas
- Wizard: 5-step flow with preview + gender-matched illustrations
- Remove: `outline.ts`, `page-text.ts`, `image-prompt.ts`, runtime `image-gen.ts`

### Phase 6: Premium Tier
- Photo upload UI + storage
- AI character generation from photos (GPT Image)
- Character layer re-rendering per template (reuse shared backgrounds)
- Per-child illustration cache
- Subscription gating

### Phase 7: Ahana India Content
- Storyboard 1-2 India templates
- Generate Bangalore backgrounds
- Generate Arav + India family character illustrations
- Text for India templates (fixed Ahana content)
- Flag as Ahana-only in template metadata

### Phase 8: Polish
- PDF export with composited illustrations
- Print ordering integration
- Reader improvements (transitions, zoom)
- Bookshelf with real covers
- Remaining 5 standard templates (replicate Phase 2-4 pattern)

---

## Verification

| Phase | How to verify |
|-------|--------------|
| 1 | Style guide documented. Conni patterns extracted. |
| 2 | Read all text variants aloud. Check tone/age differences. Verify placeholder coverage. |
| 3 | Character sheets look consistent. Same art style across girl + boy sets. |
| 4 | All 24 pages look like same book. Both genders look equally polished. Characters recognizable. |
| 5 | `pnpm lint && pnpm test && pnpm build`. Book assembles <1s. Reader shows layered illustrations. Gender routing works. |
| 6 | Upload test photos → custom illustrations in ~5 min. Cache works. Backgrounds reused correctly. |
| 7 | India templates render correctly. Not visible to non-Ahana users. |
| 8 | PDF has real images. Full e2e from landing page to printed book. |

---

## Next Session: What to Do

### Step 1: Commit this spec to the repo
- Write the finalized spec to `docs/ARCHITECTURE-V3.md` (replacing the old draft)
- Commit and push

### Step 2: Begin Phase 2 — Template Storyboarding
Start with `kindergarten-first-day` template:
1. Create `data/templates/kindergarten-first-day/template-v3.json` with full 24-page storyboard
2. Define scene descriptions, character placements (zone-based), poses, emotions per page
3. Write text variants: 9 per page (3 tones × 3 ages) × 2 languages = 432 text blocks
4. Store in `data/templates/kindergarten-first-day/text/{tone}/{age}/{lang}.json`

### Step 3: Create TypeScript types
- `types/template-v3.ts` — TemplateSpec, PageStoryboard, SceneSpec, ZonePosition
- `types/book-v3.ts` — simplified Book type (reference-based)
- `types/character-v3.ts` — CharacterProfile with photo refs

### Reference photos available at:
- `data/reference/Ahana/` — 10 photos
- `data/reference/Papa/` — 6 photos
- `data/reference/Mama/` — 7 photos
- `data/reference/Shriya/` — 12 photos
- `data/reference/scan1_img*.jpg` + `scan2_img*.jpg` — style reference (genre analysis only, NO content copying)
