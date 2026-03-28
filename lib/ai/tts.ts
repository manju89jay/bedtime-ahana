export type TtsInput = {
  text: string;
  language: 'en' | 'de';
  pageNumber: number;
  bookId: string;
};

export type TtsOutput = {
  audioUrl: string;
  pageNumber: number;
};

const isStubMode = () => process.env.USE_STUBS === 'true';

function generateStubTts(input: TtsInput): TtsOutput {
  // In stub mode, return a placeholder URL (no actual audio file)
  return {
    audioUrl: `/generated/stubs/tts-${input.bookId}-p${input.pageNumber}-${input.language}.mp3`,
    pageNumber: input.pageNumber,
  };
}

export async function generateTts(input: TtsInput): Promise<TtsOutput> {
  if (isStubMode()) {
    return generateStubTts(input);
  }

  // Live mode: ElevenLabs integration (deferred to production)
  // For now, return stub even in live mode since we don't have ElevenLabs configured
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    console.warn('ELEVENLABS_API_KEY not set, using TTS stub');
    return generateStubTts(input);
  }

  // Future: call ElevenLabs API
  // const voiceId = input.language === 'de' ? GERMAN_VOICE_ID : ENGLISH_VOICE_ID;
  // const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, ...);
  // Save audio file and return URL

  return generateStubTts(input);
}

export async function generateAllTts(
  pages: Array<{ pageNumber: number; text: { en?: string; de?: string } }>,
  language: 'en' | 'de' | 'bilingual',
  bookId: string
): Promise<TtsOutput[]> {
  const results: TtsOutput[] = [];

  for (const page of pages) {
    if (language === 'en' || language === 'bilingual') {
      if (page.text.en) {
        const result = await generateTts({
          text: page.text.en,
          language: 'en',
          pageNumber: page.pageNumber,
          bookId,
        });
        results.push(result);
      }
    }
    if (language === 'de' || language === 'bilingual') {
      if (page.text.de) {
        const result = await generateTts({
          text: page.text.de,
          language: 'de',
          pageNumber: page.pageNumber,
          bookId,
        });
        results.push(result);
      }
    }
  }

  return results;
}
