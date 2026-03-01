import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/api-helpers';

export async function GET() {
  const auth = await requireAuth();
  if ('error' in auth) return auth.error;

  const [pois, likesReceived, ratings] = await Promise.all([
    db.poi.findMany({
      where: { userId: auth.userId },
      select: { id: true, lat: true, lng: true, dateVisited: true },
    }),
    db.like.count({ where: { poi: { userId: auth.userId } } }),
    db.rating.findMany({
      where: { poi: { userId: auth.userId } },
      select: { stars: true },
    }),
  ]);

  const dates = pois.map(p => p.dateVisited).sort();
  const avgRating = ratings.length
    ? ratings.reduce((s, r) => s + r.stars, 0) / ratings.length
    : 0;

  return NextResponse.json({
    totalPois: pois.length,
    totalLikesReceived: likesReceived,
    avgRating: Math.round(avgRating * 10) / 10,
    firstTrip: dates[0] ?? null,
    lastTrip: dates[dates.length - 1] ?? null,
  });
}
