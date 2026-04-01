import { promises as fs } from 'fs';
import path from 'path';

export type StorageBackend = {
  save: (key: string, data: Buffer) => Promise<string>;
  load: (key: string) => Promise<Buffer>;
  exists: (key: string) => Promise<boolean>;
  delete: (key: string) => Promise<void>;
  getUrl: (key: string) => string;
};

function createFilesystemBackend(baseDir: string, urlPrefix: string): StorageBackend {
  return {
    async save(key: string, data: Buffer): Promise<string> {
      const filePath = path.join(baseDir, key);
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, new Uint8Array(data));
      return `${urlPrefix}/${key}`;
    },
    async load(key: string): Promise<Buffer> {
      const filePath = path.join(baseDir, key);
      return fs.readFile(filePath);
    },
    async exists(key: string): Promise<boolean> {
      try {
        await fs.access(path.join(baseDir, key));
        return true;
      } catch {
        return false;
      }
    },
    async delete(key: string): Promise<void> {
      try {
        await fs.unlink(path.join(baseDir, key));
      } catch {
        // ignore missing files
      }
    },
    getUrl(key: string): string {
      return `${urlPrefix}/${key}`;
    },
  };
}

const PUBLIC_DIR = path.join(process.cwd(), 'public', 'generated');
const URL_PREFIX = '/generated';

let _backend: StorageBackend | null = null;

export function getStorageBackend(): StorageBackend {
  if (!_backend) {
    _backend = createFilesystemBackend(PUBLIC_DIR, URL_PREFIX);
  }
  return _backend;
}

export function setStorageBackend(backend: StorageBackend): void {
  _backend = backend;
}

export async function saveAsset(key: string, data: Buffer): Promise<string> {
  return getStorageBackend().save(key, data);
}

export async function loadAsset(key: string): Promise<Buffer> {
  return getStorageBackend().load(key);
}

export async function assetExists(key: string): Promise<boolean> {
  return getStorageBackend().exists(key);
}

export async function deleteAsset(key: string): Promise<void> {
  return getStorageBackend().delete(key);
}

export function getAssetUrl(key: string): string {
  return getStorageBackend().getUrl(key);
}

export { createFilesystemBackend };
