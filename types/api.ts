import type { CharacterSheet, ChildProfile } from './character';
import type { Book, Page } from './book';
import type { StoryConfig, Beat } from './template';

export type CharacterRequest = {
  photos: string[];
  childProfile: Omit<ChildProfile, 'id' | 'userId' | 'characterSheetId' | 'createdAt'>;
};

export type CharacterResponse = {
  characterSheet: CharacterSheet;
};

export type OutlineRequest = {
  config: StoryConfig;
  templateId: string;
};

export type OutlineResponse = {
  outline: Beat[];
  templateId: string;
};

export type PageRequest = {
  outline: Beat[];
  pageNumber: number;
  config: StoryConfig;
};

export type PageResponse = {
  page: Page;
};

export type ImageRequest = {
  page: Page;
  characterRefId: string;
};

export type ImageResponse = {
  imageUrl: string;
};

export type TtsRequest = {
  text: string;
  language: 'en' | 'de';
};

export type TtsResponse = {
  audioUrl: string;
};

export type ExportRequest = {
  bookId: string;
  format: 'screen' | 'print-10x10' | 'print-15x15';
};

export type ExportResponse = {
  pdfUrl: string;
};
