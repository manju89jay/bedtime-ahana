import { NextResponse } from "next/server";
import { generateImage, writePlaceholderImage } from "@/lib/ai/image";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pageNo, imageDescription, childName, childAge, bookId } = body;

    const hasOpenAI = !!process.env.OPENAI_API_KEY;
    const fn = hasOpenAI ? generateImage : writePlaceholderImage;

    const result = await fn({
      pageNo,
      imageDescription,
      childName,
      childAge,
      bookId
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Image generation failed:", error);
    return NextResponse.json(
      { error: error.message || "Image generation failed" },
      { status: 500 }
    );
  }
}
