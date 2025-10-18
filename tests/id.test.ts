import { describe, expect, it, vi } from "vitest";
import { createBookId } from "@/lib/id";

describe("createBookId", () => {
  it("combines a base36 timestamp with a random suffix", () => {
    const fixedNow = 1_700_000_000_000;
    const fixedRandom = 0.123456789;
    vi.spyOn(Date, "now").mockReturnValue(fixedNow);
    vi.spyOn(Math, "random").mockReturnValue(fixedRandom);

    const id = createBookId();
    const expected = `book-${fixedNow.toString(36)}-${fixedRandom.toString(36).slice(2, 8)}`;

    expect(id).toBe(expected);
    vi.restoreAllMocks();
  });

  it("produces unique identifiers for sequential calls", () => {
    vi.spyOn(Date, "now").mockReturnValue(1_700_000_000_000);
    const randomValues = [0.1, 0.2, 0.3];
    vi.spyOn(Math, "random").mockImplementation(() => randomValues.shift() ?? 0.4);

    const ids = [createBookId(), createBookId(), createBookId()];

    expect(new Set(ids).size).toBe(ids.length);
    vi.restoreAllMocks();
  });
});
