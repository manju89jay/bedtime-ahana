import { describe, expect, it, beforeEach } from 'vitest';
import { useBookStore } from '@/lib/store/book-store';
import { useUserStore } from '@/lib/store/user-store';

describe('book-store', () => {
  beforeEach(() => {
    useBookStore.setState({
      currentChild: null,
      currentBook: null,
      generationStatus: 'idle',
    });
  });

  it('initializes with correct defaults', () => {
    const state = useBookStore.getState();
    expect(state.currentChild).toBeNull();
    expect(state.currentBook).toBeNull();
    expect(state.generationStatus).toBe('idle');
  });

  it('setChild updates currentChild', () => {
    const child = {
      id: 'cp-1',
      userId: 'u-1',
      name: 'Ahana',
      age: 4 as const,
      gender: 'girl' as const,
      characterSheetId: 'cs-1',
      signatureOutfit: { top: 't-shirt', bottom: 'jeans', shoes: 'sneakers', color: 'yellow' },
      companionObject: { name: 'Hoppel', type: 'bunny', description: 'plush' },
      city: 'Ulm',
      familyMembers: [{ name: 'Mama', role: 'mama' as const }],
      createdAt: '2026-01-01',
    };
    useBookStore.getState().setChild(child);
    expect(useBookStore.getState().currentChild).toEqual(child);
  });

  it('setStatus updates generationStatus', () => {
    useBookStore.getState().setStatus('generating');
    expect(useBookStore.getState().generationStatus).toBe('generating');
    useBookStore.getState().setStatus('complete');
    expect(useBookStore.getState().generationStatus).toBe('complete');
  });

  it('setBook updates currentBook', () => {
    useBookStore.getState().setBook(null);
    expect(useBookStore.getState().currentBook).toBeNull();
  });
});

describe('user-store', () => {
  beforeEach(() => {
    useUserStore.setState({
      user: null,
      subscription: 'free',
    });
  });

  it('initializes with correct defaults', () => {
    const state = useUserStore.getState();
    expect(state.user).toBeNull();
    expect(state.subscription).toBe('free');
  });

  it('setUser updates user', () => {
    const user = {
      id: 'u-1',
      email: 'test@example.com',
      subscription: 'starter' as const,
      language: 'en' as const,
      createdAt: '2026-01-01',
    };
    useUserStore.getState().setUser(user);
    expect(useUserStore.getState().user).toEqual(user);
  });

  it('setSubscription updates subscription', () => {
    useUserStore.getState().setSubscription('premium');
    expect(useUserStore.getState().subscription).toBe('premium');
  });
});
