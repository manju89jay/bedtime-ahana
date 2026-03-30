# Production Architecture Spec — Ahana Bedtime Story v3

## 1. Product Model

### What we're building
A digital storybook engine where templates are fully pre-produced (illustrations + text variants). At runtime, books are assembled from pre-made assets with text personalization. No AI generation at runtime for the default tier.

### Business tiers
- **Free/Default**: Pre-rendered scenes (Ahana-based default illustrations) + text name swap. Every child gets the same illustrations with their name in the text. Zero marginal cost. Instant delivery.
- **Premium**: Upload child's photos → AI generates illustrated character in book style → re-render all template scenes with that child's character. True visual personalization. One-time per-child cost.

### Key constraints
- 6 templates, each with 24 pages (144 total scenes)
- 3 tone variants per page (gentle / adventurous / funny)
- 2 languages (EN / DE) = 6 text versions per page
- All illustrations created at development time (AI-generated + manually touched up)
- Ahana is the default character; her family is the default cast
- System must be architected so any child can replace Ahana in the premium tier

---

## 2. Asset Pipeline (Development Time — One-Time Per Template)

### 2.1 Text Production

For each template (e.g., `kindergarten-first-day`):
- Write 24 pages of story text
- Each page has 3 tone variants: `gentle`, `adventurous`, `funny`
- Each variant in 2 languages: `en`, `de`
- Total per template: 24 pages × 3 tones × 2 languages = 144 text blocks
- Total across 6 templates: 864 text blocks

Text uses placeholders:
```
{name}             → Child's name (e.g., "Ahana")
{city}             → City (e.g., "Ulm")
{parent1}          → Primary parent name (e.g., "Mama")
{parent2}          → Secondary parent name (e.g., "Papa")
{sibling}          → Sibling name (e.g., "Shriya")
{companion}        → Companion object (e.g., "Hoppel the bunny")
{kindergartenName}  → Kindergarten name (e.g., "Kita Sonnenschein")
{petName}          → Pet name
```

### 2.2 Illustration Production

For each template:
1. **Storyboard**: Define exactly what each of the 24 pages shows
   - Scene description (location, time of day, lighting)
   - Characters present and their positions
   - Character emotions/poses
   - Key objects in frame
   - Camera angle / composition

2. **AI Generation**: Use GPT Image to generate each scene illustration
   - Style: "Soft watercolor children's book illustration, warm pastel colors, gentle lighting, rounded shapes"
   - Size: 1024×1024 (or 1536×1024 for landscape spreads)
   - Characters: Ahana + family members in the scene
   - Generate 2-3 variants per page, pick the best

3. **Manual Touchup**: Art-direct each illustration
   - Ensure character consistency across all 24 pages
   - Fix any AI artifacts
   - Ensure text readability areas are clear
   - Ensure emotional tone matches the page's content

4. **Final Storage**: Save as optimized PNG/WebP
   - Full resolution: 1536×1024 (for print)
   - Web resolution: 768×512 (for reader)
   - Thumbnail: 256×170 (for bookshelf/preview)

### 2.3 Character Production (Ahana's Family)

Upload real photos of each family member. For each person:
1. AI generates illustrated version in the book's art style
2. Generate a **character reference sheet** (front, side, expressions)
3. Use this reference when generating all template scenes
4. Store reference sheet for future scene regeneration

**Characters for Ahana's family:**
| Character | Role | Appears in templates |
|-----------|------|---------------------|
| Ahana | Main character (child) | All 6 |
| Papa | Father | kindergarten, fahrrad, zahnarzt, schwimmbad |
| Mama | Mother | kindergarten, geschwisterchen, zahnarzt |
| Shriya | Sister | geschwisterchen, schwimmbad |
| Oma | Grandmother | (varies per template) |
| Opa | Grandfather | (varies per template) |
| Uncle | Uncle | (varies per template) |
| Hoppel | Companion bunny | All 6 (always with Ahana) |

### 2.4 Asset File Structure

