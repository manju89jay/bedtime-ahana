import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, SubscriptionTier } from '@/types/user';

type UserState = {
  user: User | null;
  subscription: SubscriptionTier;
  setUser: (user: User | null) => void;
  setSubscription: (tier: SubscriptionTier) => void;
};

const isServer = typeof window === 'undefined';

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      subscription: 'free',
      setUser: (user) => set({ user }),
      setSubscription: (subscription) => set({ subscription }),
    }),
    {
      name: 'user-store',
      storage: createJSONStorage(() =>
        isServer
          ? { getItem: () => null, setItem: () => {}, removeItem: () => {} }
          : sessionStorage
      ),
    }
  )
);
