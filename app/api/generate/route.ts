import { NextResponse } from "next/server";
import { generateStory, generateStoryFallback } from "@/lib/ai/text";
import { generateImage, writePlaceholderImage, generateCoverImage } from "@/lib/ai/image";
import { saveBook, ensureBookDirs } from "@/lib/storage";
import { createBookId } from "@/lib/id";
import { checkBookForIPRisks } from "@/lib/compliance";
import type { LegacyChildProfile as ChildProfile, LegacyBook as Book, LegacyPage as Page } from "@/types/legacy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { childProfile, templateId, storyIdea, templatePrompt } = body as {
      childProfile: ChildProfile;
      templateId?: string;
      storyIdea?: string;
      templatePrompt?: string;
    };

    if (!childProfile?.name || !childProfile?.age) {
      return NextResponse.json({ error: "Name and age are required" }, { status: 400 });
    }

    const bookId = createBookId();
    await ensureBookDirs(bookId);

    // Determine story input
    const storyInput = storyIdea
      ? `Story idea: ${storyIdea}`
      : templatePrompt
        ? templatePrompt
        : "Write a gentle bedtime story about a cozy evening at home.";

    // Generate story text
    let generatedStory;
    try {
      generatedStory = await generateStory(childProfile, storyInput);
    } catch (error) {
      console.warn("AI generation failed, using fallback:", error);
      generatedStory = generateStoryFallback(childProfile, storyInput);
    }

    // Generate cover
    const cover = await generateCoverImage({
      title: generatedStory.title,
      childName: childProfile.name,
      childAge: childProfile.age,
      bookId
    });

    // Generate images for each page (in parallel)
    const imagePromises = generatedStory.pages.map((p) => {
      const hasOpenAI = !!process.env.OPENAI_API_KEY;
      const fn = hasOpenAI ? generateImage : writePlaceholderImage;
      return fn({
        pageNo: p.pageNo,
        imageDescription: p.imageDescription,
        childName: childProfile.name,
        childAge: childProfile.age,
        bookId
      });
    });

    const images = await Promise.all(imagePromises);

    // Assemble book
    const coverPage: Page = {
      pageNo: 0,
      type: "cover",
      text: generatedStory.title,
      imagePrompt: "",
      imageUrl: cover.imageUrl
    };

    const storyPages: Page[] = generatedStory.pages.map((p, i) => ({
      pageNo: p.pageNo,
      type: "story" as const,
      text: p.text,
      imagePrompt: images[i].prompt,
      imageUrl: images[i].imageUrl
    }));

    const backPage: Page = {
      pageNo: 7,
      type: "back",
      text: `A bedtime story made just for ${childProfile.name}`,
      imagePrompt: "",
      imageUrl: ""
    };

    const book: Book = {
      bookId,
      childProfile,
      templateId,
      storyIdea,
      title: generatedStory.title,
      pages: [coverPage, ...storyPages, backPage],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Run compliance check
    const issues = checkBookForIPRisks(book);
    if (issues.length > 0) {
      console.warn("Compliance issues found:", issues);
    }

    // Save book
    await saveBook(book);

    return NextResponse.json({ book, complianceIssues: issues });
  } catch (error: any) {
    console.error("Book generation failed:", error);
    return NextResponse.json(
      { error: error.message || "Book generation failed" },
      { status: 500 }
    );
  }
}
