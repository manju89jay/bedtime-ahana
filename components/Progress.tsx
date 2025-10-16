"use client";

export function Progress({ status, active }: { status: string; active: boolean }) {
  if (!status && !active) return null;
  return (
    <div className="rounded-lg border border-dashed border-brand-primary bg-white p-4 text-sm text-brand-primary">
      {active ? status || "Preparing..." : `Last status: ${status}`}
    </div>
  );
}
