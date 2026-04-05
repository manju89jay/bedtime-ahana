import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ChildProfile } from '@/types/character';
import type { Book } from '@/types/book';

type GenerationStatus = 'idle' | 'generating' | 'complete' | 'error';

type BookState = {
  currentChild: ChildProfile | null;
  currentBook: Book | null;
  generationStatus: GenerationStatus;
  setChild: (child: ChildProfile | null) => void;
  setBook: (book: Book | null) => void;
  setStatus: (status: GenerationStatus) => void;
};

const isServer = typeof window === 'undefined';

export const useBookStore = create<BookState>()(
  persist(
    (set) => ({
      currentChild: null,
      currentBook: null,
      generationStatus: 'idle',
      setChild: (child) => set({ currentChild: child }),
      setBook: (book) => set({ currentBook: book }),
      setStatus: (status) => set({ generationStatus: status }),
    }),
    {
      name: 'book-store',
      storage: createJSONStorage(() =>
        isServer
          ? { getItem: () => null, setItem: () => {}, removeItem: () => {} }
          : sessionStorage
      ),
    }
  )
);
