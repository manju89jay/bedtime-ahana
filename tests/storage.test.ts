import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { promises as fs } from "fs";
import path from "path";
import { tmpdir } from "os";
import type { Book } from "@/types/book";

type StorageModule = typeof import("@/lib/storage");

describe("storage", () => {
  let tmpDir: string;
  let storage: StorageModule;

  const createBook = (overrides: Partial<Book> = {}): Book => ({
    bookId: overrides.bookId ?? "book-1",
    title: overrides.title ?? "Test Story",
    language: overrides.language ?? "en",
    characters: overrides.characters ?? [
      {
        name: "Ahana",
        age: 5,
        home: "Ulm",
        traits: ["curious"],
        visualStyle: "soft"
      }
    ],
    pages: overrides.pages ?? [
      {
        pageNo: 1,
        text: "Sample text",
        imagePrompt: "Prompt",
        imageUrl: "/generated/book-1/p1.svg"
      }
    ],
    createdAt: overrides.createdAt ?? new Date().toISOString(),
    updatedAt: overrides.updatedAt ?? new Date().toISOString(),
    moral: overrides.moral
  });

  const loadStorageModule = async () => {
    vi.resetModules();
    vi.spyOn(process, "cwd").mockReturnValue(tmpDir);
    storage = await import("@/lib/storage");
  };

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(tmpdir(), "bedtime-storage-"));
    await loadStorageModule();
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it("ensures directories and persists a book", async () => {
    const book = createBook();
    await storage.ensureBookDirs(book.bookId);

    await expect(fs.stat(path.join(tmpDir, "data", "books"))).resolves.toBeDefined();
    await expect(
      fs.stat(path.join(tmpDir, "public", "generated", book.bookId))
    ).resolves.toBeDefined();

    await storage.saveBook(book);
    const loaded = await storage.loadBook(book.bookId);
    expect(loaded).toEqual(book);
  });

  it("returns null when a book file is missing", async () => {
    const result = await storage.loadBook("does-not-exist");
    expect(result).toBeNull();
  });

  it("rethrows unexpected filesystem errors", async () => {
    const error = Object.assign(new Error("boom"), { code: "EACCES" });
    const spy = vi.spyOn(fs, "readFile").mockRejectedValue(error);
    await expect(storage.loadBook("broken"))
      .rejects.toBe(error);
    spy.mockRestore();
  });

  it("lists books sorted by updated date and skips invalid files", async () => {
    const newer = createBook({
      bookId: "newer",
      updatedAt: new Date(2024, 0, 2).toISOString()
    });
    const older = createBook({
      bookId: "older",
      updatedAt: new Date(2024, 0, 1).toISOString()
    });

    await storage.saveBook(older);
    await storage.saveBook(newer);

    const invalidPath = path.join(tmpDir, "data", "books", "invalid.json");
    await fs.writeFile(invalidPath, "not json", "utf-8");
    const ignoredPath = path.join(tmpDir, "data", "books", "notes.txt");
    await fs.writeFile(ignoredPath, "ignore me", "utf-8");

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const books = await storage.listBooks();

    expect(books.map((book) => book.bookId)).toEqual(["newer", "older"]);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0][0]).toContain("Skipping invalid book file invalid.json");
  });

  it("builds public asset paths and urls", () => {
    const assetPath = storage.getPublicAssetPath("abc", "p1.svg");
    const assetUrl = storage.getPublicAssetUrl("abc", "p1.svg");

    expect(assetPath).toBe(path.join(tmpDir, "public", "generated", "abc", "p1.svg"));
    expect(assetUrl).toBe("/generated/abc/p1.svg");
  });
});
