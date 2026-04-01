export type Page = {
  pageNumber: number;
  text: { en?: string; de?: string };
  imagePrompt: string;
  imageUrl: string;
  audioUrl?: string;
};

export type BookStatus = 'draft' | 'generating' | 'ready' | 'exported' | 'ordered';

export type ComplianceResult = {
  passed: boolean;
  checks: {
    noKnownIPNames: boolean;
    noFranchiseMotifs: boolean;
    genericExperiences: boolean;
    ageAppropriate: boolean;
    gdprCompliant: boolean;
    culturalSensitivity: boolean;
  };
  warnings: string[];
  blockers: string[];
};

export type Book = {
  id: string;
  childProfileId: string;
  templateId: string;
  config: import('./template').StoryConfig;
  status: BookStatus;
  pages: Page[];
  language: 'en' | 'de' | 'bilingual';
  complianceCheck: ComplianceResult;
  createdAt: string;
  generatedAt?: string;
};
