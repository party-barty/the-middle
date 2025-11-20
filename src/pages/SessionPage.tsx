import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { sessionStore } from '@/lib/session-store';
import { searchNearbyVenues, VenueSearchOptions } from '@/lib/maps';
import { Session, Venue } from '@/types/session';
import LocationSetup from '@/components/LocationSetup';
import WaitingRoom from '@/components/WaitingRoom';
import MapView from '@/components/MapView';
import SwipeDeck from '@/components/SwipeDeck';
import MatchScreen from '@/components/MatchScreen';
import VenueFilters, { VenueFilterOptions } from '@/components/VenueFilters';
import ParticipantSidebar from '@/components/ParticipantSidebar';
import ProfileSettings from '@/components/ProfileSettings';
import SessionInsights from '@/components/SessionInsights';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, Users, MapPin, Lock, Unlock, Home, RefreshCw, Settings, TrendingUp } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface RouteParams {
  sessionId: string;
}

export default function SessionPage() {
  const { sessionId } = useParams<RouteParams>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const participantId = searchParams.get('participantId');

  const [session, setSession] = useState<Session | null>(null);
  const [locationSet, setLocationSet] = useState(false);
  const [filters, setFilters] = useState<VenueFilterOptions>({
    radius: 5000,
    types: [],
    minRating: 0,
    maxPriceLevel: 4,
  });
  const [venuesLoaded, setVenuesLoaded] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [allReady, setAllReady] = useState(false);

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

  const handleUpdateProfile = async (updates: Partial<typeof session.participants[0]>) => {
    if (!sessionId || !participantId) return;
    
    if (updates.name) {
      await sessionStore.updateParticipantName(sessionId, participantId, updates.name);
    }
    
    if (updates.location) {
      await sessionStore.updateParticipantLocation(sessionId, participantId, updates.location);
    }
    
    toast({
      title: 'Profile updated',
      description: 'Your changes have been saved.',
    });
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
    const link = `${window.location.origin}/join/${sessionId}`;
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

  // Always show the main view with map - no waiting room blocking
  // The map will show with default location and update as participants join

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
            onClick={() => setShowInsights(true)}
            className="gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Insights</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowProfileSettings(true)}
            className="gap-2"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Profile</span>
          </Button>
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
          {/* Waiting for participants banner */}
          {!allReady && (
            <div className="absolute top-0 left-0 right-0 z-20 bg-amber-50 border-b border-amber-200 px-4 py-2">
              <div className="flex items-center justify-center gap-2 text-sm">
                <Users className="w-4 h-4 text-amber-600" />
                <span className="text-amber-800 font-medium">
                  Waiting for {session.participants.filter(p => !p.isReady).length} participant(s) to set their location
                </span>
              </div>
            </div>
          )}
          
          <div className={`absolute inset-0 ${!allReady ? 'pt-10' : ''} p-4`}>
            <MapView
              participants={session.participants}
              midpoint={session.midpoint}
              venues={session.venues}
              selectedVenue={selectedVenue}
              onVenueSelect={setSelectedVenue}
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
            {!allReady ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-lime-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-lime-600" />
                  </div>
                  <p className="text-gray-900 font-semibold mb-2">Waiting for everyone</p>
                  <p className="text-gray-600 text-sm">
                    {session.participants.filter(p => !p.isReady).length} participant(s) still setting their location
                  </p>
                </div>
              </div>
            ) : session.venues.length > 0 ? (
              <SwipeDeck venues={session.venues} onVote={handleVote} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-8">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <MapPin className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600">Loading venues...</p>
                  <p className="text-gray-500 text-sm mt-2">Finding the best spots near your midpoint</p>
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

      {/* Profile Settings */}
      {showProfileSettings && (
        <ProfileSettings
          participant={currentParticipant}
          sessionId={sessionId!}
          onUpdate={handleUpdateProfile}
          onLeaveSession={handleLeaveSession}
          onClose={() => setShowProfileSettings(false)}
        />
      )}

      {/* Session Insights */}
      {showInsights && (
        <SessionInsights
          session={session}
          onClose={() => setShowInsights(false)}
        />
      )}
    </div>
  );
}