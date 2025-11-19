import { useEffect, useRef, useState } from 'react';
import { Participant, Venue } from '@/types/session';
import { Loader } from '@googlemaps/js-api-loader';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Users, Star, DollarSign, X, Maximize2, Minimize2 } from 'lucide-react';

interface MapViewProps {
  participants: Participant[];
  midpoint: { lat: number; lng: number } | null;
  venues?: Venue[];
  selectedVenue?: Venue | null;
  onVenueSelect?: (venue: Venue | null) => void;
  className?: string;
}

export default function MapView({ 
  participants, 
  midpoint, 
  venues = [],
  selectedVenue,
  onVenueSelect,
  className = ''
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoveredVenue, setHoveredVenue] = useState<Venue | null>(null);

  const getAvatarColor = (id: string) => {
    const colors = [
      '#f43f5e', // rose
      '#f97316', // orange
      '#f59e0b', // amber
      '#84cc16', // lime
      '#14b8a6', // teal
      '#06b6d4', // cyan
      '#3b82f6', // blue
      '#a855f7', // purple
      '#ec4899', // pink
    ];
    const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current) return;

      const loader = new Loader({
        apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        version: 'weekly',
      });

      await loader.load();

      // Default to Hermosa Beach if no midpoint or participants yet
      const defaultLocation = { lat: 33.8622, lng: -118.3998 }; // 1 Pier Ave, Hermosa Beach, CA 90254
      const center = midpoint || 
                     (participants.length > 0 && participants[0].location 
                       ? { lat: participants[0].location.lat, lng: participants[0].location.lng }
                       : defaultLocation);

      const map = new google.maps.Map(mapRef.current, {
        center,
        zoom: 13,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }],
          },
        ],
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      mapInstanceRef.current = map;
    };

    initMap();
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    const bounds = new google.maps.LatLngBounds();
    let hasLocations = false;

    // Add participant markers
    participants.forEach((participant) => {
      if (!participant.location) return;

      hasLocations = true;
      const position = { lat: participant.location.lat, lng: participant.location.lng };
      bounds.extend(position);

      // Create custom marker with avatar
      const color = getAvatarColor(participant.id);
      const initials = getInitials(participant.name);
      
      const markerIcon = {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 20,
        fillColor: color,
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3,
      };

      const marker = new google.maps.Marker({
        position,
        map: mapInstanceRef.current,
        icon: markerIcon,
        title: participant.name,
        zIndex: 100,
      });

      // Add label overlay
      const labelOverlay = new google.maps.OverlayView();
      labelOverlay.onAdd = function() {
        const div = document.createElement('div');
        div.style.position = 'absolute';
        div.style.color = '#ffffff';
        div.style.fontSize = '12px';
        div.style.fontWeight = 'bold';
        div.style.textAlign = 'center';
        div.style.width = '40px';
        div.style.marginLeft = '-20px';
        div.style.marginTop = '-8px';
        div.style.pointerEvents = 'none';
        div.textContent = initials;
        
        const panes = this.getPanes();
        panes?.overlayLayer.appendChild(div);
        
        this.div = div;
      };
      
      labelOverlay.draw = function() {
        const projection = this.getProjection();
        const pos = projection.fromLatLngToDivPixel(position);
        if (this.div && pos) {
          this.div.style.left = pos.x + 'px';
          this.div.style.top = pos.y + 'px';
        }
      };
      
      labelOverlay.onRemove = function() {
        if (this.div) {
          this.div.parentNode?.removeChild(this.div);
          this.div = null;
        }
      };
      
      labelOverlay.setMap(mapInstanceRef.current);

      // Info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <div style="font-weight: 600; margin-bottom: 4px;">${participant.name}</div>
            <div style="font-size: 12px; color: #666;">
              ${participant.location.type === 'live' ? '📍 Live Location' : '📌 Manual Location'}
            </div>
          </div>
        `,
      });

      marker.addListener('click', () => {
        infoWindow.open(mapInstanceRef.current, marker);
      });

      markersRef.current.push(marker);
    });

    // Add midpoint marker
    if (midpoint) {
      hasLocations = true;
      bounds.extend(midpoint);

      const midpointMarker = new google.maps.Marker({
        position: midpoint,
        map: mapInstanceRef.current,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 15,
          fillColor: '#84cc16',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 4,
        },
        title: 'Midpoint',
        zIndex: 200,
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <div style="font-weight: 600; color: #84cc16;">🎯 Midpoint</div>
            <div style="font-size: 12px; color: #666; margin-top: 4px;">
              The perfect middle ground
            </div>
          </div>
        `,
      });

      midpointMarker.addListener('click', () => {
        infoWindow.open(mapInstanceRef.current, midpointMarker);
      });

      markersRef.current.push(midpointMarker);
    }

    // Add venue markers
    venues.forEach((venue) => {
      hasLocations = true;
      const position = { lat: venue.location.lat, lng: venue.location.lng };
      bounds.extend(position);

      const isSelected = selectedVenue?.id === venue.id;
      
      const venueMarker = new google.maps.Marker({
        position,
        map: mapInstanceRef.current,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: isSelected ? 12 : 8,
          fillColor: isSelected ? '#14b8a6' : '#f59e0b',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: isSelected ? 3 : 2,
        },
        title: venue.name,
        zIndex: isSelected ? 150 : 50,
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; max-width: 200px;">
            <div style="font-weight: 600; margin-bottom: 4px;">${venue.name}</div>
            <div style="font-size: 12px; color: #666; margin-bottom: 4px;">
              ${venue.category}
            </div>
            <div style="display: flex; align-items: center; gap: 8px; font-size: 12px;">
              <span>⭐ ${venue.rating}</span>
              <span>${'$'.repeat(venue.priceLevel || 2)}</span>
            </div>
            ${venue.distance ? `<div style="font-size: 11px; color: #999; margin-top: 4px;">${venue.distance}</div>` : ''}
          </div>
        `,
      });

      venueMarker.addListener('click', () => {
        infoWindow.open(mapInstanceRef.current, venueMarker);
        onVenueSelect?.(venue);
      });

      venueMarker.addListener('mouseover', () => {
        setHoveredVenue(venue);
      });

      venueMarker.addListener('mouseout', () => {
        setHoveredVenue(null);
      });

      markersRef.current.push(venueMarker);
    });

    // Fit bounds if we have locations
    if (hasLocations) {
      mapInstanceRef.current.fitBounds(bounds, {
        top: 50,
        right: 50,
        bottom: 50,
        left: 50,
      });
    } else {
      // If no locations yet, center on default Hermosa Beach location
      const defaultLocation = { lat: 33.8622, lng: -118.3998 };
      mapInstanceRef.current.setCenter(defaultLocation);
      mapInstanceRef.current.setZoom(13);
    }
  }, [participants, midpoint, venues, selectedVenue]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const centerOnMidpoint = () => {
    if (midpoint && mapInstanceRef.current) {
      mapInstanceRef.current.panTo(midpoint);
      mapInstanceRef.current.setZoom(14);
    }
  };

  return (
    <div className={`relative h-full ${className} ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <div ref={mapRef} className="w-full h-full rounded-lg" />

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <Button
          onClick={toggleFullscreen}
          size="sm"
          variant="secondary"
          className="bg-white shadow-lg hover:bg-gray-50"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </Button>
        {midpoint && (
          <Button
            onClick={centerOnMidpoint}
            size="sm"
            variant="secondary"
            className="bg-white shadow-lg hover:bg-gray-50"
          >
            <Navigation className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Legend */}
      <Card className="absolute bottom-4 left-4 p-3 bg-white/95 backdrop-blur-sm shadow-lg border-gray-200">
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-lime-500 border-2 border-white"></div>
            <span className="font-medium">Midpoint</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-rose-500 border-2 border-white"></div>
            <span>Participants</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500 border border-white"></div>
            <span>Venues</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-teal-500 border border-white"></div>
            <span>Selected</span>
          </div>
        </div>
      </Card>

      {/* Hovered Venue Card */}
      {hoveredVenue && (
        <Card className="absolute top-4 left-4 p-4 bg-white/95 backdrop-blur-sm shadow-xl border-gray-200 max-w-xs">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-sm">{hoveredVenue.name}</h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setHoveredVenue(null)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-600 mb-2">{hoveredVenue.category}</p>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{hoveredVenue.rating}</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-gray-500" />
              <span>{'$'.repeat(hoveredVenue.priceLevel || 2)}</span>
            </div>
            {hoveredVenue.distance && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-gray-500" />
                <span>{hoveredVenue.distance}</span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Mobile Participant List */}
      <div className="md:hidden absolute bottom-20 left-4 right-4">
        <Card className="p-3 bg-white/95 backdrop-blur-sm shadow-lg border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-gray-600" />
            <span className="text-xs font-semibold">Participants</span>
            <Badge variant="secondary" className="text-xs">{participants.length}</Badge>
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="flex-shrink-0 flex flex-col items-center gap-1"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold border-2 border-white shadow"
                  style={{ backgroundColor: getAvatarColor(participant.id) }}
                >
                  {getInitials(participant.name)}
                </div>
                <span className="text-xs text-gray-600 max-w-[60px] truncate">
                  {participant.name.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}