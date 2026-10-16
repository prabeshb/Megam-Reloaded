import React from 'react';
import { FavoriteLocation, LocationInfo } from '../types/weather';
import { Star, Trash2, X, MapPin } from 'lucide-react';

interface FavoritesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: FavoriteLocation[];
  onSelectLocation: (loc: LocationInfo) => void;
  onRemoveFavorite: (id: string) => void;
}

export const FavoritesDrawer: React.FC<FavoritesDrawerProps> = ({
  isOpen,
  onClose,
  favorites,
  onSelectLocation,
  onRemoveFavorite,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className="relative w-full sm:max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Star size={18} className="text-amber-400 fill-amber-400" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Favorite Locations
            </h3>
            <span className="text-xs text-slate-500 font-medium">({favorites.length})</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Favorites Simple List */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-2">
          {favorites.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Star size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                No saved favorites yet
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                Tap the star icon next to any city name to save it for quick one-tap access.
              </p>
            </div>
          ) : (
            favorites.map((fav) => (
              <div
                key={fav.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
              >
                <button
                  onClick={() => {
                    onSelectLocation({
                      name: fav.name,
                      country: fav.country,
                      admin: fav.admin,
                      lat: fav.lat,
                      lon: fav.lon,
                      isCurrentLocation: false,
                    });
                    onClose();
                  }}
                  className="flex-1 flex items-center gap-3 text-left min-w-0"
                >
                  <div className="p-2 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 shrink-0">
                    <MapPin size={16} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {fav.name}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {fav.admin ? `${fav.admin}, ` : ''}{fav.country}
                    </div>
                  </div>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFavorite(fav.id);
                  }}
                  className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  title="Remove from favorites"
                  aria-label="Remove favorite"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
