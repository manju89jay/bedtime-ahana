import type { Book } from "@/types/book";

const FORBIDDEN_TOKENS = [
  "conni",
  "striped shirt",
  "signature stripes",
  "known franchise",
  "paw patrol",
  "disney",
  "pixar"
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
