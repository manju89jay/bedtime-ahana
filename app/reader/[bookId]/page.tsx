import { notFound } from "next/navigation";
import { ReaderNav } from "@/components/ReaderNav";
import { loadBook, saveBook, getPublicAssetPath, getPublicAssetUrl } from "@/lib/storage";
import type { Book } from "@/types/book";
import { promises as fs } from "fs";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function ReaderPage({ params }: { params: { bookId: string } }) {
  const book = await loadBook(params.bookId);
  if (!book) {
    notFound();
  }

  async function persist(updated: Book) {
    "use server";
    await saveBook(updated);
  }

  async function exportPdf(pdfBase64: string) {
    "use server";
    const filePath = getPublicAssetPath(book!.bookId, "book.pdf");
    const pdfBytes = Uint8Array.from(Buffer.from(pdfBase64, "base64"));
    await fs.writeFile(filePath, pdfBytes);
    return getPublicAssetUrl(book!.bookId, "book.pdf");
  }

  async function regeneratePage(pageNo: number): Promise<Book> {
    "use server";
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/generate/page`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId: book!.bookId, pageNo })
      }
    );
    if (!res.ok) {
      throw new Error("Page regeneration failed");
    }
    const data = await res.json();
    return data.book;
  }

  return (
    <ReaderNav
      initialBook={book}
      onPersist={persist}
      onExport={exportPdf}
      onRegeneratePage={regeneratePage}
    />
  );
}
