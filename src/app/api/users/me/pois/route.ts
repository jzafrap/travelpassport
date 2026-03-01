import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, poiToResponse } from '@/lib/api-helpers';

export async function GET() {
  const auth = await requireAuth();
  if ('error' in auth) return auth.error;

  const pois = await db.poi.findMany({
    where: { userId: auth.userId },
    include: {
      user: true,
      photos: true,
      poiTags: { include: { tag: true } },
      _count: { select: { likes: true, ratings: true } },
      ratings: true,
    },
    orderBy: { dateVisited: 'desc' },
  });
  return NextResponse.json(pois.map(p => poiToResponse(p, auth.userId)));
}
