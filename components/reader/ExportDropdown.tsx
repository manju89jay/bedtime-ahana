'use client';

import { useState, useCallback } from 'react';
import clsx from 'clsx';

type ExportFormat = 'screen' | 'print-10x10' | 'print-15x15';

type Props = {
  bookId: string;
  nightMode?: boolean;
};

const EXPORT_OPTIONS: { value: ExportFormat; label: string; desc: string }[] = [
  { value: 'screen', label: 'Screen PDF', desc: 'A5, 150 DPI' },
  { value: 'print-10x10', label: 'Print 10x10cm', desc: '300 DPI, bleed' },
  { value: 'print-15x15', label: 'Print 15x15cm', desc: '300 DPI, bleed' },
];

export const ExportDropdown = ({ bookId, nightMode }: Props) => {
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleExport = useCallback(
    async (format: ExportFormat) => {
      setOpen(false);
      setExporting(true);
      setResult(null);

      try {
        const res = await fetch('/api/export', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookId, format }),
        });

        if (!res.ok) throw new Error('Export failed');

        const data = await res.json();
        setResult(data.pdfUrl);
      } catch {
        setResult('error');
      } finally {
        setExporting(false);
      }
    },
    [bookId],
  );

  return (
    <div className="relative" data-testid="export-dropdown">
      <button
        onClick={() => setOpen(!open)}
        disabled={exporting}
        className={clsx(
          'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
          nightMode
            ? 'bg-slate-700 text-slate-200 hover:bg-slate-600'
            : 'bg-brand-primary text-white hover:bg-brand-primary/90',
          exporting && 'opacity-50',
        )}
        data-testid="export-button"
      >
        {exporting ? 'Exporting...' : 'Export PDF'}
      </button>

      {open && (
        <div
          className={clsx(
            'absolute right-0 top-full z-10 mt-1 w-56 rounded-xl border shadow-lg',
            nightMode ? 'border-slate-600 bg-slate-800' : 'border-slate-200 bg-white',
          )}
          data-testid="export-menu"
        >
          {EXPORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleExport(opt.value)}
              className={clsx(
                'flex w-full flex-col px-4 py-3 text-left transition-colors first:rounded-t-xl last:rounded-b-xl',
                nightMode ? 'hover:bg-slate-700' : 'hover:bg-slate-50',
              )}
              data-testid={`export-${opt.value}`}
            >
              <span className={clsx('text-sm font-medium', nightMode ? 'text-slate-200' : 'text-slate-800')}>
                {opt.label}
              </span>
              <span className={clsx('text-xs', nightMode ? 'text-slate-400' : 'text-slate-500')}>
                {opt.desc}
              </span>
            </button>
          ))}
        </div>
      )}

      {result && result !== 'error' && (
        <a
          href={result}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 block text-xs text-brand-primary hover:underline"
          data-testid="export-download-link"
        >
          Download ready
        </a>
      )}
      {result === 'error' && (
        <p className="mt-2 text-xs text-red-500" data-testid="export-error">Export failed</p>
      )}
    </div>
  );
};
