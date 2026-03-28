'use client';

import { useState, useCallback } from 'react';
import { PageView } from './PageView';
import { PageTurn } from './PageTurn';
import { TextOverlay } from './TextOverlay';
import { AudioPlayer } from './AudioPlayer';
import clsx from 'clsx';
import type { Book, Page } from '@/types/book';

type BookReaderProps = {
  book: Book;
  onSaveEdit?: (book: Book) => void;
};

export const BookReader = ({ book, onSaveEdit }: BookReaderProps) => {
  const [pageIndex, setPageIndex] = useState(0);
  const [nightMode, setNightMode] = useState(false);
  const [pages, setPages] = useState<Page[]>(book.pages);

  const currentPage = pages[pageIndex];
  const language = book.language;

  const handleNext = useCallback(() => {
    setPageIndex((i) => Math.min(pages.length - 1, i + 1));
  }, [pages.length]);

  const handlePrev = useCallback(() => {
    setPageIndex((i) => Math.max(0, i - 1));
  }, []);

  const handleTextChange = useCallback(
    (newText: { en?: string; de?: string }) => {
      const updated = pages.map((p, i) =>
        i === pageIndex ? { ...p, text: newText } : p,
      );
      setPages(updated);
      if (onSaveEdit) {
        onSaveEdit({ ...book, pages: updated });
      }
    },
    [pages, pageIndex, book, onSaveEdit],
  );

  const toggleNightMode = useCallback(() => {
    setNightMode((n) => !n);
  }, []);

  if (!currentPage) return null;

  return (
    <div
      className={clsx(
        'mx-auto flex w-full max-w-2xl flex-col gap-4 rounded-2xl p-4 transition-colors sm:p-6',
        nightMode ? 'bg-slate-900' : 'bg-slate-50',
      )}
      data-testid="book-reader"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <h2
          className={clsx(
            'text-sm font-semibold truncate',
            nightMode ? 'text-slate-200' : 'text-slate-700',
          )}
          data-testid="book-title"
        >
          {book.config.childName}&apos;s Story
        </h2>
        <button
          onClick={toggleNightMode}
          className={clsx(
            'rounded-lg px-3 py-1.5 text-xs transition-colors',
            nightMode
              ? 'bg-slate-700 text-yellow-300 hover:bg-slate-600'
              : 'bg-slate-200 text-slate-600 hover:bg-slate-300',
          )}
          data-testid="night-mode-toggle"
        >
          {nightMode ? '\u2600 Day' : '\u{1F319} Night'}
        </button>
      </div>

      {/* Page turn with illustration */}
      <PageTurn
        pageIndex={pageIndex}
        totalPages={pages.length}
        onNext={handleNext}
        onPrev={handlePrev}
      >
        <PageView
          imageUrl={currentPage.imageUrl}
          pageNumber={currentPage.pageNumber}
          alt={`Page ${currentPage.pageNumber} illustration`}
          nightMode={nightMode}
        />
      </PageTurn>

      {/* Text overlay */}
      <TextOverlay
        text={currentPage.text}
        language={language}
        nightMode={nightMode}
        editable
        onTextChange={handleTextChange}
      />

      {/* Audio player */}
      <AudioPlayer audioUrl={currentPage.audioUrl} nightMode={nightMode} />

      {/* Thumbnail strip */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 sm:gap-2">
        {pages.map((p, i) => (
          <button
            key={p.pageNumber}
            onClick={() => setPageIndex(i)}
            className={clsx(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs transition-all sm:h-12 sm:w-12',
              i === pageIndex
                ? 'ring-2 ring-brand-primary'
                : 'opacity-50 hover:opacity-80',
              nightMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600',
            )}
            data-testid={`thumb-${p.pageNumber}`}
          >
            {p.pageNumber}
          </button>
        ))}
      </div>
    </div>
  );
};
