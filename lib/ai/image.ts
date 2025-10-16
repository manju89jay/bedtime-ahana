import { promises as fs } from "fs";
import path from "path";
import { IMAGE_PROMPT } from "@/lib/prompts";
import { getPublicAssetPath, getPublicAssetUrl } from "@/lib/storage";

type ImageArgs = {
  pageNo: number;
  characterVisuals: string;
  sceneSummary: string;
  bookId: string;
};

export function generateImagePrompt(args: ImageArgs) {
  const prompt = IMAGE_PROMPT.replace("{pageNo}", args.pageNo.toString())
    .replace("{characterVisuals}", args.characterVisuals)
    .replace("{oneLineScene}", args.sceneSummary);
  const negative = "low-res, text, watermark, signature, known-franchise look-alikes";
  return { prompt, negative };
}

export async function writePlaceholderImage({
  filePath,
  prompt
}: {
  filePath: string;
  prompt: string;
}) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480">
    <rect width="100%" height="100%" fill="#f3f4f6" />
    <foreignObject x="20" y="20" width="600" height="440">
      <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: sans-serif; font-size: 18px; color: #1f2937; white-space: pre-wrap;">
        ${prompt.replace(/&/g, "&amp;").replace(/</g, "&lt;")}
      </div>
    </foreignObject>
  </svg>`;
  await fs.writeFile(filePath, svg, "utf-8");
}

export async function createImageAsset(args: ImageArgs) {
  const { prompt } = generateImagePrompt(args);
  const fileName = `p${args.pageNo}.svg`;
  const filePath = getPublicAssetPath(args.bookId, fileName);
  await writePlaceholderImage({ filePath, prompt });
  const imageUrl = getPublicAssetUrl(args.bookId, fileName);
  return { prompt, imageUrl };
}
