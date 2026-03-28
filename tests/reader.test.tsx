/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';

afterEach(cleanup);

import { PageView } from '@/components/reader/PageView';
import { TextOverlay } from '@/components/reader/TextOverlay';
import { AudioPlayer } from '@/components/reader/AudioPlayer';
import { BookReader } from '@/components/reader/BookReader';
import type { Book, Page } from '@/types/book';
import type { StoryConfig } from '@/types/template';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => {
  const React = require('react');
  return {
    motion: {
      div: ({ children, ...props }: Record<string, unknown>) => {
        const { custom, variants, initial, animate, exit, transition, ...rest } = props;
        return React.createElement('div', rest, children);
      },
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
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

const mockPages: Page[] = Array.from({ length: 3 }, (_, i) => ({
  pageNumber: i + 1,
  text: { en: `English text page ${i + 1}`, de: `Deutscher Text Seite ${i + 1}` },
  imagePrompt: `prompt ${i + 1}`,
  imageUrl: `/generated/test/p${i + 1}.svg`,
  audioUrl: `/generated/test/audio-p${i + 1}.mp3`,
}));

const mockBook: Book = {
  id: 'book-test',
  childProfileId: 'cp-1',
  templateId: 'kindergarten-first-day',
  config: mockConfig,
  status: 'ready',
  pages: mockPages,
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
  generatedAt: '2026-01-01',
};

describe('PageView', () => {
  it('renders image when imageUrl is provided', () => {
    render(<PageView imageUrl="/test.svg" pageNumber={1} alt="Test" />);
    const img = screen.getByTestId('page-image');
    expect(img).toBeDefined();
    expect(img.getAttribute('src')).toBe('/test.svg');
  });

  it('renders placeholder when no imageUrl', () => {
    render(<PageView imageUrl="" pageNumber={5} alt="Test" />);
    // When no imageUrl, the page number placeholder shows instead of img
    expect(screen.queryByTestId('page-image')).toBeFalsy();
  });

  it('toggles zoom on click', () => {
    render(<PageView imageUrl="/test.svg" pageNumber={1} alt="Test" />);
    const container = screen.getByTestId('page-view');
    const img = screen.getByTestId('page-image');

    // Initially not zoomed (scale-100)
    expect(img.className).toContain('scale-100');

    fireEvent.click(container);
    expect(img.className).toContain('scale-150');

    fireEvent.click(container);
    expect(img.className).toContain('scale-100');
  });

  it('applies night mode brightness', () => {
    render(<PageView imageUrl="/test.svg" pageNumber={1} alt="Test" nightMode />);
    const container = screen.getByTestId('page-view');
    expect(container.className).toContain('brightness-75');
  });
});

describe('TextOverlay', () => {
  it('displays English text by default for bilingual', () => {
    render(
      <TextOverlay
        text={{ en: 'Hello world', de: 'Hallo Welt' }}
        language="bilingual"
      />,
    );
    expect(screen.getByTestId('page-text').textContent).toBe('Hello world');
  });

  it('displays German text when language is de', () => {
    render(
      <TextOverlay
        text={{ en: 'Hello world', de: 'Hallo Welt' }}
        language="de"
      />,
    );
    expect(screen.getByTestId('page-text').textContent).toBe('Hallo Welt');
  });

  it('shows language toggle for bilingual', () => {
    render(
      <TextOverlay
        text={{ en: 'Hello', de: 'Hallo' }}
        language="bilingual"
      />,
    );
    expect(screen.getByTestId('lang-toggle')).toBeDefined();
    expect(screen.getByTestId('lang-en')).toBeDefined();
    expect(screen.getByTestId('lang-de')).toBeDefined();
  });

  it('hides toggle for single language', () => {
    render(
      <TextOverlay text={{ en: 'Hello' }} language="en" />,
    );
    expect(screen.queryByTestId('lang-toggle')).toBeNull();
  });

  it('switches language on toggle click', () => {
    render(
      <TextOverlay
        text={{ en: 'Hello', de: 'Hallo' }}
        language="bilingual"
      />,
    );
    expect(screen.getByTestId('page-text').textContent).toBe('Hello');

    fireEvent.click(screen.getByTestId('lang-de'));
    expect(screen.getByTestId('page-text').textContent).toBe('Hallo');

    fireEvent.click(screen.getByTestId('lang-en'));
    expect(screen.getByTestId('page-text').textContent).toBe('Hello');
  });

  it('enters edit mode when edit button clicked', () => {
    render(
      <TextOverlay
        text={{ en: 'Hello' }}
        language="en"
        editable
        onTextChange={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByTestId('edit-button'));
    expect(screen.getByTestId('text-editor')).toBeDefined();
  });

  it('applies night mode styling', () => {
    render(
      <TextOverlay text={{ en: 'Hello' }} language="en" nightMode />,
    );
    const overlay = screen.getByTestId('text-overlay');
    expect(overlay.className).toContain('bg-slate-800');
  });
});

describe('AudioPlayer', () => {
  it('renders when audioUrl is provided', () => {
    render(<AudioPlayer audioUrl="/test.mp3" />);
    expect(screen.getByTestId('audio-player')).toBeDefined();
    expect(screen.getByTestId('audio-player').textContent).toContain('Listen');
  });

  it('does not render when no audioUrl', () => {
    const { container } = render(<AudioPlayer />);
    expect(container.innerHTML).toBe('');
  });

  it('toggles play/pause', () => {
    render(<AudioPlayer audioUrl="/test.mp3" />);
    const btn = screen.getByTestId('audio-player');

    expect(btn.textContent).toContain('Listen');
    fireEvent.click(btn);
    expect(btn.textContent).toContain('Pause');
    fireEvent.click(btn);
    expect(btn.textContent).toContain('Listen');
  });

  it('applies night mode', () => {
    render(<AudioPlayer audioUrl="/test.mp3" nightMode />);
    const btn = screen.getByTestId('audio-player');
    expect(btn.className).toContain('bg-slate-700');
  });
});

describe('BookReader', () => {
  it('renders with book title', () => {
    render(<BookReader book={mockBook} />);
    expect(screen.getByTestId('book-title').textContent).toContain('Ahana');
  });

  it('shows first page initially', () => {
    render(<BookReader book={mockBook} />);
    expect(screen.getByTestId('page-text').textContent).toBe('English text page 1');
  });

  it('navigates to next page', () => {
    render(<BookReader book={mockBook} />);
    fireEvent.click(screen.getByTestId('next-button'));
    expect(screen.getByTestId('page-text').textContent).toBe('English text page 2');
  });

  it('navigates to previous page', () => {
    render(<BookReader book={mockBook} />);
    fireEvent.click(screen.getByTestId('next-button'));
    fireEvent.click(screen.getByTestId('prev-button'));
    expect(screen.getByTestId('page-text').textContent).toBe('English text page 1');
  });

  it('toggles night mode', () => {
    render(<BookReader book={mockBook} />);
    const reader = screen.getByTestId('book-reader');
    expect(reader.className).toContain('bg-slate-50');

    fireEvent.click(screen.getByTestId('night-mode-toggle'));
    expect(reader.className).toContain('bg-slate-900');
  });

  it('shows page indicator', () => {
    render(<BookReader book={mockBook} />);
    expect(screen.getByTestId('page-indicator').textContent).toBe('1 / 3');
  });

  it('renders thumbnail strip', () => {
    render(<BookReader book={mockBook} />);
    expect(screen.getByTestId('thumb-1')).toBeDefined();
    expect(screen.getByTestId('thumb-2')).toBeDefined();
    expect(screen.getByTestId('thumb-3')).toBeDefined();
  });

  it('navigates via thumbnail click', () => {
    render(<BookReader book={mockBook} />);
    fireEvent.click(screen.getByTestId('thumb-3'));
    expect(screen.getByTestId('page-text').textContent).toBe('English text page 3');
    expect(screen.getByTestId('page-indicator').textContent).toBe('3 / 3');
  });

  it('shows audio player', () => {
    render(<BookReader book={mockBook} />);
    expect(screen.getByTestId('audio-player')).toBeDefined();
  });

  it('calls onSaveEdit when text is edited', () => {
    const onSave = vi.fn();
    render(<BookReader book={mockBook} onSaveEdit={onSave} />);

    // Click edit, change text, blur to save
    fireEvent.click(screen.getByTestId('edit-button'));
    const editor = screen.getByTestId('text-editor');
    fireEvent.change(editor, { target: { value: 'Updated text' } });
    fireEvent.blur(editor);

    expect(onSave).toHaveBeenCalledTimes(1);
    const savedBook = onSave.mock.calls[0][0] as Book;
    expect(savedBook.pages[0].text.en).toBe('Updated text');
  });

  it('prev button disabled on first page', () => {
    render(<BookReader book={mockBook} />);
    const prevBtn = screen.getByTestId('prev-button') as HTMLButtonElement;
    expect(prevBtn.disabled).toBe(true);
  });

  it('next button disabled on last page', () => {
    render(<BookReader book={mockBook} />);
    fireEvent.click(screen.getByTestId('thumb-3'));
    const nextBtn = screen.getByTestId('next-button') as HTMLButtonElement;
    expect(nextBtn.disabled).toBe(true);
  });
});
