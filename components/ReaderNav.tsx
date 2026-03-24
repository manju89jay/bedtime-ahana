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
  onRegeneratePage: (pageNo: number) => Promise<Book>;
};

export function ReaderNav({ initialBook, onPersist, onExport, onRegeneratePage }: ReaderNavProps) {
  const [book, setBook] = useState<Book>(initialBook);
  const [pageIndex, setPageIndex] = useState(0);
  const [isSaving, startSaving] = useTransition();
  const [exportStatus, setExportStatus] = useState<string>("");
  const [isRegenerating, setRegenerating] = useState(false);
  const [isEditing, setEditing] = useState(false);

  const page = book.pages[pageIndex];
  const storyPages = book.pages.filter((p) => p.type === "story");
  const complianceIssues = useMemo(() => checkBookForIPRisks(book), [book]);

  const persistBook = useCallback(
    (updated: Book) =>
      startSaving(async () => {
        const stamped: Book = { ...updated, updatedAt: new Date().toISOString() };
        setBook(stamped);
        await onPersist(stamped);
      }),
    [onPersist]
  );

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setBook((prev) => ({
      ...prev,
      pages: prev.pages.map((p) =>
        p.pageNo === page.pageNo ? { ...p, text: value } : p
      )
    }));
  };

  const handleBlur = () => {
    setEditing(false);
    persistBook({ ...book });
  };

  const handleRegenerate = async () => {
    if (page.type !== "story") return;
    setRegenerating(true);
    try {
      const updatedBook = await onRegeneratePage(page.pageNo);
      setBook(updatedBook);
    } catch (e) {
      console.error("Regeneration failed:", e);
    } finally {
      setRegenerating(false);
    }
  };

  const handleExport = async () => {
    setExportStatus("Creating PDF...");

    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a5" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Title page
    doc.setFillColor(74, 95, 193);
    doc.rect(0, 0, pageWidth, pageHeight, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    const titleLines = doc.splitTextToSize(book.title, pageWidth - 80);
    doc.text(titleLines, pageWidth / 2, pageHeight / 2 - 30, { align: "center" });
    doc.setFontSize(14);
    doc.text(
      `A bedtime story for ${book.childProfile.name}`,
      pageWidth / 2,
      pageHeight / 2 + 30,
      { align: "center" }
    );

    // Story pages
    for (const sp of storyPages) {
      doc.addPage();
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageWidth, pageHeight, "F");

      // If image is a real PNG, try to embed it
      if (sp.imageUrl && sp.imageUrl.endsWith(".png")) {
        try {
          const response = await fetch(sp.imageUrl);
          const blob = await response.blob();
          const reader = new FileReader();
          const dataUrl = await new Promise<string>((resolve) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
          const imgSize = Math.min(pageWidth * 0.45, pageHeight - 80);
          doc.addImage(dataUrl, "PNG", 20, 20, imgSize, imgSize);
        } catch {
          // Image load failed, skip
        }
      }

      // Page number
      doc.setTextColor(180, 180, 180);
      doc.setFontSize(10);
      doc.text(`${sp.pageNo}`, pageWidth - 30, pageHeight - 20);

      // Text
      doc.setTextColor(40, 40, 40);
      doc.setFontSize(13);
      const textX = pageWidth * 0.52;
      const textWidth = pageWidth * 0.44;
      const splitText = doc.splitTextToSize(sp.text, textWidth);
      doc.text(splitText, textX, 50);
    }

    // Back cover
    doc.addPage();
    doc.setFillColor(242, 181, 212);
    doc.rect(0, 0, pageWidth, pageHeight, "F");
    doc.setTextColor(74, 95, 193);
    doc.setFontSize(14);
    doc.text(
      `Made with love for ${book.childProfile.name}`,
      pageWidth / 2,
      pageHeight / 2,
      { align: "center" }
    );
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("bedtime-ahana", pageWidth / 2, pageHeight / 2 + 30, { align: "center" });

    const pdfDataUri = doc.output("datauristring");
    const pdfBase64 = pdfDataUri.split(",")[1] ?? "";
    setExportStatus("Saving...");
    const url = await onExport(pdfBase64);
    setExportStatus(url);
  };

  return (
    <div className="flex flex-col gap-6">
      {complianceIssues.length > 0 && (
        <Banner
          tone="warning"
          title="Compliance warning"
          description={complianceIssues.join(" ")}
        />
      )}

      {/* Header bar */}
      <div className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
        <div>
          <p className="font-semibold text-slate-800">{book.title}</p>
          <p className="text-xs text-slate-400">
            A story for {book.childProfile.name}, age {book.childProfile.age}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPageIndex((i) => Math.max(0, i - 1))}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm transition-colors hover:bg-slate-50 disabled:opacity-40"
            disabled={pageIndex === 0}
          >
            ← Prev
          </button>
          <span className="flex items-center px-2 text-xs text-slate-400">
            {pageIndex + 1} / {book.pages.length}
          </span>
          <button
            onClick={() => setPageIndex((i) => Math.min(book.pages.length - 1, i + 1))}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm transition-colors hover:bg-slate-50 disabled:opacity-40"
            disabled={pageIndex === book.pages.length - 1}
          >
            Next →
          </button>
        </div>
      </div>

      {/* Page content */}
      {page.type === "cover" ? (
        <div className="flex items-center justify-center rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary p-12 shadow-sm">
          <div className="text-center text-white">
            <h2 className="text-3xl font-bold">{book.title}</h2>
            <p className="mt-3 text-lg opacity-90">
              A bedtime story for {book.childProfile.name}
            </p>
          </div>
        </div>
      ) : page.type === "back" ? (
        <div className="flex items-center justify-center rounded-xl bg-gradient-to-br from-brand-secondary to-brand-primary/30 p-12 shadow-sm">
          <div className="text-center">
            <p className="text-lg font-medium text-brand-primary">
              Made with love for {book.childProfile.name}
            </p>
            <p className="mt-2 text-sm text-slate-500">bedtime-ahana</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 rounded-xl bg-white p-6 shadow-sm md:grid-cols-2">
          {/* Image side */}
          <div>
            {page.imageUrl ? (
              <img
                src={page.imageUrl}
                alt={`Illustration for page ${page.pageNo}`}
                className="w-full rounded-lg border border-slate-100 bg-slate-50 object-cover"
              />
            ) : (
              <div className="flex aspect-square items-center justify-center rounded-lg bg-slate-100 text-sm text-slate-400">
                No image
              </div>
            )}
          </div>

          {/* Text side */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Page {page.pageNo}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(!isEditing)}
                  className="rounded border border-slate-200 px-2.5 py-1 text-xs text-slate-500 hover:bg-slate-50"
                >
                  {isEditing ? "Done" : "Edit"}
                </button>
                <button
                  onClick={handleRegenerate}
                  disabled={isRegenerating}
                  className="rounded border border-slate-200 px-2.5 py-1 text-xs text-slate-500 hover:bg-slate-50 disabled:opacity-40"
                >
                  {isRegenerating ? "Regenerating..." : "Regenerate"}
                </button>
              </div>
            </div>

            {isEditing ? (
              <textarea
                value={page.text}
                onChange={handleTextChange}
                onBlur={handleBlur}
                rows={8}
                className="flex-1 rounded-lg border border-slate-200 p-3 text-sm leading-relaxed focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                autoFocus
              />
            ) : (
              <p className="flex-1 text-sm leading-relaxed text-slate-700">{page.text}</p>
            )}

            <span className="text-xs text-slate-400">
              {isSaving ? "Saving..." : ""}
            </span>
          </div>
        </div>
      )}

      {/* Export bar */}
      <div className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="rounded-lg bg-brand-primary px-5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-primary/90"
          >
            Download PDF
          </button>
        </div>
        {exportStatus && (
          <p className="text-xs text-slate-500">
            {exportStatus.startsWith("/") ? (
              <a href={exportStatus} className="text-brand-primary" target="_blank" rel="noopener noreferrer">
                Download ready →
              </a>
            ) : (
              exportStatus
            )}
          </p>
        )}
      </div>

      {/* Thumbnail strip */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {book.pages.map((p, i) => (
          <button
            key={p.pageNo}
            onClick={() => setPageIndex(i)}
            className={`flex-shrink-0 rounded-lg border-2 p-1 transition-all ${
              i === pageIndex
                ? "border-brand-primary shadow-md"
                : "border-transparent opacity-60 hover:opacity-100"
            }`}
          >
            {p.type === "cover" ? (
              <div className="flex h-16 w-24 items-center justify-center rounded bg-gradient-to-br from-brand-primary to-brand-secondary text-xs text-white">
                Cover
              </div>
            ) : p.type === "back" ? (
              <div className="flex h-16 w-24 items-center justify-center rounded bg-gradient-to-br from-brand-secondary to-brand-primary/30 text-xs text-brand-primary">
                Back
              </div>
            ) : p.imageUrl ? (
              <img
                src={p.imageUrl}
                alt={`Page ${p.pageNo}`}
                className="h-16 w-24 rounded object-cover"
              />
            ) : (
              <div className="flex h-16 w-24 items-center justify-center rounded bg-slate-100 text-xs text-slate-400">
                {p.pageNo}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
