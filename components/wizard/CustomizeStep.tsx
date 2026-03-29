'use client';

import { useState } from 'react';
import clsx from 'clsx';

export type CustomizeData = {
  tonePreset: 'gentle' | 'adventurous' | 'funny';
  ageVocabulary: 'toddler' | 'preschool' | 'early-reader';
  kindergartenName?: string;
  favoritePlayground?: string;
};

type Props = {
  childAge: number;
  templateId: string;
  initial?: Partial<CustomizeData>;
  onNext: (data: CustomizeData) => void;
  onBack: () => void;
};

const TONES = [
  { value: 'gentle' as const, label: 'Gentle', desc: 'Warm and soothing' },
  { value: 'adventurous' as const, label: 'Adventurous', desc: 'Exciting and brave' },
  { value: 'funny' as const, label: 'Funny', desc: 'Silly and playful' },
];

const VOCAB_LEVELS = [
  { value: 'toddler' as const, label: 'Toddler (2-3)', desc: 'Very simple words' },
  { value: 'preschool' as const, label: 'Preschool (3-5)', desc: 'Short sentences' },
  { value: 'early-reader' as const, label: 'Early Reader (5-6)', desc: 'Longer sentences' },
];

function defaultVocab(age: number): 'toddler' | 'preschool' | 'early-reader' {
  if (age <= 3) return 'toddler';
  if (age <= 5) return 'preschool';
  return 'early-reader';
}

export const CustomizeStep = ({ childAge, templateId, initial, onNext, onBack }: Props) => {
  const [tone, setTone] = useState<CustomizeData['tonePreset']>(initial?.tonePreset ?? 'gentle');
  const [vocab, setVocab] = useState<CustomizeData['ageVocabulary']>(initial?.ageVocabulary ?? defaultVocab(childAge));
  const [kgName, setKgName] = useState(initial?.kindergartenName ?? '');
  const [playground, setPlayground] = useState(initial?.favoritePlayground ?? '');

  const showKgField = templateId === 'kindergarten-first-day';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({
      tonePreset: tone,
      ageVocabulary: vocab,
      kindergartenName: kgName.trim() || undefined,
      favoritePlayground: playground.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" data-testid="customize-step">
      {/* Tone */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-warm-700">Story Tone</label>
        <div className="grid gap-2 sm:grid-cols-3" data-testid="tone-selector">
          {TONES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTone(t.value)}
              className={clsx(
                'flex flex-col rounded-xl border-2 p-3 text-left transition-all',
                tone === t.value ? 'border-brand-primary bg-brand-primary/5' : 'border-warm-200 hover:border-warm-300',
              )}
              data-testid={`tone-${t.value}`}
            >
              <span className="text-sm font-medium text-warm-800">{t.label}</span>
              <span className="text-xs text-warm-400">{t.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Vocabulary */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-warm-700">Vocabulary Level</label>
        <div className="grid gap-2 sm:grid-cols-3" data-testid="vocab-selector">
          {VOCAB_LEVELS.map((v) => (
            <button
              key={v.value}
              type="button"
              onClick={() => setVocab(v.value)}
              className={clsx(
                'flex flex-col rounded-xl border-2 p-3 text-left transition-all',
                vocab === v.value ? 'border-brand-primary bg-brand-primary/5' : 'border-warm-200 hover:border-warm-300',
              )}
              data-testid={`vocab-${v.value}`}
            >
              <span className="text-sm font-medium text-warm-800">{v.label}</span>
              <span className="text-xs text-warm-400">{v.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Story-specific fields */}
      {showKgField && (
        <div className="space-y-1">
          <label className="text-sm font-medium text-warm-700" htmlFor="kg-name">Kindergarten Name</label>
          <input
            id="kg-name"
            className="w-full rounded-full border border-warm-200 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"
            placeholder="e.g. Kita Sonnenschein"
            value={kgName}
            onChange={(e) => setKgName(e.target.value)}
            data-testid="input-kg-name"
          />
        </div>
      )}

      <div className="space-y-1">
        <label className="text-sm font-medium text-warm-700" htmlFor="playground">Favorite Playground</label>
        <input
          id="playground"
          className="w-full rounded-full border border-warm-200 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"
          placeholder="e.g. Friedrichsau park"
          value={playground}
          onChange={(e) => setPlayground(e.target.value)}
          data-testid="input-playground"
        />
      </div>

      <div className="mt-2 flex justify-between">
        <button type="button" onClick={onBack} className="rounded-full border border-warm-200 px-6 py-2.5 text-sm text-warm-600 hover:bg-warm-50" data-testid="back-button">Back</button>
        <button type="submit" className="rounded-full bg-brand-primary px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-brand-primary/90" data-testid="next-button">Generate Book</button>
      </div>
    </form>
  );
};
