import React, { useState, useEffect, useRef } from 'react';
import { GeocodingResult, LocationInfo } from '../types/weather';
import { searchLocations } from '../services/weatherService';
import { Search, X, Navigation, MapPin, Loader2 } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (location: LocationInfo) => void;
  onDetectLocation: () => void;
  isDetectingLocation: boolean;
}

const POPULAR_CITIES: LocationInfo[] = [
  { name: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503 },
  { name: 'London', country: 'United Kingdom', lat: 51.5074, lon: -0.1278 },
  { name: 'New York', country: 'United States', admin: 'New York', lat: 40.7128, lon: -74.006 },
  { name: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522 },
  { name: 'Sydney', country: 'Australia', lat: -33.8688, lon: 151.2093 },
  { name: 'Dubai', country: 'United Arab Emirates', lat: 25.2048, lon: 55.2708 },
];

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectLocation,
  onDetectLocation,
  isDetectingLocation,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await searchLocations(query);
        setResults(data);
      } finally {
        setIsLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className="relative w-full sm:max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header and Input Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Find Location</h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          <div className="relative flex items-center">
            <Search size={18} className="absolute left-3.5 text-slate-400 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search city, region, or country..."
              className="w-full h-11 pl-10 pr-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {/* GPS Current Location Option */}
        <div className="p-2 border-b border-slate-100 dark:border-slate-800">
          <button
            onClick={() => {
              onDetectLocation();
              onClose();
            }}
            disabled={isDetectingLocation}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-sky-50 dark:hover:bg-slate-800/80 transition-colors group"
          >
            <div className="p-2 rounded-lg bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 group-hover:scale-105 transition-transform">
              {isDetectingLocation ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Navigation size={18} />
              )}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-slate-900 dark:text-white">
                {isDetectingLocation ? 'Locating device...' : 'Use Current GPS Location'}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Detect coordinates via browser geolocation
              </div>
            </div>
          </button>
        </div>

        {/* Content list: Results or Popular */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-400">
              <Loader2 size={24} className="animate-spin mb-2 text-sky-500" />
              <span className="text-xs">Searching global weather stations...</span>
            </div>
          ) : results.length > 0 ? (
            <div>
              <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 py-1.5">
                Search Results
              </div>
              {results.map((res) => (
                <button
                  key={`${res.id}-${res.latitude}-${res.longitude}`}
                  onClick={() => {
                    onSelectLocation({
                      name: res.name,
                      country: res.country || res.country_code || '',
                      admin: res.admin1,
                      lat: res.latitude,
                      lon: res.longitude,
                      isCurrentLocation: false,
                    });
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <MapPin size={16} className="text-slate-400 group-hover:text-sky-500 transition-colors shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {res.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {res.admin1 ? `${res.admin1}, ` : ''}{res.country}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 tabular-nums shrink-0">
                    {res.latitude.toFixed(1)}°, {res.longitude.toFixed(1)}°
                  </span>
                </button>
              ))}
            </div>
          ) : query.trim().length >= 2 ? (
            <div className="text-center py-8 text-slate-400">
              <p className="text-xs">No matching locations found for "{query}".</p>
              <p className="text-[11px] mt-1 text-slate-500">Check spelling or try a major nearby city.</p>
            </div>
          ) : (
            <div>
              <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 py-1.5">
                Popular Cities
              </div>
              {POPULAR_CITIES.map((city) => (
                <button
                  key={city.name}
                  onClick={() => {
                    onSelectLocation({ ...city, isCurrentLocation: false });
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <MapPin size={15} className="text-slate-400" />
                    <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                      {city.name}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {city.country}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
