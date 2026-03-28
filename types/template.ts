import type { FamilyMember } from './character';

export type Beat = {
  page: number;
  beat: string;
};

export type VocabularyConstraints = {
  toddler: string;
  preschool: string;
  'early-reader': string;
};

export type StoryTemplate = {
  templateId: string;
  title: string;
  theme: string;
  moral: string;
  pages: number;
  structure: {
    act1_setup: number[];
    act2_adventure: number[];
    act3_resolution: number[];
  };
  beats: Beat[];
  vocabulary_constraints: VocabularyConstraints;
};

export type StoryConfig = {
  childName: string;
  childAge: 2 | 3 | 4 | 5 | 6;
  childGender: 'girl' | 'boy' | 'neutral';
  characterRefId: string;
  familyMembers: FamilyMember[];
  petName?: string;
  petType?: 'cat' | 'dog' | 'bunny' | 'hamster' | 'none';
  city: string;
  kindergartenName?: string;
  favoritePlayground?: string;
  companionObject?: string;
  language: 'en' | 'de' | 'bilingual';
  tonePreset: 'gentle' | 'adventurous' | 'funny';
  ageVocabulary: 'toddler' | 'preschool' | 'early-reader';
};
