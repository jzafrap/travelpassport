import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/api-helpers';

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const auth = await requireAuth();
  if ('error' in auth) return auth.error;

  const { stars } = await req.json();
  if (!stars || stars < 1 || stars > 5) {
    return NextResponse.json({ error: 'Stars must be 1-5' }, { status: 400 });
  }

  const rating = await db.rating.upsert({
    where: { userId_poiId: { userId: auth.userId, poiId: id } },
    update: { stars },
    create: { userId: auth.userId, poiId: id, stars },
  });
  return NextResponse.json(rating);
}
