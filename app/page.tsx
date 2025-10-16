import Link from "next/link";
import { listBooks } from "@/lib/storage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function HomePage() {
  const books = await listBooks();

  return (
    <div className="flex flex-col gap-10">
      <section className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Create a new book</h2>
        <p className="mt-2 text-sm text-slate-600">
          Start with Ahana&apos;s character card, customize the prompt, and generate a six-page bedtime book.
        </p>
        <div className="mt-4 flex gap-3">
          <Link
            href="/create"
            className="inline-flex items-center justify-center rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-white shadow"
          >
            Go to Create flow
          </Link>
        </div>
      </section>

      <section className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Recent books</h2>
        {books.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No books yet. Generate one to see it here.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {books.map((book) => (
              <li key={book.bookId} className="flex items-center justify-between rounded border border-slate-200 p-3">
                <div>
                  <p className="font-medium">{book.title}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(book.updatedAt).toLocaleString()} • {book.language.toUpperCase()}
                  </p>
                </div>
                <Link href={`/reader/${book.bookId}`} className="text-sm text-brand-primary">
                  Open reader →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
