/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ExportDropdown } from '@/components/reader/ExportDropdown';

afterEach(cleanup);

describe('ExportDropdown', () => {
  it('renders export button', () => {
    render(<ExportDropdown bookId="book-1" />);
    expect(screen.getByTestId('export-button')).toBeDefined();
    expect(screen.getByTestId('export-button').textContent).toContain('Export PDF');
  });

  it('opens menu on click', () => {
    render(<ExportDropdown bookId="book-1" />);
    expect(screen.queryByTestId('export-menu')).toBeNull();

    fireEvent.click(screen.getByTestId('export-button'));
    expect(screen.getByTestId('export-menu')).toBeDefined();
  });

  it('shows 3 export options', () => {
    render(<ExportDropdown bookId="book-1" />);
    fireEvent.click(screen.getByTestId('export-button'));

    expect(screen.getByTestId('export-screen')).toBeDefined();
    expect(screen.getByTestId('export-print-10x10')).toBeDefined();
    expect(screen.getByTestId('export-print-15x15')).toBeDefined();
  });

  it('shows format descriptions', () => {
    render(<ExportDropdown bookId="book-1" />);
    fireEvent.click(screen.getByTestId('export-button'));

    expect(screen.getByTestId('export-screen').textContent).toContain('A5');
    expect(screen.getByTestId('export-print-10x10').textContent).toContain('300 DPI');
    expect(screen.getByTestId('export-print-15x15').textContent).toContain('300 DPI');
  });

  it('closes menu when option clicked', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ pdfUrl: '/test.pdf' }),
    });

    render(<ExportDropdown bookId="book-1" />);
    fireEvent.click(screen.getByTestId('export-button'));
    fireEvent.click(screen.getByTestId('export-screen'));

    // Menu should close
    expect(screen.queryByTestId('export-menu')).toBeNull();
  });

  it('applies night mode styling', () => {
    render(<ExportDropdown bookId="book-1" nightMode />);
    const btn = screen.getByTestId('export-button');
    expect(btn.className).toContain('bg-slate-700');
  });
});
