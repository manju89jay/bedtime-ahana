import { NextResponse } from 'next/server';
import { ImageRequestSchema } from '@/lib/validation/api';
import type { ImageResponse } from '@/types/api';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = ImageRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const stub: ImageResponse = {
    imageUrl: `/generated/stubs/image-p${parsed.data.page.pageNumber}.svg`,
  };

  return NextResponse.json(stub);
}
