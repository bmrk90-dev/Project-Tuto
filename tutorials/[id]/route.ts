import { NextResponse } from 'next/server';
import { toggleSave } from '@/lib/db';
export async function POST(_: Request, { params }: { params: { id: string }}) { const item = await toggleSave(params.id); if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 }); return NextResponse.json(item); }
