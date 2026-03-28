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

import LandingPage from '@/app/page';

describe('Landing page sections', () => {
  it('renders hero section', () => {
    render(<LandingPage />);
    expect(screen.getByTestId('hero')).toBeDefined();
    expect(screen.getByTestId('hero').textContent).toContain('personalized book series');
  });

  it('renders how-it-works section', () => {
    render(<LandingPage />);
    expect(screen.getByTestId('how-it-works')).toBeDefined();
    expect(screen.getByTestId('how-it-works').textContent).toContain('Create a Profile');
    expect(screen.getByTestId('how-it-works').textContent).toContain('Pick a Story');
    expect(screen.getByTestId('how-it-works').textContent).toContain('Read or Print');
  });

  it('renders sample spread', () => {
    render(<LandingPage />);
    expect(screen.getByTestId('sample-spread')).toBeDefined();
  });

  it('renders pricing with 4 plans', () => {
    render(<LandingPage />);
    expect(screen.getByTestId('pricing')).toBeDefined();
    expect(screen.getByTestId('plan-free')).toBeDefined();
    expect(screen.getByTestId('plan-starter')).toBeDefined();
    expect(screen.getByTestId('plan-family')).toBeDefined();
    expect(screen.getByTestId('plan-premium')).toBeDefined();
  });

  it('family plan shows Popular badge', () => {
    render(<LandingPage />);
    expect(screen.getByTestId('plan-family').textContent).toContain('Popular');
  });

  it('renders FAQ section', () => {
    render(<LandingPage />);
    expect(screen.getByTestId('faq')).toBeDefined();
    expect(screen.getByTestId('faq').textContent).toContain('bilingual');
  });

  it('renders footer', () => {
    render(<LandingPage />);
    expect(screen.getByTestId('footer')).toBeDefined();
    expect(screen.getByTestId('footer').textContent).toContain('2026');
  });

  it('has CTA links to /create and /register', () => {
    render(<LandingPage />);
    const links = screen.getAllByRole('link');
    const hrefs = links.map((l) => l.getAttribute('href'));
    expect(hrefs).toContain('/create');
    expect(hrefs).toContain('/register');
  });
});
