import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Navigation, Search } from 'lucide-react';
import { geocodeAddress } from '@/lib/maps';
import { Location } from '@/types/session';

interface LocationSetupProps {
  onLocationSet: (location: Location) => void;
}

export default function LocationSetup({ onLocationSet }: LocationSetupProps) {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLiveLocation = () => {
    setLoading(true);
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onLocationSet({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          type: 'live',
        });
        setLoading(false);
      },
      (error) => {
        setError('Unable to get your location. Please try manual entry.');
        setLoading(false);
      }
    );
  };

  const handleManualLocation = async () => {
    if (!address.trim()) return;

    setLoading(true);
    setError('');

    try {
      const result = await geocodeAddress(address);
      if (result) {
        onLocationSet({
          lat: result.lat,
          lng: result.lng,
          type: 'manual',
        });
      } else {
        setError('Address not found. Please try again.');
      }
    } catch (err) {
      setError('Error finding address. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-none shadow-xl bg-white">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Set Your Location</CardTitle>
          <CardDescription>
            Share your location so we can find the perfect midpoint
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Live Location */}
          <Button
            onClick={handleLiveLocation}
            disabled={loading}
            className="w-full h-14 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-semibold"
          >
            <Navigation className="w-5 h-5 mr-2" />
            Use My Current Location
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">or enter manually</span>
            </div>
          </div>

          {/* Manual Location */}
          <div className="space-y-3">
            <Input
              placeholder="Enter address or city"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleManualLocation()}
              disabled={loading}
              className="h-12"
            />
            <Button
              onClick={handleManualLocation}
              disabled={loading || !address.trim()}
              variant="outline"
              className="w-full h-12 border-2 font-semibold"
            >
              <Search className="w-5 h-5 mr-2" />
              Search Address
            </Button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
