import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import { tmpdir } from 'os';

const originalEnv = process.env;

describe('image generation (stub mode)', () => {
  let tmpDir: string;

  beforeEach(async () => {
    vi.resetModules();
    tmpDir = await fs.mkdtemp(path.join(tmpdir(), 'bedtime-imagegen-'));
    process.env = { ...originalEnv, USE_STUBS: 'true' };
    vi.spyOn(process, 'cwd').mockReturnValue(tmpDir);
    await fs.mkdir(path.join(tmpDir, 'public', 'generated'), { recursive: true });
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    process.env = originalEnv;
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it('generates a placeholder SVG for a single page', async () => {
    const { generateImage } = await import('@/lib/ai/image-gen');
    const result = await generateImage({
      imagePrompt: 'A child playing in a sunny park with flowers',
      pageNumber: 3,
      bookId: 'book-test',
      characterRefId: 'cs-1',
    });

    expect(result.imageUrl).toContain('book-test');
    expect(result.imageUrl).toContain('p3.svg');
    expect(result.pageNumber).toBe(3);

    const filePath = path.join(tmpDir, 'public', 'generated', 'book-test', 'p3.svg');
    const content = await fs.readFile(filePath, 'utf-8');
    expect(content).toContain('<svg');
    expect(content).toContain('Page 3');
  });

  it('generates images for all pages', async () => {
    const { generateAllImages } = await import('@/lib/ai/image-gen');
    const pages = Array.from({ length: 24 }, (_, i) => ({
      pageNumber: i + 1,
      imagePrompt: `Scene for page ${i + 1}`,
    }));

    const results = await generateAllImages(pages, 'book-full', 'cs-1');
    expect(results).toHaveLength(24);

    for (let i = 0; i < 24; i++) {
      expect(results[i].pageNumber).toBe(i + 1);
      expect(results[i].imageUrl).toContain(`p${i + 1}.svg`);
    }
  });

  it('saves 24 SVG files to disk', async () => {
    const { generateAllImages } = await import('@/lib/ai/image-gen');
    const pages = Array.from({ length: 24 }, (_, i) => ({
      pageNumber: i + 1,
      imagePrompt: `Illustration for page ${i + 1}`,
    }));

    await generateAllImages(pages, 'book-disk', 'cs-1');

    const dir = path.join(tmpDir, 'public', 'generated', 'book-disk');
    const files = await fs.readdir(dir);
    expect(files).toHaveLength(24);
    for (let i = 1; i <= 24; i++) {
      expect(files).toContain(`p${i}.svg`);
    }
  });

  it('escapes special characters in prompt', async () => {
    const { generateImage } = await import('@/lib/ai/image-gen');
    await generateImage({
      imagePrompt: 'A <child> & "friend" playing',
      pageNumber: 1,
      bookId: 'book-escape',
      characterRefId: 'cs-1',
    });

    const filePath = path.join(tmpDir, 'public', 'generated', 'book-escape', 'p1.svg');
    const content = await fs.readFile(filePath, 'utf-8');
    expect(content).toContain('&lt;child&gt;');
    expect(content).toContain('&amp;');
    expect(content).not.toContain('<child>');
  });
});

describe('image generation (GPT Image live mode)', () => {
  let tmpDir: string;

  beforeEach(async () => {
    vi.resetModules();
    tmpDir = await fs.mkdtemp(path.join(tmpdir(), 'bedtime-gptimage-'));
    process.env = { ...originalEnv, USE_STUBS: 'false', OPENAI_API_KEY: 'test-key' };
    vi.spyOn(process, 'cwd').mockReturnValue(tmpDir);
    await fs.mkdir(path.join(tmpDir, 'public', 'generated'), { recursive: true });
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    process.env = originalEnv;
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it('calls GPT Image API, decodes base64, and saves PNG', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    const fakeB64 = Buffer.from('fake-png-data-here').toString('base64');
    vi.doMock('@/lib/ai/imageClient', () => ({
      getOpenAIClient: () => ({
        images: {
          generate: vi.fn().mockResolvedValue({
            data: [{ b64_json: fakeB64 }],
          }),
        },
      }),
      getImageModel: () => 'gpt-image-1.5',
    }));

    vi.spyOn(process, 'cwd').mockReturnValue(tmpDir);
    const { generateImage } = await import('@/lib/ai/image-gen');

    const result = await generateImage({
      imagePrompt: 'A child in a park [character_ref:cs-1]',
      pageNumber: 5,
      bookId: 'book-gptimage',
      characterRefId: 'cs-1',
    });

    expect(result.imageUrl).toContain('book-gptimage');
    expect(result.imageUrl).toContain('p5.png');
    expect(result.pageNumber).toBe(5);

    const filePath = path.join(tmpDir, 'public', 'generated', 'book-gptimage', 'p5.png');
    const saved = await fs.readFile(filePath);
    expect(saved.toString()).toBe('fake-png-data-here');
  });

  it('strips character_ref tag before sending to GPT Image', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    const fakeB64 = Buffer.from('img').toString('base64');
    const mockGenerate = vi.fn().mockResolvedValue({
      data: [{ b64_json: fakeB64 }],
    });
    vi.doMock('@/lib/ai/imageClient', () => ({
      getOpenAIClient: () => ({ images: { generate: mockGenerate } }),
      getImageModel: () => 'gpt-image-1.5',
    }));

    vi.spyOn(process, 'cwd').mockReturnValue(tmpDir);
    const { generateImage } = await import('@/lib/ai/image-gen');

    await generateImage({
      imagePrompt: 'A scene [character_ref:cs-abc123] with flowers',
      pageNumber: 1,
      bookId: 'book-strip',
      characterRefId: 'cs-abc123',
    });

    const sentPrompt = mockGenerate.mock.calls[0][0].prompt;
    expect(sentPrompt).not.toContain('[character_ref');
    expect(sentPrompt).toContain('A scene');
    expect(sentPrompt).toContain('with flowers');
  });

  it('falls back to SVG placeholder on GPT Image error', async () => {
    vi.doMock('@/lib/ai/imageClient', () => ({
      getOpenAIClient: () => ({
        images: {
          generate: vi.fn().mockRejectedValue(new Error('API error')),
        },
      }),
      getImageModel: () => 'gpt-image-1.5',
    }));

    const warnSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(process, 'cwd').mockReturnValue(tmpDir);
    const { generateImage } = await import('@/lib/ai/image-gen');

    const result = await generateImage({
      imagePrompt: 'Fallback test',
      pageNumber: 2,
      bookId: 'book-fallback',
      characterRefId: 'cs-1',
    });

    expect(result.imageUrl).toContain('p2.svg');
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('trims whitespace from API key', async () => {
    vi.resetModules();
    process.env = { ...originalEnv, USE_STUBS: 'false', OPENAI_API_KEY: '  sk-test-key  \n' };

    const { getOpenAIClient } = await import('@/lib/ai/imageClient');
    const client = getOpenAIClient();
    expect(client).toBeDefined();
  });
});
