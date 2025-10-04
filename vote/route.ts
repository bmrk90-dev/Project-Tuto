import { NextResponse } from 'next/server';
import { vote } from '@/lib/db';
export async function POST(_: Request, { params }: { params: { id: string }}) { const item = await vote(params.id); if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 }); return NextResponse.json(item); }
