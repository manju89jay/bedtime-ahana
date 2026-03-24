import { promises as fs } from "fs";
import path from "path";
import { jsPDF } from "jspdf";
import { writePlaceholderImage, generateCoverImage } from "../lib/ai/image";
import { generateStoryFallback } from "../lib/ai/text";
import { getPublicAssetPath, saveBook } from "../lib/storage";
import type { Book, Page } from "../types/book";

const SAMPLE_BOOK_ID = "sample-ahana";

const childProfile = {
  name: "Ahana",
  age: 4,
  interests: ["painting", "her baby sister Shreya", "plush bunny"]
};

async function main() {
  console.log("Generating sample bedtime book...");

  const story = generateStoryFallback(childProfile, "helping baby sister Shreya with bedtime");

  // Generate cover
  const cover = await generateCoverImage({
    title: story.title,
    childName: childProfile.name,
    childAge: childProfile.age,
    bookId: SAMPLE_BOOK_ID
  });

  // Generate placeholder images for each page
  const storyPages: Page[] = [];
  for (const p of story.pages) {
    const { prompt, imageUrl } = await writePlaceholderImage({
      pageNo: p.pageNo,
      imageDescription: p.imageDescription,
      childName: childProfile.name,
      childAge: childProfile.age,
      bookId: SAMPLE_BOOK_ID
    });
    storyPages.push({
      pageNo: p.pageNo,
      type: "story",
      text: p.text,
      imagePrompt: prompt,
      imageUrl
    });
  }

  const coverPage: Page = {
    pageNo: 0,
    type: "cover",
    text: story.title,
    imagePrompt: "",
    imageUrl: cover.imageUrl
  };

  const backPage: Page = {
    pageNo: 7,
    type: "back",
    text: `A bedtime story made just for ${childProfile.name}`,
    imagePrompt: "",
    imageUrl: ""
  };

  const now = new Date().toISOString();
  const book: Book = {
    bookId: SAMPLE_BOOK_ID,
    childProfile,
    title: story.title,
    pages: [coverPage, ...storyPages, backPage],
    createdAt: now,
    updatedAt: now
  };

  await saveBook(book);

  // Generate PDF
  const pdf = new jsPDF({ orientation: "landscape", format: "a5", unit: "pt" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Title page
  pdf.setFillColor(74, 95, 193);
  pdf.rect(0, 0, pageWidth, pageHeight, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(28);
  const titleLines = pdf.splitTextToSize(book.title, pageWidth - 80);
  pdf.text(titleLines, pageWidth / 2, pageHeight / 2 - 20, { align: "center" });
  pdf.setFontSize(14);
  pdf.text(`A bedtime story for ${childProfile.name}`, pageWidth / 2, pageHeight / 2 + 20, {
    align: "center"
  });

  // Story pages
  for (const sp of storyPages) {
    pdf.addPage();
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, pageWidth, pageHeight, "F");
    pdf.setTextColor(180, 180, 180);
    pdf.setFontSize(10);
    pdf.text(`${sp.pageNo}`, pageWidth - 30, pageHeight - 20);
    pdf.setTextColor(40, 40, 40);
    pdf.setFontSize(13);
    const splitText = pdf.splitTextToSize(sp.text, pageWidth - 80);
    pdf.text(splitText, 40, 50);
  }

  // Back cover
  pdf.addPage();
  pdf.setFillColor(242, 181, 212);
  pdf.rect(0, 0, pageWidth, pageHeight, "F");
  pdf.setTextColor(74, 95, 193);
  pdf.setFontSize(14);
  pdf.text(`Made with love for ${childProfile.name}`, pageWidth / 2, pageHeight / 2, {
    align: "center"
  });

  const arrayBuffer = pdf.output("arraybuffer");
  const pdfPath = getPublicAssetPath(book.bookId, "book.pdf");
  await fs.mkdir(path.dirname(pdfPath), { recursive: true });
  await fs.writeFile(pdfPath, new Uint8Array(arrayBuffer));

  console.log(`Sample book saved to data/books/${book.bookId}.json`);
  console.log(`PDF written to ${pdfPath}`);
  console.log("Done. Open the Reader at /reader/sample-ahana to view it.");
}

main().catch((error) => {
  console.error("Failed to generate sample book", error);
  process.exitCode = 1;
});
