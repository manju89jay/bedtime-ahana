'use client';

import Link from 'next/link';
import clsx from 'clsx';
import type { Book } from '@/types/book';

type BookshelfProps = {
  books: Book[];
};

export const Bookshelf = ({ books }: BookshelfProps) => {
  if (books.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16" data-testid="bookshelf-empty">
        <p className="text-lg text-slate-400">No books yet</p>
        <Link
          href="/create"
          className="rounded-lg bg-brand-primary px-6 py-2.5 text-sm font-medium text-white no-underline shadow-sm hover:bg-brand-primary/90"
        >
          Create your first book
        </Link>
      </div>
    );
  }

  return (
    <div
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      data-testid="bookshelf"
    >
      {books.map((book) => (
        <Link
          key={book.id}
          href={`/reader/${book.id}`}
          className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white no-underline shadow-sm transition-shadow hover:shadow-md"
          data-testid={`book-card-${book.id}`}
        >
          {/* Cover image: use first page or gradient */}
          {book.pages[0]?.imageUrl ? (
            <img
              src={book.pages[0].imageUrl}
              alt={`Cover of ${book.config.childName}'s book`}
              className="h-40 w-full object-cover"
            />
          ) : (
            <div
              className={clsx(
                'flex h-40 items-center justify-center',
                'bg-gradient-to-br from-brand-primary to-brand-secondary',
              )}
            >
              <span className="text-3xl text-white/80">&#x1F4D6;</span>
            </div>
          )}

          <div className="flex flex-1 flex-col gap-1 p-4">
            <p className="font-medium text-slate-800 group-hover:text-brand-primary">
              {book.config.childName}&apos;s Adventure
            </p>
            <p className="text-xs text-slate-400">
              {book.templateId} &middot; {book.pages.length} pages &middot;{' '}
              {book.language === 'bilingual' ? 'EN/DE' : book.language.toUpperCase()}
            </p>
            <p className="text-xs text-slate-300">
              {new Date(book.createdAt).toLocaleDateString()}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
};
