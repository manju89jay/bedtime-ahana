import { notFound } from 'next/navigation';
import { BookReader } from '@/components/reader/BookReader';
import type { Book } from '@/types/book';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function loadBookById(bookId: string): Promise<Book | null> {
  // Read from the data/books directory
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

export default async function ReaderPage({ params }: { params: { bookId: string } }) {
  const book = await loadBookById(params.bookId);
  if (!book) {
    notFound();
  }

  return (
    <div className="py-4">
      <BookReader book={book} />
    </div>
  );
}
