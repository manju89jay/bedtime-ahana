import { NextResponse } from 'next/server';
import { CharacterRequestSchema } from '@/lib/validation/api';
import type { CharacterResponse } from '@/types/api';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = CharacterRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const stub: CharacterResponse = {
    characterSheet: {
      id: 'cs-stub-001',
      childProfileId: 'cp-stub-001',
      referenceImages: {
        front: '/generated/stubs/front.svg',
        threeQuarterLeft: '/generated/stubs/3q-left.svg',
        threeQuarterRight: '/generated/stubs/3q-right.svg',
        walking: '/generated/stubs/walking.svg',
        sitting: '/generated/stubs/sitting.svg',
        withCompanion: '/generated/stubs/companion.svg',
      },
      styleLoraId: 'watercolor-v1',
      version: 1,
      createdAt: new Date().toISOString(),
    },
  };

  return NextResponse.json(stub);
}
