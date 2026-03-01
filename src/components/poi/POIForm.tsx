'use client';
import { useState, useEffect } from 'react';
import type { Tag, POI } from '@/types';
import { PhotoUploader } from './PhotoUploader';

interface POIFormProps {
  initialLat?: number;
  initialLng?: number;
  poi?: POI;
  onSaved: (poi: POI) => void;
  onClose: () => void;
}

export function POIForm({ initialLat, initialLng, poi, onSaved, onClose }: POIFormProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTagKeys, setSelectedTagKeys] = useState<string[]>(
    poi?.tags?.map(t => t.key) ?? []
  );
  const [photos, setPhotos] = useState<any[]>(poi?.photos ?? []);
  const [savedPoiId, setSavedPoiId] = useState<string | null>(poi?.id ?? null);
  const [form, setForm] = useState({
    title: poi?.title ?? '',
    description: poi?.description ?? '',
    lat: poi?.lat?.toString() ?? initialLat?.toString() ?? '',
    lng: poi?.lng?.toString() ?? initialLng?.toString() ?? '',
    dateVisited: poi?.dateVisited
      ? new Date(poi.dateVisited).toISOString().slice(0, 10)
      : '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/tags').then(r => r.json()).then(setTags);
  }, []);

  const toggleTag = (key: string) => {
    setSelectedTagKeys(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    const body = {
      title: form.title,
      description: form.description || null,
      lat: form.lat,
      lng: form.lng,
      dateVisited: form.dateVisited,
      tagKeys: selectedTagKeys,
    };

    const url = poi ? `/api/pois/${poi.id}` : '/api/pois';
    const method = poi ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? 'Error al guardar');
      setSaving(false);
      return;
    }

    const saved: POI = await res.json();
    setSavedPoiId(saved.id);
    onSaved({ ...saved, photos });
    setSaving(false);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="font-bold text-lg">{poi ? 'Editar viaje' : 'Nuevo viaje'}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Title */}
        <div className="mb-3">
          <input
            required
            placeholder="Título del viaje *"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        {/* Description */}
        <div className="mb-3">
          <textarea
            placeholder="Descripción (opcional)"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className="w-full border rounded-lg px-3 py-2 text-sm h-20 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        {/* Date */}
        <div className="mb-3">
          <label className="text-xs text-gray-500 mb-1 block">Fecha de visita *</label>
          <input
            type="date"
            required
            value={form.dateVisited}
            onChange={e => setForm(f => ({ ...f, dateVisited: e.target.value }))}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        {/* Coordinates */}
        <div className="flex gap-2 mb-3">
          <div className="flex-1">
            <label className="text-xs text-gray-500 mb-1 block">Latitud</label>
            <input
              type="number"
              step="any"
              placeholder="0.000000"
              value={form.lat}
              onChange={e => setForm(f => ({ ...f, lat: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-500 mb-1 block">Longitud</label>
            <input
              type="number"
              step="any"
              placeholder="0.000000"
              value={form.lng}
              onChange={e => setForm(f => ({ ...f, lng: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
        </div>

        {/* Tags */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Categorías
          </p>
          <div className="flex flex-wrap gap-1.5">
            {tags.map(tag => (
              <button
                type="button"
                key={tag.key}
                onClick={() => toggleTag(tag.key)}
                className={`px-2 py-0.5 rounded-full text-xs border transition-colors ${
                  selectedTagKeys.includes(tag.key)
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-blue-300'
                }`}
              >
                {tag.emoji} {tag.label}
              </button>
            ))}
          </div>
        </div>

        {/* Photos — only available after POI is saved (has an ID) */}
        {savedPoiId && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Fotos
            </p>
            <PhotoUploader
              poiId={savedPoiId}
              existingPhotos={photos}
              onUploaded={photo => setPhotos(prev => [...prev, photo])}
              onDeleted={id => setPhotos(prev => prev.filter(p => p.id !== id))}
              onSetMain={id =>
                setPhotos(prev => prev.map(p => ({ ...p, isMain: p.id === id })))
              }
            />
          </div>
        )}

        {!savedPoiId && (
          <p className="text-xs text-gray-400 mb-4">
            💡 Guarda el viaje primero para poder añadir fotos.
          </p>
        )}

        {error && (
          <p className="text-sm text-red-500 mb-3">{error}</p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
        >
          {saving ? 'Guardando...' : poi ? 'Guardar cambios' : 'Crear viaje'}
        </button>
      </form>
    </div>
  );
}
