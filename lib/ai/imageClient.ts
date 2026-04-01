import OpenAI from "openai";

let _client: OpenAI | null = null;
let _cachedKey: string | null = null;

export function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is required");
  }
  if (!_client || apiKey !== _cachedKey) {
    _client = new OpenAI({ apiKey });
    _cachedKey = apiKey;
  }
  return _client;
}

export function getImageModel(): string {
  return process.env.OPENAI_IMAGE_MODEL || "gpt-image-1.5";
}
