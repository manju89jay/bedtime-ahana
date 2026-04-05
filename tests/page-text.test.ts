import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import type { StoryConfig, Beat } from '@/types/template';

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

const sampleOutline: Beat[] = Array.from({ length: 24 }, (_, i) => ({
  page: i + 1,
  beat: `Ahana does something on page ${i + 1} in Ulm`,
}));

describe('generatePageText (stub mode)', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv, USE_STUBS: 'true' };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('returns bilingual text when language is bilingual', async () => {
    const { generatePageText } = await import('@/lib/ai/page-text');
    const result = await generatePageText({
      config: validConfig,
      outline: sampleOutline,
      pageNumber: 1,
    });
    expect(result.pageNumber).toBe(1);
    expect(result.text.en).toBeTruthy();
    expect(result.text.de).toBeTruthy();
  });

  it('returns only English when language is en', async () => {
    const { generatePageText } = await import('@/lib/ai/page-text');
    const result = await generatePageText({
      config: { ...validConfig, language: 'en' },
      outline: sampleOutline,
      pageNumber: 5,
    });
    expect(result.text.en).toBeTruthy();
    expect(result.text.de).toBeUndefined();
  });

  it('returns only German when language is de', async () => {
    const { generatePageText } = await import('@/lib/ai/page-text');
    const result = await generatePageText({
      config: { ...validConfig, language: 'de' },
      outline: sampleOutline,
      pageNumber: 5,
    });
    expect(result.text.de).toBeTruthy();
    expect(result.text.en).toBeUndefined();
  });

  it('includes child name in text', async () => {
    const { generatePageText } = await import('@/lib/ai/page-text');
    const result = await generatePageText({
      config: validConfig,
      outline: sampleOutline,
      pageNumber: 1,
    });
    expect(result.text.en).toContain('Ahana');
    expect(result.text.de).toContain('Ahana');
  });

  it('includes city in text', async () => {
    const { generatePageText } = await import('@/lib/ai/page-text');
    const result = await generatePageText({
      config: validConfig,
      outline: sampleOutline,
      pageNumber: 1,
    });
    expect(result.text.en).toContain('Ulm');
  });
});

describe('generateAllPageTexts (stub mode)', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv, USE_STUBS: 'true' };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('generates text for all 24 pages', async () => {
    const { generateAllPageTexts } = await import('@/lib/ai/page-text');
    const results = await generateAllPageTexts(validConfig, sampleOutline);
    expect(results).toHaveLength(24);
    expect(results.map((r) => r.pageNumber)).toEqual(
      Array.from({ length: 24 }, (_, i) => i + 1)
    );
  });

  it('every page has bilingual text', async () => {
    const { generateAllPageTexts } = await import('@/lib/ai/page-text');
    const results = await generateAllPageTexts(validConfig, sampleOutline);
    for (const r of results) {
      expect(r.text.en).toBeTruthy();
      expect(r.text.de).toBeTruthy();
    }
  });
});
