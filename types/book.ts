export type ChildProfile = {
  name: string;
  age: number;
  interests: string[];
};

export type StoryTemplate = {
  id: string;
  name: string;
  icon: string;
  description: string;
  prompt: string;
  tone: "calm" | "adventurous" | "playful";
};

export type Page = {
  pageNo: number;
  type: "cover" | "story" | "back";
  text: string;
  imagePrompt: string;
  imageUrl: string;
};

export type Book = {
  bookId: string;
  childProfile: ChildProfile;
  templateId?: string;
  storyIdea?: string;
  title: string;
  pages: Page[];
  createdAt: string;
  updatedAt: string;
};
