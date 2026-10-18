import React from 'react';
import { Search, Star, Settings, RefreshCw, WifiOff, Layers, Share2 } from 'lucide-react';
import { formatStaleness } from '../services/weatherService';

interface WeatherHeaderProps {
  onOpenSearch: () => void;
  onOpenFavorites: () => void;
  onOpenSettings: () => void;
  onOpenWidgets: () => void;
  onOpenShare?: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  isOffline: boolean;
  favoritesCount: number;
  fetchedAt?: number;
}

export const WeatherHeader: React.FC<WeatherHeaderProps> = ({
  onOpenSearch,
  onOpenFavorites,
  onOpenSettings,
  onOpenWidgets,
  onOpenShare,
  onRefresh,
  isRefreshing,
  isOffline,
  favoritesCount,
  fetchedAt,
}) => {
  const stalenessText = fetchedAt ? formatStaleness(fetchedAt) : '';

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-2.5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-b border-slate-200/40 dark:border-slate-800/40 transition-colors">
      {/* Brand & Staleness / Offline */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
            Megam
          </span>
          {isOffline ? (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 text-[10px] font-semibold">
              <WifiOff size={11} />
              <span>Offline</span>
            </div>
          ) : (
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tabular-nums">
              {stalenessText}
            </span>
          )}
        </div>
      </div>

      {/* Action buttons (Touch target >= 44x44px) */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all"
          title="Refresh weather data"
          aria-label="Refresh weather data"
        >
          <RefreshCw size={17} className={isRefreshing ? 'animate-spin text-sky-500' : ''} />
        </button>

        {onOpenShare && (
          <button
            onClick={onOpenShare}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all"
            title="Share weather or app"
            aria-label="Share weather or app"
          >
            <Share2 size={17} />
          </button>
        )}

        <button
          onClick={onOpenWidgets}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all"
          title="Android Home Screen Widgets"
          aria-label="Android Home Screen Widgets"
        >
          <Layers size={17} />
        </button>

        <button
          onClick={onOpenSearch}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all"
          title="Search location"
          aria-label="Search location"
        >
          <Search size={17} />
        </button>

        <button
          onClick={onOpenFavorites}
          className="relative min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all"
          title="View favorite locations"
          aria-label="View favorite locations"
        >
          <Star size={17} />
          {favoritesCount > 0 && (
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-amber-400" />
          )}
        </button>

        <button
          onClick={onOpenSettings}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all"
          title="Settings"
          aria-label="Settings"
        >
          <Settings size={17} />
        </button>
      </div>
    </header>
  );
};
