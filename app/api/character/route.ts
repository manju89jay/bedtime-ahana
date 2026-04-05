import { NextResponse } from 'next/server';
import { CharacterRequestSchema } from '@/lib/validation/api';
import { detectFaces } from '@/lib/ai/face-detect';
import { generateCharacterSheet } from '@/lib/ai/character-sheet';
import type { CharacterResponse } from '@/types/api';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = CharacterRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const faceResults = await detectFaces(parsed.data.photos);
    const anyFaceDetected = faceResults.some((r) => r.detected);

    const characterSheet = await generateCharacterSheet({
      childProfile: parsed.data.childProfile,
      faceDetected: anyFaceDetected,
    });

    const response: CharacterResponse = { characterSheet };
    return NextResponse.json(response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Character generation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
