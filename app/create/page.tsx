'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { ChildProfileStep, type ChildProfileData } from '@/components/wizard/ChildProfileStep';
import { FamilyStep, type FamilyData } from '@/components/wizard/FamilyStep';
import { StorySelectStep } from '@/components/wizard/StorySelectStep';
import { CustomizeStep, type CustomizeData } from '@/components/wizard/CustomizeStep';
import { GenerateStep } from '@/components/wizard/GenerateStep';
import { getTemplates } from '@/data/templates/index';
import { Banner } from '@/components/Banner';

type WizardStep = 'profile' | 'family' | 'story' | 'customize' | 'generate';

const STEP_LABELS: { key: WizardStep; label: string }[] = [
  { key: 'profile', label: 'Profile' },
  { key: 'family', label: 'Family' },
  { key: 'story', label: 'Story' },
  { key: 'customize', label: 'Customize' },
  { key: 'generate', label: 'Create' },
];

export default function CreatePage() {
  const router = useRouter();
  const [step, setStep] = useState<WizardStep>('profile');
  const [profileData, setProfileData] = useState<ChildProfileData | null>(null);
  const [familyData, setFamilyData] = useState<FamilyData | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [customizeData, setCustomizeData] = useState<CustomizeData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const templates = getTemplates();
  const stepIndex = STEP_LABELS.findIndex((s) => s.key === step);

  const handleGenerate = useCallback(async (): Promise<string> => {
    if (!profileData || !familyData || !selectedTemplate || !customizeData) {
      throw new Error('Missing wizard data');
    }

    const config = {
      childName: profileData.name,
      childAge: profileData.age,
      childGender: profileData.gender,
      characterRefId: 'cs-stub',
      familyMembers: familyData.familyMembers,
      petName: familyData.petName || undefined,
      petType: familyData.petType,
      city: profileData.city,
      kindergartenName: customizeData.kindergartenName,
      favoritePlayground: customizeData.favoritePlayground,
      companionObject: profileData.companionObject || undefined,
      language: profileData.language,
      tonePreset: customizeData.tonePreset,
      ageVocabulary: customizeData.ageVocabulary,
    };

    const res = await fetch('/api/generate/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        config,
        templateId: selectedTemplate,
        childProfileId: 'cp-wizard',
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Generation failed');
    }

    const { bookId } = await res.json();
    return bookId;
  }, [profileData, familyData, selectedTemplate, customizeData]);

  const handleComplete = useCallback(
    (bookId: string) => {
      router.push(`/reader/${bookId}`);
    },
    [router],
  );

  const handleError = useCallback((msg: string) => {
    setError(msg);
    setStep('customize');
  }, []);

  return (
    <div className="flex flex-col gap-6" data-testid="create-wizard">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-0" data-testid="step-indicator">
        {STEP_LABELS.map((s, i) => (
          <div key={s.key} className="flex items-center">
            {i > 0 && (
              <div className={clsx(
                'h-px w-6 sm:w-10',
                i <= stepIndex ? 'bg-brand-primary' : 'bg-warm-200',
              )} />
            )}
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={clsx(
                  'flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                  i === stepIndex
                    ? 'bg-brand-primary text-white shadow-sm'
                    : i < stepIndex
                      ? 'bg-brand-primary/20 text-brand-primary'
                      : 'bg-warm-200 text-warm-400',
                )}
              >
                {i < stepIndex ? '\u2713' : i + 1}
              </span>
              <span
                className={clsx(
                  'text-xs font-medium',
                  i === stepIndex ? 'text-brand-primary' :
                    i < stepIndex ? 'text-warm-500' : 'text-warm-300',
                )}
              >
                {s.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      {error && <Banner tone="error" title="Error" description={error} />}

      {/* Step 1: Child Profile */}
      {step === 'profile' && (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-warm-200/60 sm:p-8">
          <h2 className="mb-1 font-serif text-lg font-semibold text-warm-800">Who is the star of this story?</h2>
          <p className="mb-6 text-sm text-warm-500">Tell us about your child so we can make them the hero.</p>
          <ChildProfileStep
            initial={profileData ?? undefined}
            onNext={(data) => { setProfileData(data); setStep('family'); }}
          />
        </div>
      )}

      {/* Step 2: Family */}
      {step === 'family' && (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-warm-200/60 sm:p-8">
          <h2 className="mb-1 font-serif text-lg font-semibold text-warm-800">Who else appears in the story?</h2>
          <p className="mb-6 text-sm text-warm-500">Add the family members and pets your child loves.</p>
          <FamilyStep
            initial={familyData ?? undefined}
            onNext={(data) => { setFamilyData(data); setStep('story'); }}
            onBack={() => setStep('profile')}
          />
        </div>
      )}

      {/* Step 3: Story Selection */}
      {step === 'story' && (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-warm-200/60 sm:p-8">
          <h2 className="mb-1 font-serif text-lg font-semibold text-warm-800">
            Choose an adventure{profileData ? ` for ${profileData.name}` : ''}
          </h2>
          <p className="mb-6 text-sm text-warm-500">Real-life moments, made magical.</p>
          <StorySelectStep
            templates={templates}
            selected={selectedTemplate}
            onSelect={setSelectedTemplate}
            onNext={() => setStep('customize')}
            onBack={() => setStep('family')}
          />
        </div>
      )}

      {/* Step 4: Customize */}
      {step === 'customize' && profileData && selectedTemplate && (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-warm-200/60 sm:p-8">
          <h2 className="mb-1 font-serif text-lg font-semibold text-warm-800">Make it just right</h2>
          <p className="mb-6 text-sm text-warm-500">Set the tone and vocabulary for {profileData.name}&apos;s story.</p>
          <CustomizeStep
            childAge={profileData.age}
            templateId={selectedTemplate}
            initial={customizeData ?? undefined}
            onNext={(data) => { setCustomizeData(data); setError(null); setStep('generate'); }}
            onBack={() => setStep('story')}
          />
        </div>
      )}

      {/* Step 5: Generate */}
      {step === 'generate' && (
        <GenerateStep
          onGenerate={handleGenerate}
          onComplete={handleComplete}
          onError={handleError}
        />
      )}
    </div>
  );
}
