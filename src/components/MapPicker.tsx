import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';
import { reverseGeocode } from '@/lib/maps';

interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number, address?: string) => void;
  onCancel: () => void;
  initialLat?: number;
  initialLng?: number;
}

export default function MapPicker({ onLocationSelect, onCancel, initialLat, initialLng }: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [selectedLat, setSelectedLat] = useState(initialLat || 33.8622);
  const [selectedLng, setSelectedLng] = useState(initialLng || -118.3998);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!mapRef.current || map) return;

    const googleMap = new google.maps.Map(mapRef.current, {
      center: { lat: selectedLat, lng: selectedLng },
      zoom: 12,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    const googleMarker = new google.maps.Marker({
      position: { lat: selectedLat, lng: selectedLng },
      map: googleMap,
      draggable: true,
    });

    googleMap.addListener('click', async (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        googleMarker.setPosition(e.latLng);
        setSelectedLat(lat);
        setSelectedLng(lng);
        
        // Reverse geocode to get address
        const addr = await reverseGeocode(lat, lng);
        setAddress(addr || '');
      }
    });

    googleMarker.addListener('dragend', async () => {
      const position = googleMarker.getPosition();
      if (position) {
        const lat = position.lat();
        const lng = position.lng();
        setSelectedLat(lat);
        setSelectedLng(lng);
        
        // Reverse geocode to get address
        const addr = await reverseGeocode(lat, lng);
        setAddress(addr || '');
      }
    });

    setMap(googleMap);
    setMarker(googleMarker);

    // Initial reverse geocode
    reverseGeocode(selectedLat, selectedLng).then(addr => {
      setAddress(addr || '');
    });
  }, []);

  const handleConfirm = () => {
    setLoading(true);
    onLocationSelect(selectedLat, selectedLng, address);
  };

  return (
    <div className="space-y-3">
      <div 
        ref={mapRef} 
        className="h-64 w-full rounded-lg border-2 border-teal-200 shadow-lg"
      />
      
      {address && (
        <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg">
          <p className="text-xs font-semibold text-teal-700 mb-1">Selected Location:</p>
          <p className="text-xs text-gray-700">{address}</p>
          <p className="text-xs text-gray-500 mt-1">
            {selectedLat.toFixed(4)}, {selectedLng.toFixed(4)}
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <Button
          onClick={handleConfirm}
          disabled={loading}
          className="flex-1 h-12 bg-gradient-to-r from-lime-500 to-teal-500 hover:from-lime-600 hover:to-teal-600 text-white font-semibold"
        >
          <MapPin className="w-5 h-5 mr-2" />
          {loading ? 'Setting...' : 'Confirm Location'}
        </Button>
        <Button
          onClick={onCancel}
          variant="outline"
          className="h-12 px-6 border-2 border-gray-300 hover:bg-gray-50"
        >
          Cancel
        </Button>
      </div>

      <p className="text-xs text-gray-500 text-center">
        Click or drag the pin to select your location
      </p>
    </div>
  );
}
