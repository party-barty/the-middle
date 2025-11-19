import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Venue } from '@/types/session';
import { Star, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface VenueCardProps {
  venue: Venue;
  onSwipe: (approved: boolean) => void;
  style?: React.CSSProperties;
}

export default function VenueCard({ venue, onSwipe, style }: VenueCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 100) {
      onSwipe(info.offset.x > 0);
    }
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
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
    >
      <Card className="h-full w-full overflow-hidden shadow-2xl border-none bg-white">
        {/* Image */}
        <div className="relative h-64 bg-gray-200">
          <img
            src={venue.photos[0]}
            alt={venue.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold text-sm">{venue.rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{venue.name}</h3>
            <div className="flex items-center text-gray-600 gap-2">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{venue.distance.toFixed(1)} km away</span>
            </div>
          </div>

          <p className="text-gray-600">{venue.address}</p>

          {venue.categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {venue.categories.slice(0, 3).map((category, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-rose-50 text-rose-700 rounded-full text-xs font-medium"
                >
                  {category.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          )}

          {/* Swipe Instructions */}
          <div className="pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-red-600 font-bold">←</span>
                </div>
                <span>Swipe left to pass</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Swipe right to like</span>
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-600 font-bold">→</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
