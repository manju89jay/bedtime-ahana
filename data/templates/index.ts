import type { StoryTemplate } from '@/types/template';

import kindergartenFirstDay from './kindergarten-first-day.json';
import zahnarzt from './zahnarzt.json';
import fahrrad from './fahrrad.json';
import geschwisterchen from './geschwisterchen.json';
import schwimmbad from './schwimmbad.json';
import muellabfuhr from './muellabfuhr.json';

const templates: StoryTemplate[] = [
  kindergartenFirstDay as StoryTemplate,
  zahnarzt as StoryTemplate,
  fahrrad as StoryTemplate,
  geschwisterchen as StoryTemplate,
  schwimmbad as StoryTemplate,
  muellabfuhr as StoryTemplate,
];

export const getTemplates = (): StoryTemplate[] => templates;

export const getTemplateById = (id: string): StoryTemplate | undefined =>
  templates.find((t) => t.templateId === id);
