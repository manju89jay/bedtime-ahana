import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Deprecated: use /api/generate instead
export async function POST() {
  return NextResponse.json(
    { error: "This endpoint is deprecated. Use /api/generate instead." },
    { status: 410 }
  );
}
