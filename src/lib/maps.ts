import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { Venue } from '@/types/session';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

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

  // Set options for the loader
  setOptions({
    apiKey: GOOGLE_MAPS_API_KEY,
    version: 'weekly',
  });

  loadingPromise = Promise.all([
    importLibrary('maps'),
    importLibrary('places'),
    importLibrary('geometry'),
  ]).then(() => {
    google = globalThis.google;
    loadingPromise = null;
    return google;
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
  options: {
    radius?: number;
    types?: string[];
    minRating?: number;
    maxPriceLevel?: number;
    openNow?: boolean;
  } = {}
): Promise<Venue[]> {
  const {
    radius = 1500,
    types = ['restaurant', 'cafe', 'bar'],
    minRating = 0,
    maxPriceLevel = 4,
    openNow = false,
  } = options;

  const google = await initGoogleMaps();
  const { Place } = await google.maps.importLibrary("places") as google.maps.PlacesLibrary;
  
  try {
    // Use the new searchNearby method
    const request = {
      location: new google.maps.LatLng(lat, lng),
      radius,
      includedTypes: types,
      maxResultCount: 20,
    };

    // @ts-ignore - New API may not have full TypeScript support yet
    const { places } = await Place.searchNearby(request);

    if (!places || places.length === 0) {
      return [];
    }

    // Fetch details for each place
    const venues: Venue[] = await Promise.all(
      places.map(async (place: any) => {
        try {
          await place.fetchFields({
            fields: ['displayName', 'formattedAddress', 'location', 'rating', 'priceLevel', 'photos', 'types'],
          });

          const placeLat = place.location?.lat() || 0;
          const placeLng = place.location?.lng() || 0;
          const primaryType = place.types?.[0] || 'restaurant';

          // Apply filters
          if (place.rating && place.rating < minRating) return null;
          if (place.priceLevel && place.priceLevel > maxPriceLevel) return null;

          return {
            id: place.id || Math.random().toString(36),
            name: place.displayName || 'Unknown',
            category: primaryType.replace(/_/g, ' '),
            address: place.formattedAddress || '',
            lat: placeLat,
            lng: placeLng,
            location: { lat: placeLat, lng: placeLng },
            rating: place.rating,
            priceLevel: place.priceLevel,
            photoUrl: place.photos && place.photos.length > 0
              ? place.photos[0].getURI({ maxWidth: 800, maxHeight: 600 })
              : 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
            types: place.types || [],
            distance: calculateDistance(lat, lng, placeLat, placeLng),
          };
        } catch (err) {
          console.error('Error fetching place details:', err);
          return null;
        }
      })
    );

    // Filter out nulls and sort
    return venues
      .filter((v): v is Venue => v !== null)
      .sort((a, b) => {
        // Sort by rating first, then by distance
        if (b.rating && a.rating) {
          const ratingDiff = b.rating - a.rating;
          if (Math.abs(ratingDiff) > 0.5) return ratingDiff;
        }
        return (a.distance || 0) - (b.distance || 0);
      });
  } catch (error) {
    console.error('Error searching nearby venues:', error);
    return [];
  }
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