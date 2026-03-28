'use client';

import { useEffect, useState } from 'react';

type ProgressStep = {
  label: string;
  status: 'pending' | 'active' | 'done' | 'error';
};

type Props = {
  onGenerate: () => Promise<string>;
  onComplete: (bookId: string) => void;
  onError: (error: string) => void;
};

const STEPS: ProgressStep[] = [
  { label: 'Creating outline...', status: 'pending' },
  { label: 'Writing page text...', status: 'pending' },
  { label: 'Generating illustrations...', status: 'pending' },
  { label: 'Running compliance check...', status: 'pending' },
  { label: 'Assembling your book...', status: 'pending' },
];

export const GenerateStep = ({ onGenerate, onComplete, onError }: Props) => {
  const [steps, setSteps] = useState<ProgressStep[]>(STEPS);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (started) return;
    setStarted(true);

    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < STEPS.length) {
        setSteps((prev) =>
          prev.map((s, i) => ({
            ...s,
            status: i < stepIndex ? 'done' : i === stepIndex ? 'active' : 'pending',
          })),
        );
        stepIndex++;
      }
    }, 400);

    onGenerate()
      .then((bookId) => {
        clearInterval(interval);
        setSteps((prev) => prev.map((s) => ({ ...s, status: 'done' })));
        setTimeout(() => onComplete(bookId), 600);
      })
      .catch((err) => {
        clearInterval(interval);
        setSteps((prev) =>
          prev.map((s) => ({
            ...s,
            status: s.status === 'active' ? 'error' : s.status === 'pending' ? 'pending' : s.status,
          })),
        );
        onError(err instanceof Error ? err.message : 'Generation failed');
      });
  }, [started, onGenerate, onComplete, onError]);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm" data-testid="generate-step">
      <h3 className="text-lg font-semibold text-slate-700">Creating your book...</h3>
      <div className="flex flex-col gap-2">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-3 text-sm">
            {step.status === 'done' && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-xs text-green-600">&#10003;</span>
            )}
            {step.status === 'active' && (
              <span className="flex h-5 w-5 items-center justify-center">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
              </span>
            )}
            {step.status === 'error' && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-xs text-red-600">!</span>
            )}
            {step.status === 'pending' && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-xs text-slate-400">{i + 1}</span>
            )}
            <span
              className={
                step.status === 'active' ? 'font-medium text-brand-primary'
                  : step.status === 'done' ? 'text-slate-500'
                    : step.status === 'error' ? 'text-red-600'
                      : 'text-slate-400'
              }
              data-testid={`step-${i}`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
