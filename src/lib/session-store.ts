import { Session, Participant, Location, Venue, Vote } from '@/types/session';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Simple store with Supabase backend
class SessionStore {
  private listeners: Map<string, Set<(session: Session) => void>> = new Map();

  generateSessionId(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  async createSession(participantName: string): Promise<Session> {
    const sessionId = this.generateSessionId();
    const participantId = Math.random().toString(36).substring(2);

    // Create session
    const { error: sessionError } = await supabase
      .from('sessions')
      .insert({
        id: sessionId,
        midpoint_mode: 'dynamic',
        host_id: participantId,
        is_locked: false,
        max_participants: 10,
      });

    if (sessionError) {
      console.error('Failed to create session:', sessionError);
      throw new Error('Failed to create session');
    }

    // Create participant (host)
    const { error: participantError } = await supabase
      .from('participants')
      .insert({
        id: participantId,
        session_id: sessionId,
        name: participantName,
        is_ready: false,
        is_host: true,
        joined_at: new Date().toISOString(),
        last_active: new Date().toISOString(),
      });

    if (participantError) {
      console.error('Failed to create participant:', participantError);
      throw new Error('Failed to create participant');
    }

    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error('Failed to retrieve created session');
    }

    return session;
  }

  async getSession(sessionId: string): Promise<Session | null> {
    // Get session
    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError || !sessionData) {
      console.error('Session not found:', sessionError);
      return null;
    }

    // Get participants
    const { data: participantsData, error: participantsError } = await supabase
      .from('participants')
      .select('*')
      .eq('session_id', sessionId);

    if (participantsError) {
      console.error('Failed to fetch participants:', participantsError);
      return null;
    }

    // Get venues
    const { data: venuesData } = await supabase
      .from('venues')
      .select('*')
      .eq('session_id', sessionId);

    // Get votes
    const { data: votesData } = await supabase
      .from('votes')
      .select('*')
      .eq('session_id', sessionId);

    const participants: Participant[] = participantsData.map(p => ({
      id: p.id,
      name: p.name,
      location: p.location_lat && p.location_lng ? {
        lat: p.location_lat,
        lng: p.location_lng,
        type: p.location_type as 'live' | 'manual',
        address: p.location_address,
      } : null,
      isReady: p.is_ready,
    }));

    const venues: Venue[] = (venuesData || []).map(v => ({
      id: v.id,
      name: v.name,
      address: v.address,
      lat: v.lat,
      lng: v.lng,
      rating: v.rating,
      priceLevel: v.price_level,
      photoUrl: v.photo_url,
      types: v.types,
      distance: v.distance,
    }));

    const votes: Vote[] = (votesData || []).map(v => ({
      participantId: v.participant_id,
      venueId: v.venue_id,
      vote: v.vote as 'like' | 'pass',
    }));

    // Calculate midpoint
    const readyParticipants = participants.filter(p => p.location);
    let midpoint = null;
    if (readyParticipants.length > 0) {
      const avgLat = readyParticipants.reduce((sum, p) => sum + p.location!.lat, 0) / readyParticipants.length;
      const avgLng = readyParticipants.reduce((sum, p) => sum + p.location!.lng, 0) / readyParticipants.length;
      midpoint = { lat: avgLat, lng: avgLng };
    }

    const session: Session = {
      id: sessionData.id,
      participants,
      midpoint,
      midpointMode: sessionData.midpoint_mode as 'dynamic' | 'locked',
      venues,
      votes,
      matchedVenue: sessionData.matched_venue_id 
        ? venues.find(v => v.id === sessionData.matched_venue_id) || null
        : null,
      createdAt: sessionData.created_at,
      hostId: sessionData.host_id,
      isLocked: sessionData.is_locked || false,
      maxParticipants: sessionData.max_participants || 10,
    };

