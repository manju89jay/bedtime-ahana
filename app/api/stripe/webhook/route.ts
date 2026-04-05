import { NextResponse } from 'next/server';
import { handleWebhookEvent } from '@/lib/payments/stripe-stub';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature') ?? '';

  try {
    const result = await handleWebhookEvent(body, signature);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Webhook failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
