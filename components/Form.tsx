"use client";

import { useState } from "react";

const defaultValues = {
  name: "Ahana",
  age: 5,
  tone: "calm" as const,
  language: "en" as const,
  storyIdea: "Helping baby sister Shreya settle at bedtime"
};

type FormValues = typeof defaultValues;

export function Form({
  onSubmit,
  isGenerating
}: {
  onSubmit: (values: FormValues) => Promise<void>;
  isGenerating: boolean;
}) {
  const [values, setValues] = useState<FormValues>(defaultValues);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: name === "age" ? Number(value) : value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await onSubmit(values);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-4 rounded-lg bg-white p-6 shadow-sm md:grid-cols-2"
    >
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="name">
          Child name
        </label>
        <input
          id="name"
          name="name"
          className="w-full rounded border border-slate-200 px-3 py-2 text-sm"
          value={values.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="age">
          Age
        </label>
        <input
          id="age"
          name="age"
          type="number"
          min={3}
          max={8}
          className="w-full rounded border border-slate-200 px-3 py-2 text-sm"
          value={values.age}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="tone">
          Tone
        </label>
        <select
          id="tone"
          name="tone"
          className="w-full rounded border border-slate-200 px-3 py-2 text-sm"
          value={values.tone}
          onChange={handleChange}
        >
          <option value="calm">Calm</option>
          <option value="adventurous">Adventurous</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="language">
          Language
        </label>
        <select
          id="language"
          name="language"
          className="w-full rounded border border-slate-200 px-3 py-2 text-sm"
          value={values.language}
          onChange={handleChange}
        >
          <option value="en">English</option>
          <option value="de">Deutsch</option>
        </select>
      </div>

      <div className="md:col-span-2 space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="storyIdea">
          Story idea (optional)
        </label>
        <textarea
          id="storyIdea"
          name="storyIdea"
          rows={3}
          className="w-full rounded border border-slate-200 px-3 py-2 text-sm"
          value={values.storyIdea}
          onChange={handleChange}
        />
        <p className="text-xs text-slate-500">Voice upload placeholder: coming soon.</p>
      </div>

      <div className="md:col-span-2 flex justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={isGenerating}
          className="inline-flex items-center justify-center rounded bg-brand-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {isGenerating ? "Generating..." : "Generate book"}
        </button>
      </div>
    </form>
  );
}
