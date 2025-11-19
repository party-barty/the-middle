export interface Location {
  lat: number;
  lng: number;
  type: 'live' | 'manual';
}

export interface Participant {
  id: string;
  name: string;
  location: Location | null;
  isReady: boolean;
}

export interface Venue {
  id: string;
  name: string;
  address: string;
  rating: number;
  photos: string[];
  distance: number;
  categories: string[];
  lat: number;
  lng: number;
}

export interface Vote {
  participantId: string;
  venueId: string;
  approved: boolean;
}

export interface Session {
  id: string;
  participants: Participant[];
  midpoint: Location | null;
  midpointMode: 'dynamic' | 'locked';
  venues: Venue[];
  votes: Vote[];
  matchedVenue: Venue | null;
  createdAt: string;
}
