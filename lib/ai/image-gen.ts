import { getOpenAIClient } from './imageClient';
import { saveAsset } from '@/lib/services/asset-storage';

export type ImageGenInput = {
  imagePrompt: string;
  pageNumber: number;
  bookId: string;
  characterRefId: string;
};

export type ImageGenOutput = {
  imageUrl: string;
  pageNumber: number;
};

const isStubMode = () => process.env.USE_STUBS === 'true';

function stripCharacterRef(prompt: string): string {
  return prompt.replace(/\[character_ref:[^\]]*\]/g, '').trim();
}

function buildPlaceholderSvg(prompt: string, pageNumber: number): string {
  const escapedPrompt = prompt
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .slice(0, 200);

  const hue = (pageNumber * 37) % 360;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640" viewBox="0 0 640 640">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:hsl(${hue}, 40%, 92%);stop-opacity:1" />
      <stop offset="100%" style="stop-color:hsl(${(hue + 60) % 360}, 40%, 88%);stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)" rx="16" />
  <text x="320" y="260" text-anchor="middle" font-family="sans-serif" font-size="48" fill="hsl(${hue}, 30%, 50%)">Page ${pageNumber}</text>
  <foreignObject x="40" y="300" width="560" height="280">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: sans-serif; font-size: 13px; color: #6b7280; text-align: center; padding: 16px; overflow: hidden;">
      ${escapedPrompt}
    </div>
  </foreignObject>
</svg>`;
}

async function generateImageStub(input: ImageGenInput): Promise<ImageGenOutput> {
  const svg = buildPlaceholderSvg(input.imagePrompt, input.pageNumber);
  const fileName = `${input.bookId}/p${input.pageNumber}.svg`;
  const url = await saveAsset(fileName, Buffer.from(svg, 'utf-8'));
  return { imageUrl: url, pageNumber: input.pageNumber };
}

async function generateImageViaDALLE(input: ImageGenInput): Promise<ImageGenOutput> {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('[image-gen] OPENAI_API_KEY not set, using placeholder');
      return generateImageStub(input);
    }

    const client = getOpenAIClient();
    const cleanPrompt = stripCharacterRef(input.imagePrompt);

    console.log(`[image-gen] Generating DALL-E image for page ${input.pageNumber}...`);
    const response = await client.images.generate({
      model: 'dall-e-3',
      prompt: cleanPrompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
    });

    const remoteUrl = response.data?.[0]?.url;
    if (!remoteUrl) {
      throw new Error('No image URL in DALL-E response');
    }

    console.log(`[image-gen] Downloading image for page ${input.pageNumber}...`);
    const imageResponse = await fetch(remoteUrl);
    const arrayBuf = await imageResponse.arrayBuffer();
    const fileName = `${input.bookId}/p${input.pageNumber}.png`;
    const url = await saveAsset(fileName, Buffer.from(arrayBuf));

    console.log(`[image-gen] Page ${input.pageNumber} saved: ${url}`);
    return { imageUrl: url, pageNumber: input.pageNumber };
  } catch (error) {
    console.error(`[image-gen] DALL-E FAILED for page ${input.pageNumber}:`, error instanceof Error ? error.message : error);
    return generateImageStub(input);
  }
}

export async function generateImage(
  input: ImageGenInput
): Promise<ImageGenOutput> {
  if (isStubMode()) {
    return generateImageStub(input);
  }
  return generateImageViaDALLE(input);
}

export async function generateAllImages(
  pages: Array<{ pageNumber: number; imagePrompt: string }>,
  bookId: string,
  characterRefId: string
): Promise<ImageGenOutput[]> {
  const results: ImageGenOutput[] = [];
  for (const page of pages) {
    const result = await generateImage({
      imagePrompt: page.imagePrompt,
      pageNumber: page.pageNumber,
      bookId,
      characterRefId,
    });
    results.push(result);
  }
  return results;
}
