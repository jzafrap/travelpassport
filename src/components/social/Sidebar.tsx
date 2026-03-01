'use client';
import type { POI } from '@/types';

interface SidebarProps {
  trending: POI[];
  recent: POI[];
  onSelectPoi: (poi: POI) => void;
}

function POIMiniCard({ poi, onClick }: { poi: POI; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="flex gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
    >
      <div className="w-10 h-10 rounded bg-gray-200 flex-shrink-0 overflow-hidden">
        {poi.mainPhoto && (
          <img
            src={poi.mainPhoto.thumbnailUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{poi.title}</p>
        <p className="text-xs text-gray-500">
          ♥ {poi.likesCount} · {poi.author?.alias ?? poi.author?.name}
        </p>
      </div>
    </div>
  );
}

export function Sidebar({ trending, recent, onSelectPoi }: SidebarProps) {
  return (
    <aside className="w-72 bg-white border-r overflow-y-auto flex-shrink-0">
      <div className="p-3 border-b">
        <h2 className="font-semibold text-sm text-gray-700 mb-1">🔥 Más populares</h2>
        {trending.length === 0 && (
          <p className="text-xs text-gray-400 px-2 py-1">Aún no hay viajes</p>
        )}
        {trending.map(poi => (
          <POIMiniCard key={poi.id} poi={poi} onClick={() => onSelectPoi(poi)} />
        ))}
      </div>
      <div className="p-3">
        <h2 className="font-semibold text-sm text-gray-700 mb-1">🕐 Últimas 24h</h2>
        {recent.length === 0 && (
          <p className="text-xs text-gray-400 px-2 py-1">Nada nuevo hoy</p>
        )}
        {recent.map(poi => (
          <POIMiniCard key={poi.id} poi={poi} onClick={() => onSelectPoi(poi)} />
        ))}
      </div>
    </aside>
  );
}
