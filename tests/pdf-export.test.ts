import { describe, expect, it } from 'vitest';
import { exportPDF } from '@/lib/services/pdf-export';
import type { Book } from '@/types/book';
import type { StoryConfig } from '@/types/template';

const mockConfig: StoryConfig = {
  childName: 'Ahana',
  childAge: 4,
  childGender: 'girl',
  characterRefId: 'cs-1',
  familyMembers: [{ name: 'Mama', role: 'mama' }],
  city: 'Ulm',
  language: 'bilingual',
  tonePreset: 'gentle',
  ageVocabulary: 'preschool',
};

const mockBook: Book = {
  id: 'book-pdf-test',
  childProfileId: 'cp-1',
  templateId: 'kindergarten-first-day',
  config: mockConfig,
  status: 'ready',
  pages: Array.from({ length: 24 }, (_, i) => ({
    pageNumber: i + 1,
    text: { en: `English text page ${i + 1}.`, de: `Deutscher Text Seite ${i + 1}.` },
    imagePrompt: `Illustration ${i + 1}`,
    imageUrl: `/generated/test/p${i + 1}.svg`,
  })),
  language: 'bilingual',
  complianceCheck: {
    passed: true,
    checks: {
      noKnownIPNames: true,
      noFranchiseMotifs: true,
      genericExperiences: true,
      ageAppropriate: true,
      gdprCompliant: true,
      culturalSensitivity: true,
    },
    warnings: [],
    blockers: [],
  },
  createdAt: '2026-01-01',
};

describe('PDF export — screen format', () => {
  it('produces valid PDF bytes', () => {
    const result = exportPDF({ book: mockBook, format: 'screen', subscription: 'free' });
    expect(result.pdfBytes).toBeInstanceOf(Uint8Array);
    expect(result.pdfBytes.length).toBeGreaterThan(100);
  });

  it('starts with PDF magic bytes', () => {
    const result = exportPDF({ book: mockBook, format: 'screen', subscription: 'free' });
    const header = String.fromCharCode(...result.pdfBytes.slice(0, 5));
    expect(header).toBe('%PDF-');
  });

  it('reports correct page count (cover + 24 pages + back)', () => {
    const result = exportPDF({ book: mockBook, format: 'screen', subscription: 'free' });
    expect(result.pageCount).toBe(26);
  });

  it('returns screen format', () => {
    const result = exportPDF({ book: mockBook, format: 'screen', subscription: 'free' });
    expect(result.format).toBe('screen');
  });
});

describe('PDF export — print 10x10', () => {
  it('produces valid PDF bytes', () => {
    const result = exportPDF({ book: mockBook, format: 'print-10x10', subscription: 'starter' });
    expect(result.pdfBytes.length).toBeGreaterThan(100);
  });

  it('starts with PDF magic bytes', () => {
    const result = exportPDF({ book: mockBook, format: 'print-10x10', subscription: 'starter' });
    const header = String.fromCharCode(...result.pdfBytes.slice(0, 5));
    expect(header).toBe('%PDF-');
  });

  it('returns print-10x10 format', () => {
    const result = exportPDF({ book: mockBook, format: 'print-10x10', subscription: 'starter' });
    expect(result.format).toBe('print-10x10');
  });
});

describe('PDF export — print 15x15', () => {
  it('produces valid PDF bytes', () => {
    const result = exportPDF({ book: mockBook, format: 'print-15x15', subscription: 'family' });
    expect(result.pdfBytes.length).toBeGreaterThan(100);
  });

  it('starts with PDF magic bytes', () => {
    const result = exportPDF({ book: mockBook, format: 'print-15x15', subscription: 'family' });
    const header = String.fromCharCode(...result.pdfBytes.slice(0, 5));
    expect(header).toBe('%PDF-');
  });

  it('returns print-15x15 format', () => {
    const result = exportPDF({ book: mockBook, format: 'print-15x15', subscription: 'family' });
    expect(result.format).toBe('print-15x15');
  });
});

describe('PDF watermark behavior', () => {
  it('free tier screen PDF has watermark (larger file)', () => {
    const freeResult = exportPDF({ book: mockBook, format: 'screen', subscription: 'free' });
    const paidResult = exportPDF({ book: mockBook, format: 'screen', subscription: 'starter' });
    // Watermark adds extra content, making the free PDF slightly larger
    expect(freeResult.pdfBytes.length).toBeGreaterThan(paidResult.pdfBytes.length);
  });

  it('paid tier screen PDF has no watermark (smaller file)', () => {
    const starterResult = exportPDF({ book: mockBook, format: 'screen', subscription: 'starter' });
    const familyResult = exportPDF({ book: mockBook, format: 'screen', subscription: 'family' });
    const premiumResult = exportPDF({ book: mockBook, format: 'screen', subscription: 'premium' });
    // All paid tiers should produce same size (no watermark)
    expect(starterResult.pdfBytes.length).toBe(familyResult.pdfBytes.length);
    expect(familyResult.pdfBytes.length).toBe(premiumResult.pdfBytes.length);
  });

  it('print formats never have watermark regardless of tier', () => {
    const freePrint = exportPDF({ book: mockBook, format: 'print-10x10', subscription: 'free' });
    const paidPrint = exportPDF({ book: mockBook, format: 'print-10x10', subscription: 'starter' });
    // Watermark only on screen format for free tier
    expect(freePrint.pdfBytes.length).toBe(paidPrint.pdfBytes.length);
  });
});
