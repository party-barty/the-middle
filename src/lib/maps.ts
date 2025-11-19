import { Loader } from '@googlemaps/js-api-loader';
import { Venue } from '@/types/session';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

let loader: Loader | null = null;
let google: typeof globalThis.google | null = null;

export async function initGoogleMaps(): Promise<typeof globalThis.google> {
  if (google) return google;

  if (!loader) {
    loader = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: 'weekly',
      libraries: ['places', 'geometry'],
    });
  }

  google = await loader.load();
  return google;
}

export async function searchNearbyVenues(
  lat: number,
  lng: number,
  radius: number = 2000
): Promise<Venue[]> {
  const google = await initGoogleMaps();
  
  return new Promise((resolve) => {
    const map = new google.maps.Map(document.createElement('div'));
    const service = new google.maps.places.PlacesService(map);

    const request = {
      location: new google.maps.LatLng(lat, lng),
      radius,
      type: 'restaurant',
    };

    service.nearbySearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        const venues: Venue[] = results.slice(0, 20).map((place) => ({
          id: place.place_id || Math.random().toString(36),
          name: place.name || 'Unknown',
          address: place.vicinity || '',
          rating: place.rating || 0,
          photos: place.photos
            ? [place.photos[0].getUrl({ maxWidth: 600, maxHeight: 400 })]
            : ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80'],
          distance: calculateDistance(
            lat,
            lng,
            place.geometry?.location?.lat() || 0,
            place.geometry?.location?.lng() || 0
          ),
          categories: place.types || [],
          lat: place.geometry?.location?.lat() || 0,
          lng: place.geometry?.location?.lng() || 0,
        }));
        resolve(venues);
      } else {
        resolve([]);
      }
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
