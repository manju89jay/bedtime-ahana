/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';

afterEach(cleanup);

import { ChildProfileStep } from '@/components/wizard/ChildProfileStep';
import { FamilyStep } from '@/components/wizard/FamilyStep';
import { StorySelectStep } from '@/components/wizard/StorySelectStep';
import { CustomizeStep } from '@/components/wizard/CustomizeStep';
import { getTemplates } from '@/data/templates/index';

describe('ChildProfileStep', () => {
  it('renders all form fields', () => {
    render(<ChildProfileStep onNext={vi.fn()} />);
    expect(screen.getByTestId('input-name')).toBeDefined();
    expect(screen.getByTestId('input-city')).toBeDefined();
    expect(screen.getByTestId('input-companion')).toBeDefined();
    expect(screen.getByTestId('age-selector')).toBeDefined();
    expect(screen.getByTestId('gender-selector')).toBeDefined();
    expect(screen.getByTestId('language-selector')).toBeDefined();
    expect(screen.getByTestId('outfit-color-selector')).toBeDefined();
    expect(screen.getByTestId('outfit-top-selector')).toBeDefined();
  });

  it('requires name and city', () => {
    const onNext = vi.fn();
    render(<ChildProfileStep onNext={onNext} />);
    const btn = screen.getByTestId('next-button') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it('calls onNext with profile data when valid', () => {
    const onNext = vi.fn();
    render(<ChildProfileStep onNext={onNext} />);

    fireEvent.change(screen.getByTestId('input-name'), { target: { value: 'Ahana' } });
    fireEvent.change(screen.getByTestId('input-city'), { target: { value: 'Ulm' } });
    fireEvent.change(screen.getByTestId('input-companion'), { target: { value: 'Hoppel' } });

    fireEvent.click(screen.getByTestId('next-button'));

    expect(onNext).toHaveBeenCalledTimes(1);
    const data = onNext.mock.calls[0][0];
    expect(data.name).toBe('Ahana');
    expect(data.city).toBe('Ulm');
    expect(data.companionObject).toBe('Hoppel');
    expect(data.age).toBe(4);
    expect(data.gender).toBe('girl');
    expect(data.language).toBe('bilingual');
  });

  it('preserves initial data', () => {
    render(
      <ChildProfileStep
        initial={{ name: 'Maya', city: 'Berlin', age: 5, gender: 'boy' }}
        onNext={vi.fn()}
      />,
    );
    expect((screen.getByTestId('input-name') as HTMLInputElement).value).toBe('Maya');
    expect((screen.getByTestId('input-city') as HTMLInputElement).value).toBe('Berlin');
  });

  it('outfit color selector has 6 options', () => {
    render(<ChildProfileStep onNext={vi.fn()} />);
    const selector = screen.getByTestId('outfit-color-selector');
    expect(selector.children.length).toBe(6);
  });
});

describe('FamilyStep', () => {
  it('renders with one default member', () => {
    render(<FamilyStep onNext={vi.fn()} onBack={vi.fn()} />);
    expect(screen.getByTestId('family-member-0')).toBeDefined();
  });

  it('adds a family member', () => {
    render(<FamilyStep onNext={vi.fn()} onBack={vi.fn()} />);
    fireEvent.click(screen.getByTestId('add-member'));
    expect(screen.getByTestId('family-member-1')).toBeDefined();
  });

  it('removes a family member', () => {
    render(<FamilyStep onNext={vi.fn()} onBack={vi.fn()} />);
    fireEvent.click(screen.getByTestId('add-member'));
    expect(screen.getByTestId('family-member-1')).toBeDefined();
    fireEvent.click(screen.getByTestId('remove-member-1'));
    expect(screen.queryByTestId('family-member-1')).toBeNull();
  });

  it('requires at least one named member', () => {
    const onNext = vi.fn();
    render(<FamilyStep onNext={onNext} onBack={vi.fn()} />);
    const btn = screen.getByTestId('next-button') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);

    fireEvent.change(screen.getByTestId('member-name-0'), { target: { value: 'Mama' } });
    expect((screen.getByTestId('next-button') as HTMLButtonElement).disabled).toBe(false);
  });

  it('calls onNext with family data', () => {
    const onNext = vi.fn();
    render(<FamilyStep onNext={onNext} onBack={vi.fn()} />);
    fireEvent.change(screen.getByTestId('member-name-0'), { target: { value: 'Mama' } });
    fireEvent.click(screen.getByTestId('next-button'));

    expect(onNext).toHaveBeenCalledTimes(1);
    const data = onNext.mock.calls[0][0];
    expect(data.familyMembers).toHaveLength(1);
    expect(data.familyMembers[0].name).toBe('Mama');
  });

  it('calls onBack', () => {
    const onBack = vi.fn();
    render(<FamilyStep onNext={vi.fn()} onBack={onBack} />);
    fireEvent.click(screen.getByTestId('back-button'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('shows pet name field when pet type selected', () => {
    render(<FamilyStep onNext={vi.fn()} onBack={vi.fn()} />);
    expect(screen.queryByTestId('input-pet-name')).toBeNull();

    const catButton = screen.getByText('Cat');
    fireEvent.click(catButton);
    expect(screen.getByTestId('input-pet-name')).toBeDefined();
  });
});

describe('StorySelectStep', () => {
  const templates = getTemplates();

  it('renders all 6 templates', () => {
    render(
      <StorySelectStep
        templates={templates}
        selected={null}
        onSelect={vi.fn()}
        onNext={vi.fn()}
        onBack={vi.fn()}
      />,
    );
    for (const t of templates) {
      expect(screen.getByTestId(`template-${t.templateId}`)).toBeDefined();
    }
  });

  it('next button disabled when no template selected', () => {
    render(
      <StorySelectStep
        templates={templates}
        selected={null}
        onSelect={vi.fn()}
        onNext={vi.fn()}
        onBack={vi.fn()}
      />,
    );
    expect((screen.getByTestId('next-button') as HTMLButtonElement).disabled).toBe(true);
  });

  it('calls onSelect when template clicked', () => {
    const onSelect = vi.fn();
    render(
      <StorySelectStep
        templates={templates}
        selected={null}
        onSelect={onSelect}
        onNext={vi.fn()}
        onBack={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByTestId('template-zahnarzt'));
    expect(onSelect).toHaveBeenCalledWith('zahnarzt');
  });

  it('next button enabled when template selected', () => {
    render(
      <StorySelectStep
        templates={templates}
        selected="kindergarten-first-day"
        onSelect={vi.fn()}
        onNext={vi.fn()}
        onBack={vi.fn()}
      />,
    );
    expect((screen.getByTestId('next-button') as HTMLButtonElement).disabled).toBe(false);
  });

  it('shows template titles and morals', () => {
    render(
      <StorySelectStep
        templates={templates}
        selected={null}
        onSelect={vi.fn()}
        onNext={vi.fn()}
        onBack={vi.fn()}
      />,
    );
    const card = screen.getByTestId('template-kindergarten-first-day');
    expect(card.textContent).toContain('Kindergarten');
  });
});

describe('CustomizeStep', () => {
  it('renders tone and vocabulary selectors', () => {
    render(
      <CustomizeStep
        childAge={4}
        templateId="zahnarzt"
        onNext={vi.fn()}
        onBack={vi.fn()}
      />,
    );
    expect(screen.getByTestId('tone-selector')).toBeDefined();
    expect(screen.getByTestId('vocab-selector')).toBeDefined();
  });

  it('shows kindergarten name field for kindergarten template', () => {
    render(
      <CustomizeStep
        childAge={4}
        templateId="kindergarten-first-day"
        onNext={vi.fn()}
        onBack={vi.fn()}
      />,
    );
    expect(screen.getByTestId('input-kg-name')).toBeDefined();
  });

  it('hides kindergarten name field for other templates', () => {
    render(
      <CustomizeStep
        childAge={4}
        templateId="zahnarzt"
        onNext={vi.fn()}
        onBack={vi.fn()}
      />,
    );
    expect(screen.queryByTestId('input-kg-name')).toBeNull();
  });

  it('calls onNext with customize data', () => {
    const onNext = vi.fn();
    render(
      <CustomizeStep childAge={4} templateId="zahnarzt" onNext={onNext} onBack={vi.fn()} />,
    );
    fireEvent.click(screen.getByTestId('tone-funny'));
    fireEvent.click(screen.getByTestId('next-button'));

    expect(onNext).toHaveBeenCalledTimes(1);
    expect(onNext.mock.calls[0][0].tonePreset).toBe('funny');
  });

  it('defaults vocabulary based on age', () => {
    const onNext = vi.fn();
    render(
      <CustomizeStep childAge={3} templateId="zahnarzt" onNext={onNext} onBack={vi.fn()} />,
    );
    fireEvent.click(screen.getByTestId('next-button'));
    expect(onNext.mock.calls[0][0].ageVocabulary).toBe('toddler');
  });
});
