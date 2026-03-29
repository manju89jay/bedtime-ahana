import { NextResponse } from 'next/server';
import { ImageRequestSchema } from '@/lib/validation/api';
import { generateImage } from '@/lib/ai/image-gen';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = ImageRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const result = await generateImage({
      imagePrompt: parsed.data.page.imagePrompt,
      pageNumber: parsed.data.page.pageNumber,
      bookId: `api-${Date.now().toString(36)}`,
      characterRefId: parsed.data.characterRefId,
    });
    return NextResponse.json({ imageUrl: result.imageUrl });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Image generation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