    return session;
  }

  async joinSession(sessionId: string, participantName: string): Promise<Participant | null> {
    // Check if session exists and is not locked
    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .select('id, is_locked, max_participants')
      .eq('id', sessionId)
      .single();

    if (sessionError || !sessionData) {
      return null;
    }

    if (sessionData.is_locked) {
      throw new Error('This session is locked and not accepting new participants');
    }

    // Check participant count
    const { count } = await supabase
      .from('participants')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', sessionId);

    if (count && sessionData.max_participants && count >= sessionData.max_participants) {
      throw new Error('This session is full');
    }

    const participantId = Math.random().toString(36).substring(2);

    const { error: participantError } = await supabase
      .from('participants')
      .insert({
        id: participantId,
        session_id: sessionId,
        name: participantName,
        is_ready: false,
        is_host: false,
        joined_at: new Date().toISOString(),
        last_active: new Date().toISOString(),
      });

    if (participantError) {
      console.error('Failed to join session:', participantError);
      return null;
    }

    const session = await this.getSession(sessionId);
    const participant = session?.participants.find(p => p.id === participantId);
    return participant || null;
  }

  async updateParticipantLocation(
    sessionId: string,
    participantId: string,
    location: Location
  ): Promise<void> {
    const { error } = await supabase
      .from('participants')
      .update({
        location_lat: location.lat,
        location_lng: location.lng,
        location_type: location.type,
        location_address: location.address,
        is_ready: true,
      })
      .eq('id', participantId)
      .eq('session_id', sessionId);

    if (error) {
      console.error('Failed to update participant location:', error);
      return;
    }

    const session = await this.getSession(sessionId);
    if (session) {
      this.notifyListeners(sessionId, session);
    }
  }

  async addVenues(sessionId: string, venues: Venue[]): Promise<void> {
    const venueRecords = venues.map(v => ({
      id: v.id,
      session_id: sessionId,
      name: v.name,
      address: v.address,
      lat: v.lat,
      lng: v.lng,
      rating: v.rating,
      price_level: v.priceLevel,
      photo_url: v.photoUrl,
      types: v.types,
      distance: v.distance,
    }));

    const { error } = await supabase
      .from('venues')
      .insert(venueRecords);

    if (error) {
      console.error('Failed to add venues:', error);
      return;
    }

    const session = await this.getSession(sessionId);
    if (session) {
      this.notifyListeners(sessionId, session);
    }
  }

  async recordVote(
    sessionId: string,
    participantId: string,
    venueId: string,
    vote: 'like' | 'pass'
  ): Promise<void> {
    const voteId = Math.random().toString(36).substring(2);

    const { error } = await supabase
      .from('votes')
      .upsert({
        id: voteId,
        session_id: sessionId,
        participant_id: participantId,
        venue_id: venueId,
        vote,
      });

    if (error) {
      console.error('Failed to record vote:', error);
      return;
    }

    // Check for match after recording vote
    await this.checkForMatch(sessionId);

    const session = await this.getSession(sessionId);
    if (session) {
      this.notifyListeners(sessionId, session);
    }
  }

  async checkForMatch(sessionId: string): Promise<Venue | null> {
    const session = await this.getSession(sessionId);
    if (!session) return null;

    // Get all participants
    const totalParticipants = session.participants.length;
    if (totalParticipants === 0) return null;

    // Group votes by venue
    const venueVotes = new Map<string, { likes: Set<string>; passes: Set<string> }>();
    
    session.votes.forEach(vote => {
      if (!venueVotes.has(vote.venueId)) {
        venueVotes.set(vote.venueId, { likes: new Set(), passes: new Set() });
      }
      const voteGroup = venueVotes.get(vote.venueId)!;
      if (vote.vote === 'like') {
        voteGroup.likes.add(vote.participantId);
      } else {
        voteGroup.passes.add(vote.participantId);
      }
    });

    // Find venue where all participants liked it
    for (const [venueId, { likes }] of venueVotes.entries()) {
      if (likes.size === totalParticipants) {
        const matchedVenue = session.venues.find(v => v.id === venueId);
        if (matchedVenue) {
          // Update session with matched venue
          await supabase
            .from('sessions')
            .update({ matched_venue_id: venueId })
            .eq('id', sessionId);
          
          return matchedVenue;
        }
      }
    }

    return null;
  }

  async toggleMidpointMode(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) return;

    const newMode = session.midpointMode === 'dynamic' ? 'locked' : 'dynamic';

    const { error } = await supabase
      .from('sessions')
      .update({ midpoint_mode: newMode })
      .eq('id', sessionId);

    if (error) {
      console.error('Failed to toggle midpoint mode:', error);
      return;
    }

    const updatedSession = await this.getSession(sessionId);
    if (updatedSession) {
      this.notifyListeners(sessionId, updatedSession);
    }
  }

  async updateParticipantActivity(participantId: string): Promise<void> {
    await supabase
      .from('participants')
      .update({ last_active: new Date().toISOString() })
      .eq('id', participantId);
  }

  async lockSession(sessionId: string, locked: boolean): Promise<void> {
    await supabase
      .from('sessions')
      .update({ is_locked: locked })
      .eq('id', sessionId);

    const session = await this.getSession(sessionId);
    if (session) {
      this.notifyListeners(sessionId, session);
    }
  }

  async removeParticipant(sessionId: string, participantId: string): Promise<void> {
    await supabase
      .from('participants')
      .delete()
      .eq('id', participantId)
      .eq('session_id', sessionId);

    const session = await this.getSession(sessionId);
    if (session) {
      this.notifyListeners(sessionId, session);
    }
  }

  async endSession(sessionId: string): Promise<void> {
    // Delete all related data
    await supabase.from('votes').delete().eq('session_id', sessionId);
    await supabase.from('venues').delete().eq('session_id', sessionId);
    await supabase.from('participants').delete().eq('session_id', sessionId);
    await supabase.from('sessions').delete().eq('id', sessionId);
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
        if (listeners.size === 0) {
          this.listeners.delete(sessionId);
        }
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