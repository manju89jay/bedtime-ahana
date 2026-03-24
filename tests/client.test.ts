import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

describe("getAnthropicClient", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("throws when ANTHROPIC_API_KEY is not set", async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const { getAnthropicClient } = await import("@/lib/ai/client");
    expect(() => getAnthropicClient()).toThrow("ANTHROPIC_API_KEY");
  });

  it("returns a client when API key is set", async () => {
    process.env.ANTHROPIC_API_KEY = "test-key-123";
    const { getAnthropicClient } = await import("@/lib/ai/client");
    const client = getAnthropicClient();
    expect(client).toBeDefined();
    expect(client.messages).toBeDefined();
  });

  it("returns the same client instance on subsequent calls", async () => {
    process.env.ANTHROPIC_API_KEY = "test-key-123";
    const { getAnthropicClient } = await import("@/lib/ai/client");
    const client1 = getAnthropicClient();
    const client2 = getAnthropicClient();
    expect(client1).toBe(client2);
  });
});

describe("getOpenAIClient", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("throws when OPENAI_API_KEY is not set", async () => {
    delete process.env.OPENAI_API_KEY;
    const { getOpenAIClient } = await import("@/lib/ai/imageClient");
    expect(() => getOpenAIClient()).toThrow("OPENAI_API_KEY");
  });

  it("returns a client when API key is set", async () => {
    process.env.OPENAI_API_KEY = "test-key-456";
    const { getOpenAIClient } = await import("@/lib/ai/imageClient");
    const client = getOpenAIClient();
    expect(client).toBeDefined();
    expect(client.images).toBeDefined();
  });
});
