'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Bookshelf } from '@/components/bookshelf/Bookshelf';
import type { Book } from '@/types/book';

export default function DashboardPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const subscription = 'free'; // Will be wired to session in production

  useEffect(() => {
    // In production, fetch from API with auth
    setLoading(false);
  }, []);

  return (
    <div className="flex flex-col gap-8" data-testid="dashboard">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800" data-testid="dashboard-title">
            My Dashboard
          </h2>
          <p className="text-sm text-slate-500">
            Plan: <span className="font-medium capitalize text-brand-primary" data-testid="subscription-tier">{subscription}</span>
          </p>
        </div>
        <Link
          href="/create"
          className="rounded-lg bg-brand-primary px-6 py-2.5 text-sm font-medium text-white no-underline shadow-sm hover:bg-brand-primary/90"
          data-testid="create-button"
        >
          Create New Book
        </Link>
      </div>

      {/* Bookshelf */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
        </div>
      ) : (
        <Bookshelf books={books} />
      )}
    </div>
  );
}
