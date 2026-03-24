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

  it("creates placeholder images with escaped special characters", async () => {
    const result = await image.writePlaceholderImage({
      pageNo: 1,
      imageDescription: "<calm & cozy>",
      childName: "Ahana",
      childAge: 5,
      bookId: "book-1"
    });

    const filePath = storage.getPublicAssetPath("book-1", "p1.svg");
    const contents = await fs.readFile(filePath, "utf-8");
    expect(contents).toContain("&lt;calm &amp; cozy&gt;");
    expect(result.imageUrl).toBe("/generated/book-1/p1.svg");
  });

  it("creates placeholder assets and returns the public url", async () => {
    const { prompt, imageUrl } = await image.writePlaceholderImage({
      bookId: "storybook",
      pageNo: 2,
      imageDescription: "sitting quietly in a garden",
      childName: "Ahana",
      childAge: 4
    });

    const expectedPath = storage.getPublicAssetPath("storybook", "p2.svg");
    const fileExists = await fs.readFile(expectedPath, "utf-8");

    expect(prompt).toContain("sitting quietly in a garden");
    expect(imageUrl).toBe("/generated/storybook/p2.svg");
    expect(fileExists.length).toBeGreaterThan(0);
  });
});
