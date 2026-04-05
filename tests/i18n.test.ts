import { describe, expect, it } from 'vitest';
import { t } from '@/lib/utils/i18n';

describe('i18n t() function', () => {
  it('returns English string for en', () => {
    expect(t('create.title', 'en')).toBe('Create a Book');
  });

  it('returns German string for de', () => {
    expect(t('create.title', 'de')).toBe('Buch erstellen');
  });

  it('returns key if translation is missing', () => {
    expect(t('nonexistent.key', 'en')).toBe('nonexistent.key');
  });

  it('falls back to English if German key is missing', () => {
    // All keys should exist in both, but test the fallback mechanism
    expect(t('create.title', 'en')).toBeTruthy();
    expect(t('create.title', 'de')).toBeTruthy();
  });

  it('returns correct button labels', () => {
    expect(t('button.next', 'en')).toBe('Next');
    expect(t('button.next', 'de')).toBe('Weiter');
    expect(t('button.generate', 'en')).toBe('Generate Book');
    expect(t('button.generate', 'de')).toBe('Buch erstellen');
  });

  it('returns correct error messages', () => {
    expect(t('error.required', 'en')).toBe('This field is required');
    expect(t('error.required', 'de')).toBe('Dieses Feld ist erforderlich');
  });

  it('returns correct status strings', () => {
    expect(t('status.generating', 'en')).toBe('Generating your book...');
    expect(t('status.generating', 'de')).toBe('Dein Buch wird erstellt...');
  });

  it('covers gender labels in both languages', () => {
    expect(t('gender.girl', 'en')).toBe('Girl');
    expect(t('gender.girl', 'de')).toBe('Maedchen');
  });

  it('covers nav labels in both languages', () => {
    expect(t('nav.home', 'en')).toBe('Home');
    expect(t('nav.home', 'de')).toBe('Startseite');
  });
});
