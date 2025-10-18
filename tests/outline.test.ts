import { describe, expect, it } from "vitest";
import { generateOutline } from "@/lib/ai/text";

const CHARACTER = {
  name: "Ahana",
  age: 5,
  home: "Ulm",
  traits: ["curious"],
  visualStyle: "soft watercolor"
};

describe("outline", () => {
  it("returns six pages and a title", async () => {
    const outline = await generateOutline({
      name: "Ahana",
      age: 5,
      tone: "calm",
      language: "en",
      characterCard: CHARACTER,
      storyIdea: "helping baby sister"
    });

    expect(outline.title.length).toBeGreaterThan(0);
    expect(outline.pages).toHaveLength(6);
  });

  it("returns deterministic results for identical input", async () => {
    const input = {
      name: "Ahana",
      age: 5,
      tone: "calm",
      language: "en" as const,
      characterCard: CHARACTER,
      storyIdea: "gentle museum visit"
    };

    const [outlineA, outlineB] = await Promise.all([
      generateOutline(input),
      generateOutline(input)
    ]);

    expect(outlineA).toEqual(outlineB);
  });

  it("uses a provided story idea when supplied", async () => {
    const outline = await generateOutline({
      name: "Ahana",
      age: 5,
      tone: "calm",
      language: "en",
      characterCard: CHARACTER,
      storyIdea: "   visit to the city library   "
    });

    expect(outline.title).toBe("Ahana and the Visit to the city library");
    expect(outline.pages.every((page) => page.summary.includes("visit to the city library"))).toBe(true);
  });

  it("falls back to a themed prompt when no idea is provided", async () => {
    const outline = await generateOutline({
      name: "Ahana",
      age: 5,
      tone: "calm",
      language: "en",
      characterCard: CHARACTER
    });

    expect(outline.title.startsWith("Ahana and the ")).toBe(true);
    expect(outline.pages.every((page) => page.summary.length > 0)).toBe(true);
  });
});
