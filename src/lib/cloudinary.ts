import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

export function getThumbnailUrl(publicId: string): string {
  return cloudinary.url(publicId, {
    width: 200,
    height: 200,
    crop: 'fill',
    gravity: 'auto',
    format: 'webp',
    quality: 'auto',
  });
}
