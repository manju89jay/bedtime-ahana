import { describe, expect, it } from 'vitest';
import { checkCompliance } from '@/lib/ai/compliance-check';
import type { Page } from '@/types/book';
import type { StoryConfig } from '@/types/template';

const validConfig: StoryConfig = {
  childName: 'Ahana',
  childAge: 4,
  childGender: 'girl',
  characterRefId: 'cs-1',
  familyMembers: [{ name: 'Mama', role: 'mama' }],
  city: 'Ulm',
  language: 'de',
  tonePreset: 'gentle',
  ageVocabulary: 'preschool',
};

const safePage = (n: number): Page => ({
  pageNumber: n,
  text: { en: `Ahana played in the park on page ${n}.`, de: `Ahana spielte im Park auf Seite ${n}.` },
  imagePrompt: 'Soft watercolor of a child in a park.',
  imageUrl: '',
});

const safePages: Page[] = Array.from({ length: 24 }, (_, i) => safePage(i + 1));

describe('compliance check — 6 checks', () => {
  it('passes for safe content', () => {
    const result = checkCompliance(safePages, validConfig);
    expect(result.passed).toBe(true);
    expect(result.checks.noKnownIPNames).toBe(true);
    expect(result.checks.noFranchiseMotifs).toBe(true);
    expect(result.checks.genericExperiences).toBe(true);
    expect(result.checks.ageAppropriate).toBe(true);
    expect(result.checks.gdprCompliant).toBe(true);
    expect(result.checks.culturalSensitivity).toBe(true);
    expect(result.blockers).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  it('blocks IP names (Conni)', () => {
    const pages = [{ ...safePage(1), text: { en: 'Conni went to the park.' } }];
    const result = checkCompliance(pages, validConfig);
    expect(result.passed).toBe(false);
    expect(result.checks.noKnownIPNames).toBe(false);
    expect(result.blockers.length).toBeGreaterThan(0);
  });

  it('blocks IP names (Pixi)', () => {
    const pages = [{ ...safePage(1), text: { en: 'This is a Pixi book.' } }];
    const result = checkCompliance(pages, validConfig);
    expect(result.passed).toBe(false);
    expect(result.checks.noKnownIPNames).toBe(false);
  });

  it('warns on franchise motifs (red headband)', () => {
    const pages = [{ ...safePage(1), text: { en: 'She wore a red headband.' } }];
    const result = checkCompliance(pages, validConfig);
    expect(result.checks.noFranchiseMotifs).toBe(false);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('blocks age-inappropriate content', () => {
    const pages = [{ ...safePage(1), text: { en: 'There was blood everywhere.' } }];
    const result = checkCompliance(pages, validConfig);
    expect(result.passed).toBe(false);
    expect(result.checks.ageAppropriate).toBe(false);
  });

  it('blocks GDPR violation (photorealistic)', () => {
    const pages = [{
      ...safePage(1),
      imagePrompt: 'A photorealistic image of a 4-year-old girl.',
    }];
    const result = checkCompliance(pages, validConfig);
    expect(result.passed).toBe(false);
    expect(result.checks.gdprCompliant).toBe(false);
  });

  it('warns on culturally insensitive terms', () => {
    const pages = [{ ...safePage(1), text: { en: 'They visited an exotic land.' } }];
    const result = checkCompliance(pages, validConfig);
    expect(result.checks.culturalSensitivity).toBe(false);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('catches multiple issues at once', () => {
    const pages = [{
      ...safePage(1),
      text: { en: 'Conni used a weapon in the frozen castle.' },
      imagePrompt: 'photorealistic child',
    }];
    const result = checkCompliance(pages, validConfig);
    expect(result.passed).toBe(false);
    expect(result.blockers.length).toBeGreaterThanOrEqual(2);
  });
});
