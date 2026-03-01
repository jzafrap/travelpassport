'use client';
import { useState, useRef } from 'react';

interface Photo {
  id: string;
  cloudinaryUrl: string;
  thumbnailUrl: string;
  isMain: boolean;
}

interface PhotoUploaderProps {
  poiId: string;
  existingPhotos?: Photo[];
  onUploaded: (photo: Photo) => void;
  onDeleted?: (photoId: string) => void;
  onSetMain?: (photoId: string) => void;
}

export function PhotoUploader({
  poiId,
  existingPhotos = [],
  onUploaded,
  onDeleted,
  onSetMain,
}: PhotoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('poiId', poiId);
    formData.append('isMain', existingPhotos.length === 0 ? 'true' : 'false');

    const res = await fetch('/api/photos/upload', { method: 'POST', body: formData });
    if (res.ok) {
      const photo = await res.json();
      onUploaded(photo);
    }
    setUploading(false);
    // Reset input so same file can be re-selected
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleDelete = async (photoId: string) => {
    setDeletingId(photoId);
    const res = await fetch(`/api/photos/${photoId}`, { method: 'DELETE' });
    if (res.ok) onDeleted?.(photoId);
    setDeletingId(null);
  };

  const handleSetMain = async (photoId: string) => {
    await fetch(`/api/pois/${poiId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mainPhotoId: photoId }),
    });
    onSetMain?.(photoId);
  };

  return (
    <div className="space-y-2">
      {/* Existing photos */}
      {existingPhotos.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {existingPhotos.map(photo => (
            <div key={photo.id} className="relative group">
              <img
                src={photo.thumbnailUrl}
                className={`w-16 h-16 rounded object-cover border-2 ${
                  photo.isMain ? 'border-blue-500' : 'border-transparent'
                }`}
                alt=""
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex flex-col items-center justify-center gap-0.5">
                {!photo.isMain && (
                  <button
                    type="button"
                    onClick={() => handleSetMain(photo.id)}
                    className="text-white text-xs bg-blue-600 rounded px-1 py-0.5 leading-none"
                  >
                    ★
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(photo.id)}
                  disabled={deletingId === photo.id}
                  className="text-white text-xs bg-red-600 rounded px-1 py-0.5 leading-none disabled:opacity-50"
                >
                  🗑
                </button>
              </div>
              {photo.isMain && (
                <span className="absolute top-0 left-0 text-xs bg-blue-500 text-white rounded-br px-1 leading-none py-0.5">
                  ★
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="text-sm px-3 py-1.5 border rounded-lg hover:bg-gray-50 transition disabled:opacity-50 flex items-center gap-1"
      >
        {uploading ? (
          <>
            <span className="animate-spin">⏳</span> Subiendo...
          </>
        ) : (
          <>📷 Añadir foto</>
        )}
      </button>
    </div>
  );
}
