import { Loader } from '@googlemaps/js-api-loader';
import { Venue } from '@/types/session';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

let loader: Loader | null = null;
let google: typeof globalThis.google | null = null;
let loadingPromise: Promise<typeof globalThis.google> | null = null;

export async function initGoogleMaps(): Promise<typeof globalThis.google> {
  if (google) return google;

  // If already loading, return the existing promise
  if (loadingPromise) return loadingPromise;

  if (!GOOGLE_MAPS_API_KEY) {
    console.error('Google Maps API key is missing!');
    throw new Error('Google Maps API key is not configured');
  }

  if (!loader) {
    loader = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: 'weekly',
      libraries: ['places', 'geometry'],
    });
  }

  loadingPromise = loader.load().then((g) => {
    google = g;
    loadingPromise = null;
    return g;
  });

  return loadingPromise;
}

// Preload Google Maps on app start
export function preloadGoogleMaps() {
  initGoogleMaps().catch((error) => {
    console.error('Failed to preload Google Maps:', error);
  });
}

export interface VenueSearchOptions {
  radius?: number;
  types?: string[];
  minRating?: number;
  maxPriceLevel?: number;
  openNow?: boolean;
}

export async function searchNearbyVenues(
  lat: number,
  lng: number,
  options: VenueSearchOptions = {}
): Promise<Venue[]> {
  const {
    radius = 2000,
    types = ['restaurant', 'cafe', 'bar'],
    minRating = 0,
    maxPriceLevel = 4,
    openNow = false,
  } = options;

  const google = await initGoogleMaps();
  
  return new Promise((resolve) => {
    const map = new google.maps.Map(document.createElement('div'));
    const service = new google.maps.places.PlacesService(map);

    // Search for multiple types and combine results
    const searchPromises = types.map(type => 
      new Promise<google.maps.places.PlaceResult[]>((resolveType) => {
        const request: google.maps.places.PlaceSearchRequest = {
          location: new google.maps.LatLng(lat, lng),
          radius,
          type: type as any,
          ...(openNow && { openNow: true }),
        };

        service.nearbySearch(request, (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            resolveType(results);
          } else {
            resolveType([]);
          }
        });
      })
    );

    Promise.all(searchPromises).then((allResults) => {
      // Combine and deduplicate results
      const uniquePlaces = new Map<string, google.maps.places.PlaceResult>();
      allResults.flat().forEach(place => {
        if (place.place_id && !uniquePlaces.has(place.place_id)) {
          uniquePlaces.set(place.place_id, place);
        }
      });

      const venues: Venue[] = Array.from(uniquePlaces.values())
        .filter(place => {
          // Filter by rating
          if (place.rating && place.rating < minRating) return false;
          // Filter by price level
          if (place.price_level && place.price_level > maxPriceLevel) return false;
          return true;
        })
        .map((place) => {
          const lat = place.geometry?.location?.lat() || 0;
          const lng = place.geometry?.location?.lng() || 0;
          const primaryType = place.types?.[0] || 'restaurant';
          
          return {
            id: place.place_id || Math.random().toString(36),
            name: place.name || 'Unknown',
            category: primaryType.replace(/_/g, ' '),
            address: place.vicinity || '',
            lat,
            lng,
            location: { lat, lng },
            rating: place.rating,
            priceLevel: place.price_level,
            photoUrl: place.photos && place.photos.length > 0
              ? place.photos[0].getUrl({ maxWidth: 800, maxHeight: 600 })
              : 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
            types: place.types || [],
            distance: calculateDistance(
              lat,
              lng,
              place.geometry?.location?.lat() || 0,
              place.geometry?.location?.lng() || 0
            ),
          };
        })
        .sort((a, b) => {
          // Sort by rating first, then by distance
          if (b.rating && a.rating) {
            const ratingDiff = b.rating - a.rating;
            if (Math.abs(ratingDiff) > 0.5) return ratingDiff;
          }
          return (a.distance || 0) - (b.distance || 0);
        })
        .slice(0, 30); // Get top 30 venues

      resolve(venues);
    });
  });
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  const google = await initGoogleMaps();
  const geocoder = new google.maps.Geocoder();

  return new Promise((resolve) => {
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        resolve({
          lat: location.lat(),
          lng: location.lng(),
        });
      } else {
        resolve(null);
      }
    });
  });
}

export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  const google = await initGoogleMaps();
  const geocoder = new google.maps.Geocoder();

  return new Promise((resolve) => {
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        resolve(results[0].formatted_address);
      } else {
        resolve(null);
      }
    });
  });
}