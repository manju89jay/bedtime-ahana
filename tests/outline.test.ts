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
});
