/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';

afterEach(cleanup);
import { Bookshelf } from '@/components/bookshelf/Bookshelf';
import type { Book } from '@/types/book';
import type { StoryConfig } from '@/types/template';

// Mock next/link
vi.mock('next/link', () => {
  const React = require('react');
  return {
    default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) =>
      React.createElement('a', { href, ...props }, children),
  };
});

const mockConfig: StoryConfig = {
  childName: 'Ahana',
  childAge: 4,
  childGender: 'girl',
  characterRefId: 'cs-1',
  familyMembers: [{ name: 'Mama', role: 'mama' }],
  city: 'Ulm',
  language: 'bilingual',
  tonePreset: 'gentle',
  ageVocabulary: 'preschool',
};

const makeBook = (id: string, templateId: string): Book => ({
  id,
  childProfileId: 'cp-1',
  templateId,
  config: mockConfig,
  status: 'ready',
  pages: [
    {
      pageNumber: 1,
      text: { en: 'text' },
      imagePrompt: '',
      imageUrl: '/generated/test/p1.svg',
    },
  ],
  language: 'bilingual',
  complianceCheck: {
    passed: true,
    checks: {
      noKnownIPNames: true,
      noFranchiseMotifs: true,
      genericExperiences: true,
      ageAppropriate: true,
      gdprCompliant: true,
      culturalSensitivity: true,
    },
    warnings: [],
    blockers: [],
  },
  createdAt: '2026-01-01',
});

describe('Bookshelf', () => {
  it('shows empty state when no books', () => {
    render(<Bookshelf books={[]} />);
    expect(screen.getByTestId('bookshelf-empty')).toBeDefined();
    expect(screen.getByTestId('bookshelf-empty').textContent).toContain('library is empty');
  });

  it('shows create link in empty state', () => {
    render(<Bookshelf books={[]} />);
    const links = screen.getAllByRole('link');
    const createLink = links.find((l) => l.getAttribute('href') === '/create');
    expect(createLink).toBeDefined();
  });

  it('renders book cards', () => {
    const books = [
      makeBook('b-1', 'kindergarten-first-day'),
      makeBook('b-2', 'zahnarzt'),
    ];
    render(<Bookshelf books={books} />);
    expect(screen.getByTestId('bookshelf')).toBeDefined();
    const cards1 = screen.getAllByTestId('book-card-b-1');
    const cards2 = screen.getAllByTestId('book-card-b-2');
    expect(cards1.length).toBeGreaterThanOrEqual(1);
    expect(cards2.length).toBeGreaterThanOrEqual(1);
  });

  it('links to reader page', () => {
    const books = [makeBook('b-1', 'kindergarten-first-day')];
    render(<Bookshelf books={books} />);
    const cards = screen.getAllByTestId('book-card-b-1');
    expect(cards[0].getAttribute('href')).toBe('/reader/b-1');
  });

  it('shows child name on card', () => {
    const books = [makeBook('b-1', 'kindergarten-first-day')];
    render(<Bookshelf books={books} />);
    const cards = screen.getAllByTestId('book-card-b-1');
    expect(cards[0].textContent).toContain('Ahana');
  });

  it('shows template and language info', () => {
    const books = [makeBook('b-1', 'kindergarten-first-day')];
    render(<Bookshelf books={books} />);
    const cards = screen.getAllByTestId('book-card-b-1');
    expect(cards[0].textContent).toContain('kindergarten-first-day');
    expect(cards[0].textContent).toContain('EN/DE');
  });

  it('renders cover image when available', () => {
    const books = [makeBook('b-1', 'kindergarten-first-day')];
    render(<Bookshelf books={books} />);
    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThan(0);
  });
});
