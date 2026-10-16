import React from 'react';
import { LocationInfo, FavoriteLocation } from '../types/weather';
import { Navigation, MapPin } from 'lucide-react';

interface LocationPagerIndicatorProps {
  currentLocation: LocationInfo;
  favorites: FavoriteLocation[];
  activePageIndex: number;
  onSelectPage: (index: number) => void;
}

export const LocationPagerIndicator: React.FC<LocationPagerIndicatorProps> = ({
  currentLocation,
  favorites,
  activePageIndex,
  onSelectPage,
}) => {
  // Page 0 is current location, Page 1..N are favorites
  const totalPages = 1 + favorites.length;

  return (
    <div className="px-4 py-2 flex items-center justify-center gap-1.5 overflow-x-auto no-scrollbar">
      {/* Current location page indicator */}
      <button
        onClick={() => onSelectPage(0)}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all shrink-0 ${
          activePageIndex === 0
            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
            : 'bg-white/40 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 hover:bg-white/70'
        }`}
        title="Current GPS location"
      >
        <Navigation size={11} className={activePageIndex === 0 ? 'fill-current' : ''} />
        <span className="truncate max-w-[90px]">{currentLocation.name}</span>
      </button>

      {/* Favorite locations */}
      {favorites.map((fav, idx) => {
        const pageIdx = idx + 1;
        const isActive = activePageIndex === pageIdx;

        return (
          <button
            key={fav.id}
            onClick={() => onSelectPage(pageIdx)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all shrink-0 ${
              isActive
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm font-semibold'
                : 'bg-white/40 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 hover:bg-white/70'
            }`}
            title={fav.name}
          >
            <MapPin size={11} />
            <span className="truncate max-w-[80px]">{fav.name}</span>
          </button>
        );
      })}

      {/* Page Dots if more than 3 locations */}
      {totalPages > 3 && (
        <div className="flex items-center gap-1 ml-1 shrink-0" aria-hidden="true">
          {Array.from({ length: totalPages }).map((_, i) => (
            <span
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                activePageIndex === i
                  ? 'bg-sky-500 w-3'
                  : 'bg-slate-300 dark:bg-slate-700'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
