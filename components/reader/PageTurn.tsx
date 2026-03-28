'use client';

import { ReactNode, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type PageTurnProps = {
  pageIndex: number;
  totalPages: number;
  onNext: () => void;
  onPrev: () => void;
  children: ReactNode;
};

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

export const PageTurn = ({ pageIndex, totalPages, onNext, onPrev, children }: PageTurnProps) => {
  const directionRef = useRef(0);
  const touchStartX = useRef(0);

  const handleNext = useCallback(() => {
    if (pageIndex < totalPages - 1) {
      directionRef.current = 1;
      onNext();
    }
  }, [pageIndex, totalPages, onNext]);

  const handlePrev = useCallback(() => {
    if (pageIndex > 0) {
      directionRef.current = -1;
      onPrev();
    }
  }, [pageIndex, onPrev]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    },
    [handleNext, handlePrev],
  );

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const delta = e.changedTouches[0].clientX - touchStartX.current;
      if (delta < -50) handleNext();
      if (delta > 50) handlePrev();
    },
    [handleNext, handlePrev],
  );

  return (
    <div
      className="relative w-full"
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      tabIndex={0}
      data-testid="page-turn"
    >
      <AnimatePresence mode="wait" custom={directionRef.current}>
        <motion.div
          key={pageIndex}
          custom={directionRef.current}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.25, ease: 'easeInOut' }}
        >
          {children}
        </motion.div>
      </AnimatePresence>

      {/* Arrow buttons */}
      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={handlePrev}
          disabled={pageIndex === 0}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm transition-colors hover:bg-slate-50 disabled:opacity-30"
          data-testid="prev-button"
        >
          &larr; Prev
        </button>
        <span className="text-xs text-slate-400" data-testid="page-indicator">
          {pageIndex + 1} / {totalPages}
        </span>
        <button
          onClick={handleNext}
          disabled={pageIndex === totalPages - 1}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm transition-colors hover:bg-slate-50 disabled:opacity-30"
          data-testid="next-button"
        >
          Next &rarr;
        </button>
      </div>
    </div>
  );
};
