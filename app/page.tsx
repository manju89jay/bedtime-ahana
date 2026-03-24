import Link from "next/link";
import { listBooks } from "@/lib/storage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function HomePage() {
  const books = await listBooks();

  return (
    <div className="flex flex-col gap-10">
      {/* Hero section */}
      <section className="rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary p-8 text-white shadow-sm">
        <h2 className="text-2xl font-bold">Create a bedtime story</h2>
        <p className="mt-2 max-w-lg text-sm opacity-90">
          Enter your child&apos;s name, age, and interests. Pick a story template or
          describe your own idea. Get a personalized bedtime book as a PDF in minutes.
        </p>
        <Link
          href="/create"
          className="mt-6 inline-flex items-center rounded-lg bg-white px-6 py-2.5 text-sm font-semibold text-brand-primary shadow-sm no-underline transition-colors hover:bg-white/90"
        >
          Get started →
        </Link>
      </section>

      {/* Recent books */}
      {books.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-slate-800">Your books</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {books.map((book) => {
              const cover = book.pages?.find((p) => p.type === "cover");
              return (
                <Link
                  key={book.bookId}
                  href={`/reader/${book.bookId}`}
                  className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm no-underline transition-shadow hover:shadow-md"
                >
                  {/* Cover thumbnail */}
                  {cover?.imageUrl ? (
                    <img
                      src={cover.imageUrl}
                      alt={book.title}
                      className="h-36 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-36 items-center justify-center bg-gradient-to-br from-brand-primary to-brand-secondary">
                      <span className="text-2xl text-white/80">&#x1F4D6;</span>
                    </div>
                  )}
                  <div className="flex flex-1 flex-col gap-1 p-4">
                    <p className="font-medium text-slate-800 group-hover:text-brand-primary">
                      {book.title}
                    </p>
                    <p className="text-xs text-slate-400">
                      For {book.childProfile?.name || "—"} •{" "}
                      {new Date(book.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
