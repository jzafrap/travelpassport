import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, poiToResponse } from '@/lib/api-helpers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const poi = await db.poi.findUnique({
    where: { id },
    include: {
      user: true,
      photos: true,
      poiTags: { include: { tag: true } },
      _count: { select: { likes: true, ratings: true } },
      ...(userId ? { likes: { where: { userId } } } : {}),
      ratings: true,
      ...(userId ? { wishlist: { where: { userId } } } : {}),
    } as any,
  });

  if (!poi) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(poiToResponse(poi, userId));
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const auth = await requireAuth();
  if ('error' in auth) return auth.error;

  const poi = await db.poi.findUnique({ where: { id } });
  if (!poi || poi.userId !== auth.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const { title, description, lat, lng, dateVisited, tagKeys, mainPhotoId } = body;

  if (tagKeys !== undefined) {
    await db.poiTag.deleteMany({ where: { poiId: id } });
    if (tagKeys.length > 0) {
      const tags = await db.tag.findMany({ where: { key: { in: tagKeys } } });
      await db.poiTag.createMany({
        data: tags.map((t: { id: string }) => ({ poiId: id, tagId: t.id })),
      });
    }
  }

  const updated = await db.poi.update({
    where: { id },
    data: {
      title: title ?? poi.title,
      description: description !== undefined ? description : poi.description,
      lat: lat !== undefined ? parseFloat(lat) : poi.lat,
      lng: lng !== undefined ? parseFloat(lng) : poi.lng,
      dateVisited: dateVisited ? new Date(dateVisited) : poi.dateVisited,
      mainPhotoId: mainPhotoId !== undefined ? mainPhotoId : poi.mainPhotoId,
    },
    include: {
      user: true,
      photos: true,
      poiTags: { include: { tag: true } },
      _count: { select: { likes: true, ratings: true } },
      ratings: true,
    },
  });

  return NextResponse.json(poiToResponse(updated, auth.userId));
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const auth = await requireAuth();
  if ('error' in auth) return auth.error;

  const poi = await db.poi.findUnique({ where: { id } });
  if (!poi || poi.userId !== auth.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await db.poi.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
