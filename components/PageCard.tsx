import type { LegacyPage as Page } from "@/types/legacy";

export function PageCard({ page }: { page: Page }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {page.type === "cover" ? "Cover" : page.type === "back" ? "Back Cover" : `Page ${page.pageNo}`}
        </span>
      </div>
      {page.imageUrl && (
        <img
          src={page.imageUrl}
          alt={`Page ${page.pageNo}`}
          className="w-full rounded-lg border border-slate-100 object-cover"
        />
      )}
      <p className="text-sm leading-relaxed text-slate-700">{page.text}</p>
    </div>
  );
}
