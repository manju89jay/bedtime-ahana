export type Page = {
  pageNo: number;
  text: string;
  imagePrompt: string;
  imageUrl: string;
  audioUrl?: string;
};

export type CharacterCard = {
  name: string;
  age: number;
  home: string;
  family?: string[];
  traits: string[];
  sidekick?: string;
  visualStyle: string;
};

export type Book = {
  bookId: string;
  title: string;
  language: "en" | "de";
  characters: CharacterCard[];
  pages: Page[];
  createdAt: string;
  updatedAt: string;
  moral?: string;
};
