import { getAnthropicClient } from './client';
import type { StoryConfig, Beat } from '@/types/template';

export type PageTextInput = {
  config: StoryConfig;
  outline: Beat[];
  pageNumber: number;
};

export type PageTextOutput = {
  pageNumber: number;
  text: { en?: string; de?: string };
};

const isStubMode = () => process.env.USE_STUBS === 'true';

const WORD_RANGES: Record<string, { min: number; max: number }> = {
  toddler: { min: 20, max: 40 },
  preschool: { min: 40, max: 70 },
  'early-reader': { min: 60, max: 100 },
};

function generateStubPageText(input: PageTextInput): PageTextOutput {
  const beat = input.outline.find((b) => b.page === input.pageNumber);
  const beatText = beat?.beat ?? `Page ${input.pageNumber}`;

  const enText = `${input.config.childName} was in ${input.config.city}. ${beatText}. It was a wonderful day full of adventure and joy. ${input.config.childName} smiled and felt happy.`;
  const deText = `${input.config.childName} war in ${input.config.city}. ${beatText}. Es war ein wundervoller Tag voller Abenteuer und Freude. ${input.config.childName} laechelte und war gluecklich.`;

  const result: PageTextOutput = { pageNumber: input.pageNumber, text: {} };

  if (input.config.language === 'en' || input.config.language === 'bilingual') {
    result.text.en = enText;
  }
  if (input.config.language === 'de' || input.config.language === 'bilingual') {
    result.text.de = deText;
  }

  return result;
}

export async function generatePageText(input: PageTextInput): Promise<PageTextOutput> {
  if (isStubMode()) {
    return generateStubPageText(input);
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('ANTHROPIC_API_KEY not set, using page text stub');
    return generateStubPageText(input);
  }

  const beat = input.outline.find((b) => b.page === input.pageNumber);
  if (!beat) {
    throw new Error(`No beat found for page ${input.pageNumber}`);
  }

  try {
    const client = getAnthropicClient();
    const wordRange = WORD_RANGES[input.config.ageVocabulary] ?? WORD_RANGES.preschool;

    const contextBeats = input.outline
      .filter((b) => Math.abs(b.page - input.pageNumber) <= 2 && b.page !== input.pageNumber)
      .map((b) => `  Page ${b.page}: ${b.beat}`)
      .join('\n');

    const languages =
      input.config.language === 'bilingual'
        ? 'both English ("en") and German ("de")'
        : input.config.language === 'de'
          ? 'German ("de") only'
          : 'English ("en") only';

    const prompt = `Write page text for a personalized children's book.

Child: ${input.config.childName}, age ${input.config.childAge}
Tone: ${input.config.tonePreset}
Vocabulary level: ${input.config.ageVocabulary} (${wordRange.min}-${wordRange.max} words per page)

This is page ${input.pageNumber} of 24.
Beat: ${beat.beat}

Nearby pages for context:
${contextBeats || '(none)'}

Write the text in ${languages}.

Rules:
- Use ${input.config.childName} as the character name
- Keep vocabulary appropriate for age ${input.config.childAge}
- ${wordRange.min}-${wordRange.max} words per language version
- Warm, gentle tone suitable for bedtime reading
- No scary content, no villains
- Page 24 should end with the child falling asleep

Return ONLY JSON: {"en": "...", "de": "..."} or just one key if single language.`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
      system: 'You are a children\'s book author. Respond with valid JSON only — no markdown, no code fences.',
    });

    const textBlock = message.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('No text response from Claude');
    }

    const cleaned = textBlock.text
      .replace(/^```(?:json)?\s*/m, '')
      .replace(/\s*```\s*$/m, '')
      .trim();

    const parsed = JSON.parse(cleaned) as { en?: string; de?: string };
    return { pageNumber: input.pageNumber, text: parsed };
  } catch (error) {
    console.warn(`Claude page text failed for page ${input.pageNumber}, falling back to stub:`, error);
    return generateStubPageText(input);
  }
}

export async function generateAllPageTexts(
  config: StoryConfig,
  outline: Beat[]
): Promise<PageTextOutput[]> {
  const results: PageTextOutput[] = [];
  for (let i = 1; i <= 24; i++) {
    const result = await generatePageText({ config, outline, pageNumber: i });
    results.push(result);
  }
  return results;
}
