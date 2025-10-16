import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "bedtime-ahana",
  description: "Create custom bedtime books for Ahana and friends"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-4 py-10">
          <header className="flex flex-col gap-2 border-b border-slate-200 pb-6">
            <h1 className="text-3xl font-bold text-brand-primary">bedtime-ahana</h1>
            <p className="max-w-2xl text-sm text-slate-600">
              Create a cozy, copyright-safe bedtime book for Ahana in minutes. Use the
              Create flow to generate pages, review them in the reader, and export a PDF for bedtime.
            </p>
          </header>
          {children}
        </main>
      </body>
    </html>
  );
}
