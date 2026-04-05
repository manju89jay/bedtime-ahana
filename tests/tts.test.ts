import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

const originalEnv = process.env;

describe('generateTts (stub mode)', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv, USE_STUBS: 'true' };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('returns audio URL for English', async () => {
    const { generateTts } = await import('@/lib/ai/tts');
    const result = await generateTts({
      text: 'Hello world',
      language: 'en',
      pageNumber: 1,
      bookId: 'book-123',
    });
    expect(result.audioUrl).toContain('en');
    expect(result.audioUrl).toContain('book-123');
    expect(result.audioUrl).toContain('p1');
    expect(result.pageNumber).toBe(1);
  });

  it('returns audio URL for German', async () => {
    const { generateTts } = await import('@/lib/ai/tts');
    const result = await generateTts({
      text: 'Hallo Welt',
      language: 'de',
      pageNumber: 3,
      bookId: 'book-456',
    });
    expect(result.audioUrl).toContain('de');
    expect(result.audioUrl).toContain('p3');
  });
});

describe('generateAllTts (stub mode)', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv, USE_STUBS: 'true' };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('generates TTS for bilingual pages', async () => {
    const { generateAllTts } = await import('@/lib/ai/tts');
    const pages = [
      { pageNumber: 1, text: { en: 'Hello', de: 'Hallo' } },
      { pageNumber: 2, text: { en: 'World', de: 'Welt' } },
    ];
    const results = await generateAllTts(pages, 'bilingual', 'book-bi');
    // 2 pages x 2 languages = 4 TTS results
    expect(results).toHaveLength(4);
  });

  it('generates TTS for English only', async () => {
    const { generateAllTts } = await import('@/lib/ai/tts');
    const pages = [
      { pageNumber: 1, text: { en: 'Hello', de: 'Hallo' } },
      { pageNumber: 2, text: { en: 'World', de: 'Welt' } },
    ];
    const results = await generateAllTts(pages, 'en', 'book-en');
    expect(results).toHaveLength(2);
    for (const r of results) {
      expect(r.audioUrl).toContain('en');
    }
  });

  it('generates TTS for German only', async () => {
    const { generateAllTts } = await import('@/lib/ai/tts');
    const pages = [
      { pageNumber: 1, text: { en: 'Hello', de: 'Hallo' } },
    ];
    const results = await generateAllTts(pages, 'de', 'book-de');
    expect(results).toHaveLength(1);
    expect(results[0].audioUrl).toContain('de');
  });

  it('skips pages without text for requested language', async () => {
    const { generateAllTts } = await import('@/lib/ai/tts');
    const pages = [
      { pageNumber: 1, text: { en: 'Hello' } }, // no German
    ];
    const results = await generateAllTts(pages, 'de', 'book-skip');
    expect(results).toHaveLength(0);
  });
});
