import { z } from 'zod';
import { StoryConfigSchema } from './template';

export const PageSchema = z.object({
  pageNumber: z.number().int().min(1).max(24),
  text: z.object({
    en: z.string().optional(),
    de: z.string().optional(),
  }),
  imagePrompt: z.string(),
  imageUrl: z.string(),
  audioUrl: z.string().optional(),
});

export const BookStatusSchema = z.enum(['draft', 'generating', 'ready', 'exported', 'ordered']);

export const ComplianceResultSchema = z.object({
  passed: z.boolean(),
  checks: z.object({
    noKnownIPNames: z.boolean(),
    noFranchiseMotifs: z.boolean(),
    genericExperiences: z.boolean(),
    ageAppropriate: z.boolean(),
    gdprCompliant: z.boolean(),
    culturalSensitivity: z.boolean(),
  }),
  warnings: z.array(z.string()),
  blockers: z.array(z.string()),
});

export const BookSchema = z.object({
  id: z.string().min(1),
  childProfileId: z.string().min(1),
  templateId: z.string().min(1),
  config: StoryConfigSchema,
  status: BookStatusSchema,
  pages: z.array(PageSchema),
  language: z.enum(['en', 'de', 'bilingual']),
  complianceCheck: ComplianceResultSchema,
  createdAt: z.string(),
  generatedAt: z.string().optional(),
});
