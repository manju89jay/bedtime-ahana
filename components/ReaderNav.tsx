"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { jsPDF } from "jspdf";
import type { Book } from "@/types/book";
import { checkBookForIPRisks } from "@/lib/compliance";
import { Banner } from "@/components/Banner";

type ReaderNavProps = {
  initialBook: Book;
  onPersist: (book: Book) => Promise<void>;
  onExport: (pdfBase64: string) => Promise<string>;
};

export function ReaderNav({ initialBook, onPersist, onExport }: ReaderNavProps) {
  const [book, setBook] = useState<Book>(initialBook);
  const [pageIndex, setPageIndex] = useState(0);
  const [isSaving, startSaving] = useTransition();
  const [exportStatus, setExportStatus] = useState<string>("");
  const [audioEnabled, setAudioEnabled] = useState(true);

  const page = book.pages[pageIndex];
  const complianceIssues = useMemo(() => checkBookForIPRisks(book), [book]);

  const handleNavigate = (direction: "prev" | "next") => {
    setPageIndex((prev) => {
      if (direction === "prev") {
        return Math.max(0, prev - 1);
      }
      return Math.min(book.pages.length - 1, prev + 1);
    });
  };

  const persistBook = useCallback(
    (updated: Book) =>
      startSaving(async () => {
        const stamped: Book = {
          ...updated,
          updatedAt: new Date().toISOString()
        };
        setBook(stamped);
        await onPersist(stamped);
      }),
    [onPersist]
  );

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = event.target;
    setBook((prev) => {
      const updatedPages = prev.pages.map((p) =>
        p.pageNo === page.pageNo ? { ...p, text: value } : p
      );
      return { ...prev, pages: updatedPages };
    });
  };

  const handleBlur = () => {
    persistBook({ ...book });
  };

  const handleExport = async () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a5" });
    book.pages.forEach((p, index) => {
      if (index !== 0) {
        doc.addPage();
      }
      doc.setFontSize(18);
      doc.text(book.title, 40, 60);
      doc.setFontSize(12);
      doc.text(`Page ${p.pageNo}`, 40, 90);
      doc.setFontSize(11);
      const splitText = doc.splitTextToSize(p.text, 480);
      doc.text(splitText, 40, 130);
    });
    const pdfDataUri = doc.output("datauristring");
    const pdfBase64 = pdfDataUri.split(",")[1] ?? "";
    setExportStatus("Saving PDF...");
    const url = await onExport(pdfBase64);
    setExportStatus(`Saved to ${url}`);
  };

  const warnings = complianceIssues.length > 0;

  return (
    <div className="flex flex-col gap-6">
      {warnings && (
        <Banner
          tone="warning"
          title="Compliance check warning"
          description={complianceIssues.join(" ")}
        />
      )}
      <div className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm">
        <div>
          <p className="text-sm font-semibold text-slate-700">{book.title}</p>
          <p className="text-xs text-slate-500">Language: {book.language.toUpperCase()}</p>
        </div>
        <div className="flex gap-2 text-sm">
          <button
            onClick={() => handleNavigate("prev")}
            className="rounded border border-slate-200 px-3 py-1 disabled:opacity-50"
            disabled={pageIndex === 0}
          >
            ← Prev
          </button>
          <button
            onClick={() => handleNavigate("next")}
            className="rounded border border-slate-200 px-3 py-1 disabled:opacity-50"
            disabled={pageIndex === book.pages.length - 1}
          >
            Next →
          </button>
        </div>
      </div>

      <div className="grid gap-4 rounded-lg bg-white p-6 shadow-sm md:grid-cols-2">
        <div className="space-y-4">
          <img
            src={page.imageUrl}
            alt={`Illustration for page ${page.pageNo}`}
            className="w-full rounded border border-slate-200 bg-slate-100 object-cover"
          />
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Prompt
          </label>
          <p className="text-sm text-slate-600">{page.imagePrompt}</p>
        </div>
        <div className="flex flex-col gap-3">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Page text
          </label>
          <textarea
            value={page.text}
            onChange={handleTextChange}
            onBlur={handleBlur}
            rows={12}
            className="h-full w-full rounded border border-slate-200 p-3 text-sm"
          />
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{isSaving ? "Saving..." : "Auto-saved"}</span>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={audioEnabled}
                onChange={(event) => setAudioEnabled(event.target.checked)}
              />
              Audio narration
            </label>
          </div>
          {audioEnabled && page.audioUrl && (
            <audio controls src={page.audioUrl} className="w-full" />
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-lg bg-white p-6 shadow-sm">
        <button
          onClick={handleExport}
          className="self-start rounded bg-brand-primary px-4 py-2 text-sm font-medium text-white"
        >
          Export to PDF
        </button>
        {exportStatus && <p className="text-xs text-slate-500">{exportStatus}</p>}
      </div>
    </div>
  );
}
