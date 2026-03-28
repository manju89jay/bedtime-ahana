import type { LegacyBook as Book } from "@/types/legacy";

const FORBIDDEN_TOKENS = [
  "conni",
  "striped shirt",
  "signature stripes",
  "known franchise",
  "paw patrol",
  "disney",
  "pixar",
  "peppa pig",
  "frozen",
  "elsa",
  "cocomelon"
];

export function checkBookForIPRisks(book: Book): string[] {
  const issues: string[] = [];
  const haystack = JSON.stringify(book).toLowerCase();
  for (const token of FORBIDDEN_TOKENS) {
    if (haystack.includes(token)) {
      issues.push(`Found forbidden reference: "${token}"`);
    }
  }
  return issues;
}
