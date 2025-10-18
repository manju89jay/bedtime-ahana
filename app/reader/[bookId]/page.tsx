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

  return <ReaderNav initialBook={book} onPersist={persist} onExport={exportPdf} />;
}
