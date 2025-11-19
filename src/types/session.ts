export interface Location {
  lat: number;
  lng: number;
  type: 'live' | 'manual';
  address?: string;
}

export interface Participant {
  id: string;
  name: string;
  location: Location | null;
  isReady: boolean;
  isHost?: boolean;
  joinedAt: string;
  lastActive?: string;
  avatar?: string;
}

export interface Venue {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  rating?: number;
  priceLevel?: number;
  photoUrl?: string;
  types?: string[];
  distance?: number;
}

export interface Vote {
  participantId: string;
  venueId: string;
  vote: 'like' | 'pass';
}

export interface Session {
  id: string;
  participants: Participant[];
  midpoint: { lat: number; lng: number } | null;
  midpointMode: 'dynamic' | 'locked';
  venues: Venue[];
  votes: Vote[];
  matchedVenue: Venue | null;
  createdAt: string;
  hostId?: string;
  isLocked?: boolean;
  maxParticipants?: number;
}