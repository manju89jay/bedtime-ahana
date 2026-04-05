import { z } from 'zod';
import { FamilyMemberSchema } from './character';

export const BeatSchema = z.object({
  page: z.number().int().min(1).max(24),
  beat: z.string().min(1),
});

export const VocabularyConstraintsSchema = z.object({
  toddler: z.string(),
  preschool: z.string(),
  'early-reader': z.string(),
});

export const StoryTemplateSchema = z.object({
  templateId: z.string().min(1),
  title: z.string().min(1),
  theme: z.string().min(1),
  moral: z.string().min(1),
  pages: z.literal(24),
  structure: z.object({
    act1_setup: z.array(z.number().int()),
    act2_adventure: z.array(z.number().int()),
    act3_resolution: z.array(z.number().int()),
  }),
  beats: z.array(BeatSchema).length(24),
  vocabulary_constraints: VocabularyConstraintsSchema,
});

export const StoryConfigSchema = z.object({
  childName: z.string().min(1),
  childAge: z.union([z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.literal(6)]),
  childGender: z.enum(['girl', 'boy', 'neutral']),
  characterRefId: z.string().min(1),
  familyMembers: z.array(FamilyMemberSchema),
  petName: z.string().optional(),
  petType: z.enum(['cat', 'dog', 'bunny', 'hamster', 'none']).optional(),
  city: z.string().min(1),
  kindergartenName: z.string().optional(),
  favoritePlayground: z.string().optional(),
  companionObject: z.string().optional(),
  language: z.enum(['en', 'de', 'bilingual']),
  tonePreset: z.enum(['gentle', 'adventurous', 'funny']),
  ageVocabulary: z.enum(['toddler', 'preschool', 'early-reader']),
});
