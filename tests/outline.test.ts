import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import type { StoryConfig } from '@/types/template';

const originalEnv = process.env;

const validConfig: StoryConfig = {
  childName: 'Ahana',
  childAge: 4,
  childGender: 'girl',
  characterRefId: 'cs-1',
  familyMembers: [{ name: 'Mama', role: 'mama' }, { name: 'Papa', role: 'papa' }],
  city: 'Ulm',
  companionObject: 'plush bunny Hoppel',
  language: 'bilingual',
  tonePreset: 'gentle',
  ageVocabulary: 'preschool',
};

describe('generateOutline (stub mode)', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv, USE_STUBS: 'true' };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('returns 24 beats for a known template', async () => {
    const { generateOutline } = await import('@/lib/ai/outline');
    const result = await generateOutline({
      config: validConfig,
      templateId: 'kindergarten-first-day',
    });
    expect(result.outline).toHaveLength(24);
    expect(result.templateId).toBe('kindergarten-first-day');
  });

  it('personalizes beats with child name', async () => {
    const { generateOutline } = await import('@/lib/ai/outline');
    const result = await generateOutline({
      config: validConfig,
      templateId: 'kindergarten-first-day',
    });
    const hasName = result.outline.some((b) => b.beat.includes('Ahana'));
    expect(hasName).toBe(true);
  });

  it('personalizes beats with city', async () => {
    const { generateOutline } = await import('@/lib/ai/outline');
    const result = await generateOutline({
      config: validConfig,
      templateId: 'kindergarten-first-day',
    });
    const hasCity = result.outline.some((b) => b.beat.includes('Ulm'));
    expect(hasCity).toBe(true);
  });

  it('personalizes beats with companion object', async () => {
    const { generateOutline } = await import('@/lib/ai/outline');
    const result = await generateOutline({
      config: validConfig,
      templateId: 'kindergarten-first-day',
    });
    const hasCompanion = result.outline.some((b) => b.beat.includes('plush bunny Hoppel'));
    expect(hasCompanion).toBe(true);
  });

  it('personalizes beats with parent name', async () => {
    const { generateOutline } = await import('@/lib/ai/outline');
    const result = await generateOutline({
      config: validConfig,
      templateId: 'kindergarten-first-day',
    });
    const hasParent = result.outline.some((b) => b.beat.includes('Mama'));
    expect(hasParent).toBe(true);
  });

  it('page numbers are sequential 1-24', async () => {
    const { generateOutline } = await import('@/lib/ai/outline');
    const result = await generateOutline({
      config: validConfig,
      templateId: 'kindergarten-first-day',
    });
    expect(result.outline.map((b) => b.page)).toEqual(
      Array.from({ length: 24 }, (_, i) => i + 1)
    );
  });

  it('returns fallback outline for unknown template', async () => {
    const { generateOutline } = await import('@/lib/ai/outline');
    const result = await generateOutline({
      config: validConfig,
      templateId: 'nonexistent-template',
    });
    expect(result.outline).toHaveLength(24);
    expect(result.outline[0].beat).toContain('Ahana');
  });

  it('works with all 6 templates', async () => {
    const { generateOutline } = await import('@/lib/ai/outline');
    const templateIds = [
      'kindergarten-first-day', 'zahnarzt', 'fahrrad',
      'geschwisterchen', 'schwimmbad', 'muellabfuhr',
    ];
    for (const id of templateIds) {
      const result = await generateOutline({ config: validConfig, templateId: id });
      expect(result.outline).toHaveLength(24);
      expect(result.templateId).toBe(id);
    }
  });
});
