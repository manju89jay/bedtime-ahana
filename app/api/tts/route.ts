import { NextResponse } from "next/server";
import { createTTSAsset } from "@/lib/ai/tts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json();
  const audio = await createTTSAsset(body);
  return NextResponse.json(audio);
}
