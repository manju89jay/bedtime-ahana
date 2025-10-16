"use client";

import { useState } from "react";
import { Form } from "@/components/Form";
import { Progress } from "@/components/Progress";
import { PageCard } from "@/components/PageCard";
import { Banner } from "@/components/Banner";
import { ensureBookDirs, saveBook } from "@/lib/storage";
import { createBookId } from "@/lib/id";
import type { Book, Page } from "@/types/book";

const ahanaCard = {
  name: "Ahana",
  age: 4,
  home: "Ulm, Germany",
  family: ["Papa", "baby sister Shreya"],
  traits: ["curious", "kind", "gentle helper"],
  sidekick: "plush bunny",
  visualStyle: "soft watercolor, warm light, cozy sweaters"
};

export default function CreatePage() {
  const [book, setBook] = useState<Book | null>(null);
  const [status, setStatus] = useState<string>("");
  const [isGenerating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (formValues: {
    name: string;
    age: number;
    tone: "calm" | "adventurous";
    language: "en" | "de";
    storyIdea?: string;
  }) => {
    try {
      setGenerating(true);
      setError(null);
      setStatus("Generating outline...");
      const characterCard = { ...ahanaCard, name: formValues.name };
      const outlineRes = await fetch("/api/outline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formValues.name,
          age: formValues.age,
          tone: formValues.tone,
          language: formValues.language,
          storyIdea: formValues.storyIdea,
          characterCard
        })
      });
      if (!outlineRes.ok) throw new Error("Outline failed");
      const outline = await outlineRes.json();
      const bookId = createBookId();
      await ensureBookDirs(bookId);
      const pages: Page[] = [];
      for (const pageBeat of outline.pages) {
        setStatus(`Writing page ${pageBeat.pageNo}...`);
        const pageRes = await fetch("/api/page", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pageNo: pageBeat.pageNo,
            language: formValues.language,
            age: formValues.age,
            beat_summary: pageBeat.summary,
            characterCard
          })
        });
        if (!pageRes.ok) throw new Error("Page generation failed");
        const pageJson = await pageRes.json();

        setStatus(`Creating art prompt for page ${pageBeat.pageNo}...`);
        const imageRes = await fetch("/api/image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pageNo: pageBeat.pageNo,
            characterVisuals: characterCard.visualStyle,
            sceneSummary: pageBeat.summary,
            bookId
          })
        });
        if (!imageRes.ok) throw new Error("Image prompt failed");
        const imageJson = await imageRes.json();

        setStatus(`Synthesizing narration for page ${pageBeat.pageNo}...`);
        const ttsRes = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: pageJson.text,
            language: formValues.language,
            voice: "calm-parent",
            bookId,
            pageNo: pageBeat.pageNo
          })
        });
        if (!ttsRes.ok) throw new Error("Audio generation failed");
        const ttsJson = await ttsRes.json();

        pages.push({
          pageNo: pageBeat.pageNo,
          text: pageJson.text,
          imagePrompt: imageJson.prompt,
          imageUrl: imageJson.imageUrl,
          audioUrl: ttsJson.audioUrl
        });
      }

      const newBook: Book = {
        bookId,
        title: outline.title,
        language: formValues.language,
        characters: [characterCard],
        pages,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        moral: outline.moral
      };

      await saveBook(newBook);
      setBook(newBook);
      setStatus("Book saved. View it in the reader.");
    } catch (e) {
      console.error(e);
      setError("Something went wrong. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Banner title="Ahana&apos;s character card" description="The Create flow is pre-filled with Ahana&apos;s life in Ulm, her baby sister Shreya, and Papa." />
      <Form onSubmit={handleCreate} isGenerating={isGenerating} />
      <Progress status={status} active={isGenerating} />
      {error && <Banner tone="error" title="Generation failed" description={error} />}
      {book && (
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Book ready!</h2>
          <p className="mt-2 text-sm text-slate-600">
            View the freshly generated book with six illustrated pages in the reader.
          </p>
          <a
            href={`/reader/${book.bookId}`}
            className="mt-4 inline-flex rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-white"
          >
            Open reader
          </a>
        </div>
      )}
      {book && (
        <div className="grid gap-4 md:grid-cols-2">
          {book.pages.map((page) => (
            <PageCard key={page.pageNo} page={page} />
          ))}
        </div>
      )}
    </div>
  );
}
