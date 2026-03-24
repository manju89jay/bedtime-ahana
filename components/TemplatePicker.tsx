"use client";

import clsx from "clsx";
import type { StoryTemplate } from "@/types/book";

const ICONS: Record<string, string> = {
  moon: "\u{1F319}",
  compass: "\u{1F9ED}",
  palette: "\u{1F3A8}",
  heart: "\u{1F49B}",
  leaf: "\u{1F33F}"
};

export function TemplatePicker({
  templates,
  selected,
  onSelect
}: {
  templates: StoryTemplate[];
  selected: string | null;
  onSelect: (template: StoryTemplate | null) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {templates.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onSelect(selected === t.id ? null : t)}
          className={clsx(
            "flex flex-col gap-2 rounded-xl border-2 p-4 text-left transition-all",
            selected === t.id
              ? "border-brand-primary bg-brand-primary/5 shadow-md"
              : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
          )}
        >
          <span className="text-2xl">{ICONS[t.icon] || ""}</span>
          <span className="font-semibold text-slate-800">{t.name}</span>
          <span className="text-xs leading-relaxed text-slate-500">{t.description}</span>
        </button>
      ))}
    </div>
  );
}
