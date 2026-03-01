import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  return { userId: session.user.id };
}

export function poiToResponse(poi: any, userId?: string) {
  return {
    id: poi.id,
    userId: poi.userId,
    title: poi.title,
    description: poi.description,
    lat: poi.lat,
    lng: poi.lng,
    dateVisited: poi.dateVisited,
    mainPhoto: poi.photos?.find((p: any) => p.isMain) ?? poi.photos?.[0] ?? null,
    photos: poi.photos ?? [],
    tags: poi.poiTags?.map((pt: any) => pt.tag) ?? [],
    likesCount: poi._count?.likes ?? poi.likes?.length ?? 0,
    ratingsAvg: poi.ratings?.length
      ? poi.ratings.reduce((s: number, r: any) => s + r.stars, 0) / poi.ratings.length
      : 0,
    ratingsCount: poi._count?.ratings ?? poi.ratings?.length ?? 0,
    userHasLiked: userId ? poi.likes?.some((l: any) => l.userId === userId) : false,
    userRating: userId ? poi.ratings?.find((r: any) => r.userId === userId)?.stars : undefined,
    userWishlisted: userId ? poi.wishlist?.some((w: any) => w.userId === userId) : false,
    author: poi.user
      ? { id: poi.user.id, name: poi.user.name, alias: poi.user.alias, avatarUrl: poi.user.avatarUrl }
      : undefined,
  };
}
