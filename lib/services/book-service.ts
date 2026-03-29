import { generateOutline } from '@/lib/ai/outline';
import { generateAllPageTexts } from '@/lib/ai/page-text';
import { generateAllImagePrompts } from '@/lib/ai/image-prompt';
import { checkCompliance } from '@/lib/ai/compliance-check';
import { generateAllTts } from '@/lib/ai/tts';
import { generateAllImages } from '@/lib/ai/image-gen';
import { createBookId } from '@/lib/id';
import type { Book, Page, ComplianceResult } from '@/types/book';
import type { StoryConfig } from '@/types/template';

export type BookGenerationResult = {
  book: Book;
  complianceCheck: ComplianceResult;
};

export async function generateBook(
  config: StoryConfig,
  templateId: string,
  childProfileId: string
): Promise<BookGenerationResult> {
  const bookId = createBookId();
  const t0 = Date.now();

  // Step 1: Generate outline
  console.log(`[book-service] Step 1/6: Generating outline for "${templateId}"...`);
  const { outline } = await generateOutline({ config, templateId });
  console.log(`[book-service] Outline: ${outline.length} beats (${Date.now() - t0}ms)`);

  // Step 2: Generate page texts (bilingual)
  console.log(`[book-service] Step 2/6: Generating page text (${config.language})...`);
  const pageTexts = await generateAllPageTexts(config, outline);
  console.log(`[book-service] Text: ${pageTexts.length} pages (${Date.now() - t0}ms)`);

  // Step 3: Build initial pages
  const pages: Page[] = pageTexts.map((pt) => ({
    pageNumber: pt.pageNumber,
    text: pt.text,
    imagePrompt: '',
    imageUrl: '',
  }));

  // Step 4: Generate image prompts with character anchoring
  console.log('[book-service] Step 3/6: Generating image prompts...');
  const imagePrompts = await generateAllImagePrompts(
    pages,
    outline,
    config,
    config.characterRefId
  );
  for (const ip of imagePrompts) {
    const page = pages.find((p) => p.pageNumber === ip.pageNumber);
    if (page) {
      page.imagePrompt = ip.imagePrompt;
    }
  }

  // Step 5: Compliance check
  console.log('[book-service] Step 4/6: Running compliance check...');
  const complianceCheck = checkCompliance(pages, config);
  console.log(`[book-service] Compliance: ${complianceCheck.passed ? 'PASSED' : 'FAILED'} (${complianceCheck.blockers.length} blockers, ${complianceCheck.warnings.length} warnings)`);

  // Step 6: Generate images via image-gen
  console.log(`[book-service] Step 5/6: Generating ${pages.length} images via GPT Image...`);
  const imageResults = await generateAllImages(
    pages.map((p) => ({ pageNumber: p.pageNumber, imagePrompt: p.imagePrompt })),
    bookId,
    config.characterRefId
  );
  const pngCount = imageResults.filter((r) => r.imageUrl.endsWith('.png')).length;
  const svgCount = imageResults.filter((r) => r.imageUrl.endsWith('.svg')).length;
  console.log(`[book-service] Images: ${pngCount} GPT Image PNGs, ${svgCount} SVG placeholders (${Date.now() - t0}ms)`);

  for (const img of imageResults) {
    const page = pages.find((p) => p.pageNumber === img.pageNumber);
    if (page) {
      page.imageUrl = img.imageUrl;
    }
  }

  // Step 7: Generate TTS audio URLs
  console.log('[book-service] Step 6/6: Generating TTS audio...');
  const ttsResults = await generateAllTts(
    pages.map((p) => ({ pageNumber: p.pageNumber, text: p.text })),
    config.language,
    bookId
  );
  for (const tts of ttsResults) {
    const page = pages.find((p) => p.pageNumber === tts.pageNumber);
    if (page) {
      page.audioUrl = tts.audioUrl;
    }
  }

  const book: Book = {
    id: bookId,
    childProfileId,
    templateId,
    config,
    status: complianceCheck.passed ? 'ready' : 'draft',
    pages,
    language: config.language,
    complianceCheck,
    createdAt: new Date().toISOString(),
    generatedAt: new Date().toISOString(),
  };

  console.log(`[book-service] DONE: Book ${bookId} — ${pages.length} pages, ${pngCount} images (${((Date.now() - t0) / 1000).toFixed(1)}s total)`);

  return { book, complianceCheck };
}
