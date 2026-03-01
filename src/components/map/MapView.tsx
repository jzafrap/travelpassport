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

// Google Maps dark theme styles
const darkMapStyles: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#263c3f' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#6b9a76' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#746855' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1f2835' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#f3d19c' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#2f3948' }] },
  { featureType: 'transit.station', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#515c6d' }] },
  { featureType: 'water', elementType: 'labels.text.stroke', stylers: [{ color: '#17263c' }] },
];

export function MapView({
  onBoundsChange,
  onMapClick,
  children,
  center,
  zoom = 3,
}: MapViewProps) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const lastBoundsRef = useRef<google.maps.LatLngBoundsLiteral | null>(null);
  // Capture initial values in refs so the object reference never changes between
  // renders — prevents @react-google-maps/api from calling panTo on every re-render.
  const initialCenter = useRef(center ?? defaultCenter);
  const initialZoom = useRef(zoom);

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
    const b = map.getBounds();
    if (!b) return;
    const next = {
      north: b.getNorthEast().lat(),
      east: b.getNorthEast().lng(),
      south: b.getSouthWest().lat(),
      west: b.getSouthWest().lng(),
    };
    const prev = lastBoundsRef.current;
    if (
      prev &&
      Math.abs(prev.north - next.north) < 0.0001 &&
      Math.abs(prev.south - next.south) < 0.0001 &&
      Math.abs(prev.east - next.east) < 0.0001 &&
      Math.abs(prev.west - next.west) < 0.0001
    ) return;
    lastBoundsRef.current = next;
    onBoundsChange(next);
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
      center={initialCenter.current}
      zoom={initialZoom.current}
      onLoad={onLoad}
      onIdle={handleIdle}
      onClick={handleClick}
      options={{ streetViewControl: false, mapTypeControl: false, styles: darkMapStyles }}
    >
      {children}
    </GoogleMap>
  );
}
