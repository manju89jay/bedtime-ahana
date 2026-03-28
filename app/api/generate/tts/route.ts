import { NextResponse } from 'next/server';
import { TtsRequestSchema } from '@/lib/validation/api';
import type { TtsResponse } from '@/types/api';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = TtsRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const stub: TtsResponse = {
    audioUrl: `/generated/stubs/tts-${parsed.data.language}.mp3`,
  };

  return NextResponse.json(stub);
}
