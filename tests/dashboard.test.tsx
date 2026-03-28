/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';

afterEach(cleanup);

// Mock next/link
vi.mock('next/link', () => {
  const React = require('react');
  return {
    default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) =>
      React.createElement('a', { href, ...props }, children),
  };
});

import DashboardPage from '@/app/dashboard/page';

describe('Dashboard page', () => {
  it('renders dashboard title', () => {
    render(<DashboardPage />);
    expect(screen.getByTestId('dashboard-title').textContent).toContain('Dashboard');
  });

  it('shows subscription tier', () => {
    render(<DashboardPage />);
    expect(screen.getByTestId('subscription-tier')).toBeDefined();
    expect(screen.getByTestId('subscription-tier').textContent).toBe('free');
  });

  it('has create new book button', () => {
    render(<DashboardPage />);
    const btn = screen.getByTestId('create-button');
    expect(btn.getAttribute('href')).toBe('/create');
    expect(btn.textContent).toContain('Create New Book');
  });

  it('shows empty bookshelf', () => {
    render(<DashboardPage />);
    expect(screen.getByTestId('bookshelf-empty')).toBeDefined();
  });
});
