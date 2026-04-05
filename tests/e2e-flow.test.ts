/**
 * End-to-end integration test simulating the full happy path:
 *   Register → Create character → Generate book → Export PDF
 *
 * Tests the complete pipeline by calling API routes and services directly.
 */
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import { tmpdir } from 'os';
import type { StoryConfig } from '@/types/template';

const originalEnv = process.env;

describe('E2E: full happy path', () => {
  let tmpDir: string;

  beforeEach(async () => {
    vi.resetModules();
    tmpDir = await fs.mkdtemp(path.join(tmpdir(), 'bedtime-e2e-'));
    process.env = { ...originalEnv, USE_STUBS: 'true' };
    vi.spyOn(process, 'cwd').mockReturnValue(tmpDir);
    await fs.mkdir(path.join(tmpDir, 'public', 'generated'), { recursive: true });
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    process.env = originalEnv;
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it('register → generate character → generate book → export PDF', async () => {
    // Step 1: Register a new user
    const { POST: registerPost } = await import('@/app/api/auth/register/route');
    const regRes = await registerPost(new Request('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'e2e@test.com', password: 'test1234' }),
    }));
    expect(regRes.status).toBe(201);
    const regData = await regRes.json();
    expect(regData.id).toBeTruthy();
    expect(regData.email).toBe('e2e@test.com');

    // Step 2: Generate a character sheet
    const { POST: charPost } = await import('@/app/api/character/route');
    const charRes = await charPost(new Request('http://localhost/api/character', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        photos: ['data:image/png;base64,fakePhoto1'],
        childProfile: {
          name: 'Ahana',
          age: 4,
          gender: 'girl',
          signatureOutfit: { top: 'Star T-Shirt', bottom: 'jeans', shoes: 'sneakers', color: 'yellow' },
          companionObject: { name: 'Hoppel', type: 'plush bunny', description: 'A soft white bunny' },
          city: 'Ulm',
          familyMembers: [{ name: 'Mama', role: 'mama' }],
        },
      }),
    }));
    expect(charRes.status).toBe(200);
    const charData = await charRes.json();
    expect(charData.characterSheet.id).toBeTruthy();
    expect(charData.characterSheet.referenceImages.front).toBeTruthy();

    // Step 3: Generate a full book via book-service
    const { generateBook } = await import('@/lib/services/book-service');
    const config: StoryConfig = {
      childName: 'Ahana',
      childAge: 4,
      childGender: 'girl',
      characterRefId: charData.characterSheet.id,
      familyMembers: [
        { name: 'Mama', role: 'mama' },
        { name: 'Papa', role: 'papa' },
      ],
      city: 'Ulm',
      companionObject: 'plush bunny Hoppel',
      language: 'bilingual',
      tonePreset: 'gentle',
      ageVocabulary: 'preschool',
    };

    const bookResult = await generateBook(config, 'kindergarten-first-day', 'cp-1');
    expect(bookResult.book.pages).toHaveLength(24);
    expect(bookResult.book.status).toBe('ready');
    expect(bookResult.complianceCheck.passed).toBe(true);

    // Verify all pages have bilingual text, images, audio
    for (const page of bookResult.book.pages) {
      expect(page.text.en).toBeTruthy();
      expect(page.text.de).toBeTruthy();
      expect(page.imageUrl).toBeTruthy();
      expect(page.imagePrompt).toBeTruthy();
      expect(page.audioUrl).toBeTruthy();
    }

    // Verify images exist on disk
    const imgDir = path.join(tmpDir, 'public', 'generated', bookResult.book.id);
    const files = await fs.readdir(imgDir);
    expect(files).toHaveLength(24);

    // Step 4: Export PDF (screen format)
    const { exportPDF } = await import('@/lib/services/pdf-export');
    const pdfResult = exportPDF({
      book: bookResult.book,
      format: 'screen',
      subscription: 'starter',
    });

    expect(pdfResult.pdfBytes).toBeInstanceOf(Uint8Array);
    const header = String.fromCharCode(...pdfResult.pdfBytes.slice(0, 5));
    expect(header).toBe('%PDF-');
    expect(pdfResult.pageCount).toBe(26); // cover + 24 + back

    // Step 5: Export PDF (print 10x10, free tier — should have watermark)
    const freePdf = exportPDF({
      book: bookResult.book,
      format: 'screen',
      subscription: 'free',
    });
    // Free tier is larger due to watermark
    expect(freePdf.pdfBytes.length).toBeGreaterThan(pdfResult.pdfBytes.length);

    // Step 6: Create print order
    const { createPrintOrder } = await import('@/lib/services/print-order');
    const orderResult = await createPrintOrder({
      bookId: bookResult.book.id,
      userId: regData.id,
      format: '10x10',
      quantity: 1,
      shippingAddress: {
        name: 'Ahana Family',
        street: 'Muensterplatz 1',
        city: 'Ulm',
        postalCode: '89073',
        country: 'DE',
      },
    });
    expect(orderResult.order.status).toBe('pending');
    expect(orderResult.order.bookId).toBe(bookResult.book.id);
  });

  it('generates books for all 6 templates', async () => {
    const { generateBook } = await import('@/lib/services/book-service');
    const config: StoryConfig = {
      childName: 'Maya',
      childAge: 5,
      childGender: 'girl',
      characterRefId: 'cs-1',
      familyMembers: [{ name: 'Papa', role: 'papa' }],
      city: 'Berlin',
      language: 'de',
      tonePreset: 'adventurous',
      ageVocabulary: 'preschool',
    };

    const templates = [
      'kindergarten-first-day', 'zahnarzt', 'fahrrad',
      'geschwisterchen', 'schwimmbad', 'muellabfuhr',
    ];

    for (const templateId of templates) {
      const result = await generateBook(config, templateId, 'cp-maya');
      expect(result.book.pages).toHaveLength(24);
      expect(result.book.templateId).toBe(templateId);
      expect(result.complianceCheck.passed).toBe(true);
    }
  });

  it('outline → page text → compliance pipeline', async () => {
    const { generateOutline } = await import('@/lib/ai/outline');
    const { generateAllPageTexts } = await import('@/lib/ai/page-text');
    const { checkCompliance } = await import('@/lib/ai/compliance-check');

    const config: StoryConfig = {
      childName: 'Leo',
      childAge: 3,
      childGender: 'boy',
      characterRefId: 'cs-leo',
      familyMembers: [{ name: 'Mama', role: 'mama' }],
      city: 'Munich',
      language: 'en',
      tonePreset: 'funny',
      ageVocabulary: 'toddler',
    };

    const { outline } = await generateOutline({ config, templateId: 'fahrrad' });
    expect(outline).toHaveLength(24);

    const pageTexts = await generateAllPageTexts(config, outline);
    expect(pageTexts).toHaveLength(24);
    for (const pt of pageTexts) {
      expect(pt.text.en).toBeTruthy();
      expect(pt.text.de).toBeUndefined(); // English only
    }

    const pages = pageTexts.map((pt) => ({
      pageNumber: pt.pageNumber,
      text: pt.text,
      imagePrompt: 'watercolor illustration',
      imageUrl: '',
    }));

    const compliance = checkCompliance(pages, config);
    expect(compliance.passed).toBe(true);
  });
});
