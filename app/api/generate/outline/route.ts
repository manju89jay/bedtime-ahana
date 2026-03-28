import { NextResponse } from 'next/server';
import { OutlineRequestSchema } from '@/lib/validation/api';
import { generateOutline } from '@/lib/ai/outline';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = OutlineRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const result = await generateOutline({
      config: parsed.data.config,
      templateId: parsed.data.templateId,
    });
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Outline generation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
