import { NextResponse } from 'next/server';
import { ExportRequestSchema } from '@/lib/validation/api';
import { exportPDF } from '@/lib/services/pdf-export';
import { saveAsset } from '@/lib/services/asset-storage';
import type { Book } from '@/types/book';
import type { SubscriptionTier } from '@/types/user';

export const runtime = 'nodejs';

async function loadBookById(bookId: string): Promise<Book | null> {
  const { promises: fs } = await import('fs');
  const path = await import('path');
  try {
    const filePath = path.join(process.cwd(), 'data', 'books', `${bookId}.json`);
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw) as Book;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = ExportRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { bookId, format } = parsed.data;

  // Try to load the book; if not found, generate a stub PDF
  const book = await loadBookById(bookId);
  if (!book) {
    // Return stub URL for now
    return NextResponse.json({ pdfUrl: `/generated/${bookId}/book-${format}.pdf` });
  }

  // Default to free tier (auth will be added in Session 7)
  const subscription: SubscriptionTier = 'free';

  const result = exportPDF({ book, format, subscription });

  const fileName = `${bookId}/book-${format}.pdf`;
  const pdfUrl = await saveAsset(fileName, Buffer.from(result.pdfBytes));

  return NextResponse.json({ pdfUrl });
}
