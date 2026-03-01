'use client';
import { useState, useEffect, useRef } from 'react';
import { MapView } from '@/components/map/MapView';
import { POIMarker } from '@/components/map/POIMarker';
import { StatsHeader } from '@/components/passport/StatsHeader';
import { POIDetailModal } from '@/components/poi/POIDetailModal';
import { POIForm } from '@/components/poi/POIForm';
import { useSession } from 'next-auth/react';
import type { POI } from '@/types';
import Link from 'next/link';

export default function PassportPage() {
  const { data: session } = useSession();
  const [pois, setPois] = useState<POI[]>([]);
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [selectedPoi, setSelectedPoi] = useState<POI | null>(null);
  const [editingPoi, setEditingPoi] = useState<POI | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [clickedLatLng, setClickedLatLng] = useState<{ lat: number; lng: number } | null>(null);
  // Prevents map click from firing when a POI marker was just clicked
  const markerClickedRef = useRef(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/users/me').then(r => r.json()),
      fetch('/api/users/me/stats').then(r => r.json()),
      fetch('/api/users/me/pois').then(r => r.json()),
    ]).then(([u, s, p]) => {
      setUser(u);
      setStats(s);
      setPois(p);
    });
  }, []);

  const handleMapClick = (lat: number, lng: number) => {
    if (markerClickedRef.current) return;
    setClickedLatLng({ lat, lng });
    setShowNewForm(true);
  };

  const handleMarkerClick = (poi: POI) => {
    markerClickedRef.current = true;
    setSelectedPoi(poi);
    setTimeout(() => { markerClickedRef.current = false; }, 0);
  };

  const handlePoiSaved = (saved: POI) => {
    setPois(prev => {
      const exists = prev.find(p => p.id === saved.id);
      if (exists) return prev.map(p => (p.id === saved.id ? saved : p));
      return [saved, ...prev];
    });
    // Refresh stats
    fetch('/api/users/me/stats').then(r => r.json()).then(setStats);
    setShowNewForm(false);
    setEditingPoi(null);
  };

  const handlePoiDeleted = (poiId: string) => {
    setPois(prev => prev.filter(p => p.id !== poiId));
    fetch('/api/users/me/stats').then(r => r.json()).then(setStats);
  };

  if (!session || !user || !stats) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-500">
        Cargando...
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 bg-white border-b shadow-sm z-10">
        <Link href="/" className="text-sm text-gray-500 hover:text-blue-600 transition">
          ← Social
        </Link>
        <h1 className="text-lg font-bold text-blue-600">✈️ My Passport</h1>
        <Link
          href="/globalpassport"
          className="text-sm px-3 py-1.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition"
        >
          🎫 GlobalPassport
        </Link>
      </header>

      {/* Stats bar */}
      <StatsHeader user={user} stats={stats} />

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-56 bg-white border-r flex flex-col flex-shrink-0 overflow-hidden">
          <div className="p-3 border-b">
            <button
              onClick={() => {
                setClickedLatLng(null);
                setShowNewForm(true);
              }}
              className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
            >
              ➕ Nuevo viaje
            </button>
            <p className="text-xs text-gray-400 mt-2 text-center">
              O haz clic en el mapa
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1 mb-1">
              Mis destinos ({pois.length})
            </p>
            {pois.length === 0 && (
              <p className="text-xs text-gray-400 px-1 py-2">
                Aún no tienes viajes registrados.
              </p>
            )}
            {pois.map(poi => (
              <button
                key={poi.id}
                onClick={() => setSelectedPoi(poi)}
                className="w-full text-left text-sm py-1.5 px-2 rounded hover:bg-gray-50 truncate flex items-center gap-1"
              >
                <span className="text-gray-400">📍</span>
                <span className="truncate">{poi.title}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Map */}
        <div className="flex-1 relative">
          <MapView onMapClick={handleMapClick}>
            {pois.map(poi => (
              <POIMarker key={poi.id} poi={poi} onClick={handleMarkerClick} />
            ))}
          </MapView>
        </div>
      </div>

      {/* POI detail modal */}
      {selectedPoi && !editingPoi && (
        <POIDetailModal
          poi={selectedPoi}
          onClose={() => setSelectedPoi(null)}
          showEditDelete
          onEdit={poi => {
            setEditingPoi(poi);
            setSelectedPoi(null);
          }}
          onDelete={handlePoiDeleted}
        />
      )}

      {/* Create / edit form */}
      {(showNewForm || editingPoi) && (
        <POIForm
          initialLat={clickedLatLng?.lat}
          initialLng={clickedLatLng?.lng}
          poi={editingPoi ?? undefined}
          onSaved={handlePoiSaved}
          onClose={() => {
            setShowNewForm(false);
            setEditingPoi(null);
            setClickedLatLng(null);
          }}
        />
      )}
    </div>
  );
}
