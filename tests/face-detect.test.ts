import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

const originalEnv = process.env;

describe('face detection (stub mode)', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv, USE_STUBS: 'true' };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('detects a face in a single photo', async () => {
    const { detectFace } = await import('@/lib/ai/face-detect');
    const result = await detectFace({ photoBase64: 'data:image/png;base64,abc' });
    expect(result.detected).toBe(true);
    expect(result.confidence).toBeGreaterThan(0.9);
    expect(result.boundingBox).toBeDefined();
    expect(result.boundingBox.width).toBeGreaterThan(0);
    expect(result.boundingBox.height).toBeGreaterThan(0);
  });

  it('detects faces in multiple photos', async () => {
    const { detectFaces } = await import('@/lib/ai/face-detect');
    const results = await detectFaces([
      'data:image/png;base64,photo1',
      'data:image/png;base64,photo2',
      'data:image/png;base64,photo3',
    ]);
    expect(results).toHaveLength(3);
    for (const r of results) {
      expect(r.detected).toBe(true);
    }
  });

  it('returns bounding box with positive dimensions', async () => {
    const { detectFace } = await import('@/lib/ai/face-detect');
    const result = await detectFace({ photoBase64: 'data:image/png;base64,test' });
    expect(result.boundingBox.x).toBeGreaterThanOrEqual(0);
    expect(result.boundingBox.y).toBeGreaterThanOrEqual(0);
    expect(result.boundingBox.width).toBeGreaterThan(0);
    expect(result.boundingBox.height).toBeGreaterThan(0);
  });
});
