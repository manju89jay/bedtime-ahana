import { NextResponse } from 'next/server';
import { PageRequestSchema } from '@/lib/validation/api';
import { generatePageText } from '@/lib/ai/page-text';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = PageRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const result = await generatePageText({
      config: parsed.data.config,
      outline: parsed.data.outline,
      pageNumber: parsed.data.pageNumber,
    });

    return NextResponse.json({
      page: {
        pageNumber: result.pageNumber,
        text: result.text,
        imagePrompt: `Illustration for page ${result.pageNumber}`,
        imageUrl: '',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Page generation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
