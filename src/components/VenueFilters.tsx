import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Filter, X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export interface VenueFilterOptions {
  radius: number;
  types: string[];
  minRating: number;
  maxPriceLevel: number;
}

interface VenueFiltersProps {
  filters: VenueFilterOptions;
  onFiltersChange: (filters: VenueFilterOptions) => void;
  onApply: () => void;
}

const VENUE_TYPES = [
  { value: 'restaurant', label: '🍽️ Restaurants' },
  { value: 'cafe', label: '☕ Cafes' },
  { value: 'bar', label: '🍺 Bars' },
  { value: 'night_club', label: '🎵 Night Clubs' },
  { value: 'movie_theater', label: '🎬 Cinemas' },
  { value: 'park', label: '🌳 Parks' },
  { value: 'museum', label: '🏛️ Museums' },
  { value: 'shopping_mall', label: '🛍️ Shopping' },
];

export default function VenueFilters({ filters, onFiltersChange, onApply }: VenueFiltersProps) {
  const [open, setOpen] = useState(false);

  const toggleType = (type: string) => {
    const newTypes = filters.types.includes(type)
      ? filters.types.filter(t => t !== type)
      : [...filters.types, type];
    onFiltersChange({ ...filters, types: newTypes });
  };

  const handleApply = () => {
    onApply();
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="w-4 h-4" />
          Filters
          {filters.types.length > 0 && (
            <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
              {filters.types.length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filter Venues</SheetTitle>
          <SheetDescription>
            Customize your venue recommendations
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Search Radius */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Search Radius</Label>
            <div className="space-y-2">
              <Slider
                value={[filters.radius]}
                onValueChange={([value]) => onFiltersChange({ ...filters, radius: value })}
                min={500}
                max={5000}
                step={500}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span>0.5 km</span>
                <span className="font-semibold text-gray-900">{(filters.radius / 1000).toFixed(1)} km</span>
                <span>5 km</span>
              </div>
            </div>
          </div>

          {/* Venue Types */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Venue Types</Label>
            <div className="grid grid-cols-2 gap-2">
              {VENUE_TYPES.map(({ value, label }) => (
                <Button
                  key={value}
                  variant={filters.types.includes(value) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleType(value)}
                  className="justify-start"
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* Minimum Rating */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Minimum Rating</Label>
            <div className="space-y-2">
              <Slider
                value={[filters.minRating]}
                onValueChange={([value]) => onFiltersChange({ ...filters, minRating: value })}
                min={0}
                max={5}
                step={0.5}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span>Any</span>
                <span className="font-semibold text-gray-900">
                  {filters.minRating > 0 ? `${filters.minRating.toFixed(1)}+ ⭐` : 'Any rating'}
                </span>
                <span>5.0 ⭐</span>
              </div>
            </div>
          </div>

          {/* Max Price Level */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Maximum Price</Label>
            <div className="space-y-2">
              <Slider
                value={[filters.maxPriceLevel]}
                onValueChange={([value]) => onFiltersChange({ ...filters, maxPriceLevel: value })}
                min={1}
                max={4}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span>$</span>
                <span className="font-semibold text-gray-900">
                  {'$'.repeat(filters.maxPriceLevel)}
                </span>
                <span>$$$$</span>
              </div>
            </div>
          </div>

          {/* Apply Button */}
          <div className="pt-4 space-y-2">
            <Button onClick={handleApply} className="w-full" size="lg">
              Apply Filters
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                onFiltersChange({
                  radius: 2000,
                  types: ['restaurant', 'cafe', 'bar'],
                  minRating: 0,
                  maxPriceLevel: 4,
                });
              }}
              className="w-full"
            >
              Reset to Defaults
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
