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
  { key: 'profile', label: '1. Profile' },
  { key: 'family', label: '2. Family' },
  { key: 'story', label: '3. Story' },
  { key: 'customize', label: '4. Customize' },
  { key: 'generate', label: '5. Generate' },
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

    const res = await fetch('/api/generate/outline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ config, templateId: selectedTemplate }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Generation failed');
    }

    await res.json();
    return `book-${Date.now().toString(36)}`;
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
      <div className="flex items-center gap-1 text-sm" data-testid="step-indicator">
        {STEP_LABELS.map((s, i) => (
          <span key={s.key}>
            {i > 0 && <span className="mx-1 text-slate-300">&rarr;</span>}
            <span
              className={clsx(
                i === stepIndex ? 'font-semibold text-brand-primary' :
                  i < stepIndex ? 'text-slate-500' : 'text-slate-300',
              )}
            >
              {s.label}
            </span>
          </span>
        ))}
      </div>

      {error && <Banner tone="error" title="Error" description={error} />}

      {/* Step 1: Child Profile */}
      {step === 'profile' && (
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-1 text-lg font-semibold text-slate-800">Tell us about your child</h2>
          <p className="mb-6 text-sm text-slate-500">Name, age, outfit, and language preferences.</p>
          <ChildProfileStep
            initial={profileData ?? undefined}
            onNext={(data) => { setProfileData(data); setStep('family'); }}
          />
        </div>
      )}

      {/* Step 2: Family */}
      {step === 'family' && (
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-1 text-lg font-semibold text-slate-800">Who is in the family?</h2>
          <p className="mb-6 text-sm text-slate-500">Add family members who appear in the story.</p>
          <FamilyStep
            initial={familyData ?? undefined}
            onNext={(data) => { setFamilyData(data); setStep('story'); }}
            onBack={() => setStep('profile')}
          />
        </div>
      )}

      {/* Step 3: Story Selection */}
      {step === 'story' && (
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-1 text-lg font-semibold text-slate-800">
            Pick a story{profileData ? ` for ${profileData.name}` : ''}
          </h2>
          <p className="mb-6 text-sm text-slate-500">Choose from our first-experiences library.</p>
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
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-1 text-lg font-semibold text-slate-800">Customize the story</h2>
          <p className="mb-6 text-sm text-slate-500">Set the tone and vocabulary level.</p>
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
