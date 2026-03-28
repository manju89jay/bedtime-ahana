import { getAnthropicClient } from './client';
import { getTemplateById } from '@/data/templates/index';
import type { StoryConfig, Beat } from '@/types/template';

export type OutlineInput = {
  config: StoryConfig;
  templateId: string;
};

export type OutlineOutput = {
  outline: Beat[];
  templateId: string;
};

const isStubMode = () => process.env.USE_STUBS === 'true';

function personalizeBeat(beat: string, config: StoryConfig): string {
  const parentMember = config.familyMembers.find(
    (m) => m.role === 'mama' || m.role === 'papa'
  );
  const parentName = parentMember?.name ?? 'a parent';

  return beat
    .replace(/\{name\}/g, config.childName)
    .replace(/\{parent\}/g, parentName)
    .replace(/\{city\}/g, config.city)
    .replace(/\{companion\}/g, config.companionObject ?? 'stuffed animal')
    .replace(/\{kindergartenName\}/g, config.kindergartenName ?? 'Kindergarten');
}

function generateStubOutline(input: OutlineInput): OutlineOutput {
  const template = getTemplateById(input.templateId);
  if (!template) {
    return {
      outline: Array.from({ length: 24 }, (_, i) => ({
        page: i + 1,
        beat: personalizeBeat(
          `Page ${i + 1} — {name} continues the adventure in {city}`,
          input.config
        ),
      })),
      templateId: input.templateId,
    };
  }

  return {
    outline: template.beats.map((b) => ({
      page: b.page,
      beat: personalizeBeat(b.beat, input.config),
    })),
    templateId: input.templateId,
  };
}

export async function generateOutline(input: OutlineInput): Promise<OutlineOutput> {
  if (isStubMode()) {
    return generateStubOutline(input);
  }

  const template = getTemplateById(input.templateId);
  if (!template) {
    throw new Error(`Template not found: ${input.templateId}`);
  }

  const client = getAnthropicClient();

  const templateBeats = template.beats
    .map((b) => `  Page ${b.page}: ${b.beat}`)
    .join('\n');

  const prompt = `You are creating a personalized children's story outline.

Template: "${template.title}"
Theme: ${template.theme}
Moral: ${template.moral}

Child: ${input.config.childName}, age ${input.config.childAge}, ${input.config.childGender}
City: ${input.config.city}
Family: ${input.config.familyMembers.map((f) => `${f.name} (${f.role})`).join(', ')}
Companion: ${input.config.companionObject ?? 'none'}
Tone: ${input.config.tonePreset}
Vocabulary: ${input.config.ageVocabulary}

Base beats:
${templateBeats}

Personalize these 24 beats for this specific child. Replace all placeholders with actual names and details. Make each beat specific and visual — describe what illustration would appear on that page.

Return ONLY a JSON array of 24 objects: [{"page": 1, "beat": "..."}, ...]`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
    system: 'You are a children\'s book editor. Respond with valid JSON only — no markdown, no code fences.',
  });

  const textBlock = message.content.find((b) => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from Claude');
  }

  const parsed = JSON.parse(textBlock.text) as Beat[];
  if (!Array.isArray(parsed) || parsed.length !== 24) {
    throw new Error('Invalid outline: expected 24 beats');
  }

  return { outline: parsed, templateId: input.templateId };
}
