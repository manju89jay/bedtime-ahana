import { z } from 'zod';
import { OutfitConfigSchema, FamilyMemberSchema } from './character';
import { BeatSchema, StoryConfigSchema } from './template';
import { PageSchema } from './book';

export const CharacterRequestSchema = z.object({
  photos: z.array(z.string()).min(1),
  childProfile: z.object({
    name: z.string().min(1),
    age: z.union([z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.literal(6)]),
    gender: z.enum(['girl', 'boy', 'neutral']),
    signatureOutfit: OutfitConfigSchema,
    companionObject: z.object({
      name: z.string(),
      type: z.string(),
      description: z.string(),
    }),
    city: z.string().min(1),
    familyMembers: z.array(FamilyMemberSchema),
  }),
});

export const OutlineRequestSchema = z.object({
  config: StoryConfigSchema,
  templateId: z.string().min(1),
});

export const PageRequestSchema = z.object({
  outline: z.array(BeatSchema),
  pageNumber: z.number().int().min(1).max(24),
  config: StoryConfigSchema,
});

export const ImageRequestSchema = z.object({
  page: PageSchema,
  characterRefId: z.string().min(1),
});

export const TtsRequestSchema = z.object({
  text: z.string().min(1),
  language: z.enum(['en', 'de']),
});

export const ExportRequestSchema = z.object({
  bookId: z.string().min(1),
  format: z.enum(['screen', 'print-10x10', 'print-15x15']),
});
