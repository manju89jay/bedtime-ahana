import { getAnthropicClient } from "./client";
import type { ChildProfile } from "@/types/book";

type GeneratedStory = {
  title: string;
  pages: {
    pageNo: number;
    text: string;
    imageDescription: string;
  }[];
};

const SYSTEM_PROMPT = `You are a children's bedtime story author. You write warm, gentle stories that help children fall asleep. Your stories are simple, loving, and always end with the child character drifting off to sleep feeling safe and happy.

You must respond with valid JSON only — no markdown, no code fences, no extra text.`;

function buildStoryPrompt(child: ChildProfile, storyInput: string): string {
  return `Write a bedtime story for ${child.name}, age ${child.age}.
Their interests: ${child.interests.join(", ")}.
${storyInput}

Output a JSON object with this exact structure:
{
  "title": "A short, charming title",
  "pages": [
    {"pageNo": 1, "text": "...", "imageDescription": "..."},
    {"pageNo": 2, "text": "...", "imageDescription": "..."},
    {"pageNo": 3, "text": "...", "imageDescription": "..."},
    {"pageNo": 4, "text": "...", "imageDescription": "..."},
    {"pageNo": 5, "text": "...", "imageDescription": "..."},
    {"pageNo": 6, "text": "...", "imageDescription": "..."}
  ]
}

Rules:
- Exactly 6 story pages
- ${child.age <= 4 ? "40-60" : "50-80"} words per page
- Use ${child.name} as the main character throughout
- Page 6 must end with ${child.name} falling asleep or close to sleep
- No scary content, no villains, no danger
- Weave in their interests naturally (but keep it grounded — no real dinosaurs, no magic unless the story idea asks for it)
- Each imageDescription should be a single sentence describing the scene visually (what we see, not style directions)
- Keep vocabulary appropriate for age ${child.age}
- The story should follow this arc: Opening → Curiosity → Action → Surprise → Warmth → Sleep`;
}

export async function generateStory(
  child: ChildProfile,
  storyInput: string
): Promise<GeneratedStory> {
  const client = getAnthropicClient();

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: buildStoryPrompt(child, storyInput)
      }
    ],
    system: SYSTEM_PROMPT
  });

  const textBlock = message.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  const parsed = JSON.parse(textBlock.text) as GeneratedStory;

  if (!parsed.title || !Array.isArray(parsed.pages) || parsed.pages.length !== 6) {
    throw new Error("Invalid story structure returned from Claude");
  }

  return parsed;
}

export async function regeneratePageText(
  child: ChildProfile,
  bookTitle: string,
  pageNo: number,
  currentText: string,
  allPages: { pageNo: number; text: string }[]
): Promise<{ text: string; imageDescription: string }> {
  const client = getAnthropicClient();

  const context = allPages
    .filter((p) => p.pageNo !== pageNo)
    .map((p) => `Page ${p.pageNo}: ${p.text}`)
    .join("\n\n");

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: `This is a bedtime story called "${bookTitle}" for ${child.name}, age ${child.age}.

Here are the other pages for context:
${context}

Please rewrite page ${pageNo}. The current text is:
"${currentText}"

Write a fresh version that:
- Fits the same position in the story arc
- Is ${child.age <= 4 ? "40-60" : "50-80"} words
- Keeps the same gentle bedtime tone
- Uses ${child.name} as the character
${pageNo === 6 ? `- Ends with ${child.name} falling asleep or nearly asleep` : ""}

Return JSON only: {"text": "...", "imageDescription": "..."}`
      }
    ],
    system: SYSTEM_PROMPT
  });

  const textBlock = message.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  return JSON.parse(textBlock.text);
}

// Keep deterministic fallback for when no API key is configured
export { generateStoryFallback };

function generateStoryFallback(child: ChildProfile, storyInput: string): GeneratedStory {
  const name = child.name;
  return {
    title: `${name}'s Cozy Bedtime`,
    pages: [
      {
        pageNo: 1,
        text: `The evening light turned golden as ${name} finished dinner. Through the window, the first stars were just beginning to peek out. "Time to get ready for bed," said a warm voice from the kitchen. ${name} smiled and hopped down from the chair.`,
        imageDescription: `A young child named ${name} at a dinner table near a window, warm golden evening light, stars visible outside.`
      },
      {
        pageNo: 2,
        text: `${name} padded softly to the bathroom. The toothbrush was blue — ${name}'s favorite color. While brushing, ${name} noticed something interesting in the mirror: a tiny feather stuck in ${name}'s hair from playing outside earlier. Where had it come from?`,
        imageDescription: `${name} brushing teeth in a cozy bathroom, looking curiously at a small feather in their hair in the mirror.`
      },
      {
        pageNo: 3,
        text: `In pajamas now, ${name} decided to investigate. The feather was soft and gray with a white tip. ${name} carried it carefully to the bedroom window and looked outside at the garden below, wondering which bird had left such a perfect little gift.`,
        imageDescription: `${name} in pajamas at a bedroom window, holding a small feather up to the moonlight, looking at a garden below.`
      },
      {
        pageNo: 4,
        text: `Just then, a small bird landed on the windowsill — a little robin with bright eyes. It tilted its head and looked at ${name}, then at the feather. ${name} giggled softly. "Is this yours?" The robin chirped once, as if saying thank you, then flew up to its nest in the nearby tree.`,
        imageDescription: `A friendly robin perched on a windowsill, looking at ${name} who is holding out the feather with a gentle smile.`
      },
      {
        pageNo: 5,
        text: `${name} placed the feather on the nightstand as a little treasure. From the bed, ${name} could see the robin settling into its own tiny nest. "Goodnight, little bird," ${name} whispered. A warm hand tucked the blanket up snug, and a soft kiss landed on ${name}'s forehead.`,
        imageDescription: `${name} tucked into bed, a feather on the nightstand, looking out the window at a robin in its nest in a tree.`
      },
      {
        pageNo: 6,
        text: `The room was quiet now, filled with soft moonlight. ${name}'s eyes grew heavy. Outside, the robin was already asleep. The stars twinkled like tiny nightlights just for ${name}. With a deep, happy breath, ${name} closed those sleepy eyes and drifted into the coziest dreams.`,
        imageDescription: `${name} peacefully asleep in bed, moonlight streaming in, stars visible through the window, everything calm and still.`
      }
    ]
  };
}
