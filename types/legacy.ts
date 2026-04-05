/**
 * Legacy types from v1 codebase.
 * Used by existing components that will be rewritten in Sessions 4-5.
 * New code should import from types/book, types/character, types/template, etc.
 */

export type LegacyChildProfile = {
  name: string;
  age: number;
  interests: string[];
};

export type LegacyStoryTemplate = {
  id: string;
  name: string;
  icon: string;
  description: string;
  prompt: string;
  tone: 'calm' | 'adventurous' | 'playful';
};

export type LegacyPage = {
  pageNo: number;
  type: 'cover' | 'story' | 'back';
  text: string;
  imagePrompt: string;
  imageUrl: string;
};

export type LegacyBook = {
  bookId: string;
  childProfile: LegacyChildProfile;
  templateId?: string;
  storyIdea?: string;
  title: string;
  pages: LegacyPage[];
  createdAt: string;
  updatedAt: string;
};
