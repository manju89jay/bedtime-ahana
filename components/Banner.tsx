"use client";

import clsx from "clsx";

export function Banner({
  title,
  description,
  tone = "info"
}: {
  title: string;
  description: string;
  tone?: "info" | "warning" | "error";
}) {
  return (
    <div
      className={clsx(
        "rounded-lg border p-4",
        tone === "info" && "border-brand-primary/30 bg-brand-secondary/20 text-slate-700",
        tone === "warning" && "border-amber-300 bg-amber-100 text-amber-800",
        tone === "error" && "border-red-300 bg-red-100 text-red-700"
      )}
    >
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-1 text-xs leading-relaxed">{description}</p>
    </div>
  );
}
