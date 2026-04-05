export type SubscriptionTier = 'free' | 'starter' | 'family' | 'premium';

export type User = {
  id: string;
  email: string;
  subscription: SubscriptionTier;
  language: 'en' | 'de';
  createdAt: string;
};
