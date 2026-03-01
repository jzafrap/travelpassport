import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { poiToResponse } from '@/lib/api-helpers';

export async function GET() {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const pois = await db.poi.findMany({
    where: { createdAt: { gte: since } },
    include: {
      user: true,
      photos: true,
      poiTags: { include: { tag: true } },
      _count: { select: { likes: true, ratings: true } },
      ratings: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });
  return NextResponse.json(pois.map(p => poiToResponse(p)));
}
