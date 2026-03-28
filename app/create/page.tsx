"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChildInfoForm } from "@/components/Form";
import { TemplatePicker } from "@/components/TemplatePicker";
import { GenerationProgress } from "@/components/Progress";
import { Banner } from "@/components/Banner";
import type { LegacyChildProfile as ChildProfile, LegacyStoryTemplate as StoryTemplate } from "@/types/legacy";

import templates from "@/data/templates/templates-v1-archived.json";

type Step = { label: string; status: "pending" | "active" | "done" };

export default function CreatePage() {
  const router = useRouter();
  const [step, setStep] = useState<"info" | "story" | "generating">("info");
  const [childProfile, setChildProfile] = useState<ChildProfile | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<StoryTemplate | null>(null);
  const [customIdea, setCustomIdea] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [progressSteps, setProgressSteps] = useState<Step[]>([]);

  const handleChildSubmit = (profile: ChildProfile) => {
    setChildProfile(profile);
    setStep("story");
  };

  const handleGenerate = async () => {
    if (!childProfile) return;

    setStep("generating");
    setError(null);
    setProgressSteps([
      { label: "Writing your story...", status: "active" },
      { label: "Creating illustrations...", status: "pending" },
      { label: "Assembling your book...", status: "pending" }
    ]);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childProfile,
          templateId: selectedTemplate?.id,
          storyIdea: customIdea || undefined,
          templatePrompt: selectedTemplate?.prompt
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Generation failed");
      }

      setProgressSteps([
        { label: "Writing your story...", status: "done" },
        { label: "Creating illustrations...", status: "done" },
        { label: "Assembling your book...", status: "done" }
      ]);

      const { book } = await res.json();

      // Brief pause so user sees completion state
      await new Promise((r) => setTimeout(r, 600));
      router.push(`/reader/${book.bookId}`);
    } catch (e: any) {
      setError(e.message || "Something went wrong. Please try again.");
      setStep("story");
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Step indicator */}
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <span className={step === "info" ? "font-semibold text-brand-primary" : "text-slate-500"}>
          1. Child Info
        </span>
        <span>→</span>
        <span
          className={
            step === "story" || step === "generating"
              ? "font-semibold text-brand-primary"
              : ""
          }
        >
          2. Choose Story
        </span>
        <span>→</span>
        <span className={step === "generating" ? "font-semibold text-brand-primary" : ""}>
          3. Your Book
        </span>
      </div>

      {/* Step 1: Child Info */}
      {step === "info" && (
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-1 text-lg font-semibold text-slate-800">
            Tell us about your child
          </h2>
          <p className="mb-6 text-sm text-slate-500">
            We&apos;ll use this to personalize the story.
          </p>
          <ChildInfoForm onSubmit={handleChildSubmit} isDisabled={false} />
        </div>
      )}

      {/* Step 2: Story Selection */}
      {step === "story" && childProfile && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Pick a story for {childProfile.name}
              </h2>
              <p className="text-sm text-slate-500">
                Choose a template or write your own idea below.
              </p>
            </div>
            <button
              onClick={() => setStep("info")}
              className="text-sm text-slate-400 hover:text-slate-600"
            >
              ← Back
            </button>
          </div>

          <TemplatePicker
            templates={templates as StoryTemplate[]}
            selected={selectedTemplate?.id || null}
            onSelect={(t) => {
              setSelectedTemplate(t);
              if (t) setCustomIdea("");
            }}
          />

          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-medium text-slate-400">OR</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Write your own story idea
            </label>
            <textarea
              rows={3}
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              placeholder={`e.g. ${childProfile.name} finds a tiny dragon egg in the garden and has to keep it warm until it hatches`}
              value={customIdea}
              onChange={(e) => {
                setCustomIdea(e.target.value);
                if (e.target.value) setSelectedTemplate(null);
              }}
            />
          </div>

          {error && <Banner tone="error" title="Generation failed" description={error} />}

          <button
            onClick={handleGenerate}
            disabled={!selectedTemplate && !customIdea.trim()}
            className="self-end rounded-lg bg-brand-primary px-8 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-primary/90 disabled:opacity-50"
          >
            Create Book
          </button>
        </div>
      )}

      {/* Step 3: Generating */}
      {step === "generating" && <GenerationProgress steps={progressSteps} />}
    </div>
  );
}
