import { COMPLIANCE_CHECKLIST, IMAGE_PROMPT, OUTLINE_PROMPT, PAGE_PROMPT } from "@/lib/prompts";
import type { CharacterCard } from "@/types/book";

type OutlinePage = {
  pageNo: number;
  beat_title: string;
  summary: string;
};

type Outline = {
  title: string;
  moral: string;
  reading_time_minutes: number;
  pages: OutlinePage[];
};

function createSeed(str: string) {
  let seed = 0;
  for (let i = 0; i < str.length; i += 1) {
    seed ^= str.charCodeAt(i) << (i % 8);
  }
  return seed >>> 0;
}

function xorshift(seed: number) {
  let value = seed || 1;
  return () => {
    value ^= value << 13;
    value ^= value >>> 17;
    value ^= value << 5;
    value >>>= 0;
    return value / 4294967295;
  };
}

const THEMES = [
  "helping with baby sibling",
  "rainy day at the museum",
  "visiting the city library",
  "first swim class",
  "weekly market discoveries",
  "gentle dentist visit"
];

const MORALS = [
  "Small helpers make big differences.",
  "Curiosity grows brighter when shared.",
  "Calm breaths turn jitters into joy.",
  "Kindness keeps adventures cozy.",
  "Trying slowly still counts as brave."
];

const PAGE_PATTERNS = [
  "setup",
  "decision",
  "preparation",
  "small challenge",
  "resolution",
  "cozy close"
];

function pick(rand: () => number, items: string[]) {
  const index = Math.floor(rand() * items.length);
  return items[index];
}

export async function generateOutline(input: {
  name: string;
  age: number;
  tone: string;
  language: "en" | "de";
  storyIdea?: string;
  characterCard: CharacterCard;
}): Promise<Outline> {
  const seed = createSeed(`${input.name}|${input.language}|${input.age}|${input.storyIdea ?? ""}`);
  const rand = xorshift(seed);
  const theme = input.storyIdea?.trim() || pick(rand, THEMES);
  const title = `${input.name} and the ${theme.charAt(0).toUpperCase()}${theme.slice(1)}`;
  const moral = pick(rand, MORALS);
  const pages: OutlinePage[] = PAGE_PATTERNS.map((pattern, idx) => {
    const detail = pick(rand, [
      "gentle rain tapping windows",
      "Papa offering warm tea",
      "Shreya giggling softly",
      "Ahana listening closely",
      "a friendly guide smiling",
      "soft slippers on clean floors",
      "plush bunny tucked under arm"
    ]);
    return {
      pageNo: idx + 1,
      beat_title: `${pattern.replace(/\b\w/g, (m) => m.toUpperCase())}`,
      summary: `${input.name} experiences the ${theme} with ${detail}.`
    };
  });

  return {
    title,
    moral,
    reading_time_minutes: 6,
    pages
  };
}

export async function generatePageText(args: {
  pageNo: number;
  language: "en" | "de";
  age: number;
  beat_summary: string;
  characterCard: CharacterCard;
}): Promise<{ text: string }> {
  const seed = createSeed(`${args.pageNo}|${args.language}|${args.age}|${args.beat_summary}`);
  const rand = xorshift(seed);
  const sentenceStarters = [
    "In the quiet evening,",
    "As the sky glowed amber,",
    "With a careful breath,",
    "Soft lamp light followed as",
    "Under Papa's gentle smile,",
    "Around the cozy corner,",
    "Inside the echoing hall,",
    "Beside the friendly guide,"
  ];
  const verbs = [
    "noticed",
    "imagined",
    "tiptoed",
    "whispered",
    "reached",
    "hugged",
    "listened",
    "giggled"
  ];
  const endings = [
    "promising tomorrow would feel familiar.",
    "and the room settled into calm twinkles.",
    "making the air smell of cinnamon courage.",
    "so even Shreya felt the hush of bedtime.",
    "and everyone agreed the moment was just right.",
    "gathering tiny memories like polished stones.",
    "reminding her that small steps become stories.",
    "showing how patience hums like a lullaby."
  ];

  const sentences: string[] = [];
  for (let i = 0; i < 8; i += 1) {
    const starter = sentenceStarters[Math.floor(rand() * sentenceStarters.length)];
    const verb = verbs[Math.floor(rand() * verbs.length)];
    const ending = endings[Math.floor(rand() * endings.length)];
    sentences.push(
      `${starter} ${args.characterCard.name} ${verb} ${args.beat_summary.toLowerCase()} ${ending}`
    );
  }

  const text = sentences.join(" ");
  return { text };
}

export { OUTLINE_PROMPT, PAGE_PROMPT, IMAGE_PROMPT, COMPLIANCE_CHECKLIST };
