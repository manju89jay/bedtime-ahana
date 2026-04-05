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
      <div className="flex flex-col items-center gap-5 rounded-3xl bg-white px-8 py-16 ring-1 ring-warm-200/60" data-testid="bookshelf-empty">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-primary/10">
          <span className="text-2xl">&#x1F4D6;</span>
        </div>
        <div className="text-center">
          <p className="font-serif text-lg font-semibold text-warm-700">Your library is empty</p>
          <p className="mt-1 text-sm text-warm-400">Create your first personalized story</p>
        </div>
        <Link
          href="/create"
          className="rounded-full bg-brand-primary px-6 py-2.5 text-sm font-medium text-white no-underline shadow-sm hover:bg-brand-primary/90 hover:shadow-md"
        >
          Create Your First Story
        </Link>
      </div>
    );
  }

  return (
    <div
      className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
      data-testid="bookshelf"
    >
      {books.map((book) => (
        <Link
          key={book.id}
          href={`/reader/${book.id}`}
          className="group flex flex-col overflow-hidden rounded-2xl bg-white no-underline shadow-sm ring-1 ring-warm-200/60 transition-all hover:shadow-md"
          data-testid={`book-card-${book.id}`}
        >
          {/* Cover image: use first page or gradient */}
          {book.pages[0]?.imageUrl ? (
            <img
              src={book.pages[0].imageUrl}
              alt={`Cover of ${book.config.childName}'s book`}
              className="h-44 w-full object-cover"
            />
          ) : (
            <div
              className={clsx(
                'flex h-44 items-center justify-center',
                'bg-gradient-to-br from-brand-primary to-brand-accent/40',
              )}
            >
              <span className="text-4xl text-white/70">&#x1F4D6;</span>
            </div>
          )}

          <div className="flex flex-1 flex-col gap-1.5 p-5">
            <p className="font-serif font-semibold text-warm-800 group-hover:text-brand-primary">
              {book.config.childName}&apos;s Adventure
            </p>
            <p className="text-xs text-warm-500">
              {book.templateId} &middot; {book.pages.length} pages &middot;{' '}
              {book.language === 'bilingual' ? 'EN/DE' : book.language.toUpperCase()}
            </p>
            <p className="text-xs text-warm-400">
              {new Date(book.createdAt).toLocaleDateString()}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
};
