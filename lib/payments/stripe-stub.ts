import type { SubscriptionTier } from '@/types/user';

export type PricingPlan = {
  tier: SubscriptionTier;
  name: string;
  price: string;
  priceMonthly: number;
  features: string[];
  highlighted?: boolean;
};

export const PRICING_PLANS: PricingPlan[] = [
  {
    tier: 'free',
    name: 'Free',
    price: '€0',
    priceMonthly: 0,
    features: [
      '1 child profile',
      '1 story per month',
      'Digital only',
      'Watermark on PDFs',
    ],
  },
  {
    tier: 'starter',
    name: 'Starter',
    price: '€4.99/mo',
    priceMonthly: 4.99,
    features: [
      '1 child profile',
      '3 stories per month',
      'No watermark',
      'PDF export',
    ],
  },
  {
    tier: 'family',
    name: 'Family',
    price: '€9.99/mo',
    priceMonthly: 9.99,
    features: [
      '3 child profiles',
      'Unlimited digital',
      '1 printed book/month',
      'Priority support',
    ],
    highlighted: true,
  },
  {
    tier: 'premium',
    name: 'Premium',
    price: '€14.99/mo',
    priceMonthly: 14.99,
    features: [
      '5 child profiles',
      'Unlimited everything',
      '2 printed books/month',
      'Priority generation',
    ],
  },
];

export type CreateCheckoutInput = {
  userId: string;
  tier: SubscriptionTier;
};

export type CheckoutResult = {
  checkoutUrl: string;
  sessionId: string;
};

const isStubMode = () => process.env.USE_STUBS === 'true';

export async function createCheckoutSession(
  input: CreateCheckoutInput
): Promise<CheckoutResult> {
  if (isStubMode() || !process.env.STRIPE_SECRET_KEY) {
    return {
      checkoutUrl: `/api/stripe/webhook?stub=true&tier=${input.tier}&userId=${input.userId}`,
      sessionId: `cs_stub_${Date.now()}`,
    };
  }

  // Live: Stripe API call
  return {
    checkoutUrl: '/stub-checkout',
    sessionId: `cs_stub_${Date.now()}`,
  };
}

export async function handleWebhookEvent(
  body: string,
  _signature: string
): Promise<{ received: boolean; event?: string }> {
  // Stub: parse and acknowledge
  return { received: true, event: 'stub' };
}
