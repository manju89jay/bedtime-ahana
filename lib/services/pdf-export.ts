import { jsPDF } from 'jspdf';
import type { Book } from '@/types/book';
import type { SubscriptionTier } from '@/types/user';

export type ExportFormat = 'screen' | 'print-10x10' | 'print-15x15';

export type ExportOptions = {
  book: Book;
  format: ExportFormat;
  subscription: SubscriptionTier;
};

export type ExportResult = {
  pdfBytes: Uint8Array;
  format: ExportFormat;
  pageCount: number;
};

// Convert mm to points (1mm = 2.835pt)
const MM_TO_PT = 2.835;

const FORMAT_CONFIG = {
  screen: {
    width: 210 * MM_TO_PT,  // A5 width in pt
    height: 148 * MM_TO_PT, // A5 height in pt
    orientation: 'landscape' as const,
    bleed: 0,
    dpi: 150,
  },
  'print-10x10': {
    width: 100 * MM_TO_PT,  // 10cm
    height: 100 * MM_TO_PT,
    orientation: 'portrait' as const,
    bleed: 3 * MM_TO_PT,    // 3mm bleed
    dpi: 300,
  },
  'print-15x15': {
    width: 150 * MM_TO_PT,  // 15cm
    height: 150 * MM_TO_PT,
    orientation: 'portrait' as const,
    bleed: 3 * MM_TO_PT,    // 3mm bleed
    dpi: 300,
  },
};

function addWatermark(doc: jsPDF, pageWidth: number, pageHeight: number): void {
  doc.saveGraphicsState();
  doc.setGState(doc.GState({ opacity: 0.15 }));
  doc.setFontSize(36);
  doc.setTextColor(150, 150, 150);

  // Diagonal watermark
  const text = 'PREVIEW';
  const centerX = pageWidth / 2;
  const centerY = pageHeight / 2;

  doc.text(text, centerX, centerY, {
    align: 'center',
    angle: 45,
  });
  doc.restoreGraphicsState();
}

function addTrimMarks(doc: jsPDF, pageWidth: number, pageHeight: number, bleed: number): void {
  if (bleed === 0) return;

  const markLen = 10;
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.25);

  // Top-left
  doc.line(bleed, 0, bleed, markLen);
  doc.line(0, bleed, markLen, bleed);
  // Top-right
  doc.line(pageWidth - bleed, 0, pageWidth - bleed, markLen);
  doc.line(pageWidth, bleed, pageWidth - markLen, bleed);
  // Bottom-left
  doc.line(bleed, pageHeight, bleed, pageHeight - markLen);
  doc.line(0, pageHeight - bleed, markLen, pageHeight - bleed);
  // Bottom-right
  doc.line(pageWidth - bleed, pageHeight, pageWidth - bleed, pageHeight - markLen);
  doc.line(pageWidth, pageHeight - bleed, pageWidth - markLen, pageHeight - bleed);
}

export function exportPDF(options: ExportOptions): ExportResult {
  const { book, format, subscription } = options;
  const config = FORMAT_CONFIG[format];
  const totalWidth = config.width + config.bleed * 2;
  const totalHeight = config.height + config.bleed * 2;
  const showWatermark = subscription === 'free' && format === 'screen';

  const doc = new jsPDF({
    orientation: config.orientation,
    unit: 'pt',
    format: [totalWidth, totalHeight],
  });

  const pageWidth = totalWidth;
  const pageHeight = totalHeight;
  const contentX = config.bleed;
  const contentY = config.bleed;
  const contentW = config.width;
  const contentH = config.height;

  // Cover page
  doc.setFillColor(74, 95, 193);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(format === 'screen' ? 28 : 20);
  const titleText = `${book.config.childName}'s Adventure`;
  doc.text(titleText, contentX + contentW / 2, contentY + contentH / 2 - 20, { align: 'center' });
  doc.setFontSize(format === 'screen' ? 14 : 10);
  doc.text(
    `A personalized story for ${book.config.childName}`,
    contentX + contentW / 2,
    contentY + contentH / 2 + 15,
    { align: 'center' },
  );

  if (showWatermark) addWatermark(doc, pageWidth, pageHeight);
  if (config.bleed > 0) addTrimMarks(doc, pageWidth, pageHeight, config.bleed);

  // Story pages
  for (const page of book.pages) {
    doc.addPage([totalWidth, totalHeight], config.orientation);

    // Background
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Page number
    doc.setTextColor(180, 180, 180);
    doc.setFontSize(8);
    doc.text(`${page.pageNumber}`, pageWidth - config.bleed - 15, pageHeight - config.bleed - 10);

    // Text content
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(format === 'screen' ? 12 : 9);
    const displayText = page.text.en ?? page.text.de ?? '';
    const textMargin = contentX + 20;
    const textWidth = contentW - 40;
    const splitText = doc.splitTextToSize(displayText, textWidth);
    doc.text(splitText, textMargin, contentY + contentH / 2);

    if (showWatermark) addWatermark(doc, pageWidth, pageHeight);
    if (config.bleed > 0) addTrimMarks(doc, pageWidth, pageHeight, config.bleed);
  }

  // Back cover
  doc.addPage([totalWidth, totalHeight], config.orientation);
  doc.setFillColor(242, 181, 212);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  doc.setTextColor(74, 95, 193);
  doc.setFontSize(12);
  doc.text(
    `Made with love for ${book.config.childName}`,
    contentX + contentW / 2,
    contentY + contentH / 2,
    { align: 'center' },
  );
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('bedtime-ahana', contentX + contentW / 2, contentY + contentH / 2 + 20, { align: 'center' });

  if (showWatermark) addWatermark(doc, pageWidth, pageHeight);
  if (config.bleed > 0) addTrimMarks(doc, pageWidth, pageHeight, config.bleed);

  const arrayBuffer = doc.output('arraybuffer');
  return {
    pdfBytes: new Uint8Array(arrayBuffer),
    format,
    pageCount: book.pages.length + 2, // cover + pages + back
  };
}
