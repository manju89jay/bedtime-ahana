import { NextResponse } from 'next/server';
import { OutlineRequestSchema } from '@/lib/validation/api';
import type { OutlineResponse } from '@/types/api';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = OutlineRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const stub: OutlineResponse = {
    outline: Array.from({ length: 24 }, (_, i) => ({
      page: i + 1,
      beat: `Beat ${i + 1} — stub outline for template ${parsed.data.templateId}`,
    })),
    templateId: parsed.data.templateId,
  };

  return NextResponse.json(stub);
}
