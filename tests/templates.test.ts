import { describe, expect, it } from 'vitest';
import { StoryTemplateSchema } from '@/lib/validation/template';
import { getTemplates, getTemplateById } from '@/data/templates/index';

import kindergartenFirstDay from '@/data/templates/kindergarten-first-day.json';
import zahnarzt from '@/data/templates/zahnarzt.json';
import fahrrad from '@/data/templates/fahrrad.json';
import geschwisterchen from '@/data/templates/geschwisterchen.json';
import schwimmbad from '@/data/templates/schwimmbad.json';
import muellabfuhr from '@/data/templates/muellabfuhr.json';

const allTemplates = [
  { name: 'kindergarten-first-day', data: kindergartenFirstDay },
  { name: 'zahnarzt', data: zahnarzt },
  { name: 'fahrrad', data: fahrrad },
  { name: 'geschwisterchen', data: geschwisterchen },
  { name: 'schwimmbad', data: schwimmbad },
  { name: 'muellabfuhr', data: muellabfuhr },
];

describe('Story templates', () => {
  it.each(allTemplates)('$name validates against StoryTemplate schema', ({ data }) => {
    const result = StoryTemplateSchema.safeParse(data);
    if (!result.success) {
      console.error(result.error.format());
    }
    expect(result.success).toBe(true);
  });

  it.each(allTemplates)('$name has exactly 24 beats', ({ data }) => {
    expect(data.beats).toHaveLength(24);
  });

  it.each(allTemplates)('$name has page numbers 1-24', ({ data }) => {
    const pageNumbers = data.beats.map((b) => b.page);
    expect(pageNumbers).toEqual(Array.from({ length: 24 }, (_, i) => i + 1));
  });

  it.each(allTemplates)('$name has correct act structure page ranges', ({ data }) => {
    expect(data.structure.act1_setup).toEqual([1, 2, 3, 4, 5, 6]);
    expect(data.structure.act2_adventure).toEqual([7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]);
    expect(data.structure.act3_resolution).toEqual([19, 20, 21, 22, 23, 24]);
  });

  it.each(allTemplates)('$name has moral field', ({ data }) => {
    expect(data.moral).toBeTruthy();
    expect(data.moral.length).toBeGreaterThan(5);
  });

  it.each(allTemplates)('$name has vocabulary_constraints', ({ data }) => {
    expect(data.vocabulary_constraints.toddler).toBeTruthy();
    expect(data.vocabulary_constraints.preschool).toBeTruthy();
    expect(data.vocabulary_constraints['early-reader']).toBeTruthy();
  });

  it.each(allTemplates)('$name has 24 pages field', ({ data }) => {
    expect(data.pages).toBe(24);
  });
});

describe('Template index', () => {
  it('returns exactly 6 templates', () => {
    const templates = getTemplates();
    expect(templates).toHaveLength(6);
  });

  it('each template has a unique templateId', () => {
    const templates = getTemplates();
    const ids = templates.map((t) => t.templateId);
    expect(new Set(ids).size).toBe(6);
  });

  it('finds template by id', () => {
    const t = getTemplateById('kindergarten-first-day');
    expect(t).toBeDefined();
    expect(t?.templateId).toBe('kindergarten-first-day');
  });

  it('returns undefined for unknown id', () => {
    expect(getTemplateById('nonexistent')).toBeUndefined();
  });
});
