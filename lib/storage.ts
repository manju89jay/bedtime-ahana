import { promises as fs } from "fs";
import path from "path";
import type { Book } from "@/types/book";

const DATA_DIR = path.join(process.cwd(), "data");
const BOOKS_DIR = path.join(DATA_DIR, "books");
const PUBLIC_DIR = path.join(process.cwd(), "public", "generated");

export async function ensureBookDirs(bookId: string) {
  await fs.mkdir(BOOKS_DIR, { recursive: true });
  await fs.mkdir(path.join(PUBLIC_DIR, bookId), { recursive: true });
}

export async function saveBook(book: Book) {
  await ensureBookDirs(book.bookId);
  const filePath = path.join(BOOKS_DIR, `${book.bookId}.json`);
  const json = JSON.stringify(book, null, 2);
  await fs.writeFile(filePath, json, "utf-8");
}

export async function loadBook(bookId: string): Promise<Book | null> {
  try {
    const filePath = path.join(BOOKS_DIR, `${bookId}.json`);
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as Book;
  } catch (error: any) {
    if (error.code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

export async function listBooks(): Promise<Book[]> {
  await fs.mkdir(BOOKS_DIR, { recursive: true });
  const files = await fs.readdir(BOOKS_DIR);
  const books: Book[] = [];
  for (const file of files) {
    if (!file.endsWith(".json")) continue;
    const raw = await fs.readFile(path.join(BOOKS_DIR, file), "utf-8");
    try {
      const book = JSON.parse(raw) as Book;
      books.push(book);
    } catch (error) {
      console.warn(`Skipping invalid book file ${file}`, error);
    }
  }
  return books.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export function getPublicAssetPath(bookId: string, fileName: string) {
  return path.join(PUBLIC_DIR, bookId, fileName);
}

export function getPublicAssetUrl(bookId: string, fileName: string) {
  return `/generated/${bookId}/${fileName}`;
}
