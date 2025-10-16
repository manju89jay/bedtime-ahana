import { describe, expect, it, afterAll } from "vitest";
import { loadBook, saveBook, ensureBookDirs, getPublicAssetPath } from "@/lib/storage";
import type { Book } from "@/types/book";
import { promises as fs } from "fs";

const SAMPLE_BOOK: Book = {
  bookId: "test-book",
  title: "Test Story",
  language: "en",
  characters: [
    {
      name: "Ahana",
      age: 5,
      home: "Ulm",
      traits: ["curious"],
      visualStyle: "soft"
    }
  ],
  pages: [
    {
      pageNo: 1,
      text: "Sample text",
      imagePrompt: "Prompt",
      imageUrl: "/generated/test-book/p1.svg"
    }
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

describe("storage", () => {
  afterAll(async () => {
    const path = getPublicAssetPath(SAMPLE_BOOK.bookId, "book.pdf");
    await fs.rm(path, { force: true });
    await fs.rm(`data/books/${SAMPLE_BOOK.bookId}.json`, { force: true });
  });

  it("saves and loads a book", async () => {
    await ensureBookDirs(SAMPLE_BOOK.bookId);
    await saveBook(SAMPLE_BOOK);
    const loaded = await loadBook(SAMPLE_BOOK.bookId);
    expect(loaded).not.toBeNull();
    expect(loaded?.title).toBe(SAMPLE_BOOK.title);
  });
});
