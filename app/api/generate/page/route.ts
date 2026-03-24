import { NextResponse } from "next/server";
import { regeneratePageText } from "@/lib/ai/text";
import { generateImage, writePlaceholderImage } from "@/lib/ai/image";
import { loadBook, saveBook } from "@/lib/storage";
import type { ChildProfile } from "@/types/book";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bookId, pageNo } = body as { bookId: string; pageNo: number };

    const book = await loadBook(bookId);
    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const pageIndex = book.pages.findIndex((p) => p.pageNo === pageNo);
    if (pageIndex === -1) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const currentPage = book.pages[pageIndex];
    const storyPages = book.pages.filter((p) => p.type === "story");

    // Regenerate text
    const result = await regeneratePageText(
      book.childProfile,
      book.title,
      pageNo,
      currentPage.text,
      storyPages.map((p) => ({ pageNo: p.pageNo, text: p.text }))
    );

    // Regenerate image
    const hasOpenAI = !!process.env.OPENAI_API_KEY;
    const imageFn = hasOpenAI ? generateImage : writePlaceholderImage;
    const image = await imageFn({
      pageNo,
      imageDescription: result.imageDescription,
      childName: book.childProfile.name,
      childAge: book.childProfile.age,
      bookId
    });

    // Update page in book
    book.pages[pageIndex] = {
      ...currentPage,
      text: result.text,
      imagePrompt: image.prompt,
      imageUrl: image.imageUrl
    };
    book.updatedAt = new Date().toISOString();

    await saveBook(book);

    return NextResponse.json({
      page: book.pages[pageIndex],
      book
    });
  } catch (error: any) {
    console.error("Page regeneration failed:", error);
    return NextResponse.json(
      { error: error.message || "Page regeneration failed" },
      { status: 500 }
    );
  }
}
