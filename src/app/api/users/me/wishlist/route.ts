import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, poiToResponse } from '@/lib/api-helpers';

export async function GET() {
  const auth = await requireAuth();
  if ('error' in auth) return auth.error;

  const wishlist = await db.wishlist.findMany({
    where: { userId: auth.userId },
    include: {
      poi: {
        include: {
          user: true,
          photos: true,
          poiTags: { include: { tag: true } },
          _count: { select: { likes: true, ratings: true } },
          likes: { where: { userId: auth.userId } },
          ratings: { where: { userId: auth.userId } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(wishlist.map(w => poiToResponse(w.poi, auth.userId)));
}
