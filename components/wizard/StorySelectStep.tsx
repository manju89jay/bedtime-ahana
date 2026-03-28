'use client';

import clsx from 'clsx';
import type { StoryTemplate } from '@/types/template';

type Props = {
  templates: StoryTemplate[];
  selected: string | null;
  onSelect: (templateId: string | null) => void;
  onNext: () => void;
  onBack: () => void;
};

const THEME_ICONS: Record<string, string> = {
  'kindergarten-first-day': '\u{1F392}',
  zahnarzt: '\u{1FA7B}',
  fahrrad: '\u{1F6B2}',
  geschwisterchen: '\u{1F476}',
  schwimmbad: '\u{1F3CA}',
  muellabfuhr: '\u{1F69A}',
};

export const StorySelectStep = ({ templates, selected, onSelect, onNext, onBack }: Props) => {
  return (
    <div className="flex flex-col gap-5" data-testid="story-select-step">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((t) => (
          <button
            key={t.templateId}
            type="button"
            onClick={() => onSelect(selected === t.templateId ? null : t.templateId)}
            className={clsx(
              'flex flex-col gap-2 rounded-xl border-2 p-4 text-left transition-all',
              selected === t.templateId
                ? 'border-brand-primary bg-brand-primary/5 shadow-md'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm',
            )}
            data-testid={`template-${t.templateId}`}
          >
            <span className="text-2xl">{THEME_ICONS[t.templateId] ?? '\u{1F4D6}'}</span>
            <span className="font-semibold text-slate-800">{t.title}</span>
            <span className="text-xs text-slate-500">{t.theme}</span>
            <span className="text-xs italic text-slate-400">{t.moral}</span>
          </button>
        ))}
      </div>

      <div className="mt-2 flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-slate-200 px-6 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
          data-testid="back-button"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!selected}
          className="rounded-lg bg-brand-primary px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-brand-primary/90 disabled:opacity-50"
          data-testid="next-button"
        >
          Next
        </button>
      </div>
    </div>
  );
};
