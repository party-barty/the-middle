import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Search, RefreshCw, Map } from 'lucide-react';
import { initGoogleMaps } from '@/lib/maps';
import { Location } from '@/types/session';
import MapPicker from './MapPicker';

interface LocationSetupProps {
  onLocationSet: (location: Location) => void;
}

export default function LocationSetup({ onLocationSet }: LocationSetupProps) {
  const [mode, setMode] = useState<'choice' | 'live' | 'manual'>('choice');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [address, setAddress] = useState('1141 Manhattan Ave, Hermosa Beach, CA 90254');
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number; type: 'live' | 'manual' } | null>(null);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize autocomplete service
  useEffect(() => {
    initGoogleMaps().then((google) => {
      autocompleteService.current = new google.maps.places.AutocompleteService();
      const map = new google.maps.Map(document.createElement('div'));
      placesService.current = new google.maps.places.PlacesService(map);
    });
  }, []);

  // Auto-request location permission on mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      // Check if we already have permission
      if (navigator.permissions) {
        navigator.permissions.query({ name: 'geolocation' }).then((result) => {
          if (result.state === 'granted') {
            // Auto-fetch location if already granted
            handleLiveLocation();
          }
        });
      }
    }
  }, []);

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
            console.error('Failed to update location:', error);
          },
          { 
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 60000
          }
        );
      }, 5 * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [currentLocation?.type, onLocationSet]);

  // Autocomplete search
  useEffect(() => {
    if (!address.trim() || !autocompleteService.current) {
      setPredictions([]);
      setShowPredictions(false);
      return;
    }

    const timer = setTimeout(() => {
      autocompleteService.current?.getPlacePredictions(
        {
          input: address,
          types: ['geocode', 'establishment'],
        },
        (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            setPredictions(results);
            setShowPredictions(true);
          } else {
            setPredictions([]);
            setShowPredictions(false);
          }
        }
      );
    }, 300);

    return () => clearTimeout(timer);
  }, [address]);

  // Close predictions on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowPredictions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          type: 'live' as const,
        };
        setCurrentLocation(location);
        onLocationSet(location);
        setMode('live');
        setLoading(false);
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setError('Location permission denied. Please use manual entry instead.');
          setMode('manual');
        } else if (error.code === error.TIMEOUT) {
          setError('Location request timed out. Please try again or use manual entry.');
        } else {
          setError('Unable to get your location. Please try manual entry.');
        }
        setLoading(false);
      },
      { 
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 30000
      }
    );
  };

  const handlePredictionSelect = (prediction: google.maps.places.AutocompletePrediction) => {
    if (!placesService.current) return;

    setLoading(true);
    setError('');
    setAddress(prediction.description);
    setShowPredictions(false);

    placesService.current.getDetails(
      {
        placeId: prediction.place_id,
        fields: ['geometry', 'formatted_address'],
      },
      (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
          const location = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            type: 'manual' as const,
            address: place.formatted_address,
          };
          setCurrentLocation(location);
          onLocationSet(location);
          setMode('manual');
        } else {
          setError('Unable to get location details. Please try again.');
        }
        setLoading(false);
      }
    );
  };

  const handleManualLocation = () => {
    if (!address.trim()) return;
    
    // If we have predictions, use the first one
    if (predictions.length > 0) {
      handlePredictionSelect(predictions[0]);
      return;
    }
    
    // Otherwise, geocode the address directly
    if (!placesService.current) return;
    
    setLoading(true);
    setError('');
    
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const location = {
          lat: results[0].geometry.location.lat(),
          lng: results[0].geometry.location.lng(),
          type: 'manual' as const,
          address: results[0].formatted_address,
        };
        setCurrentLocation(location);
        onLocationSet(location);
        setMode('manual');
      } else {
        setError('Unable to find that address. Please try a different search.');
      }
      setLoading(false);
    });
  };

  const handleMapPicker = () => {
    setShowMapPicker(true);
    setMode('map');
  };

  const handleMapLocationSelect = (lat: number, lng: number, addr?: string) => {
    const location = {
      lat,
      lng,
      type: 'manual' as const,
      address: addr,
    };
    setCurrentLocation(location);
    onLocationSet(location);
    setShowMapPicker(false);
    setMode('manual');
  };

  const handleSwitchMode = () => {
    setMode('choice');
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
          {mode === 'choice' && !currentLocation && (
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
              <div className="space-y-3 relative">
                <div className="relative">
                  <Input
                    ref={inputRef}
                    placeholder="Enter address or city"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleManualLocation()}
                    onFocus={() => predictions.length > 0 && setShowPredictions(true)}
                    disabled={loading}
                    className="h-12 border-lime-200 focus:border-lime-400 focus:ring-lime-400"
                  />
                  
                  {/* Autocomplete Predictions */}
                  {showPredictions && predictions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {predictions.map((prediction) => (
                        <button
                          key={prediction.place_id}
                          onClick={() => handlePredictionSelect(prediction)}
                          className="w-full px-4 py-3 text-left hover:bg-lime-50 border-b border-gray-100 last:border-b-0 transition-colors"
                        >
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-lime-600 mt-1 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {prediction.structured_formatting.main_text}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {prediction.structured_formatting.secondary_text}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
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
            <div className="space-y-3 relative">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="bg-amber-500 hover:bg-amber-600">
                  📌 Manual Entry
                </Badge>
              </div>
              
              <div className="relative">
                <Input
                  ref={inputRef}
                  placeholder="Enter address or city"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleManualLocation()}
                  onFocus={() => predictions.length > 0 && setShowPredictions(true)}
                  disabled={loading}
                  className="h-12 border-lime-200 focus:border-lime-400 focus:ring-lime-400"
                />
                
                {/* Autocomplete Predictions */}
                {showPredictions && predictions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {predictions.map((prediction) => (
                      <button
                        key={prediction.place_id}
                        onClick={() => handlePredictionSelect(prediction)}
                        className="w-full px-4 py-3 text-left hover:bg-lime-50 border-b border-gray-100 last:border-b-0 transition-colors"
                      >
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-lime-600 mt-1 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {prediction.structured_formatting.main_text}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {prediction.structured_formatting.secondary_text}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

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