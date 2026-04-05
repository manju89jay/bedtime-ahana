import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import { tmpdir } from 'os';
import type { StoryConfig } from '@/types/template';

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

describe('full pipeline — book generation produces 24 page images on disk', () => {
  let tmpDir: string;

  beforeEach(async () => {
    vi.resetModules();
    tmpDir = await fs.mkdtemp(path.join(tmpdir(), 'bedtime-pipeline-'));
    process.env = { ...originalEnv, USE_STUBS: 'true' };
    vi.spyOn(process, 'cwd').mockReturnValue(tmpDir);
    await fs.mkdir(path.join(tmpDir, 'public', 'generated'), { recursive: true });
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    process.env = originalEnv;
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it('generates a book with 24 page images saved to disk', async () => {
    const { generateBook } = await import('@/lib/services/book-service');
    const result = await generateBook(validConfig, 'kindergarten-first-day', 'cp-1');

    // Check book structure
    expect(result.book.pages).toHaveLength(24);
    expect(result.book.status).toBe('ready');

    // Every page should have an imageUrl
    for (const page of result.book.pages) {
      expect(page.imageUrl).toBeTruthy();
      expect(page.imageUrl).toContain('.svg');
    }

    // Verify files exist on disk
    const bookId = result.book.id;
    const imgDir = path.join(tmpDir, 'public', 'generated', bookId);
    const files = await fs.readdir(imgDir);
    expect(files).toHaveLength(24);

    for (let i = 1; i <= 24; i++) {
      expect(files).toContain(`p${i}.svg`);
      const content = await fs.readFile(path.join(imgDir, `p${i}.svg`), 'utf-8');
      expect(content).toContain('<svg');
      expect(content).toContain(`Page ${i}`);
    }
  });

  it('every page has bilingual text, image prompt, image URL, and audio URL', async () => {
    const { generateBook } = await import('@/lib/services/book-service');
    const result = await generateBook(validConfig, 'kindergarten-first-day', 'cp-1');

    for (const page of result.book.pages) {
      expect(page.text.en).toBeTruthy();
      expect(page.text.de).toBeTruthy();
      expect(page.imagePrompt.length).toBeGreaterThan(10);
      expect(page.imageUrl).toBeTruthy();
      expect(page.audioUrl).toBeTruthy();
    }
  });

  it('compliance check passes for generated content', async () => {
    const { generateBook } = await import('@/lib/services/book-service');
    const result = await generateBook(validConfig, 'kindergarten-first-day', 'cp-1');

    expect(result.complianceCheck.passed).toBe(true);
    expect(result.complianceCheck.blockers).toHaveLength(0);
  });

  it('works with all 6 templates', async () => {
    const { generateBook } = await import('@/lib/services/book-service');
    const templateIds = [
      'kindergarten-first-day', 'zahnarzt', 'fahrrad',
      'geschwisterchen', 'schwimmbad', 'muellabfuhr',
    ];

    for (const templateId of templateIds) {
      const result = await generateBook(validConfig, templateId, 'cp-1');
      expect(result.book.pages).toHaveLength(24);
      expect(result.book.templateId).toBe(templateId);

      // Verify images on disk
      const imgDir = path.join(tmpDir, 'public', 'generated', result.book.id);
      const files = await fs.readdir(imgDir);
      expect(files).toHaveLength(24);
    }
  });
});
