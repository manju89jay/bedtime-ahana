import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { promises as fs } from "fs";
import path from "path";
import { tmpdir } from "os";

type ImageModule = typeof import("@/lib/ai/image");
type StorageModule = typeof import("@/lib/storage");

const fakeB64 = Buffer.from("fake-png-data").toString("base64");

// Mock the OpenAI client to return base64 (GPT Image format)
vi.mock("@/lib/ai/imageClient", () => ({
  getOpenAIClient: () => ({
    images: {
      generate: vi.fn().mockResolvedValue({
        data: [{ b64_json: fakeB64 }]
      })
    }
  }),
  getImageModel: () => "gpt-image-1.5",
}));

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

  it("generates a cover image SVG", async () => {
    const result = await image.generateCoverImage({
      title: "Ahana's Dream",
      childName: "Ahana",
      childAge: 4,
      bookId: "book-cover"
    });

    expect(result.imageUrl).toBe("/generated/book-cover/cover.svg");
    const filePath = storage.getPublicAssetPath("book-cover", "cover.svg");
    const contents = await fs.readFile(filePath, "utf-8");
    expect(contents).toContain("Ahana");
    expect(contents).toContain("bedtime story");
  });

  it("generates real image via GPT Image and saves locally", async () => {
    const result = await image.generateImage({
      pageNo: 3,
      imageDescription: "A child playing in the garden",
      childName: "Ahana",
      childAge: 4,
      bookId: "book-real"
    });

    expect(result.prompt).toContain("A child playing in the garden");
    expect(result.imageUrl).toBe("/generated/book-real/p3.png");

    const filePath = storage.getPublicAssetPath("book-real", "p3.png");
    const savedFile = await fs.readFile(filePath);
    expect(savedFile.toString()).toBe("fake-png-data");
  });

  it("falls back to placeholder when GPT Image returns no data", async () => {
    vi.doMock("@/lib/ai/imageClient", () => ({
      getOpenAIClient: () => ({
        images: {
          generate: vi.fn().mockResolvedValue({ data: [{}] })
        }
      }),
      getImageModel: () => "gpt-image-1.5",
    }));
    vi.resetModules();
    vi.spyOn(process, "cwd").mockReturnValue(tmpDir);
    const freshImage = await import("@/lib/ai/image");

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const result = await freshImage.generateImage({
      pageNo: 2,
      imageDescription: "Empty response",
      childName: "Ahana",
      childAge: 4,
      bookId: "book-nodata"
    });
    expect(result.imageUrl).toBe("/generated/book-nodata/p2.svg");
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it("falls back to placeholder when GPT Image fails", async () => {
    vi.doMock("@/lib/ai/imageClient", () => ({
      getOpenAIClient: () => ({
        images: {
          generate: vi.fn().mockRejectedValue(new Error("API error"))
        }
      }),
      getImageModel: () => "gpt-image-1.5",
    }));

    vi.resetModules();
    vi.spyOn(process, "cwd").mockReturnValue(tmpDir);
    const freshImage = await import("@/lib/ai/image");

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const result = await freshImage.generateImage({
      pageNo: 1,
      imageDescription: "A cozy scene",
      childName: "Ahana",
      childAge: 4,
      bookId: "book-fallback"
    });

    expect(result.imageUrl).toBe("/generated/book-fallback/p1.svg");
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});
