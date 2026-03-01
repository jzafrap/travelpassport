import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

type RouteParams = { params: Promise<{ userId: string }> };

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { userId } = await params;

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const pois = await db.poi.findMany({
    where: { userId },
    select: { id: true, title: true, lat: true, lng: true, dateVisited: true },
  });

  const [likesReceived, ratings] = await Promise.all([
    db.like.count({ where: { poi: { userId } } }),
    db.rating.findMany({ where: { poi: { userId } }, select: { stars: true } }),
  ]);

  const avgRating = ratings.length
    ? ratings.reduce((s, r) => s + r.stars, 0) / ratings.length
    : 0;
  const dates = pois.map(p => p.dateVisited).sort();

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      alias: user.alias,
      avatarUrl: user.avatarUrl,
    },
    pois,
    stats: {
      totalPois: pois.length,
      totalLikesReceived: likesReceived,
      avgRating: Math.round(avgRating * 10) / 10,
      firstTrip: dates[0] ?? null,
      lastTrip: dates[dates.length - 1] ?? null,
      memberSince: user.createdAt,
    },
  });
}
