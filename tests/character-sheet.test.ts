import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import { tmpdir } from 'os';

const originalEnv = process.env;

describe('character sheet generation (stub mode)', () => {
  let tmpDir: string;

  beforeEach(async () => {
    vi.resetModules();
    tmpDir = await fs.mkdtemp(path.join(tmpdir(), 'bedtime-charsheet-'));
    process.env = { ...originalEnv, USE_STUBS: 'true' };
    vi.spyOn(process, 'cwd').mockReturnValue(tmpDir);
    // Ensure the generated directory exists
    await fs.mkdir(path.join(tmpDir, 'public', 'generated'), { recursive: true });
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    process.env = originalEnv;
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it('generates a character sheet with 6 SVG poses', async () => {
    const { generateCharacterSheet } = await import('@/lib/ai/character-sheet');
    const sheet = await generateCharacterSheet({
      childProfile: {
        name: 'Ahana',
        age: 4,
        gender: 'girl',
        signatureOutfit: { top: 'star t-shirt', bottom: 'jeans', shoes: 'sneakers', color: 'yellow' },
        companionObject: { name: 'Hoppel', type: 'plush bunny', description: 'A soft white bunny' },
        city: 'Ulm',
        familyMembers: [{ name: 'Mama', role: 'mama' }],
      },
      faceDetected: true,
    });

    expect(sheet.id).toBeTruthy();
    expect(sheet.childProfileId).toBeTruthy();
    expect(sheet.referenceImages.front).toBeTruthy();
    expect(sheet.referenceImages.threeQuarterLeft).toBeTruthy();
    expect(sheet.referenceImages.threeQuarterRight).toBeTruthy();
    expect(sheet.referenceImages.walking).toBeTruthy();
    expect(sheet.referenceImages.sitting).toBeTruthy();
    expect(sheet.referenceImages.withCompanion).toBeTruthy();
    expect(sheet.styleLoraId).toBe('watercolor-v1');
    expect(sheet.version).toBe(1);
  });

  it('saves SVG files to disk', async () => {
    const { generateCharacterSheet } = await import('@/lib/ai/character-sheet');
    const sheet = await generateCharacterSheet({
      childProfile: {
        name: 'Ahana',
        age: 4,
        gender: 'girl',
        signatureOutfit: { top: 'star t-shirt', bottom: 'jeans', shoes: 'sneakers', color: 'yellow' },
        companionObject: { name: 'Hoppel', type: 'plush bunny', description: 'A soft white bunny' },
        city: 'Ulm',
        familyMembers: [{ name: 'Mama', role: 'mama' }],
      },
      faceDetected: true,
    });

    // Check that the front SVG file exists on disk
    const frontUrl = sheet.referenceImages.front;
    // URL looks like /generated/<sheetId>/front.svg
    const relativePath = frontUrl.replace('/generated/', '');
    const filePath = path.join(tmpDir, 'public', 'generated', relativePath);
    const content = await fs.readFile(filePath, 'utf-8');
    expect(content).toContain('<svg');
    expect(content).toContain('Ahana');
  });

  it('includes child name in SVG content', async () => {
    const { generateCharacterSheet } = await import('@/lib/ai/character-sheet');
    const sheet = await generateCharacterSheet({
      childProfile: {
        name: 'Maya',
        age: 5,
        gender: 'girl',
        signatureOutfit: { top: 'dress', bottom: 'skirt', shoes: 'sandals', color: 'pink' },
        companionObject: { name: 'Teddy', type: 'bear', description: 'Brown teddy bear' },
        city: 'Berlin',
        familyMembers: [{ name: 'Papa', role: 'papa' }],
      },
      faceDetected: true,
    });

    const frontUrl = sheet.referenceImages.front;
    const relativePath = frontUrl.replace('/generated/', '');
    const filePath = path.join(tmpDir, 'public', 'generated', relativePath);
    const content = await fs.readFile(filePath, 'utf-8');
    expect(content).toContain('Maya');
  });
});
