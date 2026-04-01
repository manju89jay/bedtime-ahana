import { describe, expect, it } from 'vitest';
import { BookSchema, PageSchema, ComplianceResultSchema } from '@/lib/validation/book';
import { ChildProfileSchema, CharacterSheetSchema, FamilyMemberSchema, OutfitConfigSchema } from '@/lib/validation/character';
import { UserSchema, SubscriptionTierSchema } from '@/lib/validation/user';
import { StoryTemplateSchema, StoryConfigSchema, BeatSchema } from '@/lib/validation/template';
import { PrintOrderSchema, AddressSchema } from '@/lib/validation/order';
import {
  CharacterRequestSchema,
  OutlineRequestSchema,
  PageRequestSchema,
  ImageRequestSchema,
  TtsRequestSchema,
  ExportRequestSchema,
} from '@/lib/validation/api';

const validOutfit = { top: 'star t-shirt', bottom: 'jeans', shoes: 'sneakers', color: 'yellow' };
const validCompanion = { name: 'Hoppel', type: 'plush bunny', description: 'A soft white bunny' };
const validFamily = [{ name: 'Mama', role: 'mama' as const }];
const validAddress = { name: 'Max', street: 'Hauptstr 1', city: 'Berlin', postalCode: '10115', country: 'DE' };

const validChildProfile = {
  id: 'cp-1',
  userId: 'u-1',
  name: 'Ahana',
  age: 4 as const,
  gender: 'girl' as const,
  characterSheetId: 'cs-1',
  signatureOutfit: validOutfit,
  companionObject: validCompanion,
  city: 'Ulm',
  familyMembers: validFamily,
  createdAt: '2026-01-01T00:00:00Z',
};

const validConfig = {
  childName: 'Ahana',
  childAge: 4 as const,
  childGender: 'girl' as const,
  characterRefId: 'cs-1',
  familyMembers: validFamily,
  city: 'Ulm',
  language: 'de' as const,
  tonePreset: 'gentle' as const,
  ageVocabulary: 'preschool' as const,
};

describe('Zod schemas — valid data accepted', () => {
  it('validates Page', () => {
    expect(PageSchema.safeParse({
      pageNumber: 1,
      text: { en: 'Hello', de: 'Hallo' },
      imagePrompt: 'A child waving',
      imageUrl: '/img/1.png',
    }).success).toBe(true);
  });

  it('validates ComplianceResult', () => {
    expect(ComplianceResultSchema.safeParse({
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
    }).success).toBe(true);
  });

  it('validates Book', () => {
    expect(BookSchema.safeParse({
      id: 'b-1',
      childProfileId: 'cp-1',
      templateId: 'kindergarten-first-day',
      config: validConfig,
      status: 'draft',
      pages: [{ pageNumber: 1, text: { en: 'test' }, imagePrompt: '', imageUrl: '' }],
      language: 'de',
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
    }).success).toBe(true);
  });

  it('validates ChildProfile', () => {
    expect(ChildProfileSchema.safeParse(validChildProfile).success).toBe(true);
  });

  it('validates CharacterSheet', () => {
    expect(CharacterSheetSchema.safeParse({
      id: 'cs-1',
      childProfileId: 'cp-1',
      referenceImages: {
        front: '/img/front.png',
        threeQuarterLeft: '/img/3ql.png',
        threeQuarterRight: '/img/3qr.png',
        walking: '/img/walk.png',
        sitting: '/img/sit.png',
        withCompanion: '/img/comp.png',
      },
      styleLoraId: 'watercolor-v1',
      version: 1,
      createdAt: '2026-01-01',
    }).success).toBe(true);
  });

  it('validates User', () => {
    expect(UserSchema.safeParse({
      id: 'u-1',
      email: 'test@example.com',
      subscription: 'starter',
      language: 'en',
      createdAt: '2026-01-01',
    }).success).toBe(true);
  });

  it('validates StoryConfig', () => {
    expect(StoryConfigSchema.safeParse(validConfig).success).toBe(true);
  });

  it('validates PrintOrder', () => {
    expect(PrintOrderSchema.safeParse({
      id: 'po-1',
      bookId: 'b-1',
      userId: 'u-1',
      format: '10x10',
      quantity: 2,
      shippingAddress: validAddress,
      printProvider: 'gelato',
      status: 'pending',
      createdAt: '2026-01-01',
    }).success).toBe(true);
  });
});

