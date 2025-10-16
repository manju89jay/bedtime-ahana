export const OUTLINE_PROMPT = `You are an original children's bedtime author. Output JSON: {title, moral, reading_time_minutes, pages[6]{beat_title, summary}}.
Constraints: calm tone, age-appropriate for {age}, language {language}. Characters: {characterCard}.
Theme must be everyday “first experiences” (library, dentist, rainy museum day, helping with baby sibling, weekly market, first swim class).
Do not reference or imitate any existing IP (e.g., Conni)—no names, outfits, phrases, or specific plots.
User idea (optional): """{storyIdea}"""`;

export const PAGE_PROMPT = `Write 100–140 words for page {pageNo} in {language}. Vocabulary for ages {age}.
Characters: {characterNames}. Keep a calm bedtime cadence. Original content only, no references to existing franchises. Return JSON: { "text": "..." }.`;

export const IMAGE_PROMPT = `One illustration prompt for page {pageNo}.
Style: soft watercolor, pastel palette, rounded shapes; non-derivative wardrobe.
Character card: {characterVisuals} (Ahana: 4–5 years, lives in Ulm, baby sister Shreya, Papa).
Scene: {oneLineScene}. Camera: eye-level, medium shot. Cozy lighting.
Negative: low-res, text, watermark, signature, known-franchise look-alikes.
Return JSON: { "prompt":"...", "negative":"..." }.`;

export const COMPLIANCE_CHECKLIST = `- No names/phrases/outfits/pets from known series.
- Plots are generic first experiences, not retellings.
- Art prompts avoid trademark motifs (e.g., signature stripes).
- Metadata/tags/titles do not mention other IP.`;
