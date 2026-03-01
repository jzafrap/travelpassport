'use client';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useRef } from 'react';
import html2canvas from 'html2canvas';

const GEO_URL =
  'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

interface DiplomaProps {
  user: {
    name: string;
    alias: string | null;
    avatarUrl: string | null;
  };
  pois: {
    id: string;
    lat: number;
    lng: number;
    title: string;
  }[];
  stats: {
    totalPois: number;
    totalLikesReceived: number;
    avgRating: number;
    firstTrip: string | null;
    lastTrip: string | null;
    memberSince: string;
  };
}

export function GlobalPassportDiploma({ user, pois, stats }: DiplomaProps) {
  const diplomaRef = useRef<HTMLDivElement>(null);

  const downloadPng = async () => {
    if (!diplomaRef.current) return;
    const canvas = await html2canvas(diplomaRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: null,
    } as any);
    const link = document.createElement('a');
    link.download = `travelpassport-${user.alias ?? user.name}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('¡Enlace copiado!');
    } catch {
      prompt('Copia este enlace:', window.location.href);
    }
  };

  // Rough unique country estimate via degree-rounded coordinates
  const approxCountries = new Set(
    pois.map(p => `${Math.round(p.lat / 5) * 5},${Math.round(p.lng / 5) * 5}`)
  ).size;

  return (
    <div className="flex flex-col items-center gap-5 p-6">
      {/* Diploma card */}
      <div
        ref={diplomaRef}
        className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white rounded-2xl p-8 w-full max-w-2xl shadow-2xl border border-indigo-500/30"
      >
        {/* Header */}
        <div className="text-center mb-5">
          <div className="text-4xl mb-1">✈️</div>
          <h1 className="text-2xl font-bold tracking-[0.2em] uppercase text-white">
            TravelPassport
          </h1>
          <p className="text-indigo-300 text-xs tracking-widest uppercase mt-0.5">
            Global Explorer Certificate
          </p>
          <div className="h-px bg-gradient-to-r from-transparent via-indigo-400 to-transparent mt-3" />
        </div>

        {/* World map */}
        <div className="rounded-xl overflow-hidden bg-slate-800/60 border border-slate-700/50 mb-5">
          <ComposableMap
            projectionConfig={{ scale: 147 }}
            height={200}
            style={{ width: '100%', height: 'auto' }}
          >
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map(geo => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#334155"
                    stroke="#1e293b"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: 'none' },
                      hover: { outline: 'none' },
                      pressed: { outline: 'none' },
                    }}
                  />
                ))
              }
            </Geographies>
            {pois.map(poi => (
              <Marker key={poi.id} coordinates={[poi.lng, poi.lat]}>
                <circle r={3} fill="#f59e0b" stroke="#fff" strokeWidth={1} />
              </Marker>
            ))}
          </ComposableMap>
        </div>

        {/* User info */}
        <div className="flex justify-between items-end mb-4">
          <div>
            <p className="text-xl font-bold">{user.alias ?? user.name}</p>
            <p className="text-indigo-300 text-sm">
              Viajero desde{' '}
              {format(new Date(stats.memberSince), 'MMMM yyyy', { locale: es })}
            </p>
          </div>
          {stats.firstTrip && stats.lastTrip && (
            <div className="text-right text-sm text-indigo-200">
              <p>
                {format(new Date(stats.firstTrip), 'yyyy')} –{' '}
                {format(new Date(stats.lastTrip), 'yyyy')}
              </p>
            </div>
          )}
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-4 gap-3 pt-4 border-t border-indigo-500/30">
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-400">{stats.totalPois}</div>
            <div className="text-xs text-indigo-300 mt-0.5">destinos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-400">{approxCountries}</div>
            <div className="text-xs text-indigo-300 mt-0.5">países aprox.</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-400">
              {stats.totalLikesReceived}
            </div>
            <div className="text-xs text-indigo-300 mt-0.5">likes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-400">
              ⭐ {stats.avgRating || '—'}
            </div>
            <div className="text-xs text-indigo-300 mt-0.5">rating</div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 flex-wrap justify-center">
        <button
          onClick={downloadPng}
          className="px-5 py-2.5 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition shadow"
        >
          ⬇ Descargar PNG
        </button>
        <button
          onClick={handleShare}
          className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition"
        >
          🔗 Copiar enlace
        </button>
      </div>
    </div>
  );
}
