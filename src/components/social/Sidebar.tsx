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
      className="flex gap-2 p-2 hover:bg-slate-700/50 rounded-lg cursor-pointer transition-colors"
    >
      <div className="w-10 h-10 rounded-lg bg-slate-700 flex-shrink-0 overflow-hidden">
        {poi.mainPhoto && (
          <img
            src={poi.mainPhoto.thumbnailUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-100 truncate">{poi.title}</p>
        <p className="text-xs text-slate-400">
          ♥ {poi.likesCount} · {poi.author?.alias ?? poi.author?.name}
        </p>
      </div>
    </div>
  );
}

export function Sidebar({ trending, recent, onSelectPoi }: SidebarProps) {
  return (
    <aside className="w-72 bg-slate-900 border-r border-slate-700/60 overflow-y-auto flex-shrink-0">
      <div className="p-3 border-b border-slate-700/60">
        <h2 className="font-semibold text-xs text-slate-400 uppercase tracking-widest mb-2 px-1">
          🔥 Más populares
        </h2>
        {trending.length === 0 && (
          <p className="text-xs text-slate-500 px-1 py-1">Aún no hay viajes</p>
        )}
        {trending.map(poi => (
          <POIMiniCard key={poi.id} poi={poi} onClick={() => onSelectPoi(poi)} />
        ))}
      </div>
      <div className="p-3">
        <h2 className="font-semibold text-xs text-slate-400 uppercase tracking-widest mb-2 px-1">
          🕐 Últimas 24h
        </h2>
        {recent.length === 0 && (
          <p className="text-xs text-slate-500 px-1 py-1">Nada nuevo hoy</p>
        )}
        {recent.map(poi => (
          <POIMiniCard key={poi.id} poi={poi} onClick={() => onSelectPoi(poi)} />
        ))}
      </div>
    </aside>
  );
}