describe('Zod schemas — invalid data rejected', () => {
  it('rejects Page with invalid pageNumber', () => {
    expect(PageSchema.safeParse({ pageNumber: 0, text: {}, imagePrompt: '', imageUrl: '' }).success).toBe(false);
    expect(PageSchema.safeParse({ pageNumber: 25, text: {}, imagePrompt: '', imageUrl: '' }).success).toBe(false);
  });

  it('rejects ChildProfile with invalid age', () => {
    expect(ChildProfileSchema.safeParse({ ...validChildProfile, age: 1 }).success).toBe(false);
    expect(ChildProfileSchema.safeParse({ ...validChildProfile, age: 7 }).success).toBe(false);
  });

  it('rejects User with invalid email', () => {
    expect(UserSchema.safeParse({ id: 'u-1', email: 'invalid', subscription: 'free', language: 'en', createdAt: '' }).success).toBe(false);
  });

  it('rejects PrintOrder with invalid format', () => {
    expect(PrintOrderSchema.safeParse({
      id: 'po-1', bookId: 'b-1', userId: 'u-1',
      format: '20x20', quantity: 1, shippingAddress: validAddress,
      printProvider: 'gelato', status: 'pending', createdAt: '',
    }).success).toBe(false);
  });

  it('rejects FamilyMember with invalid role', () => {
    expect(FamilyMemberSchema.safeParse({ name: 'Test', role: 'cousin' }).success).toBe(false);
  });

  it('rejects empty required strings', () => {
    expect(ChildProfileSchema.safeParse({ ...validChildProfile, name: '' }).success).toBe(false);
  });
});

describe('API schemas', () => {
  it('validates CharacterRequest', () => {
    expect(CharacterRequestSchema.safeParse({
      photos: ['data:image/png;base64,abc'],
      childProfile: {
        name: 'Ahana', age: 4, gender: 'girl',
        signatureOutfit: validOutfit,
        companionObject: validCompanion,
        city: 'Ulm',
        familyMembers: validFamily,
      },
    }).success).toBe(true);
  });

  it('validates OutlineRequest', () => {
    expect(OutlineRequestSchema.safeParse({
      config: validConfig,
      templateId: 'kindergarten-first-day',
    }).success).toBe(true);
  });

  it('validates PageRequest', () => {
    expect(PageRequestSchema.safeParse({
      outline: [{ page: 1, beat: 'Title page' }],
      pageNumber: 1,
      config: validConfig,
    }).success).toBe(true);
  });

  it('validates ImageRequest', () => {
    expect(ImageRequestSchema.safeParse({
      page: { pageNumber: 1, text: { en: 'text' }, imagePrompt: 'prompt', imageUrl: '' },
      characterRefId: 'cs-1',
    }).success).toBe(true);
  });

  it('validates TtsRequest', () => {
    expect(TtsRequestSchema.safeParse({ text: 'Hello world', language: 'en' }).success).toBe(true);
  });

  it('validates ExportRequest', () => {
    expect(ExportRequestSchema.safeParse({ bookId: 'b-1', format: 'print-10x10' }).success).toBe(true);
  });

  it('rejects empty photos array', () => {
    expect(CharacterRequestSchema.safeParse({
      photos: [],
      childProfile: {
        name: 'Ahana', age: 4, gender: 'girl',
        signatureOutfit: validOutfit,
        companionObject: validCompanion,
        city: 'Ulm',
        familyMembers: validFamily,
      },
    }).success).toBe(false);
  });
});
