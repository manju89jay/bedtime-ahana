import { describe, expect, it, vi, beforeEach } from "vitest";
import { generateStoryFallback } from "@/lib/ai/text";

// Mock the Anthropic client
vi.mock("@/lib/ai/client", () => ({
  getAnthropicClient: () => ({
    messages: {
      create: vi.fn().mockResolvedValue({
        content: [
          {
            type: "text",
            text: JSON.stringify({
              title: "Ahana's Starry Night",
              pages: [
                { pageNo: 1, text: "Page one text.", imageDescription: "A child looking at stars." },
                { pageNo: 2, text: "Page two text.", imageDescription: "A child in the garden." },
                { pageNo: 3, text: "Page three text.", imageDescription: "A child picking flowers." },
                { pageNo: 4, text: "Page four text.", imageDescription: "A surprise butterfly." },
                { pageNo: 5, text: "Page five text.", imageDescription: "A warm hug." },
                { pageNo: 6, text: "Page six text.", imageDescription: "A child falling asleep." }
              ]
            })
          }
        ]
      })
    }
  })
}));

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

describe("generateStory (mocked)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls Claude API and returns parsed story for young child", async () => {
    const { generateStory } = await import("@/lib/ai/text");
    const story = await generateStory(
      { name: "Ahana", age: 3, interests: ["stars"] },
      "A story about stars"
    );
    expect(story.title).toBe("Ahana's Starry Night");
    expect(story.pages).toHaveLength(6);
    expect(story.pages[0].pageNo).toBe(1);
  });

  it("calls Claude API and returns parsed story for older child", async () => {
    const { generateStory } = await import("@/lib/ai/text");
    const story = await generateStory(
      { name: "Ahana", age: 6, interests: ["stars"] },
      "A story about stars"
    );
    expect(story.title).toBe("Ahana's Starry Night");
    expect(story.pages).toHaveLength(6);
  });

  it("throws when Claude returns no text block", async () => {
    vi.doMock("@/lib/ai/client", () => ({
      getAnthropicClient: () => ({
        messages: {
          create: vi.fn().mockResolvedValue({ content: [] })
        }
      })
    }));
    vi.resetModules();
    const { generateStory } = await import("@/lib/ai/text");
    await expect(
      generateStory({ name: "Ahana", age: 4, interests: [] }, "test")
    ).rejects.toThrow("No text response");
  });

  it("throws when Claude returns invalid structure", async () => {
    vi.doMock("@/lib/ai/client", () => ({
      getAnthropicClient: () => ({
        messages: {
          create: vi.fn().mockResolvedValue({
            content: [{ type: "text", text: '{"title":"x","pages":[]}' }]
          })
        }
      })
    }));
    vi.resetModules();
    const { generateStory } = await import("@/lib/ai/text");
    await expect(
      generateStory({ name: "Ahana", age: 4, interests: [] }, "test")
    ).rejects.toThrow("Invalid story structure");
  });
});

describe("regeneratePageText (mocked)", () => {
  it("calls Claude API for young child page regen", async () => {
    vi.doMock("@/lib/ai/client", () => ({
      getAnthropicClient: () => ({
        messages: {
          create: vi.fn().mockResolvedValue({
            content: [{ type: "text", text: '{"text":"Regen text","imageDescription":"Scene"}' }]
          })
        }
      })
    }));
    vi.resetModules();
    const { regeneratePageText } = await import("@/lib/ai/text");
    const result = await regeneratePageText(
      { name: "Ahana", age: 3, interests: [] },
      "Test Book",
      3,
      "Old text",
      [{ pageNo: 1, text: "P1" }]
    );
    expect(result.text).toBe("Regen text");
  });

  it("calls Claude API for older child page regen", async () => {
    vi.doMock("@/lib/ai/client", () => ({
      getAnthropicClient: () => ({
        messages: {
          create: vi.fn().mockResolvedValue({
            content: [{ type: "text", text: '{"text":"Regen older","imageDescription":"Scene"}' }]
          })
        }
      })
    }));
    vi.resetModules();
    const { regeneratePageText } = await import("@/lib/ai/text");
    const result = await regeneratePageText(
      { name: "Ahana", age: 6, interests: [] },
      "Test Book",
      6,
      "Old text",
      [{ pageNo: 1, text: "P1" }]
    );
    expect(result.text).toBe("Regen older");
  });

  it("throws when Claude returns no text block", async () => {
    vi.doMock("@/lib/ai/client", () => ({
      getAnthropicClient: () => ({
        messages: {
          create: vi.fn().mockResolvedValue({ content: [] })
        }
      })
    }));
    vi.resetModules();
    const { regeneratePageText } = await import("@/lib/ai/text");
    await expect(
      regeneratePageText(
        { name: "Ahana", age: 4, interests: [] },
        "Book",
        1,
        "Old",
        []
      )
    ).rejects.toThrow("No text response");
  });
});
