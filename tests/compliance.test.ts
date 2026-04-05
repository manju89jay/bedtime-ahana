import { describe, expect, it } from "vitest";
import { checkBookForIPRisks } from "@/lib/compliance";
import type { LegacyBook as Book } from "@/types/legacy";

const createBook = (text: string): Book => ({
  bookId: "sample",
  title: "Sample",
  childProfile: { name: "Ahana", age: 5, interests: ["painting"] },
  pages: [
    {
      pageNo: 1,
      type: "story",
      text,
      imagePrompt: text,
      imageUrl: "/generated/sample/p1.svg"
    }
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

describe("compliance", () => {
  it("flags forbidden words", () => {
    const issues = checkBookForIPRisks(createBook("Conni wears a striped shirt"));
    expect(issues.length).toBeGreaterThan(0);
  });

  it("passes safe content", () => {
    const issues = checkBookForIPRisks(createBook("Ahana visits the library"));
    expect(issues.length).toBe(0);
  });
});
