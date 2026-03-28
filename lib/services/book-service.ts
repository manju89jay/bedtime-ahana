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

  // Step 1: Generate outline
  const { outline } = await generateOutline({ config, templateId });

  // Step 2: Generate page texts (bilingual)
  const pageTexts = await generateAllPageTexts(config, outline);

  // Step 3: Build initial pages
  const pages: Page[] = pageTexts.map((pt) => ({
    pageNumber: pt.pageNumber,
    text: pt.text,
    imagePrompt: '',
    imageUrl: '',
  }));

  // Step 4: Generate image prompts with character anchoring
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
  const complianceCheck = checkCompliance(pages, config);

  // Step 6: Generate images via image-gen
  const imageResults = await generateAllImages(
    pages.map((p) => ({ pageNumber: p.pageNumber, imagePrompt: p.imagePrompt })),
    bookId,
    config.characterRefId
  );
  for (const img of imageResults) {
    const page = pages.find((p) => p.pageNumber === img.pageNumber);
    if (page) {
      page.imageUrl = img.imageUrl;
    }
  }

  // Step 7: Generate TTS audio URLs
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

  return { book, complianceCheck };
}
