import { describe, expect, it } from "vitest";
import { generatePageText } from "@/lib/ai/text";

const CHARACTER = {
  name: "Ahana",
  age: 5,
  home: "Ulm",
  traits: ["curious"],
  visualStyle: "soft watercolor"
};

describe("generatePageText", () => {
  const baseArgs = {
    language: "en" as const,
    age: 5,
    beat_summary: "Guides Shreya through the quiet museum",
    characterCard: CHARACTER
  };

  it("creates deterministic text for the same inputs", async () => {
    const textA = await generatePageText({
      ...baseArgs,
      pageNo: 1
    });
    const textB = await generatePageText({
      ...baseArgs,
      pageNo: 1
    });

    expect(textA).toEqual(textB);
  });

  it("varies output when the seed changes", async () => {
    const textA = await generatePageText({
      ...baseArgs,
      pageNo: 1
    });
    const textB = await generatePageText({
      ...baseArgs,
      pageNo: 2
    });

    expect(textA.text).not.toBe(textB.text);
  });

  it("mentions the beat summary in each sentence", async () => {
    const { text } = await generatePageText({
      ...baseArgs,
      pageNo: 1
    });

    const sentences = text
      .split(".")
      .map((sentence) => sentence.trim())
      .filter(Boolean);

    expect(sentences).toHaveLength(8);
    for (const sentence of sentences) {
      expect(sentence.toLowerCase()).toContain(baseArgs.beat_summary.toLowerCase());
    }
  });
});
