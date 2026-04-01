'use client';

import { useEffect, useState, useRef } from 'react';

type Props = {
  onGenerate: () => Promise<string>;
  onComplete: (bookId: string) => void;
  onError: (error: string) => void;
};

const PHASES = [
  { threshold: 0, label: 'Writing the story\u2026', detail: 'Crafting 24 pages of personalized text' },
  { threshold: 30, label: 'Painting the illustrations\u2026', detail: 'Creating unique artwork for every page' },
  { threshold: 180, label: 'Adding finishing touches\u2026', detail: 'Polishing your book for the reader' },
];

export const GenerateStep = ({ onGenerate, onComplete, onError }: Props) => {
  const [status, setStatus] = useState<'generating' | 'done' | 'error'>('generating');
  const [elapsed, setElapsed] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const startedRef = useRef(false);

  // Elapsed time counter
  useEffect(() => {
    if (status !== 'generating') return;
    const interval = setInterval(() => {
      setElapsed((e) => e + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [status]);

  // Trigger generation
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    onGenerate()
      .then((bookId) => {
        setStatus('done');
        setTimeout(() => onComplete(bookId), 800);
      })
      .catch((err) => {
        setStatus('error');
        const msg = err instanceof Error ? err.message : 'Generation failed';
        setErrorMsg(msg);
        onError(msg);
      });
  }, [onGenerate, onComplete, onError]);

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  const timeStr = minutes > 0
    ? `${minutes}m ${seconds.toString().padStart(2, '0')}s`
    : `${seconds}s`;

  const currentPhase = [...PHASES].reverse().find((p) => elapsed >= p.threshold) || PHASES[0];

  return (
    <div className="flex flex-col items-center gap-8 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-warm-200/60 sm:p-12" data-testid="generate-step">
      {status === 'generating' && (
        <>
          {/* Animated book icon */}
          <div className="relative">
            <div className="h-16 w-16 animate-spin rounded-full border-[3px] border-warm-200 border-t-brand-primary" />
            <span className="absolute inset-0 flex items-center justify-center text-2xl">
              &#x1F4D6;
            </span>
          </div>

          <div className="text-center">
            <h3 className="font-serif text-xl font-semibold text-warm-800">{currentPhase.label}</h3>
            <p className="mt-1.5 text-sm text-warm-400">
              {currentPhase.detail}
            </p>
            <p className="mt-4 font-mono text-3xl font-light tracking-wide text-brand-primary" data-testid="elapsed-time">
              {timeStr}
            </p>
          </div>

          {/* Progress bar */}
          <div className="w-full max-w-xs">
            <div className="h-1 overflow-hidden rounded-full bg-warm-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-primary to-brand-accent transition-all duration-1000"
                style={{ width: `${Math.min(95, (elapsed / 300) * 100)}%` }}
              />
            </div>
          </div>

          {/* Tip */}
          <p className="max-w-sm text-center text-xs leading-relaxed text-warm-400">
            This usually takes 2&ndash;5 minutes. We&apos;re crafting something special &mdash; sit tight!
          </p>
        </>
      )}

      {status === 'done' && (
        <>
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-3xl text-emerald-600 ring-4 ring-emerald-100">
            &#10003;
          </div>
          <div className="text-center">
            <h3 className="font-serif text-xl font-semibold text-warm-800">Your story is ready!</h3>
            <p className="mt-1.5 text-sm text-warm-400">Opening the reader for you&hellip;</p>
          </div>
        </>
      )}

      {status === 'error' && (
        <>
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-3xl text-red-500 ring-4 ring-red-100">
            !
          </div>
          <div className="text-center">
            <h3 className="font-serif text-lg font-semibold text-red-700">Something went wrong</h3>
            <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600" data-testid="generate-error">
              {errorMsg}
            </p>
            <p className="mt-3 text-xs text-warm-400">
              Please try again. If the issue persists, contact support.
            </p>
          </div>
        </>
      )}
    </div>
  );
};
