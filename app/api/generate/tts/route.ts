import { NextResponse } from 'next/server';
import { TtsRequestSchema } from '@/lib/validation/api';
import { generateTts } from '@/lib/ai/tts';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = TtsRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const result = await generateTts({
      text: parsed.data.text,
      language: parsed.data.language,
      pageNumber: 1,
      bookId: 'api-call',
    });
    return NextResponse.json({ audioUrl: result.audioUrl });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'TTS generation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
