'use client';
import type { POI } from '@/types';
import { useState } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface POIDetailModalProps {
  poi: POI;
  onClose: () => void;
  onLikeToggle?: (poiId: string) => void;
  showEditDelete?: boolean;
  onEdit?: (poi: POI) => void;
  onDelete?: (poiId: string) => void;
}

export function POIDetailModal({
  poi,
  onClose,
  onLikeToggle,
  showEditDelete,
  onEdit,
  onDelete,
}: POIDetailModalProps) {
  const { data: session } = useSession();
  const [liked, setLiked] = useState(poi.userHasLiked ?? false);
  const [likeCount, setLikeCount] = useState(poi.likesCount);
  const [wishlisted, setWishlisted] = useState(poi.userWishlisted ?? false);
  const [activePhoto, setActivePhoto] = useState(poi.mainPhoto ?? poi.photos[0] ?? null);
  const [deleting, setDeleting] = useState(false);

  const handleLike = async () => {
    if (!session) return;
    const res = await fetch(`/api/pois/${poi.id}/like`, { method: 'POST' });
    const data = await res.json();
    setLiked(data.liked);
    setLikeCount(c => (data.liked ? c + 1 : c - 1));
    onLikeToggle?.(poi.id);
  };

  const handleWishlist = async () => {
    if (!session) return;
    const res = await fetch(`/api/pois/${poi.id}/wishlist`, { method: 'POST' });
    const data = await res.json();
    setWishlisted(data.wishlisted);
  };

  const handleDelete = async () => {
    if (!confirm('¿Eliminar este viaje?')) return;
    setDeleting(true);
    await fetch(`/api/pois/${poi.id}`, { method: 'DELETE' });
    onDelete?.(poi.id);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Main photo */}
        {activePhoto && (
          <div className="relative h-56 bg-gray-200">
            <Image
              src={activePhoto.cloudinaryUrl}
              alt={poi.title}
              fill
              className="object-cover rounded-t-xl"
            />
          </div>
        )}

        {/* Photo strip */}
        {poi.photos.length > 1 && (
          <div className="flex gap-1 p-2 overflow-x-auto bg-gray-50">
            {poi.photos.map(photo => (
              <button key={photo.id} onClick={() => setActivePhoto(photo)}>
                <img
                  src={photo.thumbnailUrl}
                  className={`w-14 h-14 rounded object-cover flex-shrink-0 border-2 transition-colors ${
                    activePhoto?.id === photo.id ? 'border-blue-500' : 'border-transparent'
                  }`}
                  alt=""
                />
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="p-4">
          <div className="flex justify-between items-start gap-2">
            <h2 className="text-lg font-semibold leading-tight">{poi.title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none flex-shrink-0"
            >
              ×
            </button>
          </div>

          <p className="text-sm text-gray-500 mt-1">
            📅{' '}
            {format(new Date(poi.dateVisited), 'dd MMM yyyy', { locale: es })} ·{' '}
            👤 @{poi.author?.alias ?? poi.author?.name}
          </p>

          {/* Tags */}
          {poi.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {poi.tags.map(t => (
                <span
                  key={t.key}
                  className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700"
                >
                  {t.emoji} {t.label}
                </span>
              ))}
            </div>
          )}

          {poi.description && (
            <p className="text-sm text-gray-700 mt-3 leading-relaxed">{poi.description}</p>
          )}

          {/* Actions */}
          <div className="flex gap-2 mt-4 flex-wrap">
            <button
              onClick={handleLike}
              disabled={!session}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm border transition ${
                liked
                  ? 'bg-red-50 border-red-300 text-red-600'
                  : 'border-gray-300 hover:border-red-300'
              } disabled:opacity-50`}
            >
              {liked ? '♥' : '♡'} {likeCount}
            </button>

            <button
              onClick={handleWishlist}
              disabled={!session}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm border transition ${
                wishlisted
                  ? 'bg-yellow-50 border-yellow-400 text-yellow-700'
                  : 'border-gray-300 hover:border-yellow-300'
              } disabled:opacity-50`}
            >
              {wishlisted ? '🔖' : '📌'} {wishlisted ? 'Guardado' : 'Guardar'}
            </button>

            <span className="flex items-center gap-1 text-sm text-gray-600 ml-auto">
              ⭐ {poi.ratingsAvg.toFixed(1)}
              <span className="text-xs text-gray-400">({poi.ratingsCount})</span>
            </span>
          </div>

          {/* Owner actions */}
          {showEditDelete && (
            <div className="flex gap-2 mt-3 pt-3 border-t">
              <button
                onClick={() => onEdit?.(poi)}
                className="flex-1 py-1.5 text-sm border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition"
              >
                ✏️ Editar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-1.5 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
              >
                🗑 {deleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