```
/data/
  /templates/
    /kindergarten-first-day/
      template.json              # Metadata, storyboard, character map
      /text/
        /gentle/
          en.json                # 24 pages of EN gentle text
          de.json                # 24 pages of DE gentle text
        /adventurous/
          en.json
          de.json
        /funny/
          en.json
          de.json
      /illustrations/
        /full/                   # 1536×1024 print quality
          p01.webp ... p24.webp
        /web/                    # 768×512 reader quality
          p01.webp ... p24.webp
        /thumb/                  # 256×170 thumbnails
          p01.webp ... p24.webp
    /zahnarzt/
      ... (same structure)
    /fahrrad/
      ... (same structure)
    ... (6 templates total)

  /characters/
    /ahana/
      reference-sheet.webp       # AI-illustrated character ref
      photo-originals/           # Original uploaded photos
        front.jpg
        side.jpg
    /papa/
      reference-sheet.webp
      photo-originals/
    /mama/
      ...
    /shriya/
      ...
```

---

## 3. Template Specification Format

Each template needs a detailed `template.json` that serves as both storyboard and configuration:

```typescript
type TemplateSpec = {
  templateId: string;
  title: string;                    // "Ahana's First Day at Kindergarten"
  titleTemplate: string;            // "{name}'s First Day at Kindergarten"
  theme: string;
  moral: string;
  ageRange: [number, number];       // [2, 6]

  // Characters that appear in this template
  characters: {
    main: 'child';                  // Always the child
    supporting: Array<{
      role: string;                 // 'parent1', 'sibling', 'companion'
      appearsOnPages: number[];     // [1, 2, 3, 5, 22, 23, 24]
    }>;
  };

  // Per-page storyboard
  pages: Array<{
    pageNumber: number;             // 1-24
    act: 1 | 2 | 3;               // Story act

    // Storyboard (for illustration production)
    scene: {
      location: string;            // "Kindergarten entrance"
      timeOfDay: string;           // "Morning"
      lighting: string;            // "Warm morning sunlight"
      composition: string;         // "Wide shot, child in foreground, building behind"
      charactersPresent: string[]; // ["child", "parent1", "companion"]
      characterActions: string;    // "Child clutching parent's hand, looking up at building"
      keyObjects: string[];        // ["backpack", "building door", "other children"]
      emotion: string;             // "Nervous but excited"
    };

    // Text placeholders used on this page
    placeholders: string[];        // ["{name}", "{parent1}", "{kindergartenName}"]
  }>;
};
```

---

## 4. Runtime Flow (Book Assembly)

### 4.1 Default Tier (Free) — <1 second

```
User input:
  - childName: "Emma"
  - city: "Berlin"
  - parent1: "Sarah"
  - parent2: "Michael"
  - sibling: "Leo"
  - companion: "Mr. Bear"
  - kindergartenName: "Regenbogen"
  - templateId: "kindergarten-first-day"
  - tone: "gentle"
  - language: "en"

Runtime steps:
  1. Load pre-written text: /data/templates/kindergarten-first-day/text/gentle/en.json
  2. Load pre-rendered illustrations: /data/templates/kindergarten-first-day/illustrations/web/
  3. For each of 24 pages:
     a. text = template_text[page].replace("{name}", "Emma").replace("{city}", "Berlin")...
     b. imageUrl = `/data/templates/kindergarten-first-day/illustrations/web/p{page}.webp`
  4. Assemble Book JSON
  5. Save to user's library
  6. Redirect to reader

No AI calls. No image generation. Instant.
```

### 4.2 Premium Tier — ~5 minutes (one-time per child)

```
User input:
  - Same as above, plus:
  - childPhotos: [front.jpg, side.jpg, ...]

Runtime steps:
  1. FIRST TIME ONLY (per child):
     a. Upload photos → AI generates illustrated character reference sheet
     b. For each template the child uses:
        - Re-generate all 24 scene illustrations with the child's character
        - (Can use the original backgrounds/compositions as reference)
        - Save to /data/characters/{childId}/scenes/{templateId}/p01-p24.webp
     c. This takes ~5 minutes and costs ~$2-5 per template

  2. SUBSEQUENT BOOKS (same child, different template):
     - Only step 1b needed for new template (~5 min)

  3. SAME TEMPLATE AGAIN:
     - Instant (illustrations already generated)

  Text personalization: Same as default tier (name swap)
```

