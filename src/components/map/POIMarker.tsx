'use client';
import { OverlayView } from '@react-google-maps/api';
import type { POI } from '@/types';
import Image from 'next/image';

interface POIMarkerProps {
  poi: POI;
  onClick: (poi: POI) => void;
}

export function POIMarker({ poi, onClick }: POIMarkerProps) {
  return (
    <OverlayView
      position={{ lat: poi.lat, lng: poi.lng }}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
    >
      <div
        className="relative cursor-pointer group"
        onClick={() => onClick(poi)}
      >
        {/* Thumbnail circle */}
        <div className="w-12 h-12 rounded-full border-2 border-white shadow-lg overflow-hidden bg-gray-200 hover:scale-110 transition-transform">
          {poi.mainPhoto ? (
            <Image
              src={poi.mainPhoto.thumbnailUrl}
              alt={poi.title}
              width={48}
              height={48}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xl">
              📍
            </div>
          )}
        </div>

        {/* Hover tooltip */}
        <div className="absolute bottom-14 left-1/2 -translate-x-1/2 bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
          {poi.title}
        </div>
      </div>
    </OverlayView>
  );
}
