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
  const [importingGoogle, setImportingGoogle] = useState(false);
  const [googleStatus, setGoogleStatus] = useState<string>('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleGooglePhotos = async () => {
    setImportingGoogle(true);
    setGoogleStatus('Creando sesión...');

    // Step 1: create picker session
    const createRes = await fetch('/api/photos/picker', { method: 'POST' });
    if (!createRes.ok) {
      setGoogleStatus('Error al crear sesión');
      setImportingGoogle(false);
      return;
    }
    const { id: sessionId, pickerUri } = await createRes.json();

    // Step 2: open picker in new window
    const pickerWindow = window.open(pickerUri, '_blank', 'width=900,height=700');
    setGoogleStatus('Selecciona fotos en la ventana emergente...');

    // Step 3: poll until user finishes selection
    let attempts = 0;
    const maxAttempts = 150; // 5 minutes at 2s interval

    pollIntervalRef.current = setInterval(async () => {
      attempts++;
      if (attempts > maxAttempts) {
        clearInterval(pollIntervalRef.current!);
        pollIntervalRef.current = null;
        setGoogleStatus('Tiempo de espera agotado');
        setImportingGoogle(false);
        pickerWindow?.close();
        return;
      }

      try {
        const pollRes = await fetch(`/api/photos/picker/${sessionId}`);
        if (!pollRes.ok) return;
        const { mediaItemsSet } = await pollRes.json();

        if (mediaItemsSet) {
          clearInterval(pollIntervalRef.current!);
          pollIntervalRef.current = null;
          pickerWindow?.close();

          // Step 4: import selected photos
          setGoogleStatus('Importando fotos a Cloudinary...');
          const importRes = await fetch('/api/photos/picker/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, poiId }),
          });

          if (importRes.ok) {
            const { photos } = await importRes.json();
            photos.forEach((photo: Photo) => onUploaded(photo));
            setGoogleStatus(`✅ ${photos.length} foto${photos.length !== 1 ? 's' : ''} importada${photos.length !== 1 ? 's' : ''}`);
          } else {
            setGoogleStatus('Error al importar fotos');
          }

          setImportingGoogle(false);
          setTimeout(() => setGoogleStatus(''), 3000);
        }
      } catch {
        // Network error — keep polling
      }
    }, 2000);
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
                  photo.isMain ? 'border-indigo-500' : 'border-transparent'
                }`}
                alt=""
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded flex flex-col items-center justify-center gap-0.5">
                {!photo.isMain && (
                  <button
                    type="button"
                    onClick={() => handleSetMain(photo.id)}
                    className="text-white text-xs bg-indigo-600 rounded px-1 py-0.5 leading-none"
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
                <span className="absolute top-0 left-0 text-xs bg-indigo-500 text-white rounded-br px-1 leading-none py-0.5">
                  ★
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload buttons */}
      <div className="flex flex-wrap gap-2">
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
          disabled={uploading || importingGoogle}
          className="text-sm px-3 py-1.5 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-700 transition disabled:opacity-50 flex items-center gap-1"
        >
          {uploading ? (
            <><span className="animate-spin">⏳</span> Subiendo...</>
          ) : (
            <>📷 Desde dispositivo</>
          )}
        </button>

        <button
          type="button"
          onClick={handleGooglePhotos}
          disabled={uploading || importingGoogle}
          className="text-sm px-3 py-1.5 border border-indigo-500 rounded-lg text-indigo-300 hover:bg-indigo-900/50 transition disabled:opacity-50 flex items-center gap-1"
        >
          {importingGoogle ? (
            <><span className="animate-spin">⏳</span> Importando...</>
          ) : (
            <>🖼️ Google Fotos</>
          )}
        </button>
      </div>

      {/* Google Photos status message */}
      {googleStatus && (
        <p className="text-xs text-slate-400">{googleStatus}</p>
      )}
    </div>
  );
}
