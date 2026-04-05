import type { ComplianceResult, Page } from '@/types/book';
import type { StoryConfig } from '@/types/template';

const FORBIDDEN_IP_NAMES = [
  'conni', 'jakob', 'kater mau', 'pixi', 'carlsen',
  'paw patrol', 'disney', 'pixar', 'peppa pig', 'frozen',
  'elsa', 'cocomelon', 'bluey', 'peppa', 'mickey mouse',
];

const FRANCHISE_MOTIFS = [
  'red headband', 'striped headband', 'signature stripes',
  'red-striped', 'known franchise', 'copyrighted',
];

const INAPPROPRIATE_CONTENT = [
  'blood', 'kill', 'murder', 'weapon', 'gun', 'knife',
  'violence', 'death', 'dead', 'horror', 'nightmare',
  'abuse', 'drug', 'alcohol', 'cigarette', 'sexy', 'naked',
  // Note: 'die' excluded — it's the most common German article
];

const CULTURAL_INSENSITIVE = [
  'savage', 'primitive', 'exotic', 'third world',
  'spirit animal', 'gypsy',
];

function searchText(haystack: string, needles: string[]): string[] {
  const lower = haystack.toLowerCase();
  return needles.filter((needle) => {
    const regex = new RegExp(`\\b${needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
    return regex.test(lower);
  });
}

export function checkCompliance(
  pages: Page[],
  config: StoryConfig
): ComplianceResult {
  const allText = pages
    .map((p) => `${p.text.en ?? ''} ${p.text.de ?? ''} ${p.imagePrompt}`)
    .join(' ');

  const configText = `${config.childName} ${config.city} ${config.companionObject ?? ''} ${config.familyMembers.map((f) => f.name).join(' ')}`;

  const fullText = `${allText} ${configText}`;

  const ipHits = searchText(fullText, FORBIDDEN_IP_NAMES);
  const motifHits = searchText(fullText, FRANCHISE_MOTIFS);
  const contentHits = searchText(allText, INAPPROPRIATE_CONTENT);
  const culturalHits = searchText(allText, CULTURAL_INSENSITIVE);

  const warnings: string[] = [];
  const blockers: string[] = [];

  if (ipHits.length > 0) {
    blockers.push(`Found forbidden IP references: ${ipHits.join(', ')}`);
  }
  if (motifHits.length > 0) {
    warnings.push(`Found franchise motif references: ${motifHits.join(', ')}`);
  }
  if (contentHits.length > 0) {
    blockers.push(`Found age-inappropriate content: ${contentHits.join(', ')}`);
  }
  if (culturalHits.length > 0) {
    warnings.push(`Found culturally sensitive terms: ${culturalHits.join(', ')}`);
  }

  const noKnownIPNames = ipHits.length === 0;
  const noFranchiseMotifs = motifHits.length === 0;
  const ageAppropriate = contentHits.length === 0;
  const culturalSensitivity = culturalHits.length === 0;

  // GDPR: image prompts should not request photorealistic child images
  const gdprHits = searchText(
    pages.map((p) => p.imagePrompt).join(' '),
    ['photorealistic', 'photo-realistic', 'photograph', 'real photo']
  );
  const gdprCompliant = gdprHits.length === 0;
  if (!gdprCompliant) {
    blockers.push('Image prompts request photorealistic child images (GDPR violation)');
  }

  // Generic experiences: story should not be a copy of a specific published book
  const genericExperiences = noKnownIPNames && noFranchiseMotifs;

  const passed = blockers.length === 0;

  return {
    passed,
    checks: {
      noKnownIPNames,
      noFranchiseMotifs,
      genericExperiences,
      ageAppropriate,
      gdprCompliant,
      culturalSensitivity,
    },
    warnings,
    blockers,
  };
}
