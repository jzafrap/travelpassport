import { NextRequest, NextResponse } from 'next/server';
import { cloudinary, getThumbnailUrl } from '@/lib/cloudinary';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/api-helpers';

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if ('error' in auth) return auth.error;

  const formData = await req.formData();
  const file = formData.get('file') as File;
  const poiId = formData.get('poiId') as string;
  const isMain = formData.get('isMain') === 'true';

  if (!file || !poiId) {
    return NextResponse.json({ error: 'file and poiId required' }, { status: 400 });
  }

  // Verify POI belongs to user
  const poi = await db.poi.findUnique({ where: { id: poiId } });
  if (!poi || poi.userId !== auth.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadResult = await new Promise<any>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        { folder: 'travelpassport', resource_type: 'image' },
        (error, result) => (error ? reject(error) : resolve(result))
      )
      .end(buffer);
  });

  const photo = await db.photo.create({
    data: {
      poiId,
      cloudinaryUrl: uploadResult.secure_url,
      cloudinaryPublicId: uploadResult.public_id,
      thumbnailUrl: getThumbnailUrl(uploadResult.public_id),
      isMain,
    },
  });

  if (isMain) {
    await db.photo.updateMany({
      where: { poiId, id: { not: photo.id } },
      data: { isMain: false },
    });
    await db.poi.update({ where: { id: poiId }, data: { mainPhotoId: photo.id } });
  }

  return NextResponse.json(photo, { status: 201 });
}
