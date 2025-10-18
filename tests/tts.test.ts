import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { promises as fs } from "fs";
import path from "path";
import { tmpdir } from "os";

type TTSModule = typeof import("@/lib/ai/tts");
type StorageModule = typeof import("@/lib/storage");

describe("ai tts helpers", () => {
  let tmpDir: string;
  let tts: TTSModule;
  let storage: StorageModule;

  const loadModules = async () => {
    vi.resetModules();
    vi.spyOn(process, "cwd").mockReturnValue(tmpDir);
    [tts, storage] = await Promise.all([
      import("@/lib/ai/tts"),
      import("@/lib/storage")
    ]);
  };

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(tmpdir(), "bedtime-tts-"));
    await loadModules();
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it("writes silent audio bytes to disk", async () => {
    const filePath = path.join(tmpDir, "public", "generated", "book", "p1.mp3");
    const returnedPath = await tts.synthesize({
      filePath,
      text: "calm narration",
      language: "en",
      voice: "lullaby"
    });

    const audio = await fs.readFile(filePath);
    expect(returnedPath).toBe(filePath);
    expect(audio.length).toBeGreaterThan(0);
  });

  it("creates a TTS asset and returns the public url", async () => {
    const result = await tts.createTTSAsset({
      bookId: "storybook",
      pageNo: 4,
      text: "soft bedtime words",
      language: "en",
      voice: "soft"
    });

    const expectedPath = storage.getPublicAssetPath("storybook", "p4.mp3");
    const audio = await fs.readFile(expectedPath);

    expect(result.audioUrl).toBe("/generated/storybook/p4.mp3");
    expect(audio.length).toBeGreaterThan(0);
  });
});
