import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/api-helpers';

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const auth = await requireAuth();
  if ('error' in auth) return auth.error;

  const existing = await db.like.findUnique({
    where: { userId_poiId: { userId: auth.userId, poiId: id } },
  });

  if (existing) {
    await db.like.delete({
      where: { userId_poiId: { userId: auth.userId, poiId: id } },
    });
    return NextResponse.json({ liked: false });
  } else {
    await db.like.create({ data: { userId: auth.userId, poiId: id } });
    return NextResponse.json({ liked: true });
  }
}
