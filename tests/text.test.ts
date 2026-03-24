import { describe, expect, it } from "vitest";
import { generateStoryFallback } from "@/lib/ai/text";

describe("generateStoryFallback", () => {
  it("returns a story with 6 pages", () => {
    const story = generateStoryFallback(
      { name: "Ahana", age: 4, interests: ["dinosaurs"] },
      "A story about bedtime"
    );
    expect(story.title).toBeTruthy();
    expect(story.pages).toHaveLength(6);
  });

  it("uses the child name throughout", () => {
    const story = generateStoryFallback(
      { name: "Maya", age: 5, interests: ["painting"] },
      "A story about bedtime"
    );
    expect(story.title).toContain("Maya");
    for (const page of story.pages) {
      expect(page.text).toContain("Maya");
      expect(page.imageDescription).toContain("Maya");
    }
  });

  it("includes image descriptions for every page", () => {
    const story = generateStoryFallback(
      { name: "Ahana", age: 4, interests: [] },
      "A bedtime story"
    );
    for (const page of story.pages) {
      expect(page.imageDescription).toBeTruthy();
    }
  });

  it("page numbers are sequential 1-6", () => {
    const story = generateStoryFallback(
      { name: "Ahana", age: 4, interests: [] },
      "A bedtime story"
    );
    expect(story.pages.map((p) => p.pageNo)).toEqual([1, 2, 3, 4, 5, 6]);
  });
});
