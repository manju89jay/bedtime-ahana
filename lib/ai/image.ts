import { promises as fs } from "fs";
import path from "path";
import { getOpenAIClient } from "./imageClient";
import { getPublicAssetPath, getPublicAssetUrl } from "@/lib/storage";

type ImageArgs = {
  pageNo: number;
  imageDescription: string;
  childName: string;
  childAge: number;
  bookId: string;
};

function buildImagePrompt(args: ImageArgs): string {
  return `A children's book illustration in a simple, warm, slightly cartoonish style with soft colors. ${args.imageDescription} The main character is a ${args.childAge}-year-old child named ${args.childName}. Soft lighting, gentle colors, cozy atmosphere. No text or words in the image.`;
}

export async function generateImage(args: ImageArgs): Promise<{ prompt: string; imageUrl: string }> {
  const prompt = buildImagePrompt(args);
  const fileName = `p${args.pageNo}.png`;
  const filePath = getPublicAssetPath(args.bookId, fileName);

  await fs.mkdir(path.dirname(filePath), { recursive: true });

  try {
    const client = getOpenAIClient();
    const response = await client.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard"
    });

    const imageUrlRemote = response.data?.[0]?.url;
    if (!imageUrlRemote) {
      throw new Error("No image URL in DALL-E response");
    }

    // Download the image and save locally
    const imageResponse = await fetch(imageUrlRemote);
    const arrayBuf = await imageResponse.arrayBuffer();
    await fs.writeFile(filePath, new Uint8Array(arrayBuf));

    const imageUrl = getPublicAssetUrl(args.bookId, fileName);
    return { prompt, imageUrl };
  } catch (error) {
    // Fallback to placeholder if image generation fails
    console.warn("Image generation failed, using placeholder:", error);
    return writePlaceholderImage(args);
  }
}

export async function writePlaceholderImage(args: ImageArgs): Promise<{ prompt: string; imageUrl: string }> {
  const prompt = buildImagePrompt(args);
  const fileName = `p${args.pageNo}.svg`;
  const filePath = getPublicAssetPath(args.bookId, fileName);

  await fs.mkdir(path.dirname(filePath), { recursive: true });

  const escapedDesc = args.imageDescription
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640" viewBox="0 0 640 640">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f0e6ff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#e6f0ff;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)" rx="16" />
  <text x="320" y="280" text-anchor="middle" font-family="sans-serif" font-size="48" fill="#8b7ec8">Page ${args.pageNo}</text>
  <foreignObject x="40" y="320" width="560" height="280">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: sans-serif; font-size: 16px; color: #6b7280; text-align: center; padding: 16px;">
      ${escapedDesc}
    </div>
  </foreignObject>
</svg>`;

  await fs.writeFile(filePath, svg, "utf-8");
  const imageUrl = getPublicAssetUrl(args.bookId, fileName);
  return { prompt, imageUrl };
}

export async function generateCoverImage(args: {
  title: string;
  childName: string;
  childAge: number;
  bookId: string;
}): Promise<{ imageUrl: string }> {
  const fileName = "cover.svg";
  const filePath = getPublicAssetPath(args.bookId, fileName);

  await fs.mkdir(path.dirname(filePath), { recursive: true });

  const escapedTitle = args.title
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640" viewBox="0 0 640 640">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4a5fc1;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f2b5d4;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)" rx="16" />
  <text x="320" y="240" text-anchor="middle" font-family="Georgia, serif" font-size="36" fill="white" font-weight="bold">
    <tspan x="320" dy="0">${escapedTitle}</tspan>
  </text>
  <text x="320" y="340" text-anchor="middle" font-family="sans-serif" font-size="22" fill="rgba(255,255,255,0.9)">A bedtime story for ${args.childName}</text>
  <text x="320" y="520" text-anchor="middle" font-family="sans-serif" font-size="16" fill="rgba(255,255,255,0.7)">bedtime-ahana</text>
</svg>`;

  await fs.writeFile(filePath, svg, "utf-8");
  return { imageUrl: getPublicAssetUrl(args.bookId, fileName) };
}
