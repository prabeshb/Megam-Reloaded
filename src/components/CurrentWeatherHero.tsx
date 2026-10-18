import React from 'react';
import { CurrentWeather, DailyForecast, LocationInfo, PrimaryUnit } from '../types/weather';
import { WeatherIcon } from './WeatherIcons';
import { MapPin, ArrowUp, ArrowDown, Clock, Share2 } from 'lucide-react';

interface CurrentWeatherHeroProps {
  location: LocationInfo;
  current: CurrentWeather;
  todayForecast?: DailyForecast;
  primaryUnit: PrimaryUnit;
  onOpenSearch: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onOpenShare?: () => void;
  timezone?: string;
  utcOffsetSeconds?: number;
}

export const CurrentWeatherHero: React.FC<CurrentWeatherHeroProps> = ({
  location,
  current,
  todayForecast,
  primaryUnit,
  onOpenSearch,
  isFavorite,
  onToggleFavorite,
  onOpenShare,
  timezone,
  utcOffsetSeconds,
}) => {
  const isCelsiusPrimary = primaryUnit === 'C';
  const primaryTemp = isCelsiusPrimary ? `${current.tempC}°C` : `${current.tempF}°F`;
  const secondaryTemp = isCelsiusPrimary ? `${current.tempF}°F` : `${current.tempC}°C`;

  const primaryFeelsLike = isCelsiusPrimary ? `${current.feelsLikeC}°C` : `${current.feelsLikeF}°F`;
  const secondaryFeelsLike = isCelsiusPrimary ? `${current.feelsLikeF}°F` : `${current.feelsLikeC}°C`;

  const formatDestinationLocalTime = (): string => {
    try {
      if (timezone) {
        return new Intl.DateTimeFormat('en-US', {
          timeZone: timezone,
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }).format(new Date());
      }
      if (typeof utcOffsetSeconds === 'number') {
        const utcMs = Date.now() + new Date().getTimezoneOffset() * 60000;
        const destDate = new Date(utcMs + utcOffsetSeconds * 1000);
        return destDate.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });
      }
    } catch {
      // Fallback to device local time if timezone string is unrecognized
    }
    return new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const localTimeStr = formatDestinationLocalTime();

  const formatHighLow = (maxC: number, maxF: number, minC: number, minF: number) => {
    if (isCelsiusPrimary) {
      return {
        highPrimary: `${maxC}°C`,
        highSecondary: `${maxF}°F`,
        lowPrimary: `${minC}°C`,
        lowSecondary: `${minF}°F`,
      };
    }
    return {
      highPrimary: `${maxF}°F`,
      highSecondary: `${maxC}°C`,
      lowPrimary: `${minF}°F`,
      lowSecondary: `${minC}°C`,
    };
  };

  const hl = todayForecast
    ? formatHighLow(
        todayForecast.maxTempC,
        todayForecast.maxTempF,
        todayForecast.minTempC,
        todayForecast.minTempF
      )
    : null;

  return (
    <div className="flex flex-col items-center text-center px-4 pt-1 pb-4">
      {/* City Title & Location Tap Trigger */}
      <div className="flex items-center justify-center gap-2 mb-1 group">
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-1.5 text-slate-800 dark:text-white font-semibold text-xl tracking-tight hover:opacity-80 active:scale-95 transition-all text-left"
          title="Change location"
        >
          <MapPin size={18} className="text-sky-500 shrink-0" />
          <span className="truncate max-w-[200px] sm:max-w-[260px]">{location.name}</span>
          {location.country && (
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400 shrink-0">
              {location.country}
            </span>
          )}
        </button>

        <button
          onClick={onToggleFavorite}
          className={`p-1.5 rounded-full transition-colors ${
            isFavorite
              ? 'text-amber-400 hover:text-amber-500'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <svg
            className="w-5 h-5 fill-current"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={isFavorite ? 0 : 2}
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>

        {onOpenShare && (
          <button
            onClick={onOpenShare}
            className="p-1.5 rounded-full text-slate-400 hover:text-sky-500 dark:hover:text-sky-400 transition-colors"
            title="Share place weather"
            aria-label="Share place weather"
          >
            <Share2 size={17} />
          </button>
        )}
      </div>

      {/* Destination Local Time Clock Pill */}
      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-1">
        <Clock size={11} className="text-sky-500 shrink-0" />
        <span>Local time · {localTimeStr}</span>
      </div>

      {/* Weather Condition Icon */}
      <div className="my-2 flex items-center justify-center">
        <div className="p-3 rounded-full bg-white/30 dark:bg-slate-800/40 backdrop-blur-md shadow-sm">
          <WeatherIcon code={current.conditionCode} isDay={current.isDay} size={64} />
        </div>
      </div>

      {/* Dual Temperature Visual Hierarchy (Primary 100% scale/opacity, Secondary 60% opacity) */}
      <div className="flex items-baseline justify-center gap-2 mb-1">
        <div className="text-5xl font-extrabold tracking-tight tabular-nums text-slate-900 dark:text-white">
          {primaryTemp}
        </div>
        <span className="text-2xl font-light text-slate-400 dark:text-slate-500" aria-hidden="true">
          ·
        </span>
        <div className="text-3xl font-bold tracking-tight tabular-nums text-slate-600/70 dark:text-slate-300/60">
          {secondaryTemp}
        </div>
      </div>

      {/* Condition Description */}
      <div className="text-base font-medium text-slate-800 dark:text-slate-200 capitalize mb-1.5">
        {current.condition}
      </div>

      {/* Feels Like & High/Low Unboxed Metadata */}
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-slate-600 dark:text-slate-400 font-medium">
        <span>
          Feels like {primaryFeelsLike} <span className="opacity-60 font-normal">({secondaryFeelsLike})</span>
        </span>
        {hl && (
          <>
            <span aria-hidden="true">·</span>
            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <span className="flex items-center text-rose-500">
                <ArrowUp size={13} className="inline mr-0.5" />
                <span className="font-bold">{hl.highPrimary}</span>
                <span className="text-rose-400/70 font-normal ml-0.5 text-[11px]">({hl.highSecondary})</span>
              </span>
              <span className="text-slate-400 dark:text-slate-600">/</span>
              <span className="flex items-center text-sky-500">
                <ArrowDown size={13} className="inline mr-0.5" />
                <span className="font-bold">{hl.lowPrimary}</span>
                <span className="text-sky-400/70 font-normal ml-0.5 text-[11px]">({hl.lowSecondary})</span>
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
