import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import { tmpdir } from 'os';

const originalEnv = process.env;

describe('asset-storage (filesystem backend)', () => {
  let tmpDir: string;

  beforeEach(async () => {
    vi.resetModules();
    tmpDir = await fs.mkdtemp(path.join(tmpdir(), 'bedtime-assets-'));
    process.env = { ...originalEnv };
    vi.spyOn(process, 'cwd').mockReturnValue(tmpDir);
    await fs.mkdir(path.join(tmpDir, 'public', 'generated'), { recursive: true });
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    process.env = originalEnv;
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it('saves and loads an asset', async () => {
    const { saveAsset, loadAsset } = await import('@/lib/services/asset-storage');
    const data = Buffer.from('hello world', 'utf-8');
    const url = await saveAsset('test/file.txt', data);

    expect(url).toBe('/generated/test/file.txt');

    const loaded = await loadAsset('test/file.txt');
    expect(loaded.toString('utf-8')).toBe('hello world');
  });

  it('checks if asset exists', async () => {
    const { saveAsset, assetExists } = await import('@/lib/services/asset-storage');
    expect(await assetExists('missing/file.txt')).toBe(false);

    await saveAsset('exists/file.txt', Buffer.from('data'));
    expect(await assetExists('exists/file.txt')).toBe(true);
  });

  it('deletes an asset', async () => {
    const { saveAsset, deleteAsset, assetExists } = await import('@/lib/services/asset-storage');
    await saveAsset('del/file.txt', Buffer.from('data'));
    expect(await assetExists('del/file.txt')).toBe(true);

    await deleteAsset('del/file.txt');
    expect(await assetExists('del/file.txt')).toBe(false);
  });

  it('delete of missing file does not throw', async () => {
    const { deleteAsset } = await import('@/lib/services/asset-storage');
    await expect(deleteAsset('nonexistent/file.txt')).resolves.toBeUndefined();
  });

  it('creates nested directories when saving', async () => {
    const { saveAsset } = await import('@/lib/services/asset-storage');
    const url = await saveAsset('deep/nested/path/file.svg', Buffer.from('<svg/>'));
    expect(url).toBe('/generated/deep/nested/path/file.svg');

    const filePath = path.join(tmpDir, 'public', 'generated', 'deep', 'nested', 'path', 'file.svg');
    const content = await fs.readFile(filePath, 'utf-8');
    expect(content).toBe('<svg/>');
  });

  it('getUrl returns correct URL', async () => {
    const { getAssetUrl } = await import('@/lib/services/asset-storage');
    expect(getAssetUrl('book-1/p1.svg')).toBe('/generated/book-1/p1.svg');
  });

  it('supports swappable backend via setStorageBackend', async () => {
    const { setStorageBackend, saveAsset, loadAsset } = await import('@/lib/services/asset-storage');

    const inMemory: Record<string, Buffer> = {};
    setStorageBackend({
      save: async (key, data) => { inMemory[key] = data; return `/mem/${key}`; },
      load: async (key) => inMemory[key],
      exists: async (key) => key in inMemory,
      delete: async (key) => { delete inMemory[key]; },
      getUrl: (key) => `/mem/${key}`,
    });

    const url = await saveAsset('test.txt', Buffer.from('memory'));
    expect(url).toBe('/mem/test.txt');

    const loaded = await loadAsset('test.txt');
    expect(loaded.toString('utf-8')).toBe('memory');
  });
});
