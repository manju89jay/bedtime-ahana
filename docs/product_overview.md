# Bedtime Ahana Product Overview

## Purpose and Vision
Bedtime Ahana transforms a child-provided prompt into a personalized, six-page bedtime story starring Ahana and her friends. The product exists to give caregivers a safe, delightful way to co-create nightly routines, while demonstrating the full pipeline needed for future commercial offerings (generation, review, export, and fulfillment).

## Current Capabilities
- **Guided story creation** – The Create flow collects character details, tone, language, and optional prompts or voice notes to seed generation.
- **Deterministic content pipeline** – Outline, page prose, illustration prompts, and narration placeholders are generated locally for predictable demos and testing.
- **In-browser reader and editor** – The Reader view presents each spread, allows inline text tweaks, and manages export-ready assets.
- **Compliance guardrails** – Safety checks flag references to existing intellectual property before export, ensuring brand-new stories.
- **Asset packaging** – Stories persist as JSON, with images, audio stubs, and PDFs saved under `public/generated/<bookId>/` for instant sharing.

## Extensibility and Roadmap
The repository is structured for easy extension:
- **AI provider swap** – Replace `lib/ai/*` stubs with real LLM, image, and TTS services while keeping the same signatures.
- **Collaboration hooks** – Introduce accounts, shared libraries, and review workflows so families can co-edit.
- **Localization pipeline** – Expand beyond English/German with translation memory, RTL layout support, and locale-specific art prompts.
- **Print fulfillment** – Add integrations with print-on-demand partners, status tracking, and shipping notifications.
- **Analytics & personalization** – Capture anonymized reading behavior to suggest future prompts or merchandise bundles.

## New Feature Suggestions
1. **Character Creator** – Let families design custom avatars (hair, outfits, sidekicks). Store presets for recurring use and sync them with illustration prompts.
2. **Dynamic Soundscapes** – Upgrade TTS stubs to full narration with ambient audio layers, offering bedtime playlists per book.
3. **Achievement System** – Celebrate nightly reading streaks, giving kids collectible badges tied to story themes.
4. **Marketplace for Guest Authors** – Allow vetted writers/illustrators to submit new adventures, moderated via compliance tools.
5. **Family Library App** – Companion mobile app for offline reading, narration playback, and parental controls.

## End-to-End Demo (Today)
1. **Launch** the app with `npm run dev` and open `http://localhost:3000`.
2. **Select a character** on the landing page by clicking “Create a New Book” and confirming Ahana or entering a co-star’s name.
3. **Customize inputs**: choose tone (e.g., “gentle adventure”), language, moral, and optional prompt/voice note.
4. **Generate** the outline and page content; the app sequentially calls `/api/outline`, `/api/page`, `/api/image`, and `/api/tts` stubs.
5. **Review in the reader**: edit text inline, trigger a compliance scan, and preview placeholder illustrations/audio.
6. **Export to PDF** via the reader’s action bar. The PDF lands under `public/generated/<bookId>/<bookId>.pdf` and opens for download.
7. **Share** the generated book by sending the PDF or pointing collaborators to the saved JSON in `data/books/<bookId>.json`.

## Future Experience Enhancements
- **Hardcover fulfillment** – Convert the finalized PDF into print-ready spreads, bundle pricing (e.g., $24.99 hardcover, $14.99 softcover), and enable address capture + order tracking.
- **Subscription tiers** – Offer monthly story bundles, unlimited printing, or exclusive character packs; experiment with family vs. gift pricing.
- **Video storytelling** – Animate page art into short bedtime videos, layering narration and gentle motion. Export MP4 files alongside PDFs.
- **Cross-platform sharing** – One-click delivery to tablets, smart displays, and bedtime projector apps.

## How to Share This Doc
Commit this file to version control and share the repository (or a published doc site) with teammates. For non-technical friends, render this markdown in a wiki, Notion page, or static site so they can skim capabilities, roadmap, and demo steps without running the code.
