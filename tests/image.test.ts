import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { promises as fs } from "fs";
import path from "path";
import { tmpdir } from "os";

type ImageModule = typeof import("@/lib/ai/image");
type StorageModule = typeof import("@/lib/storage");

describe("ai image helpers", () => {
  let tmpDir: string;
  let image: ImageModule;
  let storage: StorageModule;

  const loadModules = async () => {
    vi.resetModules();
    vi.spyOn(process, "cwd").mockReturnValue(tmpDir);
    [image, storage] = await Promise.all([
      import("@/lib/ai/image"),
      import("@/lib/storage")
    ]);
  };

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(tmpdir(), "bedtime-image-"));
    await loadModules();
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it("replaces placeholders in generated prompts", () => {
    const { prompt, negative } = image.generateImagePrompt({
      pageNo: 3,
      characterVisuals: "Ahana wearing a blue sweater",
      sceneSummary: "walking through the market",
      bookId: "book-123"
    });

    expect(prompt).toContain("page 3");
    expect(prompt).toContain("Ahana wearing a blue sweater");
    expect(prompt).toContain("walking through the market");
    expect(negative).toContain("known-franchise look-alikes");
  });

  it("escapes special characters when writing placeholder images", async () => {
    const filePath = path.join(tmpDir, "public", "generated", "book-1", "p1.svg");
    await image.writePlaceholderImage({ filePath, prompt: "<calm & cozy>" });

    const contents = await fs.readFile(filePath, "utf-8");
    expect(contents).toContain("&lt;calm &amp; cozy>");
  });

  it("creates placeholder assets and returns the public url", async () => {
    const { prompt, imageUrl } = await image.createImageAsset({
      bookId: "storybook",
      pageNo: 2,
      characterVisuals: "soft pastels",
      sceneSummary: "sitting quietly"
    });

    const expectedPath = storage.getPublicAssetPath("storybook", "p2.svg");
    const fileExists = await fs.readFile(expectedPath, "utf-8");

    expect(prompt).toContain("page 2");
    expect(imageUrl).toBe("/generated/storybook/p2.svg");
    expect(fileExists.length).toBeGreaterThan(0);
  });
});
