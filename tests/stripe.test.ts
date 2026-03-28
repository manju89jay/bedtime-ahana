import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { PRICING_PLANS } from '@/lib/payments/stripe-stub';

const originalEnv = process.env;

describe('pricing plans', () => {
  it('has 4 tiers', () => {
    expect(PRICING_PLANS).toHaveLength(4);
  });

  it('includes free, starter, family, premium', () => {
    const tiers = PRICING_PLANS.map((p) => p.tier);
    expect(tiers).toEqual(['free', 'starter', 'family', 'premium']);
  });

  it('free tier costs 0', () => {
    const free = PRICING_PLANS.find((p) => p.tier === 'free');
    expect(free?.priceMonthly).toBe(0);
  });

  it('family tier is highlighted', () => {
    const family = PRICING_PLANS.find((p) => p.tier === 'family');
    expect(family?.highlighted).toBe(true);
  });

  it('each plan has features', () => {
    for (const plan of PRICING_PLANS) {
      expect(plan.features.length).toBeGreaterThanOrEqual(3);
    }
  });
});

describe('checkout session (stub mode)', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv, USE_STUBS: 'true' };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('returns a stub checkout URL', async () => {
    const { createCheckoutSession } = await import('@/lib/payments/stripe-stub');
    const result = await createCheckoutSession({ userId: 'u-1', tier: 'starter' });
    expect(result.checkoutUrl).toContain('starter');
    expect(result.sessionId).toContain('cs_stub');
  });
});

describe('webhook handler', () => {
  it('acknowledges webhook', async () => {
    const { handleWebhookEvent } = await import('@/lib/payments/stripe-stub');
    const result = await handleWebhookEvent('{}', 'sig');
    expect(result.received).toBe(true);
  });
});
