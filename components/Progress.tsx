"use client";

type Step = {
  label: string;
  status: "pending" | "active" | "done";
};

export function GenerationProgress({ steps }: { steps: Step[] }) {
  if (steps.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-700">Creating your book...</h3>
      <div className="flex flex-col gap-2">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-3 text-sm">
            {step.status === "done" && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-600 text-xs">
                &#10003;
              </span>
            )}
            {step.status === "active" && (
              <span className="flex h-5 w-5 items-center justify-center">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
              </span>
            )}
            {step.status === "pending" && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-400 text-xs">
                {i + 1}
              </span>
            )}
            <span
              className={
                step.status === "active"
                  ? "font-medium text-brand-primary"
                  : step.status === "done"
                    ? "text-slate-500"
                    : "text-slate-400"
              }
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
