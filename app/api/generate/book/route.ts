import { NextResponse } from 'next/server';
import { z } from 'zod';
import { StoryConfigSchema } from '@/lib/validation/template';
import { generateBook } from '@/lib/services/book-service';
import { promises as fs } from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes for DALL-E generation

const BookRequestSchema = z.object({
  config: StoryConfigSchema,
  templateId: z.string().min(1),
  childProfileId: z.string().min(1),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = BookRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const result = await generateBook(
      parsed.data.config,
      parsed.data.templateId,
      parsed.data.childProfileId,
    );

    // Save book JSON to data/books/
    const booksDir = path.join(process.cwd(), 'data', 'books');
    await fs.mkdir(booksDir, { recursive: true });
    const bookPath = path.join(booksDir, `${result.book.id}.json`);
    await fs.writeFile(bookPath, JSON.stringify(result.book, null, 2), 'utf-8');

    return NextResponse.json({
      bookId: result.book.id,
      status: result.book.status,
      pageCount: result.book.pages.length,
      compliancePassed: result.complianceCheck.passed,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Book generation failed';
    console.error('Book generation failed:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
