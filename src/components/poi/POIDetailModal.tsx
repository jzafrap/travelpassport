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
  const [userRating, setUserRating] = useState(poi.userRating ?? 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingsAvg, setRatingsAvg] = useState(poi.ratingsAvg);
  const [ratingsCount, setRatingsCount] = useState(poi.ratingsCount);

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

  const handleRate = async (stars: number) => {
    if (!session) return;
    const prev = userRating;
    setUserRating(stars);
    const res = await fetch(`/api/pois/${poi.id}/rate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stars }),
    });
    if (res.ok) {
      const base = ratingsAvg * ratingsCount;
      if (prev === 0) {
        setRatingsAvg((base + stars) / (ratingsCount + 1));
        setRatingsCount(c => c + 1);
      } else {
        setRatingsAvg((base - prev + stars) / ratingsCount);
      }
    } else {
      setUserRating(prev);
    }
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
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700/60 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Main photo */}
        {activePhoto && (
          <div className="relative h-56 bg-slate-800">
            <Image
              src={activePhoto.cloudinaryUrl}
              alt={poi.title}
              fill
              className="object-cover rounded-t-2xl"
            />
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-900/80 to-transparent rounded-b-none" />
          </div>
        )}

        {/* Photo strip */}
        {poi.photos.length > 1 && (
          <div className="flex gap-1.5 p-2 overflow-x-auto bg-slate-800/50">
            {poi.photos.map(photo => (
              <button key={photo.id} onClick={() => setActivePhoto(photo)}>
                <img
                  src={photo.thumbnailUrl}
                  className={`w-14 h-14 rounded-lg object-cover flex-shrink-0 border-2 transition-colors ${
                    activePhoto?.id === photo.id ? 'border-indigo-500' : 'border-transparent'
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
            <h2 className="text-lg font-semibold text-slate-100 leading-tight">{poi.title}</h2>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-200 text-2xl leading-none flex-shrink-0 transition-colors"
            >
              ×
            </button>
          </div>

          <p className="text-sm text-slate-400 mt-1">
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
                  className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700"
                >
                  {t.emoji} {t.label}
                </span>
              ))}
            </div>
          )}

          {poi.description && (
            <p className="text-sm text-slate-300 mt-3 leading-relaxed">{poi.description}</p>
          )}

          {/* Actions */}
          <div className="flex gap-2 mt-4 flex-wrap">
            <button
              onClick={handleLike}
              disabled={!session}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm border transition ${
                liked
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                  : 'border-slate-600 text-slate-400 hover:border-rose-500/50 hover:text-rose-400'
              } disabled:opacity-40`}
            >
              {liked ? '♥' : '♡'} {likeCount}
            </button>

            <button
              onClick={handleWishlist}
              disabled={!session}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm border transition ${
                wishlisted
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                  : 'border-slate-600 text-slate-400 hover:border-amber-500/50 hover:text-amber-400'
              } disabled:opacity-40`}
            >
              {wishlisted ? '🔖' : '📌'} {wishlisted ? 'Guardado' : 'Guardar'}
            </button>

            <div className="flex items-center gap-1 ml-auto">
              {session ? (
                <div
                  className="flex items-center gap-0.5"
                  onMouseLeave={() => setHoverRating(0)}
                  title="Valora este viaje"
                >
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => handleRate(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      className="text-xl leading-none transition-transform hover:scale-110"
                    >
                      {star <= (hoverRating || userRating) ? '⭐' : '☆'}
                    </button>
                  ))}
                </div>
              ) : (
                <span className="text-sm text-slate-400">
                  ⭐ {ratingsAvg.toFixed(1)}
                </span>
              )}
              <span className="text-xs text-slate-500 ml-1">
                {ratingsAvg.toFixed(1)} ({ratingsCount})
              </span>
            </div>
          </div>

          {/* Owner actions */}
          {showEditDelete && (
            <div className="flex gap-2 mt-3 pt-3 border-t border-slate-700/60">
              <button
                onClick={() => onEdit?.(poi)}
                className="flex-1 py-1.5 text-sm border border-indigo-500/40 text-indigo-400 rounded-xl hover:bg-indigo-500/10 transition"
              >
                ✏️ Editar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-1.5 text-sm border border-rose-500/40 text-rose-400 rounded-xl hover:bg-rose-500/10 transition disabled:opacity-50"
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
