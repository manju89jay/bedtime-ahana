# Bedtime Ahana — First-Impression Overview (v0.2)

**One-liner**  
Personalized, bilingual *bedtime* books with soothing audio — rooted in Indian family & festivals, ready to scale to Germany.

---

## What it is
A calming, **24–32 page** personalized bedtime book for ages **3–6**, with:
- **Light personalization** (child name, sibling(s), family roles like Ajja/Ayi/Amama, home city) that preserves print quality.
- **Bilingual text & audio** (EN ⇄ HI at launch; DE next) with a **QR code** for narration (TTS or a family recording).
- **Festival editions** (Diwali, Raksha Bandhan, Onam, Eid, Christmas) as limited drops for gifting moments.
- **Slice-of-life** stories focused on routine, kindness, and winding down (no franchise IP; copyright-safe).

---

## Why this stands out (vs. common alternatives)
- **Bedtime-first engine**: Stories follow a proven wind-down arc (calm start → small cozy conflict → resolution → gratitude/affirmation page), with per-page word caps for sleepy cadence.
- **Bilingual & regional by design**: EN-HI now, expansion to EN-{kn/ta/te/ml/mr/bn/gu/pa} and DE later.
- **Family narration**: Parents or grandparents can record the story; keepsake QR on the back cover.
- **Print-quality over hyper-personalization**: 10–15% of panels/lines vary; layout/pagination stays stable for QA.
- **Safety & consistency**: Template-driven generation + vocabulary controls + post-gen checks (age-safe, ad-free, no brand IP).
- **Price & distribution fit for India**: Affordable PDF/softcover options; festival bundles; school/library tie-ins.

---

## Who it’s for
- **Indian parents of 3–6-year-olds** seeking screen-light bedtime routines in English + a home language.  
- **Gift givers** (birthdays, festivals, return gifts).  
- **Schools/libraries** wanting bilingual, calm-reading material.  
- **Diaspora families** and **Germany** next, with German translations and exportable audio content.

---

## How it works (current POC loop)
Create → Generate → Read → Export  
- **Create Book**: name(s), age, family roles, city, tone, language (EN/DE today; EN/HI in this doc’s plan), optional story seed.  
- **Generate**: outline → page text (100–140 words/page) → image prompt per page (character-consistent) → optional TTS stub.  
- **Reader**: page viewer with inline edits.  
- **Export**: A5 PDF with embedded QR pointing to the narration.

*Tech:* Next.js 14 (App Router) + TypeScript • Tailwind • local JSON storage • `/api/*` stubs for outline/page/image/tts/export.

---

## Core features (v0.2)
- **Bedtime Templates**: `bedtime_v1` with beats, tone markers, max words/page.  
- **Personalization Fields**: child name, siblings, family roles, city, language.  
- **Bilingual Text Toggle**: EN ⇄ HI per line/paragraph; DE pipeline stub remains.  
- **Narration Options**: TTS (EN+HI) *or* upload a safe family recording; store + attach via QR.  
- **Festival Limited Editions**: Diwali/Raksha/Onam/Eid/Christmas variants (art motifs & small text swaps).  
- **Export & Share**: A5 PDF; QR on back cover for audio.  
- **Safety & Compliance**: profanity/violence filters; no third-party characters, logos, or trade dress.  
- **Storage**: local JSON under `/data/books/<id>.json`; assets under `/public/generated/<id>/`.

---

## Roadmap (next 6 weeks)
1. **Reading levels (L0–L2)** with simpler phrasings for younger kids.  
2. **Bilingual rollout (EN-HI)**: dual-text authoring + TTS voices; UI toggle.  
3. **Festival Drops**: Diwali & Raksha packs (limited covers, gift notes).  
4. **Family-Voice Flow**: secure upload, trimming, loudness-normalize, QR embed.  
5. **Story corpus seeding** from open CC-BY Indian sources (proper attribution); re-leveled to bedtime cadence.  
6. **Analytics (privacy-respecting)**: completion rate, language usage, narration attach rate.  
7. **Print-on-Demand trials** (softcover/hardcover) and packaging.  
8. **Germany scale hooks**: DE translation QA; explore export to kid-audio ecosystems (licensing later).

---

## Pricing experiments (India)
- **Starter PDF:** ₹299  
- **Softcover POD:** ₹799–1,199  
- **Hardcover Gift:** ₹1,499–1,999  
- **Festival Twin-Pack:** value bundle (siblings/cousins)  
- **Narration:** include 1 family recording free; extra recordings as add-on.

*Channels:* D2C site first; marketplaces (e.g., FirstCry/Amazon) later; school/library kits; corporate gifting around festivals.

---

## Success metrics
- **Bedtime fit:** story completion rate; “fell asleep before page X” (parent self-report).  
- **Language stickiness:** EN vs Indic split; % who use both; share rate to family groups.  
- **Giftability:** festival purchase %, repeat gift buyers, narration-added %.  
- **Quality:** NPS for calmness/soothing; edit-after-generate rate.

---

## Safety, privacy, and IP
- **No third-party IP** (names, outfits, characters).  
- **Age-safe content** with filters and manual checks for early releases.  
- **Children’s data:** parental consent gating; data minimization; ad-free.  
- **Attribution** for any CC-BY sources; maintain a `/docs/attribution.md`.

---

## Germany scale path
- **Language**: DE translations; localized lullaby pack.  
- **Audio ecosystems**: prepare export format for kid-audio platforms (subject to licensing).  
- **Compliance**: EU parental-consent age and cookie practices; same ad-free stance.

---

## What’s in the repo today (anchor)
- Next.js 14 + TypeScript app; Create → Generate → Reader → PDF export; TTS stub; local JSON model; compliance check stubs.

---

## Next steps (developer checklist)
- Add `data/templates/bedtime_v1.json` (beats, tone, word caps).  
- Add `data/festivals/` (Diwali, Raksha, Onam…) with palettes/motifs.  
- Add `lib/compliance/safety.ts` (age-safe vocabulary & filters).  
- Upgrade `/api/tts` (EN+HI voices) and add `/api/narration/upload`.  
- Embed QR on export (back cover).  
- Add `scripts/ccby_ingest.ts` to import CC-BY stories with YAML attribution.  
- Track metrics (completion, language toggle, narration attach) with privacy-first events.

---

### Changelog
- **v0.2 (this update):** Refocused the product on bedtime calm, bilingual EN-HI, family narration via QR, festival editio
