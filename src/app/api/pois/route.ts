import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, poiToResponse } from '@/lib/api-helpers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

function poiInclude(userId?: string) {
  return {
    user: true,
    photos: true,
    poiTags: { include: { tag: true } },
    _count: { select: { likes: true, ratings: true } },
    ...(userId ? { likes: { where: { userId } } } : {}),
    ratings: true,
    ...(userId ? { wishlist: { where: { userId } } } : {}),
  } as const;
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const { searchParams } = req.nextUrl;

  const minLat = searchParams.get('minLat');
  const maxLat = searchParams.get('maxLat');
  const minLng = searchParams.get('minLng');
  const maxLng = searchParams.get('maxLng');
  const dateFrom = searchParams.get('dateFrom');
  const dateTo = searchParams.get('dateTo');
  const tagKeys = searchParams.getAll('tag');
  const limit = parseInt(searchParams.get('limit') ?? '100');

  const where: any = {};

  if (minLat && maxLat && minLng && maxLng) {
    where.lat = { gte: parseFloat(minLat), lte: parseFloat(maxLat) };
    where.lng = { gte: parseFloat(minLng), lte: parseFloat(maxLng) };
  }
  if (dateFrom) where.dateVisited = { ...(where.dateVisited ?? {}), gte: new Date(dateFrom) };
  if (dateTo) where.dateVisited = { ...(where.dateVisited ?? {}), lte: new Date(dateTo) };
  if (tagKeys.length > 0) {
    where.poiTags = { some: { tag: { key: { in: tagKeys } } } };
  }

  const pois = await db.poi.findMany({
    where,
    include: poiInclude(userId) as any,
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return NextResponse.json(pois.map(p => poiToResponse(p, userId)));
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if ('error' in auth) return auth.error;

  const body = await req.json();
  const { title, description, lat, lng, dateVisited, tagKeys } = body;

  if (!title || lat === undefined || lng === undefined || !dateVisited) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  let tagCreateData: { tagId: string }[] = [];
  if (tagKeys?.length) {
    const tags = await db.tag.findMany({ where: { key: { in: tagKeys } } });
    tagCreateData = tags.map((t: { id: string }) => ({ tagId: t.id }));
  }

  const poi = await db.poi.create({
    data: {
      userId: auth.userId,
      title,
      description: description ?? null,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      dateVisited: new Date(dateVisited),
      ...(tagCreateData.length ? { poiTags: { create: tagCreateData } } : {}),
    },
    include: poiInclude(auth.userId) as any,
  });

  return NextResponse.json(poiToResponse(poi, auth.userId), { status: 201 });
}
