import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Venue } from '@/types/session';
import VenueCard from './VenueCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Heart, RotateCcw } from 'lucide-react';

interface SwipeDeckProps {
  venues: Venue[];
  onVote: (venueId: string, approved: boolean) => void;
}

export default function SwipeDeck({ venues, onVote }: SwipeDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [history, setHistory] = useState<Array<{ venueId: string; approved: boolean }>>([]);

  const handleSwipe = (approved: boolean) => {
    if (currentIndex < venues.length) {
      const venue = venues[currentIndex];
      onVote(venue.id, approved);
      setHistory([...history, { venueId: venue.id, approved }]);
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleUndo = () => {
    if (history.length > 0 && currentIndex > 0) {
      const lastVote = history[history.length - 1];
      // Record opposite vote to cancel out
      onVote(lastVote.venueId, !lastVote.approved);
      setHistory(history.slice(0, -1));
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const currentVenue = venues[currentIndex];
  const nextVenue = venues[currentIndex + 1];

  if (!currentVenue) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
        <div className="text-center p-8">
          <div className="w-20 h-20 bg-gradient-to-br from-rose-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-10 h-10 text-rose-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">All done!</h3>
          <p className="text-gray-500">
            You've reviewed all available venues. Waiting for others to vote...
          </p>
          <div className="mt-6">
            <Badge variant="secondary" className="text-sm px-4 py-2">
              {venues.length} venues reviewed
            </Badge>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Progress Bar */}
      <div className="p-4 bg-white/80 backdrop-blur border-b border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span className="font-semibold">
            {currentIndex + 1} of {venues.length}
          </span>
          <span className="text-gray-500">{venues.length - currentIndex - 1} remaining</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-rose-500 via-pink-500 to-orange-500 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((currentIndex + 1) / venues.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Card Stack */}
      <div className="flex-1 relative p-4">
        {/* Next card preview (behind) */}
        {nextVenue && (
          <div className="absolute inset-4 scale-95 opacity-40 pointer-events-none">
            <div className="h-full w-full bg-white rounded-2xl shadow-xl border border-gray-200" />
          </div>
        )}

        {/* Current card */}
        <AnimatePresence mode="wait">
          {currentVenue && (
            <VenueCard
              key={currentVenue.id}
              venue={currentVenue}
              onSwipe={handleSwipe}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="p-6 bg-white/80 backdrop-blur border-t border-gray-200">
        <div className="flex justify-center items-center gap-4">
          {/* Undo Button */}
          <Button
            onClick={handleUndo}
            disabled={history.length === 0}
            size="lg"
            variant="outline"
            className="w-14 h-14 rounded-full border-2 border-gray-300 hover:bg-gray-100 hover:border-gray-400 transition-all disabled:opacity-30"
          >
            <RotateCcw className="w-5 h-5 text-gray-600" />
          </Button>

          {/* Pass Button */}
          <Button
            onClick={() => handleSwipe(false)}
            size="lg"
            variant="outline"
            className="w-16 h-16 rounded-full border-2 border-red-200 hover:bg-red-50 hover:border-red-400 hover:scale-110 transition-all shadow-lg"
          >
            <X className="w-8 h-8 text-red-500" />
          </Button>

          {/* Like Button */}
          <Button
            onClick={() => handleSwipe(true)}
            size="lg"
            className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 hover:scale-110 transition-all shadow-lg"
          >
            <Heart className="w-8 h-8 text-white fill-white" />
          </Button>
        </div>

        {/* Swipe Hints */}
        <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
          <span>← Swipe left to pass</span>
          <span>Swipe right to like →</span>
        </div>
      </div>
    </div>
  );
}