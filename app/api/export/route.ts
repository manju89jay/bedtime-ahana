import { NextResponse } from "next/server";
import { getPublicAssetPath, getPublicAssetUrl, ensureBookDirs } from "@/lib/storage";
import { promises as fs } from "fs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { bookId, pdfBase64 } = await request.json();
  await ensureBookDirs(bookId);
  const filePath = getPublicAssetPath(bookId, "book.pdf");
  const pdfBytes = Uint8Array.from(Buffer.from(pdfBase64, "base64"));
  await fs.writeFile(filePath, pdfBytes);
  return NextResponse.json({ pdfUrl: getPublicAssetUrl(bookId, "book.pdf") });
}
