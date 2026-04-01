import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Ahana \u2014 Personalized Bedtime Stories for Your Child",
  description: "Beautifully illustrated, personalized storybooks where your child is the hero. Digital reader + keepsake-quality printed books."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen font-sans">
        <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8">
          <header className="flex items-center justify-between">
            <Link href="/" className="no-underline">
              <span className="font-serif text-xl font-semibold tracking-tight text-brand-primary sm:text-2xl">
                ahana
              </span>
            </Link>
            <nav className="flex items-center gap-3 sm:gap-4">
              <Link
                href="/login"
                className="text-sm font-medium text-warm-600 no-underline transition-colors hover:text-brand-primary"
              >
                Sign In
              </Link>
              <Link
                href="/create"
                className="rounded-full bg-brand-primary px-5 py-2 text-sm font-medium text-white no-underline shadow-sm transition-all hover:bg-brand-primary/90 hover:shadow-md"
              >
                Create a Story
              </Link>
            </nav>
          </header>
          {children}
        </main>
      </body>
    </html>
  );
}
