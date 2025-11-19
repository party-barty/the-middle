import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { sessionStore } from '@/lib/session-store';
import { searchNearbyVenues, VenueSearchOptions } from '@/lib/maps';
import { Session } from '@/types/session';
import LocationSetup from '@/components/LocationSetup';
import WaitingRoom from '@/components/WaitingRoom';
import MapView from '@/components/MapView';
import SwipeDeck from '@/components/SwipeDeck';
import MatchScreen from '@/components/MatchScreen';
import VenueFilters, { VenueFilterOptions } from '@/components/VenueFilters';
import ParticipantSidebar from '@/components/ParticipantSidebar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, Users, MapPin, Lock, Unlock, Home, RefreshCw } from 'lucide-react';
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
  const [filters, setFilters] = useState<VenueFilterOptions>({
    radius: 2000,
    types: ['restaurant', 'cafe', 'bar'],
    minRating: 0,
    maxPriceLevel: 4,
  });

  useEffect(() => {
    if (!sessionId || !participantId) {
      navigate('/');
      return;
    }

    const loadSession = async () => {
      const currentSession = await sessionStore.getSession(sessionId);
      if (!currentSession) {
        toast({
          title: 'Session not found',
          description: 'Please check the session code and try again.',
          variant: 'destructive',
        });
        navigate('/');
        return;
      }

      setSession(currentSession);
    };

    loadSession();

    const unsubscribe = sessionStore.subscribe(sessionId, (updatedSession) => {
      setSession(updatedSession);
    });

    return () => unsubscribe();
  }, [sessionId, participantId, navigate, toast]);

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

  const loadVenues = async (customFilters?: VenueFilterOptions) => {
    if (!session || !session.midpoint || !sessionId) return;

    const searchOptions: VenueSearchOptions = customFilters || filters;
    
    toast({
      title: 'Loading venues...',
      description: 'Finding the best spots near your midpoint',
    });

    setVenuesLoaded(true);
    const venues = await searchNearbyVenues(
      session.midpoint.lat,
      session.midpoint.lng,
      searchOptions
    );
    
    if (venues.length === 0) {
      toast({
        title: 'No venues found',
        description: 'Try adjusting your filters or expanding the search radius',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Venues loaded!',
        description: `Found ${venues.length} venues to explore`,
      });
    }

    await sessionStore.addVenues(sessionId, venues);
  };

  const handleFiltersApply = () => {
    setVenuesLoaded(false);
    loadVenues(filters);
  };

  const handleLocationSet = async (location: { lat: number; lng: number; type: 'live' | 'manual' }) => {
    if (!sessionId || !participantId) return;

    await sessionStore.updateParticipantLocation(sessionId, participantId, location);
    setLocationSet(true);
  };

  const handleReady = async () => {
    if (!sessionId || !participantId) return;
    await sessionStore.markParticipantReady(sessionId, participantId);
  };

  const handleLeaveSession = () => {
    navigate('/');
  };

  const handleVote = async (venueId: string, approved: boolean) => {
    if (!sessionId || !participantId) return;
    await sessionStore.recordVote(sessionId, participantId, venueId, approved ? 'like' : 'pass');
  };

  const handleToggleMidpointMode = async () => {
    if (!sessionId || !session) return;
    const newMode = session.midpointMode === 'dynamic' ? 'locked' : 'dynamic';
    await sessionStore.updateMidpointMode(sessionId, newMode);
    toast({
      title: newMode === 'locked' ? 'Midpoint locked' : 'Midpoint unlocked',
      description: newMode === 'locked' 
        ? 'The midpoint is now fixed and won\'t update with location changes'
        : 'The midpoint will now update as participants move',
    });
  };

  const handleCopySessionLink = () => {
    const link = `${window.location.origin}/session/${sessionId}`;
    navigator.clipboard.writeText(link);
    toast({
      title: 'Link copied!',
      description: 'Share this link with your friends',
    });
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
        onReady={handleReady}
        onLeave={handleLeaveSession}
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
            onClick={handleLeaveSession}
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
              <div className="text-xs text-gray-500">{session.participants.length} participants</div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <Users className="w-3 h-3" />
            {session.participants.length}
          </Badge>
          {session.isLocked && (
            <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-300">
              <Lock className="w-3 h-3 mr-1" />
              Locked
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopySessionLink}
            className="gap-2"
          >
            <Copy className="w-4 h-4" />
            Share
          </Button>
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
            />
          </div>

          {/* Midpoint Mode Toggle */}
          <div className="absolute top-4 left-4 z-10">
            <Button
              onClick={handleToggleMidpointMode}
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
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-xl font-bold">Find Your Spot</h2>
                {session.votes.length > 0 && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {session.votes.length} votes cast
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <VenueFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                  onApply={handleFiltersApply}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFiltersApply()}
                  className="gap-2"
                  disabled={!venuesLoaded}
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </Button>
              </div>
            </div>
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

        {/* Participant Sidebar */}
        <ParticipantSidebar
          session={session}
          currentParticipantId={participantId!}
        />
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