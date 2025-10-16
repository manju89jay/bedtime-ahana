import type { Page } from "@/types/book";

export function PageCard({ page }: { page: Page }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-slate-500">Page {page.pageNo}</span>
      </div>
      <p className="text-sm text-slate-700">{page.text}</p>
      <div className="rounded border border-slate-200 bg-slate-100 p-3 text-xs text-slate-500">
        <p className="font-medium text-slate-600">Prompt:</p>
        <p>{page.imagePrompt}</p>
      </div>
    </div>
  );
}
