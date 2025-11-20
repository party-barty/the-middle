import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { Venue } from '@/types/session';

const GOOGLE_MAPS_API_KEY: string = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

let googleInstance: typeof globalThis.google | null = null;
let loadingPromise: Promise<typeof globalThis.google> | null = null;
let optionsSet = false;

export async function initGoogleMaps(): Promise<typeof globalThis.google> {
  if (googleInstance) return googleInstance;

  if (loadingPromise) return loadingPromise;

  if (!GOOGLE_MAPS_API_KEY) {
    console.error('Google Maps API key is missing!');
    throw new Error('Google Maps API key is not configured');
  }

  if (!optionsSet) {
    setOptions({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: 'weekly',
      libraries: ['places', 'geometry'],
    } as google.maps.LibraryImportOptions);
    optionsSet = true;
  }

  loadingPromise = importLibrary('maps').then(() => {
    googleInstance = globalThis.google;
    return googleInstance;
  });

  return loadingPromise;
}

export async function preloadGoogleMaps(): Promise<void> {
  if (loadingPromise || googleInstance) return;

  try {
    await initGoogleMaps();
  } catch (error) {
    console.error('Failed to preload Google Maps:', error);
  }
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
    radius = 1500,
    types = ['restaurant', 'cafe', 'bar'],
    minRating = 0,
    maxPriceLevel = 4,
    openNow = false,
  } = options;

  const google = await initGoogleMaps();
  const { Place } = (await google.maps.importLibrary('places')) as google.maps.PlacesLibrary;

  try {
    const request: google.maps.places.SearchNearbyRequest = {
      location: new google.maps.LatLng(lat, lng),
      radius,
      includedTypes: types,
      maxResultCount: 20,
      openNow,
    };

    // @ts-expect-error New Places API typings might not be available yet
    const { places } = await Place.searchNearby(request);

    if (!places || places.length === 0) {
      return [];
    }

    const venues: Array<Venue | null> = await Promise.all(
      places.map(async (place: google.maps.places.Place) => {
        try {
          await place.fetchFields({
            fields: [
              'displayName',
              'formattedAddress',
              'location',
              'rating',
              'priceLevel',
              'photos',
              'types',
            ],
          });

          const placeLat = place.location?.lat() ?? 0;
          const placeLng = place.location?.lng() ?? 0;
          const primaryType = place.types?.[0] ?? 'restaurant';

          if (place.rating !== undefined && place.rating < minRating) return null;
          if (place.priceLevel !== undefined && place.priceLevel > maxPriceLevel) return null;

          return {
            id: place.id ?? Math.random().toString(36),
            name: place.displayName ?? 'Unknown',
            category: primaryType.replace(/_/g, ' '),
            address: place.formattedAddress ?? '',
            lat: placeLat,
            lng: placeLng,
            location: { lat: placeLat, lng: placeLng },
            rating: place.rating,
            priceLevel: place.priceLevel,
            photoUrl:
              place.photos && place.photos.length > 0
                ? place.photos[0].getURI({ maxWidth: 800, maxHeight: 600 })
                : 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
            types: place.types ?? [],
            distance: calculateDistance(lat, lng, placeLat, placeLng),
          } satisfies Venue;
        } catch (err) {
          console.error('Error fetching place details:', err);
          return null;
        }
      })
    );

    return venues
      .filter((v): v is Venue => v !== null)
      .sort((a, b) => {
        if (b.rating && a.rating) {
          const ratingDiff = b.rating - a.rating;
          if (Math.abs(ratingDiff) > 0.5) return ratingDiff;
        }
        return (a.distance ?? 0) - (b.distance ?? 0);
      });
  } catch (error) {
    console.error('Error searching nearby venues:', error);
    return [];
  }
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
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
        resolve(results[0].formatted_address ?? null);
      } else {
        resolve(null);
      }
    });
  });
}