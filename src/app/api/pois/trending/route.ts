import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { poiToResponse } from '@/lib/api-helpers';

export async function GET() {
  const pois = await db.poi.findMany({
    include: {
      user: true,
      photos: true,
      poiTags: { include: { tag: true } },
      _count: { select: { likes: true, ratings: true } },
      ratings: true,
    },
    orderBy: { likes: { _count: 'desc' } },
    take: 10,
  });
  return NextResponse.json(pois.map(p => poiToResponse(p)));
}
