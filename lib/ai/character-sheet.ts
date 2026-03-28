import type { CharacterSheet, ChildProfile } from '@/types/character';
import { saveAsset } from '@/lib/services/asset-storage';
import { createBookId } from '@/lib/id';

export type CharacterSheetInput = {
  childProfile: Omit<ChildProfile, 'id' | 'userId' | 'characterSheetId' | 'createdAt'>;
  faceDetected: boolean;
};

const isStubMode = () => process.env.USE_STUBS === 'true';

const POSES = ['front', 'threeQuarterLeft', 'threeQuarterRight', 'walking', 'sitting', 'withCompanion'] as const;

function buildSvgPose(
  poseName: string,
  childName: string,
  outfit: { color: string; top: string },
  companionDesc: string
): string {
  const hue = simpleHash(childName + outfit.color) % 360;
  const skinTone = '#f5d0a9';
  const hairColor = `hsl(${(hue + 30) % 360}, 40%, 30%)`;
  const outfitColor = outfit.color || `hsl(${hue}, 60%, 60%)`;

  const poseVariants: Record<string, string> = {
    front: `
      <circle cx="150" cy="90" r="40" fill="${skinTone}" />
      <ellipse cx="150" cy="60" rx="42" ry="30" fill="${hairColor}" />
      <circle cx="137" cy="88" r="4" fill="#333" />
      <circle cx="163" cy="88" r="4" fill="#333" />
      <path d="M142 102 Q150 110 158 102" stroke="#333" fill="none" stroke-width="2" />
      <rect x="120" y="130" width="60" height="70" rx="10" fill="${outfitColor}" />
      <rect x="110" y="130" width="15" height="50" rx="5" fill="${outfitColor}" />
      <rect x="175" y="130" width="15" height="50" rx="5" fill="${outfitColor}" />
      <rect x="130" y="200" width="18" height="50" rx="5" fill="#5a7fc2" />
      <rect x="152" y="200" width="18" height="50" rx="5" fill="#5a7fc2" />`,
    threeQuarterLeft: `
      <circle cx="140" cy="90" r="40" fill="${skinTone}" />
      <ellipse cx="135" cy="60" rx="42" ry="30" fill="${hairColor}" />
      <circle cx="128" cy="88" r="4" fill="#333" />
      <circle cx="150" cy="88" r="4" fill="#333" />
      <path d="M132 102 Q140 110 148 102" stroke="#333" fill="none" stroke-width="2" />
      <rect x="110" y="130" width="60" height="70" rx="10" fill="${outfitColor}" />
      <rect x="130" y="200" width="18" height="50" rx="5" fill="#5a7fc2" />
      <rect x="150" y="200" width="18" height="50" rx="5" fill="#5a7fc2" />`,
    threeQuarterRight: `
      <circle cx="160" cy="90" r="40" fill="${skinTone}" />
      <ellipse cx="165" cy="60" rx="42" ry="30" fill="${hairColor}" />
      <circle cx="150" cy="88" r="4" fill="#333" />
      <circle cx="172" cy="88" r="4" fill="#333" />
      <path d="M152 102 Q160 110 168 102" stroke="#333" fill="none" stroke-width="2" />
      <rect x="130" y="130" width="60" height="70" rx="10" fill="${outfitColor}" />
      <rect x="135" y="200" width="18" height="50" rx="5" fill="#5a7fc2" />
      <rect x="157" y="200" width="18" height="50" rx="5" fill="#5a7fc2" />`,
    walking: `
      <circle cx="150" cy="90" r="40" fill="${skinTone}" />
      <ellipse cx="150" cy="60" rx="42" ry="30" fill="${hairColor}" />
      <circle cx="137" cy="88" r="4" fill="#333" />
      <circle cx="163" cy="88" r="4" fill="#333" />
      <path d="M142 102 Q150 110 158 102" stroke="#333" fill="none" stroke-width="2" />
      <rect x="120" y="130" width="60" height="70" rx="10" fill="${outfitColor}" />
      <line x1="105" y1="145" x2="120" y2="165" stroke="${outfitColor}" stroke-width="12" stroke-linecap="round" />
      <line x1="180" y1="165" x2="195" y2="145" stroke="${outfitColor}" stroke-width="12" stroke-linecap="round" />
      <rect x="125" y="200" width="18" height="50" rx="5" fill="#5a7fc2" transform="rotate(-10 134 225)" />
      <rect x="157" y="200" width="18" height="50" rx="5" fill="#5a7fc2" transform="rotate(10 166 225)" />`,
    sitting: `
      <circle cx="150" cy="80" r="40" fill="${skinTone}" />
      <ellipse cx="150" cy="50" rx="42" ry="30" fill="${hairColor}" />
      <circle cx="137" cy="78" r="4" fill="#333" />
      <circle cx="163" cy="78" r="4" fill="#333" />
      <path d="M142 92 Q150 100 158 92" stroke="#333" fill="none" stroke-width="2" />
      <rect x="120" y="120" width="60" height="60" rx="10" fill="${outfitColor}" />
      <rect x="110" y="175" width="80" height="18" rx="5" fill="#5a7fc2" />
      <rect x="115" y="193" width="18" height="30" rx="5" fill="#5a7fc2" />
      <rect x="167" y="193" width="18" height="30" rx="5" fill="#5a7fc2" />`,
    withCompanion: `
      <circle cx="130" cy="90" r="40" fill="${skinTone}" />
      <ellipse cx="130" cy="60" rx="42" ry="30" fill="${hairColor}" />
      <circle cx="117" cy="88" r="4" fill="#333" />
      <circle cx="143" cy="88" r="4" fill="#333" />
      <path d="M122 102 Q130 110 138 102" stroke="#333" fill="none" stroke-width="2" />
      <rect x="100" y="130" width="60" height="70" rx="10" fill="${outfitColor}" />
      <rect x="110" y="200" width="18" height="50" rx="5" fill="#5a7fc2" />
      <rect x="132" y="200" width="18" height="50" rx="5" fill="#5a7fc2" />
      <ellipse cx="210" cy="180" rx="25" ry="30" fill="#e8d5b7" />
      <ellipse cx="200" cy="148" rx="8" ry="18" fill="#e8d5b7" />
      <ellipse cx="220" cy="148" rx="8" ry="18" fill="#e8d5b7" />
      <circle cx="205" cy="175" r="2" fill="#333" />
      <circle cx="215" cy="175" r="2" fill="#333" />
      <ellipse cx="210" cy="182" rx="3" ry="2" fill="#ffb6c1" />`,
  };

  const body = poseVariants[poseName] ?? poseVariants.front;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
  <defs>
    <linearGradient id="bg-${poseName}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f0e6ff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#e6f0ff;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg-${poseName})" rx="12" />
  ${body}
  <text x="150" y="285" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#999">${childName} — ${poseName}</text>
</svg>`;
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

async function generateCharacterSheetStub(
  input: CharacterSheetInput
): Promise<CharacterSheet> {
  const sheetId = `cs-${createBookId().slice(5)}`;
  const profileId = `cp-${createBookId().slice(5)}`;
  const companionDesc = input.childProfile.companionObject?.description ?? 'a companion';

  const referenceImages: Record<string, string> = {};

  for (const pose of POSES) {
    const svg = buildSvgPose(
      pose,
      input.childProfile.name,
      { color: input.childProfile.signatureOutfit.color, top: input.childProfile.signatureOutfit.top },
      companionDesc
    );
    const fileName = `${sheetId}/${pose}.svg`;
    const url = await saveAsset(fileName, Buffer.from(svg, 'utf-8'));
    referenceImages[pose] = url;
  }

  return {
    id: sheetId,
    childProfileId: profileId,
    referenceImages: referenceImages as CharacterSheet['referenceImages'],
    styleLoraId: 'watercolor-v1',
    version: 1,
    createdAt: new Date().toISOString(),
  };
}

export async function generateCharacterSheet(
  input: CharacterSheetInput
): Promise<CharacterSheet> {
  if (isStubMode()) {
    return generateCharacterSheetStub(input);
  }

  // Live mode: IP-Adapter-FaceID-Plus v2 + Style LoRA
  // For now, return stub
  return generateCharacterSheetStub(input);
}
