import { promises as fs } from "fs";
import path from "path";
import { jsPDF } from "jspdf";
import { createImageAsset } from "../lib/ai/image";
import { createTTSAsset } from "../lib/ai/tts";
import { generateOutline, generatePageText } from "../lib/ai/text";
import { getPublicAssetPath, saveBook } from "../lib/storage";
import type { Book, CharacterCard } from "../types/book";

const SAMPLE_BOOK_ID = "sample-ahana";

const AHANA_CARD: CharacterCard = {
  name: "Ahana",
  age: 4,
  home: "Ulm, Germany",
  family: ["Papa", "Baby sister Shreya"],
  traits: ["curious", "kind", "gentle helper"],
  sidekick: "plush bunny",
  visualStyle: "soft watercolor, warm light, comfy jumper"
};

async function buildPages(bookId: string, outlinePages: Array<{
  pageNo: number;
  summary: string;
}>) {
  const pages: Book["pages"] = [];

  for (const page of outlinePages) {
    const textResult = await generatePageText({
      pageNo: page.pageNo,
      language: "en",
      age: AHANA_CARD.age,
      beat_summary: page.summary,
      characterCard: AHANA_CARD
    });

    const { prompt, imageUrl } = await createImageAsset({
      pageNo: page.pageNo,
      characterVisuals: AHANA_CARD.visualStyle,
      sceneSummary: page.summary,
      bookId
    });

    const { audioUrl } = await createTTSAsset({
      bookId,
      pageNo: page.pageNo,
      text: textResult.text,
      language: "en",
      voice: "soft-lullaby"
    });

    pages.push({
      pageNo: page.pageNo,
      text: textResult.text,
      imagePrompt: prompt,
      imageUrl,
      audioUrl
    });
  }

  return pages;
}

async function writePdf(book: Book) {
  const pdf = new jsPDF({ orientation: "landscape", format: "a5", unit: "pt" });

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(28);
  const titleLines = pdf.splitTextToSize(book.title, 360);
  pdf.text(titleLines, 40, 120);
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "normal");
  pdf.text(`A bedtime story for ${book.characters[0]?.name ?? "a friend"}`, 40, 160);
  if (book.moral) {
    pdf.setFontSize(12);
    pdf.text(`Moral: ${book.moral}`, 40, 190, { maxWidth: 480 });
  }

  book.pages.forEach((page, index) => {
    if (index === 0) {
      pdf.addPage("a5", "landscape");
    } else {
      pdf.addPage();
    }

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);
    pdf.text(`Page ${page.pageNo}`, 40, 80);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(12);
    const bodyLines = pdf.splitTextToSize(page.text, 500);
    pdf.text(bodyLines, 40, 120);

    pdf.setFontSize(10);
    pdf.setTextColor(100);
    const promptLines = pdf.splitTextToSize(`Art prompt: ${page.imagePrompt}`, 500);
    pdf.text(promptLines, 40, 320);
    pdf.setTextColor(0);
  });

  const arrayBuffer = pdf.output("arraybuffer");
  const buffer = Buffer.from(arrayBuffer);
  const pdfPath = getPublicAssetPath(book.bookId, "book.pdf");
  await fs.mkdir(path.dirname(pdfPath), { recursive: true });
  await fs.writeFile(pdfPath, new Uint8Array(buffer));
  return pdfPath;
}

async function main() {
  console.log("Generating sample bedtime book...");
  const outline = await generateOutline({
    name: AHANA_CARD.name,
    age: AHANA_CARD.age,
    tone: "calm",
    language: "en",
    storyIdea: "helping baby sister Shreya with bedtime",
    characterCard: AHANA_CARD
  });

  const now = new Date().toISOString();
  const pages = await buildPages(
    SAMPLE_BOOK_ID,
    outline.pages.map((page) => ({ pageNo: page.pageNo, summary: page.summary }))
  );

  const book: Book = {
    bookId: SAMPLE_BOOK_ID,
    title: outline.title,
    language: "en",
    characters: [AHANA_CARD],
    pages,
    createdAt: now,
    updatedAt: now,
    moral: outline.moral
  };

  await saveBook(book);
  const pdfPath = await writePdf(book);

  console.log(`Sample book saved to data/books/${book.bookId}.json`);
  console.log(`PDF written to ${pdfPath}`);
  console.log("Done. You can open the Reader at /reader/sample-ahana to view it.");
}

main().catch((error) => {
  console.error("Failed to generate sample book", error);
  process.exitCode = 1;
});
