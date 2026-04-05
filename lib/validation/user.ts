import { z } from 'zod';

export const SubscriptionTierSchema = z.enum(['free', 'starter', 'family', 'premium']);

export const UserSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  subscription: SubscriptionTierSchema,
  language: z.enum(['en', 'de']),
  createdAt: z.string(),
});
