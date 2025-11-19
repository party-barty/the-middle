import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Venue } from '@/types/session';
import { Star, MapPin, DollarSign, Heart, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface VenueCardProps {
  venue: Venue;
  onSwipe: (approved: boolean) => void;
  style?: React.CSSProperties;
}

export default function VenueCard({ venue, onSwipe, style }: VenueCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-20, 20]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
  
  // Like/Pass overlay opacity
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const passOpacity = useTransform(x, [-100, 0], [1, 0]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 100) {
      onSwipe(info.offset.x > 0);
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
      style={{
        x,
        rotate,
        opacity,
        ...style,
      }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      dragElastic={0.7}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
    >
      <Card className="h-full w-full overflow-hidden shadow-2xl border-none bg-white rounded-2xl">
        {/* Image */}
        <div className="relative h-72 bg-gradient-to-br from-gray-200 to-gray-300">
          <img
            src={venue.photoUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80'}
            alt={venue.name}
            className="w-full h-full object-cover"
          />
          
          {/* Like Overlay */}
          <motion.div
            style={{ opacity: likeOpacity }}
            className="absolute inset-0 bg-green-500/20 backdrop-blur-sm flex items-center justify-center pointer-events-none"
          >
            <div className="bg-green-500 text-white px-8 py-4 rounded-full font-bold text-2xl rotate-12 border-4 border-white shadow-2xl flex items-center gap-2">
              <Heart className="w-8 h-8 fill-white" />
              LIKE
            </div>
          </motion.div>

          {/* Pass Overlay */}
          <motion.div
            style={{ opacity: passOpacity }}
            className="absolute inset-0 bg-red-500/20 backdrop-blur-sm flex items-center justify-center pointer-events-none"
          >
            <div className="bg-red-500 text-white px-8 py-4 rounded-full font-bold text-2xl -rotate-12 border-4 border-white shadow-2xl flex items-center gap-2">
              <X className="w-8 h-8" />
              PASS
            </div>
          </motion.div>
          
          {/* Rating Badge */}
          {venue.rating && (
            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-bold text-sm text-gray-900">{venue.rating.toFixed(1)}</span>
            </div>
          )}

          {/* Price Level Badge */}
          {venue.priceLevel && (
            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="font-bold text-sm text-gray-900">{getPriceLevelDisplay(venue.priceLevel)}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2 line-clamp-2">{venue.name}</h3>
            <div className="flex items-center text-gray-600 gap-2">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">
                {venue.distance ? `${venue.distance.toFixed(1)} km away` : 'Distance unknown'}
              </span>
            </div>
          </div>

          <p className="text-gray-600 text-sm line-clamp-2">{venue.address}</p>

          {venue.types && venue.types.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {venue.types.slice(0, 4).map((type, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-gradient-to-r from-rose-50 to-pink-50 text-rose-700 border-rose-200 hover:from-rose-100 hover:to-pink-100"
                >
                  {formatCategory(type)}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}