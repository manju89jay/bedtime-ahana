import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "bedtime-ahana — Personalized Bedtime Stories",
  description: "Create a custom bedtime storybook for your child in minutes"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-8 px-4 py-8">
          <header className="flex items-center justify-between border-b border-slate-200 pb-4">
            <Link href="/" className="no-underline">
              <h1 className="text-xl font-bold text-brand-primary">bedtime-ahana</h1>
            </Link>
            <Link
              href="/create"
              className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white no-underline shadow-sm transition-colors hover:bg-brand-primary/90"
            >
              New Book
            </Link>
          </header>
          {children}
        </main>
      </body>
    </html>
  );
}
