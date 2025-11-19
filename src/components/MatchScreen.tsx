import { motion } from 'framer-motion';
import { Venue } from '@/types/session';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Navigation, Share2, PartyPopper, DollarSign } from 'lucide-react';

interface MatchScreenProps {
  venue: Venue;
  onClose: () => void;
}

export default function MatchScreen({ venue, onClose }: MatchScreenProps) {
  const handleGetDirections = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${venue.lat},${venue.lng}`;
    window.open(url, '_blank');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'We found a match!',
        text: `Let's meet at ${venue.name}!`,
        url: window.location.href,
      });
    }
  };

  const getPriceLevelDisplay = (level?: number) => {
    if (!level) return null;
    return '$'.repeat(level);
  };

  const formatCategory = (category: string) => {
    return category
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring' }}
        className="w-full max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="border-none shadow-2xl bg-white overflow-hidden">
          {/* Celebration Header */}
          <div className="bg-gradient-to-r from-rose-500 to-orange-500 p-8 text-center text-white relative overflow-hidden">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="mb-4"
            >
              <PartyPopper className="w-16 h-16 mx-auto" />
            </motion.div>
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-4xl font-bold mb-2"
            >
              It's a Match!
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-white/90"
            >
              Everyone approved this venue
            </motion.p>

            {/* Decorative confetti */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: -100, opacity: 0 }}
                  animate={{ y: 500, opacity: [0, 1, 0] }}
                  transition={{
                    delay: Math.random() * 0.5,
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: Math.random() * 2,
                  }}
                  className="absolute text-2xl"
                  style={{
                    left: `${Math.random() * 100}%`,
                  }}
                >
                  {['🎉', '✨', '🎊', '⭐'][Math.floor(Math.random() * 4)]}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Venue Details */}
          <div className="p-8">
            <div className="relative h-64 rounded-lg overflow-hidden mb-6 bg-gradient-to-br from-gray-200 to-gray-300">
              <img
                src={venue.photoUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80'}
                alt={venue.name}
                className="w-full h-full object-cover"
              />
              
              {/* Rating & Price Badges */}
              <div className="absolute top-4 right-4 flex gap-2">
                {venue.rating && (
                  <div className="bg-white/95 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold text-sm text-gray-900">{venue.rating.toFixed(1)}</span>
                  </div>
                )}
                {venue.priceLevel && (
                  <div className="bg-white/95 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="font-bold text-sm text-gray-900">{getPriceLevelDisplay(venue.priceLevel)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{venue.name}</h3>
                <div className="flex items-center text-gray-600 gap-2">
                  <MapPin className="w-5 h-5" />
                  <span>{venue.address}</span>
                </div>
                {venue.distance && (
                  <div className="flex items-center text-gray-600 gap-2 mt-1">
                    <span className="text-sm">{venue.distance.toFixed(1)} km from midpoint</span>
                  </div>
                )}
              </div>

              {venue.types && venue.types.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {venue.types.slice(0, 5).map((type, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-gradient-to-r from-rose-50 to-pink-50 text-rose-700 border-rose-200"
                    >
                      {formatCategory(type)}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleGetDirections}
                  className="flex-1 h-12 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-semibold"
                >
                  <Navigation className="w-5 h-5 mr-2" />
                  Get Directions
                </Button>
                {navigator.share && (
                  <Button
                    onClick={handleShare}
                    variant="outline"
                    className="h-12 px-6 border-2"
                  >
                    <Share2 className="w-5 h-5" />
                  </Button>
                )}
              </div>

              <Button
                onClick={onClose}
                variant="ghost"
                className="w-full h-12"
              >
                Close
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}