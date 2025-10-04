import { NextResponse } from "next/server";
import { addTutorial, getAll } from "@/lib/db";
export async function GET() { return NextResponse.json(await getAll()); }
export async function POST(req: Request) {
  const body = await req.json();
  const { title, category, tags = [], description = "", durationSec } = body || {};
  if (!title || !category || typeof durationSec !== "number") { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }
  const item = await addTutorial({
    title: String(title).slice(0, 120),
    category,
    tags: Array.isArray(tags) ? tags.slice(0, 8).map(String) : [],
    description: String(description).slice(0, 300),
    durationSec: Math.max(10, Math.min(90, durationSec)),
  });
  return NextResponse.json(item, { status: 201 });
}