---

## 5. Data Model Changes

### Book (simplified)
```typescript
type Book = {
  id: string;
  userId: string;
  childProfileId: string;
  templateId: string;
  tone: 'gentle' | 'adventurous' | 'funny';
  language: 'en' | 'de' | 'bilingual';
  tier: 'default' | 'premium';

  // Personalization values
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

  // For premium tier: custom illustration set
  customIllustrationSetId?: string;

  status: 'ready' | 'generating_illustrations' | 'exported' | 'ordered';
  createdAt: string;
};
```

### Page (simplified — no longer stores generated content)
```typescript
type BookPage = {
  pageNumber: number;

  // Text is derived at runtime from template + personalization
  // Not stored per-book (reduces storage, ensures template updates propagate)

  // Image URL points to either:
  // - Default: /data/templates/{templateId}/illustrations/web/p{n}.webp
  // - Premium: /data/characters/{childId}/scenes/{templateId}/p{n}.webp
};
```

### ChildProfile (expanded)
```typescript
type ChildProfile = {
  id: string;
  userId: string;
  name: string;
  age: number;
  gender: 'girl' | 'boy' | 'neutral';

  // Photo-based character generation (premium)
  photos?: {
    front?: string;     // URL to uploaded photo
    side?: string;
    additional?: string[];
  };
  referenceSheetUrl?: string;  // AI-generated illustration reference

  // Family
  familyMembers: Array<{
    name: string;
    role: string;
    photoUrl?: string;
    referenceSheetUrl?: string;
  }>;

  companion?: {
    name: string;
    type: string;
    description: string;
  };

  city: string;

  // Premium illustration cache
  generatedScenes?: Record<string, {  // keyed by templateId
    status: 'pending' | 'generating' | 'ready';
    illustrationUrls: string[];       // 24 URLs
    generatedAt: string;
  }>;
};
```

---

## 6. Template Storyboard — What Needs to Be Defined Per Page

For EACH of the 24 pages in EACH of the 6 templates, we need:

### Text (authored by human, not AI):
- `gentle.en`: Gentle tone, English
- `gentle.de`: Gentle tone, German
- `adventurous.en`: Adventurous tone, English
- `adventurous.de`: Adventurous tone, German
- `funny.en`: Funny tone, English
- `funny.de`: Funny tone, German

### Illustration specification:
- Exact scene description
- Characters present and their positions
- Character emotions
- Key objects
- Camera angle
- Color palette / mood
- What MUST be visible (story-critical elements)
- What MUST NOT be visible (no text, no logos, etc.)

### Example — kindergarten-first-day, Page 3:
```
Page 3: "Walking to Kindergarten"
Act: 1 (Setup)

Scene: {name} walks down a tree-lined street holding {parent1}'s hand.
       {companion} is in {name}'s other arm. A colorful building is visible
       at the end of the street. Other children and parents walk ahead of them.

Characters: child (nervous but determined), parent1 (reassuring smile), companion
Emotion: Anxious anticipation
Location: Tree-lined residential street in a small European city
Time: Morning, golden hour light
Composition: Medium shot from behind, child slightly left of center,
             kindergarten building visible at end of street
Key objects: Backpack on child, companion animal, trees, other families ahead
Color mood: Warm golds and soft greens

Text (gentle, EN):
  "{name} held {parent1}'s hand tightly as they walked down the street.
   {companion} was tucked under {name}'s other arm. 'Almost there,'
   said {parent1} with a warm smile."

Text (gentle, DE):
  "{name} hielt {parent1}s Hand ganz fest, als sie die Straße entlanggingen.
   {companion} war unter {name}s anderem Arm eingeklemmt. 'Gleich sind wir da,'
   sagte {parent1} mit einem warmen Lächeln."

Text (adventurous, EN):
  "{name} marched down the street like a brave explorer heading into
   the unknown. {companion} bounced with every step. 'Let's go!'
   {name} said, pulling {parent1} along."

... (3 more variants)
```

