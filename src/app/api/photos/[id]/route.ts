import { NextRequest, NextResponse } from 'next/server';
import { cloudinary } from '@/lib/cloudinary';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/api-helpers';

type RouteParams = { params: Promise<{ id: string }> };

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const auth = await requireAuth();
  if ('error' in auth) return auth.error;

  const photo = await db.photo.findUnique({
    where: { id },
    include: { poi: true },
  });

  if (!photo || photo.poi.userId !== auth.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await cloudinary.uploader.destroy(photo.cloudinaryPublicId);
  await db.photo.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
