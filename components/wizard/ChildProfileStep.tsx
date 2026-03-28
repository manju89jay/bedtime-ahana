'use client';

import { useState } from 'react';
import clsx from 'clsx';

export type ChildProfileData = {
  name: string;
  age: 2 | 3 | 4 | 5 | 6;
  gender: 'girl' | 'boy' | 'neutral';
  city: string;
  companionObject: string;
  language: 'en' | 'de' | 'bilingual';
  outfitColor: string;
  outfitTop: string;
  photos: string[];
};

type Props = {
  initial?: Partial<ChildProfileData>;
  onNext: (data: ChildProfileData) => void;
};

const AGES = [2, 3, 4, 5, 6] as const;
const GENDERS = [
  { value: 'girl' as const, label: 'Girl' },
  { value: 'boy' as const, label: 'Boy' },
  { value: 'neutral' as const, label: 'Neutral' },
];
const LANGUAGES = [
  { value: 'en' as const, label: 'English' },
  { value: 'de' as const, label: 'Deutsch' },
  { value: 'bilingual' as const, label: 'Bilingual' },
];
const OUTFIT_COLORS = [
  { value: 'red', label: 'Red', hex: '#ef4444' },
  { value: 'blue', label: 'Blue', hex: '#3b82f6' },
  { value: 'yellow', label: 'Yellow', hex: '#eab308' },
  { value: 'green', label: 'Green', hex: '#22c55e' },
  { value: 'purple', label: 'Purple', hex: '#a855f7' },
  { value: 'pink', label: 'Pink', hex: '#ec4899' },
];
const OUTFIT_TOPS = [
  'Star T-Shirt', 'Stripy Sweater', 'Rainbow Dress',
  'Hoodie', 'Dungarees', 'Polka Dot Shirt',
];

export const ChildProfileStep = ({ initial, onNext }: Props) => {
  const [name, setName] = useState(initial?.name ?? '');
  const [age, setAge] = useState<2 | 3 | 4 | 5 | 6>(initial?.age ?? 4);
  const [gender, setGender] = useState<'girl' | 'boy' | 'neutral'>(initial?.gender ?? 'girl');
  const [city, setCity] = useState(initial?.city ?? '');
  const [companion, setCompanion] = useState(initial?.companionObject ?? '');
  const [language, setLanguage] = useState<'en' | 'de' | 'bilingual'>(initial?.language ?? 'bilingual');
  const [outfitColor, setOutfitColor] = useState(initial?.outfitColor ?? 'yellow');
  const [outfitTop, setOutfitTop] = useState(initial?.outfitTop ?? 'Star T-Shirt');

  const errors: string[] = [];
  if (!name.trim()) errors.push('Name is required');
  if (!city.trim()) errors.push('City is required');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (errors.length > 0) return;
    onNext({
      name: name.trim(),
      age,
      gender,
      city: city.trim(),
      companionObject: companion.trim(),
      language,
      outfitColor,
      outfitTop,
      photos: [],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" data-testid="child-profile-step">
      {/* Name */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700" htmlFor="cp-name">Name *</label>
        <input
          id="cp-name"
          className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          placeholder="e.g. Ahana"
          value={name}
          onChange={(e) => setName(e.target.value)}
          data-testid="input-name"
          required
        />
      </div>

      {/* Age */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700">Age</label>
        <div className="flex gap-2" data-testid="age-selector">
          {AGES.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setAge(a)}
              className={clsx(
                'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                age === a ? 'bg-brand-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
              )}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      {/* Gender */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700">Gender</label>
        <div className="flex gap-2" data-testid="gender-selector">
          {GENDERS.map((g) => (
            <button
              key={g.value}
              type="button"
              onClick={() => setGender(g.value)}
              className={clsx(
                'rounded-lg px-4 py-2 text-sm transition-colors',
                gender === g.value ? 'bg-brand-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
              )}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* City */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700" htmlFor="cp-city">City *</label>
        <input
          id="cp-city"
          className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          placeholder="e.g. Ulm"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          data-testid="input-city"
          required
        />
      </div>

      {/* Companion */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700" htmlFor="cp-companion">Companion Object</label>
        <input
          id="cp-companion"
          className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          placeholder="e.g. plush bunny named Hoppel"
          value={companion}
          onChange={(e) => setCompanion(e.target.value)}
          data-testid="input-companion"
        />
      </div>

      {/* Language */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700">Language</label>
        <div className="flex gap-2" data-testid="language-selector">
          {LANGUAGES.map((l) => (
            <button
              key={l.value}
              type="button"
              onClick={() => setLanguage(l.value)}
              className={clsx(
                'rounded-lg px-4 py-2 text-sm transition-colors',
                language === l.value ? 'bg-brand-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
              )}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Outfit color */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700">Signature Outfit Color</label>
        <div className="flex gap-2" data-testid="outfit-color-selector">
          {OUTFIT_COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setOutfitColor(c.value)}
              className={clsx(
                'h-8 w-8 rounded-full border-2 transition-all',
                outfitColor === c.value ? 'border-slate-800 scale-110' : 'border-transparent',
              )}
              style={{ backgroundColor: c.hex }}
              aria-label={c.label}
            />
          ))}
        </div>
      </div>

      {/* Outfit top */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700">Outfit Style</label>
        <div className="flex flex-wrap gap-2" data-testid="outfit-top-selector">
          {OUTFIT_TOPS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setOutfitTop(t)}
              className={clsx(
                'rounded-lg px-3 py-1.5 text-xs transition-colors',
                outfitTop === t ? 'bg-brand-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={errors.length > 0}
        className="mt-2 self-end rounded-lg bg-brand-primary px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-primary/90 disabled:opacity-50"
        data-testid="next-button"
      >
        Next
      </button>
    </form>
  );
};
