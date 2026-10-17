/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  LocationInfo,
  WeatherData,
  FavoriteLocation,
  AppSettings,
} from './types/weather';
import {
  fetchWeather,
  getSavedFavorites,
  saveFavorites,
  getSavedSettings,
  saveSettings,
  reverseGeocode,
  getLastSavedLocation,
  getWmoConditionMeta,
} from './services/weatherService';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { MobileFrame } from './components/MobileFrame';
import { WeatherHeader } from './components/WeatherHeader';
import { LocationPagerIndicator } from './components/LocationPagerIndicator';
import { YesterdayComparisonBanner } from './components/YesterdayComparisonBanner';
import { CurrentWeatherHero } from './components/CurrentWeatherHero';
import { NextHourRainBar } from './components/NextHourRainBar';
import { QuickMetricsGrid } from './components/QuickMetricsGrid';
import { HourlyForecast } from './components/HourlyForecast';
import { GoldenHourCard } from './components/GoldenHourCard';
import { DailyForecast } from './components/DailyForecast';
import { PullToRefresh } from './components/PullToRefresh';
import { SearchModal } from './components/SearchModal';
import { FavoritesDrawer } from './components/FavoritesDrawer';
import { SettingsModal } from './components/SettingsModal';
import { WidgetPreviewModal } from './components/WidgetPreviewModal';
import { SevereAlertBanner } from './components/SevereAlertBanner';
import { Loader2, AlertCircle, WifiOff } from 'lucide-react';

const DEFAULT_LOCATION: LocationInfo = {
  name: 'New York',
  country: 'United States',
  admin: 'New York',
  lat: 40.7128,
  lon: -74.006,
  isCurrentLocation: false,
};

