import { NextResponse } from "next/server";
import { getPublicAssetPath, getPublicAssetUrl, ensureBookDirs } from "@/lib/storage";
import { promises as fs } from "fs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { bookId, pdfBase64 } = await request.json();
  await ensureBookDirs(bookId);
  const filePath = getPublicAssetPath(bookId, "book.pdf");
  await fs.writeFile(filePath, Buffer.from(pdfBase64, "base64"));
  return NextResponse.json({ pdfUrl: getPublicAssetUrl(bookId, "book.pdf") });
}
