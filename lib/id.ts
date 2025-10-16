export function createBookId() {
  const now = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `book-${now}-${rand}`;
}