export default function App() {
  const isOnline = useOnlineStatus();
  const [settings, setSettings] = useState<AppSettings>(getSavedSettings);
  const [favorites, setFavorites] = useState<FavoriteLocation[]>(getSavedFavorites);

  // Current detected GPS location (page 0)
  const [currentGpsLocation, setCurrentGpsLocation] = useState<LocationInfo>(() => {
    return getLastSavedLocation() || DEFAULT_LOCATION;
  });

  // Pager index: 0 = GPS / Current Location; 1..N = favorites
  const [activePageIndex, setActivePageIndex] = useState<number>(0);

  // Active viewing location determined by pager
  const activeLocation = useMemo<LocationInfo>(() => {
    if (activePageIndex === 0) return currentGpsLocation;
    const fav = favorites[activePageIndex - 1];
    if (fav) {
      return {
        name: fav.name,
        country: fav.country,
        admin: fav.admin,
        lat: fav.lat,
        lon: fav.lon,
        isCurrentLocation: false,
      };
    }
    return currentGpsLocation;
  }, [activePageIndex, currentGpsLocation, favorites]);

  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal navigation states
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isWidgetPreviewOpen, setIsWidgetPreviewOpen] = useState(false);

  // Horizontal Swipe Pager Touch Handling
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);

  const handlePagerTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement | null;
    if (
      target?.closest('[data-no-page-swipe]') ||
      target?.closest('.overflow-x-auto') ||
      target?.closest('button') ||
      target?.closest('input')
    ) {
      touchStartX.current = -1;
      return;
    }
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handlePagerTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === -1) return;
    const target = e.target as HTMLElement | null;
    if (
      target?.closest('[data-no-page-swipe]') ||
      target?.closest('.overflow-x-auto') ||
      target?.closest('button') ||
      target?.closest('input')
    ) {
      touchStartX.current = -1;
      return;
    }

    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    touchStartX.current = -1;

    // Only trigger horizontal swipe if horizontal movement is dominant and intentional
    if (Math.abs(deltaX) > 70 && Math.abs(deltaX) > Math.abs(deltaY) * 2.0) {
      const totalPages = 1 + favorites.length;
      if (deltaX < 0 && activePageIndex < totalPages - 1) {
        // Swipe left -> Next location
        setActivePageIndex((prev) => prev + 1);
      } else if (deltaX > 0 && activePageIndex > 0) {
        // Swipe right -> Previous location
        setActivePageIndex((prev) => prev - 1);
      }
    }
  };

  // Apply Theme (light, dark, system)
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (systemPrefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [settings.theme]);

  // Load weather data for the currently active location
  const loadWeather = useCallback(
    async (loc: LocationInfo, showSpinner = true) => {
      if (showSpinner) setIsLoading(true);
      setErrorMessage(null);
      try {
        const data = await fetchWeather(
          loc,
          settings.openWeatherMapKey,
          settings.activityPreferences
        );
        setWeatherData(data);
      } catch (err: any) {
        console.error('Failed to load weather:', err);
        setErrorMessage(
          err?.message || 'Unable to load weather forecast. Using cached data if available.'
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [settings.openWeatherMapKey, settings.activityPreferences]
  );

  // Whenever activeLocation changes, load its weather
  useEffect(() => {
    loadWeather(activeLocation, !weatherData);
  }, [activeLocation, loadWeather]);

  // Detect GPS Location on launch (PRD v2 Section 10: Instant cache-first launch + async background GPS fix)
  const handleDetectGPS = useCallback(async () => {
    if (!navigator.geolocation) {
      loadWeather(currentGpsLocation);
      return;
    }

    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const geoInfo = await reverseGeocode(lat, lon);
          const detectedLoc: LocationInfo = {
            name: geoInfo.name,
            country: geoInfo.country,
            admin: geoInfo.admin,
            lat,
            lon,
            isCurrentLocation: true,
          };
          setCurrentGpsLocation(detectedLoc);
          if (activePageIndex === 0) {
            await loadWeather(detectedLoc, false);
          }
        } catch (e) {
          console.warn('Error processing detected location', e);
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (err) => {
        console.warn('Geolocation denied or timed out:', err.message);
        setIsDetectingLocation(false);
      },
      { timeout: 8000, enableHighAccuracy: false }
    );
  }, [currentGpsLocation, activePageIndex, loadWeather]);

  // Initial mount: load cached data instantly, then trigger async GPS
  useEffect(() => {
    handleDetectGPS();
  }, []);

  // Periodic Background Pre-Fetching (PRD v2: default OFF, configurable in Settings)
  useEffect(() => {
    if (!settings.autoRefreshEnabled) return;
    const intervalMs = (settings.autoRefreshIntervalMinutes || 30) * 60 * 1000;
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadWeather(activeLocation, false);
      }
    }, intervalMs);
    return () => clearInterval(interval);
  }, [settings.autoRefreshEnabled, settings.autoRefreshIntervalMinutes, activeLocation, loadWeather]);

  // Manual pull-to-refresh
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await loadWeather(activeLocation, false);
  };

  // Location selection from search modal
  const handleSelectLocation = (loc: LocationInfo) => {
    // Check if location matches an existing favorite
    const existingFavIdx = favorites.findIndex(
      (f) =>
        f.name.toLowerCase() === loc.name.toLowerCase() ||
        (Math.abs(f.lat - loc.lat) < 0.05 && Math.abs(f.lon - loc.lon) < 0.05)
    );

    if (existingFavIdx >= 0) {
      setActivePageIndex(existingFavIdx + 1);
    } else {
      // Set as current location or add to favorites
      setCurrentGpsLocation(loc);
      setActivePageIndex(0);
      loadWeather(loc, true);
    }
  };

  // Favorites management
  const isCurrentFavorite = useMemo(() => {
    return favorites.some(
      (f) =>
        f.name.toLowerCase() === activeLocation.name.toLowerCase() ||
        (Math.abs(f.lat - activeLocation.lat) < 0.05 &&
          Math.abs(f.lon - activeLocation.lon) < 0.05)
    );
  }, [favorites, activeLocation]);

  const handleToggleFavorite = () => {
    if (isCurrentFavorite) {
      const updated = favorites.filter(
        (f) =>
          f.name.toLowerCase() !== activeLocation.name.toLowerCase() &&
          !(
            Math.abs(f.lat - activeLocation.lat) < 0.05 &&
            Math.abs(f.lon - activeLocation.lon) < 0.05
          )
      );
      setFavorites(updated);
      saveFavorites(updated);
      if (activePageIndex > 0) setActivePageIndex(0);
    } else {
      const newFav: FavoriteLocation = {
        id: `fav_${Date.now()}`,
        name: activeLocation.name,
        country: activeLocation.country,
        admin: activeLocation.admin,
        lat: activeLocation.lat,
        lon: activeLocation.lon,
        addedAt: Date.now(),
      };
      const updated = [newFav, ...favorites];
      setFavorites(updated);
      saveFavorites(updated);
      // Switch to this new favorite
      setActivePageIndex(1);
    }
  };

  const handleRemoveFavorite = (id: string) => {
    const updated = favorites.filter((f) => f.id !== id);
    setFavorites(updated);
    saveFavorites(updated);
    if (activePageIndex > updated.length) {
      setActivePageIndex(0);
    }
  };

  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  // Dynamic Weather Condition theme for gradient background
  const themeType = useMemo(() => {
    if (!weatherData) return 'sunny';
    const meta = getWmoConditionMeta(
      weatherData.current.conditionCode,
      weatherData.current.isDay
    );
    return meta.themeType;
  }, [weatherData]);

  return (
    <MobileFrame themeType={themeType}>
      {/* Mobile Top App Bar with staleness timestamp */}
      <WeatherHeader
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenWidgets={() => setIsWidgetPreviewOpen(true)}
        onRefresh={handleManualRefresh}
        isRefreshing={isRefreshing}
        isOffline={!isOnline || !!weatherData?.isOfflineCached}
        favoritesCount={favorites.length}
        fetchedAt={weatherData?.fetchedAt}
      />

      {/* Horizontal Swipeable Pager Indicator (Current Location + Favorites) */}
      <LocationPagerIndicator
        currentLocation={currentGpsLocation}
        favorites={favorites}
        activePageIndex={activePageIndex}
        onSelectPage={(idx) => setActivePageIndex(idx)}
      />

      {/* Main Weather View with Pull-To-Refresh and Horizontal Swipe Pager Listener */}
      <div
        onTouchStart={handlePagerTouchStart}
        onTouchEnd={handlePagerTouchEnd}
        className="flex-1 flex flex-col overflow-hidden"
      >
        <PullToRefresh onRefresh={handleManualRefresh} isRefreshing={isRefreshing}>
          {isLoading && !weatherData ? (
            <div className="flex flex-col items-center justify-center min-h-[460px] text-slate-500 dark:text-slate-400 p-8">
              <Loader2 size={36} className="animate-spin text-sky-500 mb-3" />
              <p className="text-sm font-medium">Fetching local forecast...</p>
              <p className="text-xs text-slate-400 mt-1">Retrieving weather satellites & nowcasting</p>
            </div>
          ) : weatherData ? (
            <div className="flex flex-col pb-8">
              {/* Severe Weather Alert Banner (if enabled & active) */}
              <SevereAlertBanner
                alerts={weatherData.alerts}
                enabled={settings.severeAlertsEnabled}
              />

              {/* Offline cached notification banner */}
              {(!isOnline || weatherData.isOfflineCached) && (
                <div className="mx-4 mb-2.5 px-3 py-2 rounded-xl bg-amber-500/20 dark:bg-amber-500/30 border border-amber-500/40 text-amber-800 dark:text-amber-200 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <WifiOff size={14} className="shrink-0 text-amber-600 dark:text-amber-400" />
                    <span>Offline Mode: Displaying last known cached forecast</span>
                  </div>
                </div>
              )}

              {/* Yesterday Comparison Micro-Copy (PRD v2 Value-Add Feature) */}
              <YesterdayComparisonBanner comparison={weatherData.yesterdayComparison} />

              {/* Hero Card: City, Icon, Dual Temperatures with Primary/Secondary Hierarchy */}
              <CurrentWeatherHero
                location={weatherData.location}
                current={weatherData.current}
                todayForecast={weatherData.daily[0]}
                primaryUnit={settings.primaryUnit}
                onOpenSearch={() => setIsSearchOpen(true)}
                isFavorite={isCurrentFavorite}
                onToggleFavorite={handleToggleFavorite}
              />

              {/* 60-Minute Rain Bar Nowcasting (PRD v2 Value-Add Feature) */}
              <NextHourRainBar rainData={weatherData.nextHourRain} />

              {/* Quick Metrics: Humidity, Wind, Sunrise/Sunset, Pressure with Trend Arrow ↗ ↘ */}
              <QuickMetricsGrid current={weatherData.current} />

              {/* Hourly Forecast with Activity Window Highlights */}
              <HourlyForecast
                hourly={weatherData.hourly}
                primaryUnit={settings.primaryUnit}
                activityPrefs={settings.activityPreferences}
              />

              {/* Golden Hour & Blue Hour Calculator (PRD v2 Value-Add Feature) */}
              <GoldenHourCard windows={weatherData.astronomicalWindows} />

              {/* 7-Day Forecast with Primary/Secondary Dual Units */}
              <DailyForecast
                daily={weatherData.daily}
                primaryUnit={settings.primaryUnit}
              />

              {/* Transparent Data Attribution & Privacy Footer */}
              <div className="px-6 pt-2 pb-6 text-center">
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Data sourced via {weatherData.source} · Local On-Device Privacy
                </div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                  Megam Weather v2.0 · Fast, Lightweight Mobile App
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[460px] p-6 text-center">
              <AlertCircle size={36} className="text-rose-500 mb-2" />
              <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
                Unable to load weather
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4 max-w-xs">
                {errorMessage || 'Network connection failed. Please check your internet or search for a city.'}
              </p>
              <button
                onClick={() => loadWeather(activeLocation, true)}
                className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
              >
                Retry
              </button>
            </div>
          )}
        </PullToRefresh>
      </div>

      {/* Modals & Drawers */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectLocation={handleSelectLocation}
        onDetectLocation={handleDetectGPS}
        isDetectingLocation={isDetectingLocation}
      />

      <FavoritesDrawer
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        favorites={favorites}
        onSelectLocation={(loc) => {
          handleSelectLocation(loc);
        }}
        onRemoveFavorite={handleRemoveFavorite}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />

      <WidgetPreviewModal
        isOpen={isWidgetPreviewOpen}
        onClose={() => setIsWidgetPreviewOpen(false)}
        weatherData={weatherData}
        primaryUnit={settings.primaryUnit}
      />
    </MobileFrame>
  );
}
