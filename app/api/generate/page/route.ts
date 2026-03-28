import { NextResponse } from 'next/server';
import { PageRequestSchema } from '@/lib/validation/api';
import type { PageResponse } from '@/types/api';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = PageRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const stub: PageResponse = {
    page: {
      pageNumber: parsed.data.pageNumber,
      text: {
        en: `Stub text for page ${parsed.data.pageNumber} in English.`,
        de: `Stub-Text fuer Seite ${parsed.data.pageNumber} auf Deutsch.`,
      },
      imagePrompt: `Illustration for page ${parsed.data.pageNumber}`,
      imageUrl: `/generated/stubs/page-${parsed.data.pageNumber}.svg`,
    },
  };

  return NextResponse.json(stub);
}
