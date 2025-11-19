import { Session, Participant, Location, Venue, Vote } from '@/types/session';

// Simple in-memory store for MVP (no login required)
class SessionStore {
  private sessions: Map<string, Session> = new Map();
  private listeners: Map<string, Set<(session: Session) => void>> = new Map();

  generateSessionId(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  createSession(participantName: string): Session {
    const sessionId = this.generateSessionId();
    const participant: Participant = {
      id: Math.random().toString(36).substring(2),
      name: participantName,
      location: null,
      isReady: false,
    };

    const session: Session = {
      id: sessionId,
      participants: [participant],
      midpoint: null,
      midpointMode: 'dynamic',
      venues: [],
      votes: [],
      matchedVenue: null,
      createdAt: new Date().toISOString(),
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  getSession(sessionId: string): Session | null {
    return this.sessions.get(sessionId) || null;
  }

  joinSession(sessionId: string, participantName: string): Participant | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const participant: Participant = {
      id: Math.random().toString(36).substring(2),
      name: participantName,
      location: null,
      isReady: false,
    };

    session.participants.push(participant);
    this.notifyListeners(sessionId, session);
    return participant;
  }

  updateParticipantLocation(
    sessionId: string,
    participantId: string,
    location: Location
  ): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const participant = session.participants.find((p) => p.id === participantId);
    if (participant) {
      participant.location = location;
      participant.isReady = true;

      // Recalculate midpoint if dynamic mode
      if (session.midpointMode === 'dynamic') {
        this.calculateMidpoint(sessionId);
      }

      this.notifyListeners(sessionId, session);
    }
  }

  calculateMidpoint(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const locations = session.participants
      .filter((p) => p.location)
      .map((p) => p.location!);

    if (locations.length === 0) return;

    const avgLat = locations.reduce((sum, loc) => sum + loc.lat, 0) / locations.length;
    const avgLng = locations.reduce((sum, loc) => sum + loc.lng, 0) / locations.length;

    session.midpoint = {
      lat: avgLat,
      lng: avgLng,
      type: 'manual',
    };

    this.notifyListeners(sessionId, session);
  }

  setMidpointMode(sessionId: string, mode: 'dynamic' | 'locked'): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.midpointMode = mode;
    if (mode === 'locked') {
      this.calculateMidpoint(sessionId);
    }
    this.notifyListeners(sessionId, session);
  }

  addVote(sessionId: string, participantId: string, venueId: string, approved: boolean): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    // Remove existing vote for this participant and venue
    session.votes = session.votes.filter(
      (v) => !(v.participantId === participantId && v.venueId === venueId)
    );

    session.votes.push({ participantId, venueId, approved });

    // Check for match
    this.checkForMatch(sessionId);
    this.notifyListeners(sessionId, session);
  }

  checkForMatch(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const participantIds = session.participants.map((p) => p.id);
    
    for (const venue of session.venues) {
      const venueVotes = session.votes.filter((v) => v.venueId === venue.id);
      const allApproved = participantIds.every((pid) =>
        venueVotes.some((v) => v.participantId === pid && v.approved)
      );

      if (allApproved && participantIds.length > 0) {
        session.matchedVenue = venue;
        this.notifyListeners(sessionId, session);
        return;
      }
    }
  }

  setVenues(sessionId: string, venues: Venue[]): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.venues = venues;
    this.notifyListeners(sessionId, session);
  }

  subscribe(sessionId: string, callback: (session: Session) => void): () => void {
    if (!this.listeners.has(sessionId)) {
      this.listeners.set(sessionId, new Set());
    }
    this.listeners.get(sessionId)!.add(callback);

    return () => {
      const listeners = this.listeners.get(sessionId);
      if (listeners) {
        listeners.delete(callback);
      }
    };
  }

  private notifyListeners(sessionId: string, session: Session): void {
    const listeners = this.listeners.get(sessionId);
    if (listeners) {
      listeners.forEach((callback) => callback(session));
    }
  }
}

export const sessionStore = new SessionStore();
