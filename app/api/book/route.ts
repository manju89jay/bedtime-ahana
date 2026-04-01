import { NextResponse } from "next/server";
import { saveBook } from "@/lib/storage";
import type { LegacyBook as Book } from "@/types/legacy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const book = (await request.json()) as Book;
  await saveBook(book);
  return NextResponse.json({ ok: true });
}
