'use client';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { useCallback, useRef } from 'react';

interface MapViewProps {
  onBoundsChange?: (bounds: google.maps.LatLngBoundsLiteral) => void;
  onMapClick?: (lat: number, lng: number) => void;
  children?: React.ReactNode;
  center?: { lat: number; lng: number };
  zoom?: number;
}

const containerStyle = { width: '100%', height: '100%' };
const defaultCenter = { lat: 20, lng: 0 };
const libraries: ('places')[] = ['places'];

export function MapView({
  onBoundsChange,
  onMapClick,
  children,
  center,
  zoom = 3,
}: MapViewProps) {
  const mapRef = useRef<google.maps.Map | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries,
  });

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const handleIdle = useCallback(() => {
    const map = mapRef.current;
    if (!map || !onBoundsChange) return;
    const bounds = map.getBounds();
    if (bounds) {
      onBoundsChange({
        north: bounds.getNorthEast().lat(),
        east: bounds.getNorthEast().lng(),
        south: bounds.getSouthWest().lat(),
        west: bounds.getSouthWest().lng(),
      });
    }
  }, [onBoundsChange]);

  const handleClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (e.latLng && onMapClick) {
        onMapClick(e.latLng.lat(), e.latLng.lng());
      }
    },
    [onMapClick]
  );

  if (!isLoaded) {
    return <div className="w-full h-full bg-gray-100 animate-pulse" />;
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center ?? defaultCenter}
      zoom={zoom}
      onLoad={onLoad}
      onIdle={handleIdle}
      onClick={handleClick}
      options={{ streetViewControl: false, mapTypeControl: false }}
    >
      {children}
    </GoogleMap>
  );
}
