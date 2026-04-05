"use client";

import { useState } from "react";
import type { LegacyChildProfile as ChildProfile } from "@/types/legacy";

export function ChildInfoForm({
  onSubmit,
  isDisabled
}: {
  onSubmit: (profile: ChildProfile) => void;
  isDisabled: boolean;
}) {
  const [name, setName] = useState("");
  const [age, setAge] = useState(4);
  const [interestsText, setInterestsText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const interests = interestsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    onSubmit({ name, age, interests });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700" htmlFor="name">
          Child&apos;s name
        </label>
        <input
          id="name"
          className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          placeholder="e.g. Ahana"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700" htmlFor="age">
          Age
        </label>
        <select
          id="age"
          className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          value={age}
          onChange={(e) => setAge(Number(e.target.value))}
        >
          {[3, 4, 5, 6, 7, 8].map((a) => (
            <option key={a} value={a}>
              {a} years old
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700" htmlFor="interests">
          Interests
        </label>
        <input
          id="interests"
          className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          placeholder="e.g. dinosaurs, painting, her baby sister"
          value={interestsText}
          onChange={(e) => setInterestsText(e.target.value)}
        />
        <p className="text-xs text-slate-400">Separate with commas</p>
      </div>

      <button
        type="submit"
        disabled={isDisabled || !name.trim()}
        className="mt-2 self-end rounded-lg bg-brand-primary px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-primary/90 disabled:opacity-50"
      >
        Next
      </button>
    </form>
  );
}
