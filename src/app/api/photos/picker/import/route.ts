import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { cloudinary, getThumbnailUrl } from '@/lib/cloudinary';
import { db } from '@/lib/db';

// POST /api/photos/picker/import — fetch selected items and upload to Cloudinary
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { sessionId, poiId } = await req.json();
  if (!sessionId || !poiId) {
    return NextResponse.json({ error: 'sessionId and poiId required' }, { status: 400 });
  }

  // Verify POI belongs to user
  const poi = await db.poi.findUnique({ where: { id: poiId } });
  if (!poi || poi.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Fetch selected media items from Google Photos Picker
  const itemsRes = await fetch(
    `https://photospicker.googleapis.com/v1/mediaItems?sessionId=${sessionId}&pageSize=50`,
    { headers: { Authorization: `Bearer ${session.accessToken}` } }
  );

  if (!itemsRes.ok) {
    return NextResponse.json({ error: 'Failed to fetch media items' }, { status: 500 });
  }

  const { mediaItems } = await itemsRes.json();
  if (!mediaItems?.length) {
    return NextResponse.json({ photos: [] });
  }

  const existingCount = await db.photo.count({ where: { poiId } });
  const photos: { id: string; poiId: string; cloudinaryUrl: string; thumbnailUrl: string; isMain: boolean }[] = [];

  for (const item of mediaItems) {
    try {
      // baseUrl is nested under mediaFile per the Picker API v1 spec
      const baseUrl = item.mediaFile?.baseUrl ?? item.baseUrl;
      const uploadResult = await cloudinary.uploader.upload(`${baseUrl}=d`, {
        folder: 'travelpassport',
        resource_type: 'image',
      });

      const isMain = existingCount === 0 && photos.length === 0;
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
        await db.poi.update({ where: { id: poiId }, data: { mainPhotoId: photo.id } });
      }

      photos.push(photo);
    } catch (err) {
      console.error('Failed to import photo from Google Photos:', err);
    }
  }

  // Clean up the picker session
  await fetch(`https://photospicker.googleapis.com/v1/sessions/${sessionId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${session.accessToken}` },
  }).catch(() => {});

  return NextResponse.json({ photos });
}
