import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Deferred: TTS is not part of the POC
export async function POST() {
  return NextResponse.json(
    { error: "TTS is not yet implemented. Coming in a future release." },
    { status: 501 }
  );
}