---

## 7. Implementation Roadmap

### Phase 1: Template Storyboarding (NO CODE — pure content)
For each of the 6 templates:
1. Write detailed page-by-page storyboard (scene, characters, composition)
2. Write all text variants (3 tones × 2 languages × 24 pages)
3. Define character appearance map (who appears on which pages)
4. Review and iterate on text quality

**Deliverable**: 6 complete template specs with all text variants
**Effort**: ~2-3 days per template = ~2 weeks total
**No code changes needed**

### Phase 2: Character Generation (Ahana's family)
1. Collect reference photos of Ahana, Papa, Mama, Shriya, grandparents, uncle
2. AI-generate illustrated character reference sheets in consistent style
3. Define the illustration style guide (color palette, line weight, rendering style)
4. Iterate until characters look consistent and recognizable

**Deliverable**: Character reference sheets for all family members
**Effort**: ~2-3 days

### Phase 3: Illustration Production
For each template (starting with kindergarten-first-day):
1. Generate all 24 scenes using AI with character references
2. Manual touchup pass on each illustration
3. Export in 3 resolutions (print, web, thumbnail)
4. Quality review: character consistency, scene accuracy, emotional tone

**Deliverable**: 144 production-quality illustrations (24 × 6 templates)
**Effort**: ~1 week per template = ~6 weeks total
**Can be parallelized across templates**

### Phase 4: Engine Rebuild
Rewrite the book generation pipeline:
1. New asset loading system (templates, text variants, illustrations)
2. Text personalization engine (placeholder replacement)
3. Book assembly (combine text + illustrations → Book JSON)
4. Update reader to use new asset paths
5. Update PDF export for pre-rendered illustrations
6. Remove AI generation pipeline (outline, page-text, image-prompt, image-gen)
7. Update wizard flow (simpler: no "generating" wait for default tier)

**Deliverable**: Working book assembly engine with default tier
**Effort**: ~1 week

### Phase 5: Premium Tier (Character Personalization)
1. Photo upload flow
2. AI character generation from photos
3. Scene re-rendering with custom character
4. Per-child illustration cache
5. Premium tier gating (subscription check)

**Deliverable**: Premium tier with custom illustrations
**Effort**: ~2 weeks

### Phase 6: End-to-End Polish
1. Reader improvements (image quality, transitions, audio)
2. PDF export with real illustrations
3. Print ordering flow
4. Bookshelf with real book covers
5. Gifting/sharing flow

**Deliverable**: Production-ready product
**Effort**: ~2 weeks

---

## 8. What to Do First

**Phase 1 is pure content work — no code.** You need to storyboard the templates.

I recommend starting with ONE template (`kindergarten-first-day`) as the proof of concept:
1. Write the 24-page storyboard
2. Write all 6 text variants per page
3. Generate Ahana's character reference
4. Generate 24 illustrations
5. Wire up the engine
6. Test end-to-end

Once one template is production-quality, replicate for the other 5.

---

## 9. Open Questions

1. **Bilingual in one book or separate?** Currently one book can show both EN and DE. With pre-written text, do we maintain this toggle, or create separate EN and DE books?

2. **Page text length by age?** Current system adjusts vocabulary by age (toddler: 20-40 words, preschool: 40-70). Do we need separate text variants by age too? That would be 3 tones × 2 languages × 3 age levels = 18 variants per page.

3. **Cover page?** Is page 1 a title page with the child's name, or a story page? Does the cover illustration need personalization?

4. **Landscape or portrait?** Current images are square (1024×1024). Books are typically landscape for spread layouts. What format?

5. **Audio narration?** The spec mentions TTS. With pre-written text, we could pre-record professional narration (or high-quality TTS) during development time instead of generating it per-book.
