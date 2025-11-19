import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Search, RefreshCw, Map } from 'lucide-react';
import { geocodeAddress } from '@/lib/maps';
import { Location } from '@/types/session';
import MapPicker from './MapPicker';

interface LocationSetupProps {
  onLocationSet: (location: Location) => void;
  currentLocation?: Location | null;
}

export default function LocationSetup({ onLocationSet, currentLocation }: LocationSetupProps) {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'choose' | 'live' | 'manual' | 'map'>('choose');
  const [showMapPicker, setShowMapPicker] = useState(false);

  // Live location refresh every 5 minutes
  useEffect(() => {
    if (currentLocation?.type === 'live') {
      const interval = setInterval(() => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            onLocationSet({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              type: 'live',
            });
          },
          (error) => {
            console.error('Failed to refresh location:', error);
          }
        );
      }, 5 * 60 * 1000); // 5 minutes

      return () => clearInterval(interval);
    }
  }, [currentLocation?.type, onLocationSet]);

  const handleLiveLocation = () => {
    setLoading(true);
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      setMode('manual');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onLocationSet({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          type: 'live',
        });
        setMode('live');
        setLoading(false);
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setError('Location permission denied. Please use manual entry instead.');
          setMode('manual');
        } else {
          setError('Unable to get your location. Please try manual entry.');
        }
        setLoading(false);
      },
      { enableHighAccuracy: true }
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
          address: address,
        });
        setMode('manual');
      } else {
        setError('Address not found. Please try again.');
      }
    } catch (err) {
      setError('Error finding address. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMapPicker = () => {
    setShowMapPicker(true);
    setMode('map');
  };

  const handleMapLocationSelect = (lat: number, lng: number, addr?: string) => {
    onLocationSet({
      lat,
      lng,
      type: 'manual',
      address: addr,
    });
    setShowMapPicker(false);
    setMode('manual');
  };

  const handleSwitchMode = () => {
    setMode('choose');
    setError('');
    setAddress('');
    setShowMapPicker(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 via-amber-50 to-teal-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-none shadow-xl bg-white">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-lime-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Set Your Location</CardTitle>
          <CardDescription>
            Share your location so we can find the perfect midpoint
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Current Location Display */}
          {currentLocation && (
            <div className="p-4 bg-gradient-to-r from-lime-50 to-teal-50 border border-lime-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">Current Location</span>
                <Badge 
                  variant={currentLocation.type === 'live' ? 'default' : 'secondary'}
                  className={currentLocation.type === 'live' 
                    ? 'bg-lime-500 hover:bg-lime-600' 
                    : 'bg-amber-500 hover:bg-amber-600'}
                >
                  {currentLocation.type === 'live' ? '📍 Live' : '📌 Manual'}
                </Badge>
              </div>
              <p className="text-xs text-gray-600">
                {currentLocation.type === 'live' 
                  ? `${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}`
                  : currentLocation.address || `${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}`
                }
              </p>
              <Button
                onClick={handleSwitchMode}
                variant="ghost"
                size="sm"
                className="mt-2 h-8 text-xs text-lime-700 hover:text-lime-800 hover:bg-lime-100"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Change Location
              </Button>
            </div>
          )}

          {/* Mode Selection */}
          {mode === 'choose' && !currentLocation && (
            <>
              {/* Live Location */}
              <Button
                onClick={handleLiveLocation}
                disabled={loading}
                className="w-full h-14 bg-gradient-to-r from-lime-500 to-teal-500 hover:from-lime-600 hover:to-teal-600 text-white font-semibold"
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

              {/* Manual Location Options */}
              <div className="space-y-3">
                <Input
                  placeholder="Enter address or city"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleManualLocation()}
                  disabled={loading}
                  className="h-12 border-lime-200 focus:border-lime-400 focus:ring-lime-400"
                />
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={handleManualLocation}
                    disabled={loading || !address.trim()}
                    variant="outline"
                    className="h-12 border-2 border-lime-400 hover:bg-lime-50 hover:border-lime-500 font-semibold text-lime-700"
                  >
                    <Search className="w-5 h-5 mr-2" />
                    Search
                  </Button>
                  <Button
                    onClick={handleMapPicker}
                    disabled={loading}
                    variant="outline"
                    className="h-12 border-2 border-teal-400 hover:bg-teal-50 hover:border-teal-500 font-semibold text-teal-700"
                  >
                    <Map className="w-5 h-5 mr-2" />
                    Pin on Map
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Manual Mode Active */}
          {mode === 'manual' && !currentLocation && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="bg-amber-500 hover:bg-amber-600">
                  📌 Manual Entry
                </Badge>
              </div>
              <Input
                placeholder="Enter address or city"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleManualLocation()}
                disabled={loading}
                className="h-12 border-lime-200 focus:border-lime-400 focus:ring-lime-400"
              />
              <Button
                onClick={handleManualLocation}
                disabled={loading || !address.trim()}
                className="w-full h-12 bg-gradient-to-r from-lime-500 to-teal-500 hover:from-lime-600 hover:to-teal-600 text-white font-semibold"
              >
                <Search className="w-5 h-5 mr-2" />
                {loading ? 'Searching...' : 'Set Location'}
              </Button>
              <Button
                onClick={handleSwitchMode}
                variant="ghost"
                className="w-full text-gray-600 hover:text-gray-800"
              >
                Back to options
              </Button>
            </div>
          )}

          {/* Live Mode Active */}
          {mode === 'live' && !currentLocation && (
            <div className="text-center py-4">
              <div className="animate-pulse mb-4">
                <Navigation className="w-12 h-12 mx-auto text-lime-500" />
              </div>
              <p className="text-sm text-gray-600">Getting your location...</p>
            </div>
          )}

          {/* Map Picker Mode */}
          {mode === 'map' && showMapPicker && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="bg-teal-500 hover:bg-teal-600">
                  🗺️ Map Picker
                </Badge>
              </div>
              <MapPicker
                onLocationSelect={handleMapLocationSelect}
                onCancel={handleSwitchMode}
              />
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Info Box */}
          <div className="p-3 bg-gradient-to-r from-lime-50 to-teal-50 border border-lime-200 rounded-lg text-xs text-gray-600">
            <p className="font-semibold mb-1 text-lime-700">💡 Tip:</p>
            <p>Live location updates every 5 minutes. Manual location stays fixed until you change it.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}