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
