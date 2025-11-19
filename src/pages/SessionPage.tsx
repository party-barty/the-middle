import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { sessionStore } from '@/lib/session-store';
import { searchNearbyVenues } from '@/lib/maps';
import { Session } from '@/types/session';
import LocationSetup from '@/components/LocationSetup';
import WaitingRoom from '@/components/WaitingRoom';
import MapView from '@/components/MapView';
import SwipeDeck from '@/components/SwipeDeck';
import MatchScreen from '@/components/MatchScreen';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, Users, MapPin, Lock, Unlock, Home } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function SessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const participantId = searchParams.get('participantId');

  const [session, setSession] = useState<Session | null>(null);
  const [locationSet, setLocationSet] = useState(false);
  const [venuesLoaded, setVenuesLoaded] = useState(false);

  useEffect(() => {
    if (!sessionId || !participantId) {
      navigate('/');
      return;
    }

    const currentSession = sessionStore.getSession(sessionId);
    if (!currentSession) {
      navigate('/');
      return;
    }

    setSession(currentSession);

    const unsubscribe = sessionStore.subscribe(sessionId, (updatedSession) => {
      setSession(updatedSession);
    });

    return () => unsubscribe();
  }, [sessionId, participantId, navigate]);

  useEffect(() => {
    if (
      session &&
      session.midpoint &&
      !venuesLoaded &&
      session.participants.every((p) => p.isReady)
    ) {
      loadVenues();
    }
  }, [session, venuesLoaded]);

  const loadVenues = async () => {
    if (!session || !session.midpoint || !sessionId) return;

    setVenuesLoaded(true);
    const venues = await searchNearbyVenues(session.midpoint.lat, session.midpoint.lng);
    sessionStore.setVenues(sessionId, venues);
  };

  const handleLocationSet = (location: { lat: number; lng: number; type: 'live' | 'manual' }) => {
    if (!sessionId || !participantId) return;

    sessionStore.updateParticipantLocation(sessionId, participantId, location);
    setLocationSet(true);
  };

  const handleVote = (venueId: string, approved: boolean) => {
    if (!sessionId || !participantId) return;
    sessionStore.addVote(sessionId, participantId, venueId, approved);
  };

  const handleCopyLink = () => {
    const link = window.location.origin + `/session/${sessionId}`;
    navigator.clipboard.writeText(link);
    toast({
      title: 'Link copied!',
      description: 'Share this link with your friends to join the session',
    });
  };

  const toggleMidpointMode = () => {
    if (!sessionId || !session) return;
    const newMode = session.midpointMode === 'dynamic' ? 'locked' : 'dynamic';
    sessionStore.setMidpointMode(sessionId, newMode);
  };

  if (!session) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const currentParticipant = session.participants.find((p) => p.id === participantId);

  // Show location setup if participant hasn't set location
  if (!currentParticipant?.isReady && !locationSet) {
    return <LocationSetup onLocationSet={handleLocationSet} currentLocation={currentParticipant?.location} />;
  }

  // Show waiting room if not all participants are ready
  const allReady = session.participants.every((p) => p.isReady);
  if (!allReady) {
    return (
      <WaitingRoom
        session={session}
        currentParticipantId={participantId!}
        onReady={() => setLocationSet(false)}
      />
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <Home className="w-4 h-4" />
            Home
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-lime-500 to-teal-500 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-semibold text-sm">Session {sessionId}</div>
              <div className="text-xs text-gray-500">The Middle</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="gap-2"
          >
            <Copy className="w-4 h-4" />
            Share Link
          </Button>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
            <Users className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium">{session.participants.length}</span>
          </div>
        </div>
      </header>

      {/* Main View */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Map Section */}
        <div className="flex-1 relative bg-white border-r border-gray-200">
          <div className="absolute inset-0 p-4">
            <MapView
              participants={session.participants}
              midpoint={session.midpoint}
              venues={session.venues}
            />
          </div>

          {/* Midpoint Mode Toggle */}
          <div className="absolute top-4 left-4 z-10">
            <Button
              onClick={toggleMidpointMode}
              variant="secondary"
              size="sm"
              className="gap-2 bg-white shadow-lg"
            >
              {session.midpointMode === 'dynamic' ? (
                <>
                  <Unlock className="w-4 h-4" />
                  Dynamic
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Locked
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Swipe Section */}
        <div className="w-full md:w-[480px] bg-gray-50 flex flex-col">
          <div className="p-4 bg-white border-b border-gray-200">
            <h2 className="text-xl font-bold">Find Your Spot</h2>
            <p className="text-sm text-gray-600">Swipe right to like, left to pass</p>
          </div>
          <div className="flex-1 overflow-hidden">
            {session.venues.length > 0 ? (
              <SwipeDeck venues={session.venues} onVote={handleVote} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-8">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <MapPin className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600">Loading venues...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Match Screen */}
      {session.matchedVenue && (
        <MatchScreen
          venue={session.matchedVenue}
          onClose={() => {
            // Could reset or navigate away
          }}
        />
      )}
    </div>
  );
}