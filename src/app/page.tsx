'use client';
import { useState, useCallback, useEffect } from 'react';
import { MapView } from '@/components/map/MapView';
import { POIMarker } from '@/components/map/POIMarker';
import { MapControls } from '@/components/map/MapControls';
import { Sidebar } from '@/components/social/Sidebar';
import { POIDetailModal } from '@/components/poi/POIDetailModal';
import { useSession, signIn } from 'next-auth/react';
import type { POI, Tag } from '@/types';
import Link from 'next/link';

export default function SocialPage() {
  const { data: session } = useSession();
  const [pois, setPois] = useState<POI[]>([]);
  const [trending, setTrending] = useState<POI[]>([]);
  const [recent, setRecent] = useState<POI[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedPoi, setSelectedPoi] = useState<POI | null>(null);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    tagKeys: [] as string[],
  });
  const [bounds, setBounds] = useState<google.maps.LatLngBoundsLiteral | null>(null);

  // Load sidebar data and tags once
  useEffect(() => {
    fetch('/api/pois/trending').then(r => r.json()).then(setTrending);
    fetch('/api/pois/recent').then(r => r.json()).then(setRecent);
    fetch('/api/tags').then(r => r.json()).then(setTags);
  }, []);

  // Load map POIs when bounds or filters change
  const loadPois = useCallback(async () => {
    if (!bounds) return;
    const params = new URLSearchParams();
    params.set('minLat', String(bounds.south));
    params.set('maxLat', String(bounds.north));
    params.set('minLng', String(bounds.west));
    params.set('maxLng', String(bounds.east));
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.set('dateTo', filters.dateTo);
    filters.tagKeys.forEach(k => params.append('tag', k));

    const res = await fetch(`/api/pois?${params}`);
    setPois(await res.json());
  }, [bounds, filters]);

  useEffect(() => {
    loadPois();
  }, [loadPois]);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 bg-white border-b shadow-sm z-10">
        <h1 className="text-lg font-bold text-blue-600">✈️ TravelPassport</h1>
        <div className="flex items-center gap-2">
          {session ? (
            <Link
              href="/passport"
              className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
            >
              My Passport
            </Link>
          ) : (
            <button
              onClick={() => signIn('google')}
              className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
            >
              Login con Google
            </button>
          )}
        </div>
      </header>

      {/* Filter controls */}
      <MapControls
        tags={tags}
        onDateChange={(from, to) =>
          setFilters(f => ({ ...f, dateFrom: from, dateTo: to }))
        }
        onTagsChange={keys => setFilters(f => ({ ...f, tagKeys: keys }))}
      />

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar trending={trending} recent={recent} onSelectPoi={setSelectedPoi} />

        <div className="flex-1 relative">
          <MapView onBoundsChange={setBounds}>
            {pois.map(poi => (
              <POIMarker key={poi.id} poi={poi} onClick={setSelectedPoi} />
            ))}
          </MapView>
        </div>
      </div>

      {/* POI detail modal */}
      {selectedPoi && (
        <POIDetailModal
          poi={selectedPoi}
          onClose={() => setSelectedPoi(null)}
        />
      )}
    </div>
  );
}
