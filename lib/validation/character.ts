import { z } from 'zod';

export const OutfitConfigSchema = z.object({
  top: z.string(),
  bottom: z.string(),
  shoes: z.string(),
  accessory: z.string().optional(),
  color: z.string(),
});

export const FamilyMemberSchema = z.object({
  name: z.string().min(1),
  role: z.enum(['mama', 'papa', 'oma', 'opa', 'sister', 'brother', 'aunt', 'uncle']),
});

export const ChildProfileSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  name: z.string().min(1),
  age: z.union([z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.literal(6)]),
  gender: z.enum(['girl', 'boy', 'neutral']),
  characterSheetId: z.string().min(1),
  signatureOutfit: OutfitConfigSchema,
  companionObject: z.object({
    name: z.string(),
    type: z.string(),
    description: z.string(),
  }),
  city: z.string().min(1),
  familyMembers: z.array(FamilyMemberSchema),
  createdAt: z.string(),
});

export const CharacterSheetSchema = z.object({
  id: z.string().min(1),
  childProfileId: z.string().min(1),
  referenceImages: z.object({
    front: z.string(),
    threeQuarterLeft: z.string(),
    threeQuarterRight: z.string(),
    walking: z.string(),
    sitting: z.string(),
    withCompanion: z.string(),
  }),
  styleLoraId: z.string(),
  version: z.number().int().min(1),
  createdAt: z.string(),
});
