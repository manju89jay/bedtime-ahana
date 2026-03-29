'use client';

import { useEffect, useState, useRef } from 'react';

type Props = {
  onGenerate: () => Promise<string>;
  onComplete: (bookId: string) => void;
  onError: (error: string) => void;
};

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

  return (
    <div className="flex flex-col items-center gap-6 rounded-xl border border-slate-200 bg-white p-8 shadow-sm" data-testid="generate-step">
      {status === 'generating' && (
        <>
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" />
          <div className="text-center">
            <h3 className="text-lg font-semibold text-slate-700">Creating your book...</h3>
            <p className="mt-1 text-sm text-slate-400">
              AI is writing text and generating illustrations.
            </p>
            <p className="mt-3 text-2xl font-mono text-brand-primary" data-testid="elapsed-time">
              {timeStr}
            </p>
            <p className="mt-2 text-xs text-slate-400">
              This typically takes 2-5 minutes. Please don&apos;t close or reload this page.
            </p>
          </div>
          <div className="w-full max-w-xs">
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-brand-primary transition-all duration-1000"
                style={{ width: `${Math.min(95, (elapsed / 300) * 100)}%` }}
              />
            </div>
          </div>
        </>
      )}

      {status === 'done' && (
        <>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-2xl text-green-600">
            &#10003;
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-slate-700">Book is ready!</h3>
            <p className="mt-1 text-sm text-slate-400">Redirecting to reader...</p>
          </div>
        </>
      )}

      {status === 'error' && (
        <>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-2xl text-red-600">
            !
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-red-700">Generation failed</h3>
            <p className="mt-2 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600" data-testid="generate-error">
              {errorMsg}
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Check the terminal for detailed error logs.
            </p>
          </div>
        </>
      )}
    </div>
  );
};
