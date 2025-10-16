import { NextResponse } from "next/server";
import { generatePageText } from "@/lib/ai/text";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json();
  const page = await generatePageText(body);
  return NextResponse.json(page);
}
