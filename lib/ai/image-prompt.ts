import type { StoryConfig, Beat } from '@/types/template';
import type { Page } from '@/types/book';

export type ImagePromptInput = {
  page: Page;
  beat: Beat;
  config: StoryConfig;
  characterRefId: string;
};

export type ImagePromptOutput = {
  pageNumber: number;
  imagePrompt: string;
};

const isStubMode = () => process.env.USE_STUBS === 'true';

const STYLE_PREFIX =
  'Soft watercolor children\'s book illustration, warm colors, gentle lighting, rounded shapes. ';

const STYLE_SUFFIX =
  ' No text or words in the image. Child-friendly, safe, cozy atmosphere.';

function buildCharacterAnchor(config: StoryConfig): string {
  const genderDesc =
    config.childGender === 'girl'
      ? 'a young girl'
      : config.childGender === 'boy'
        ? 'a young boy'
        : 'a young child';

  return `The main character is ${genderDesc} named ${config.childName}, age ${config.childAge}, wearing a signature ${config.companionObject ? `outfit, carrying ${config.companionObject}` : 'outfit'}.`;
}

function generateStubImagePrompt(input: ImagePromptInput): ImagePromptOutput {
  const anchor = buildCharacterAnchor(input.config);
  const scene = input.beat.beat
    .replace(/\{name\}/g, input.config.childName)
    .replace(/\{parent\}/g, 'parent')
    .replace(/\{city\}/g, input.config.city)
    .replace(/\{companion\}/g, input.config.companionObject ?? 'stuffed animal');

  return {
    pageNumber: input.page.pageNumber,
    imagePrompt: `${STYLE_PREFIX}${scene}. ${anchor} [character_ref:${input.characterRefId}]${STYLE_SUFFIX}`,
  };
}

export async function generateImagePrompt(
  input: ImagePromptInput
): Promise<ImagePromptOutput> {
  if (isStubMode()) {
    return generateStubImagePrompt(input);
  }

  // In live mode, we'd use Claude to enhance the prompt.
  // For now, both modes produce deterministic prompts from beats.
  return generateStubImagePrompt(input);
}

export async function generateAllImagePrompts(
  pages: Page[],
  beats: Beat[],
  config: StoryConfig,
  characterRefId: string
): Promise<ImagePromptOutput[]> {
  const results: ImagePromptOutput[] = [];
  for (const page of pages) {
    const beat = beats.find((b) => b.page === page.pageNumber);
    if (!beat) continue;
    const result = await generateImagePrompt({
      page,
      beat,
      config,
      characterRefId,
    });
    results.push(result);
  }
  return results;
}
