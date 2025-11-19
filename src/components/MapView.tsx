import { useEffect, useRef } from 'react';
import { initGoogleMaps } from '@/lib/maps';
import { Participant, Location } from '@/types/session';

interface MapViewProps {
  participants: Participant[];
  midpoint: Location | null;
  onMapReady?: (map: google.maps.Map) => void;
}

export default function MapView({ participants, midpoint, onMapReady }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    let mounted = true;

    const initMap = async () => {
      if (!mapRef.current) return;

      const google = await initGoogleMaps();
      
      if (!mounted) return;

      const map = new google.maps.Map(mapRef.current, {
        center: { lat: 40.7128, lng: -74.006 },
        zoom: 12,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }],
          },
        ],
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      });

      mapInstanceRef.current = map;
      if (onMapReady) onMapReady(map);
    };

    initMap();

    return () => {
      mounted = false;
    };
  }, [onMapReady]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const updateMarkers = async () => {
      const google = await initGoogleMaps();

      // Clear existing markers
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];

      const bounds = new google.maps.LatLngBounds();
      let hasLocations = false;

      // Add participant markers
      participants.forEach((participant) => {
        if (participant.location) {
          hasLocations = true;
          const marker = new google.maps.Marker({
            position: { lat: participant.location.lat, lng: participant.location.lng },
            map: mapInstanceRef.current,
            title: participant.name,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: participant.location.type === 'live' ? '#10b981' : '#3b82f6',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            },
            label: {
              text: participant.name.charAt(0).toUpperCase(),
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 'bold',
            },
          });

          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div style="padding: 8px;">
                <strong>${participant.name}</strong><br/>
                <span style="color: ${participant.location.type === 'live' ? '#10b981' : '#3b82f6'}">
                  ${participant.location.type === 'live' ? '📍 Live Location' : '📌 Manual Location'}
                </span>
              </div>
            `,
          });

          marker.addListener('click', () => {
            infoWindow.open(mapInstanceRef.current, marker);
          });

          markersRef.current.push(marker);
          bounds.extend(marker.getPosition()!);
        }
      });

      // Add midpoint marker
      if (midpoint) {
        hasLocations = true;
        const midpointMarker = new google.maps.Marker({
          position: { lat: midpoint.lat, lng: midpoint.lng },
          map: mapInstanceRef.current,
          title: 'Midpoint',
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 15,
            fillColor: '#f97316',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 3,
          },
          label: {
            text: '★',
            color: '#ffffff',
            fontSize: '16px',
            fontWeight: 'bold',
          },
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 8px;">
              <strong>Midpoint</strong><br/>
              <span style="color: #f97316">Meeting point center</span>
            </div>
          `,
        });

        midpointMarker.addListener('click', () => {
          infoWindow.open(mapInstanceRef.current, midpointMarker);
        });

        markersRef.current.push(midpointMarker);
        bounds.extend(midpointMarker.getPosition()!);
      }

      // Fit bounds if we have locations
      if (hasLocations && mapInstanceRef.current) {
        mapInstanceRef.current.fitBounds(bounds);
        const zoom = mapInstanceRef.current.getZoom();
        if (zoom && zoom > 15) {
          mapInstanceRef.current.setZoom(15);
        }
      }
    };

    updateMarkers();
  }, [participants, midpoint]);

  return (
    <div ref={mapRef} className="w-full h-full rounded-lg" />
  );
}
