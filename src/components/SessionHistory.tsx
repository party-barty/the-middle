import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { 
  History, 
  X, 
  MapPin, 
  Star, 
  Users, 
  Calendar,
  Ban,
  Save
} from 'lucide-react';
import { SessionHistory as SessionHistoryType, VenueReview } from '@/types/session';
import { sessionStore } from '@/lib/session-store';
import { useToast } from '@/components/ui/use-toast';

interface SessionHistoryProps {
  participantId: string;
  onClose: () => void;
}

export default function SessionHistory({ participantId, onClose }: SessionHistoryProps) {
  const { toast } = useToast();
  const [history, setHistory] = useState<SessionHistoryType[]>([]);
  const [selectedSession, setSelectedSession] = useState<SessionHistoryType | null>(null);
  const [review, setReview] = useState<VenueReview | null>(null);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadHistory();
  }, [participantId]);

  useEffect(() => {
    if (selectedSession) {
      loadReview();
    }
  }, [selectedSession]);

  const loadHistory = async () => {
    const data = await sessionStore.getSessionHistory(participantId);
    setHistory(data);
  };

  const loadReview = async () => {
    if (!selectedSession) return;
    
    const existingReview = await sessionStore.getVenueReview(selectedSession.id, participantId);
    if (existingReview) {
      setReview(existingReview);
      setRating(existingReview.rating);
      setReviewText(existingReview.reviewText || '');
    } else {
      setReview(null);
      setRating(0);
      setReviewText('');
    }
  };

  const handleRatingChange = async (newRating: number) => {
    setRating(newRating);
    
    if (newRating === 0 && !review?.isBlocked) {
      setShowBlockDialog(true);
    } else {
      await saveReview(newRating, reviewText);
    }
  };

  const saveReview = async (newRating: number, newReviewText: string) => {
    if (!selectedSession?.matchedVenue) return;
    
    setIsSaving(true);
    try {
      if (review) {
        await sessionStore.updateVenueReview(
          selectedSession.id,
          participantId,
          newRating,
          newReviewText
        );
      } else {
        await sessionStore.saveVenueReview(
          selectedSession.id,
          participantId,
          selectedSession.matchedVenue.id,
          selectedSession.matchedVenue.name,
          newRating,
          newReviewText
        );
      }
      
      await loadReview();
      
      toast({
        title: 'Review saved',
        description: 'Your review has been saved successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save review',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBlockVenue = async () => {
    if (!selectedSession?.matchedVenue) return;
    
    try {
      await sessionStore.blockVenue(
        participantId,
        selectedSession.matchedVenue.id,
        selectedSession.matchedVenue.name
      );
      
      await saveReview(0, reviewText);
      
      toast({
        title: 'Venue blocked',
        description: 'This venue has been added to your blocked list',
      });
      
      setShowBlockDialog(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to block venue',
        variant: 'destructive',
      });
    }
  };

  const handleReviewTextChange = (text: string) => {
    setReviewText(text);
  };

  const handleSaveReviewText = async () => {
    await saveReview(rating, reviewText);
  };

  const renderStars = (currentRating: number, interactive: boolean = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => interactive && handleRatingChange(star)}
            disabled={!interactive || isSaving}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          >
            <Star
              className={`w-6 h-6 ${
                star <= currentRating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <History className="w-6 h-6 text-gray-700" />
            <h2 className="text-2xl font-bold text-gray-900">Session History</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6">
          {!selectedSession ? (
            /* History List */
            <div className="space-y-4">
              {history.length === 0 ? (
                <div className="text-center py-12">
                  <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No session history yet</p>
                  <p className="text-gray-400 text-sm mt-2">
                    Complete a session to see it here
                  </p>
                </div>
              ) : (
                history.map((session) => (
                  <Card
                    key={session.id}
                    className="p-4 border-2 hover:border-lime-300 cursor-pointer transition-colors"
                    onClick={() => setSelectedSession(session)}
                  >
                    <div className="flex items-start gap-4">
                      {/* Venue Image */}
                      {session.matchedVenue?.photoUrl ? (
                        <img
                          src={session.matchedVenue.photoUrl}
                          alt={session.matchedVenue.name}
                          className="w-24 h-24 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-lime-100 to-teal-100 flex items-center justify-center">
                          <MapPin className="w-8 h-8 text-lime-600" />
                        </div>
                      )}

                      {/* Session Info */}
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 mb-1">
                          {session.matchedVenue?.name || 'No match found'}
                        </h3>
                        {session.matchedVenue && (
                          <p className="text-sm text-gray-600 mb-2">
                            {session.matchedVenue.address}
                          </p>
                        )}
                        
                        <div className="flex flex-wrap gap-2 mb-2">
                          <Badge variant="secondary" className="gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(session.completedAt).toLocaleDateString()}
                          </Badge>
                          <Badge variant="secondary" className="gap-1">
                            <Users className="w-3 h-3" />
                            {session.participantNames.length} participants
                          </Badge>
                          {session.matchedVenue?.rating && (
                            <Badge variant="secondary" className="gap-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              {session.matchedVenue.rating.toFixed(1)}
                            </Badge>
                          )}
                        </div>

                        {session.participantNames.length > 0 && (
                          <p className="text-xs text-gray-500">
                            With: {session.participantNames.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          ) : (
            /* Review Modal */
            <div className="space-y-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedSession(null)}
                className="mb-4"
              >
                ← Back to history
              </Button>

              {/* Venue Details */}
              {selectedSession.matchedVenue && (
                <div>
                  <div className="flex items-start gap-4 mb-6">
                    {selectedSession.matchedVenue.photoUrl ? (
                      <img
                        src={selectedSession.matchedVenue.photoUrl}
                        alt={selectedSession.matchedVenue.name}
                        className="w-32 h-32 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-lg bg-gradient-to-br from-lime-100 to-teal-100 flex items-center justify-center">
                        <MapPin className="w-12 h-12 text-lime-600" />
                      </div>
                    )}

                    <div className="flex-1">
                      <h3 className="font-bold text-2xl text-gray-900 mb-2">
                        {selectedSession.matchedVenue.name}
                      </h3>
                      <p className="text-gray-600 mb-3">
                        {selectedSession.matchedVenue.address}
                      </p>
                      
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(selectedSession.completedAt).toLocaleDateString()}
                        </Badge>
                        {selectedSession.matchedVenue.rating && (
                          <Badge variant="secondary" className="gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            {selectedSession.matchedVenue.rating.toFixed(1)} Google Rating
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Rating Section */}
                  <div className="space-y-4 mt-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Your Rating</h4>
                      {renderStars(rating, true)}
                      {rating === 0 && (
                        <p className="text-xs text-gray-500 mt-2">
                          Tap a star to rate this venue
                        </p>
                      )}
                      {review?.isBlocked && (
                        <Badge variant="destructive" className="mt-2 gap-1">
                          <Ban className="w-3 h-3" />
                          Blocked
                        </Badge>
                      )}
                    </div>

                    <Separator />

                    {/* Review Text */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Your Review</h4>
                      <Textarea
                        value={reviewText}
                        onChange={(e) => handleReviewTextChange(e.target.value)}
                        placeholder="Share your experience at this venue..."
                        className="min-h-[120px] resize-none"
                        disabled={isSaving}
                      />
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-xs text-gray-500">
                          {reviewText.length}/500 characters
                        </p>
                        <Button
                          size="sm"
                          onClick={handleSaveReviewText}
                          disabled={isSaving || reviewText === (review?.reviewText || '')}
                          className="gap-2"
                        >
                          <Save className="w-4 h-4" />
                          Save Review
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    {/* Group Members */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Group Members
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedSession.participantNames.map((name, idx) => (
                          <Badge key={idx} variant="secondary">
                            {name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!selectedSession.matchedVenue && (
                <div className="text-center py-12">
                  <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No venue was matched in this session</p>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Block Venue Dialog */}
      <AlertDialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Block this venue?</AlertDialogTitle>
            <AlertDialogDescription>
              You've given this venue 0 stars. Would you like to add it to your blocked venue list? 
              Blocked venues won't appear in your future searches.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => saveReview(0, reviewText)}>
              No, just save rating
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleBlockVenue} className="bg-red-600 hover:bg-red-700">
              Yes, block venue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
