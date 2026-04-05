import { describe, expect, it, vi, beforeAll, afterAll } from 'vitest';

const originalEnv = process.env;

beforeAll(() => {
  process.env = { ...originalEnv, USE_STUBS: 'true' };
});

afterAll(() => {
  process.env = originalEnv;
});

// We test the API route handlers directly by calling the POST functions
// with mock Request objects

const makeRequest = (body: unknown): Request =>
  new Request('http://localhost:3000/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

const validConfig = {
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

describe('POST /api/character', () => {
  it('returns 200 with character sheet', async () => {
    const { POST } = await import('@/app/api/character/route');
    const res = await POST(makeRequest({
      photos: ['data:image/png;base64,abc'],
      childProfile: {
        name: 'Ahana', age: 4, gender: 'girl',
        signatureOutfit: { top: 'shirt', bottom: 'jeans', shoes: 'sneakers', color: 'yellow' },
        companionObject: { name: 'Hoppel', type: 'bunny', description: 'plush' },
        city: 'Ulm',
        familyMembers: [{ name: 'Mama', role: 'mama' }],
      },
    }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.characterSheet).toBeDefined();
    expect(data.characterSheet.id).toBeTruthy();
    expect(data.characterSheet.referenceImages.front).toBeTruthy();
  });

  it('returns 400 for invalid input', async () => {
    const { POST } = await import('@/app/api/character/route');
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
  });
});

describe('POST /api/generate/outline', () => {
  it('returns 200 with 24 beats', async () => {
    const { POST } = await import('@/app/api/generate/outline/route');
    const res = await POST(makeRequest({
      config: validConfig,
      templateId: 'kindergarten-first-day',
    }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.outline).toHaveLength(24);
    expect(data.templateId).toBe('kindergarten-first-day');
  });
});

describe('POST /api/generate/page', () => {
  it('returns 200 with page data', async () => {
    const { POST } = await import('@/app/api/generate/page/route');
    const res = await POST(makeRequest({
      outline: [{ page: 1, beat: 'Title page' }],
      pageNumber: 1,
      config: validConfig,
    }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.page).toBeDefined();
    expect(data.page.pageNumber).toBe(1);
    expect(data.page.text.de).toBeTruthy();
  });
});

describe('POST /api/generate/image', () => {
  it('returns 200 with image URL', async () => {
    const { POST } = await import('@/app/api/generate/image/route');
    const res = await POST(makeRequest({
      page: { pageNumber: 1, text: { en: 'text' }, imagePrompt: 'prompt', imageUrl: '' },
      characterRefId: 'cs-1',
    }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.imageUrl).toBeTruthy();
  });
});

describe('POST /api/generate/tts', () => {
  it('returns 200 with audio URL', async () => {
    const { POST } = await import('@/app/api/generate/tts/route');
    const res = await POST(makeRequest({
      text: 'Hello world',
      language: 'en',
    }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.audioUrl).toBeTruthy();
  });
});

describe('POST /api/export', () => {
  it('returns 200 with PDF URL', async () => {
    const { POST } = await import('@/app/api/export/route');
    const res = await POST(makeRequest({
      bookId: 'book-123',
      format: 'screen',
    }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.pdfUrl).toBeTruthy();
    expect(data.pdfUrl).toContain('book-123');
  });
});
