import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import type { StoryConfig, Beat } from '@/types/template';
import type { Page } from '@/types/book';

const originalEnv = process.env;

const validConfig: StoryConfig = {
  childName: 'Ahana',
  childAge: 4,
  childGender: 'girl',
  characterRefId: 'cs-1',
  familyMembers: [{ name: 'Mama', role: 'mama' }],
  city: 'Ulm',
  companionObject: 'plush bunny Hoppel',
  language: 'bilingual',
  tonePreset: 'gentle',
  ageVocabulary: 'preschool',
};

const samplePage: Page = {
  pageNumber: 1,
  text: { en: 'Ahana walked to school.', de: 'Ahana ging zur Schule.' },
  imagePrompt: '',
  imageUrl: '',
};

const sampleBeat: Beat = { page: 1, beat: 'Title page — {name} with backpack in {city}' };

describe('generateImagePrompt', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv, USE_STUBS: 'true' };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('includes watercolor style prefix', async () => {
    const { generateImagePrompt } = await import('@/lib/ai/image-prompt');
    const result = await generateImagePrompt({
      page: samplePage,
      beat: sampleBeat,
      config: validConfig,
      characterRefId: 'cs-1',
    });
    expect(result.imagePrompt).toContain('watercolor');
  });

  it('includes character reference tag', async () => {
    const { generateImagePrompt } = await import('@/lib/ai/image-prompt');
    const result = await generateImagePrompt({
      page: samplePage,
      beat: sampleBeat,
      config: validConfig,
      characterRefId: 'cs-1',
    });
    expect(result.imagePrompt).toContain('[character_ref:cs-1]');
  });

  it('includes child name in prompt', async () => {
    const { generateImagePrompt } = await import('@/lib/ai/image-prompt');
    const result = await generateImagePrompt({
      page: samplePage,
      beat: sampleBeat,
      config: validConfig,
      characterRefId: 'cs-1',
    });
    expect(result.imagePrompt).toContain('Ahana');
  });

  it('personalizes city in beat', async () => {
    const { generateImagePrompt } = await import('@/lib/ai/image-prompt');
    const result = await generateImagePrompt({
      page: samplePage,
      beat: sampleBeat,
      config: validConfig,
      characterRefId: 'cs-1',
    });
    expect(result.imagePrompt).toContain('Ulm');
  });

  it('includes no-text-in-image instruction', async () => {
    const { generateImagePrompt } = await import('@/lib/ai/image-prompt');
    const result = await generateImagePrompt({
      page: samplePage,
      beat: sampleBeat,
      config: validConfig,
      characterRefId: 'cs-1',
    });
    expect(result.imagePrompt).toContain('No text or words');
  });
});

describe('generateAllImagePrompts', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv, USE_STUBS: 'true' };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('generates prompts for all pages with matching beats', async () => {
    const { generateAllImagePrompts } = await import('@/lib/ai/image-prompt');
    const pages: Page[] = Array.from({ length: 3 }, (_, i) => ({
      pageNumber: i + 1,
      text: { en: `Text ${i + 1}` },
      imagePrompt: '',
      imageUrl: '',
    }));
    const beats: Beat[] = [
      { page: 1, beat: 'Scene one' },
      { page: 2, beat: 'Scene two' },
      { page: 3, beat: 'Scene three' },
    ];
    const results = await generateAllImagePrompts(pages, beats, validConfig, 'cs-1');
    expect(results).toHaveLength(3);
    for (const r of results) {
      expect(r.imagePrompt).toBeTruthy();
    }
  });
});
