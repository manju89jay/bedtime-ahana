'use client';

import { useState } from 'react';
import clsx from 'clsx';
import type { FamilyMember } from '@/types/character';

export type FamilyData = {
  familyMembers: FamilyMember[];
  petName: string;
  petType: 'cat' | 'dog' | 'bunny' | 'hamster' | 'none';
};

type Props = {
  initial?: Partial<FamilyData>;
  onNext: (data: FamilyData) => void;
  onBack: () => void;
};

const ROLES: FamilyMember['role'][] = ['mama', 'papa', 'oma', 'opa', 'sister', 'brother', 'aunt', 'uncle'];
const PET_TYPES = [
  { value: 'none' as const, label: 'None' },
  { value: 'cat' as const, label: 'Cat' },
  { value: 'dog' as const, label: 'Dog' },
  { value: 'bunny' as const, label: 'Bunny' },
  { value: 'hamster' as const, label: 'Hamster' },
];

export const FamilyStep = ({ initial, onNext, onBack }: Props) => {
  const [members, setMembers] = useState<FamilyMember[]>(
    initial?.familyMembers ?? [{ name: '', role: 'mama' }],
  );
  const [petName, setPetName] = useState(initial?.petName ?? '');
  const [petType, setPetType] = useState<FamilyData['petType']>(initial?.petType ?? 'none');

  const addMember = () => {
    setMembers([...members, { name: '', role: 'papa' }]);
  };

  const removeMember = (index: number) => {
    if (members.length <= 1) return;
    setMembers(members.filter((_, i) => i !== index));
  };

  const updateMember = (index: number, field: 'name' | 'role', value: string) => {
    setMembers(
      members.map((m, i) =>
        i === index ? { ...m, [field]: value } : m,
      ),
    );
  };

  const validMembers = members.filter((m) => m.name.trim());
  const canProceed = validMembers.length >= 1;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canProceed) return;
    onNext({
      familyMembers: validMembers,
      petName: petName.trim(),
      petType,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" data-testid="family-step">
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-700">Family Members *</label>
        {members.map((m, i) => (
          <div key={i} className="flex gap-2" data-testid={`family-member-${i}`}>
            <input
              className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"
              placeholder="Name"
              value={m.name}
              onChange={(e) => updateMember(i, 'name', e.target.value)}
              data-testid={`member-name-${i}`}
            />
            <select
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={m.role}
              onChange={(e) => updateMember(i, 'role', e.target.value)}
              data-testid={`member-role-${i}`}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
              ))}
            </select>
            {members.length > 1 && (
              <button
                type="button"
                onClick={() => removeMember(i)}
                className="rounded-lg px-2 text-slate-400 hover:text-red-500"
                data-testid={`remove-member-${i}`}
              >
                &times;
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addMember}
          className="text-sm text-brand-primary hover:underline"
          data-testid="add-member"
        >
          + Add family member
        </button>
      </div>

      {/* Pet */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Pet</label>
        <div className="flex gap-2" data-testid="pet-type-selector">
          {PET_TYPES.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPetType(p.value)}
              className={clsx(
                'rounded-lg px-3 py-1.5 text-sm transition-colors',
                petType === p.value ? 'bg-brand-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
        {petType !== 'none' && (
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"
            placeholder="Pet name"
            value={petName}
            onChange={(e) => setPetName(e.target.value)}
            data-testid="input-pet-name"
          />
        )}
      </div>

      <div className="mt-2 flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-slate-200 px-6 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
          data-testid="back-button"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={!canProceed}
          className="rounded-lg bg-brand-primary px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-brand-primary/90 disabled:opacity-50"
          data-testid="next-button"
        >
          Next
        </button>
      </div>
    </form>
  );
};
