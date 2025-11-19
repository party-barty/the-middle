import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Venue } from '@/types/session';
import VenueCard from './VenueCard';
import { Button } from '@/components/ui/button';
import { X, Heart } from 'lucide-react';

interface SwipeDeckProps {
  venues: Venue[];
  onVote: (venueId: string, approved: boolean) => void;
}

export default function SwipeDeck({ venues, onVote }: SwipeDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSwipe = (approved: boolean) => {
    if (currentIndex < venues.length) {
      onVote(venues[currentIndex].id, approved);
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const currentVenue = venues[currentIndex];

  if (!currentVenue) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
        <div className="text-center p-8">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No more venues</h3>
          <p className="text-gray-500">
            You've reviewed all available venues. Waiting for others to vote...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full flex flex-col">
      {/* Progress */}
      <div className="mb-4 px-4">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>
            {currentIndex + 1} of {venues.length}
          </span>
          <span>{venues.length - currentIndex - 1} remaining</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-rose-500 to-orange-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / venues.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Card Stack */}
      <div className="flex-1 relative px-4">
        <AnimatePresence>
          {currentVenue && (
            <VenueCard
              key={currentVenue.id}
              venue={currentVenue}
              onSwipe={handleSwipe}
            />
          )}
        </AnimatePresence>

        {/* Next card preview */}
        {venues[currentIndex + 1] && (
          <div className="absolute inset-0 -z-10 scale-95 opacity-50 pointer-events-none px-4">
            <div className="h-full w-full bg-white rounded-lg shadow-xl" />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-6 p-6">
        <Button
          onClick={() => handleSwipe(false)}
          size="lg"
          variant="outline"
          className="w-16 h-16 rounded-full border-2 border-red-200 hover:bg-red-50 hover:border-red-300 transition-all"
        >
          <X className="w-8 h-8 text-red-500" />
        </Button>
        <Button
          onClick={() => handleSwipe(true)}
          size="lg"
          className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg"
        >
          <Heart className="w-8 h-8 text-white" />
        </Button>
      </div>
    </div>
  );
}
