import { promises as fs } from "fs";
import path from "path";
import { getPublicAssetPath, getPublicAssetUrl } from "@/lib/storage";

type TTSArgs = {
  filePath: string;
  text: string;
  language: string;
  voice: string;
};

const SILENT_MP3_BASE64 =
  "//uQxAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAACcQCAAwACAAADSAAAAAEAAADSAAAAAQAAANMgAAAA";

export async function synthesize({ filePath }: TTSArgs): Promise<string> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const buffer = Buffer.from(SILENT_MP3_BASE64, "base64");
  await fs.writeFile(filePath, buffer);
  return filePath;
}

export async function createTTSAsset({
  bookId,
  pageNo,
  text,
  language,
  voice
}: {
  bookId: string;
  pageNo: number;
  text: string;
  language: string;
  voice: string;
}) {
  const fileName = `p${pageNo}.mp3`;
  const filePath = getPublicAssetPath(bookId, fileName);
  await synthesize({ filePath, text, language, voice });
  const audioUrl = getPublicAssetUrl(bookId, fileName);
  return { audioUrl };
}
