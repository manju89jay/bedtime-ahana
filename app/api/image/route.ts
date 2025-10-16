import { NextResponse } from "next/server";
import { createImageAsset } from "@/lib/ai/image";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json();
  const image = await createImageAsset(body);
  return NextResponse.json(image);
}
