import { NextResponse } from "next/server";
import { generateOutline } from "@/lib/ai/text";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json();
  const outline = await generateOutline(body);
  const response = {
    title: outline.title,
    moral: outline.moral,
    pages: outline.pages.map((page) => ({
      pageNo: page.pageNo,
      beat_title: page.beat_title,
      summary: page.summary
    }))
  };
  return NextResponse.json(response);
}
