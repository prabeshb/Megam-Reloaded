import React from 'react';
import { CurrentWeather } from '../types/weather';
import {
  Droplets,
  Wind,
  Sunrise,
  Gauge,
  TrendingUp,
  TrendingDown,
  MoveRight,
  Sun,
  Leaf,
} from 'lucide-react';

interface QuickMetricsGridProps {
  current: CurrentWeather;
}

export const QuickMetricsGrid: React.FC<QuickMetricsGridProps> = ({ current }) => {
  const getPressureTrendMeta = () => {
    switch (current.pressureTrend) {
      case 'rising':
        return {
          icon: TrendingUp,
          color: 'text-emerald-500',
          label: 'Rising (Clear skies)',
          arrow: '↗',
        };
      case 'falling':
        return {
          icon: TrendingDown,
          color: 'text-rose-500',
          label: 'Falling (Storm warning)',
          arrow: '↘',
        };
      default:
        return {
          icon: MoveRight,
          color: 'text-slate-400',
          label: 'Steady',
          arrow: '→',
        };
    }
  };

  const getUvBadgeMeta = (uv: number) => {
    if (uv >= 8) {
      return {
        label: 'Very High',
        badgeClass: 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400',
      };
    }
    if (uv >= 6) {
      return {
        label: 'High',
        badgeClass: 'bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400',
      };
    }
    if (uv >= 3) {
      return {
        label: 'Mod',
        badgeClass: 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
      };
    }
    return {
      label: 'Low',
      badgeClass: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
    };
  };

  const getAqiBadgeMeta = (aqi: number) => {
    if (aqi > 150) {
      return {
        label: 'Unhealthy',
        badgeClass: 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400',
      };
    }
    if (aqi > 100) {
      return {
        label: 'Sensitive',
        badgeClass: 'bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400',
      };
    }
    if (aqi > 50) {
      return {
        label: 'Moderate',
        badgeClass: 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
      };
    }
    return {
      label: 'Good',
      badgeClass: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
    };
  };

  const trend = getPressureTrendMeta();
  const TrendIcon = trend.icon;
  const uvValue = current.uvIndex ?? 0;
  const uvMeta = getUvBadgeMeta(uvValue);
  const aqiValue = current.aqi;
  const aqiMeta = getAqiBadgeMeta(aqiValue ?? 25);

  return (
    <div className="grid grid-cols-2 gap-2.5 px-4 mb-4">
      {/* Humidity */}
      <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50">
        <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 shrink-0">
          <Droplets size={20} />
        </div>
        <div className="min-w-0">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Humidity</div>
          <div className="text-base font-bold tabular-nums text-slate-800 dark:text-slate-100">
            {current.humidity}%
          </div>
        </div>
      </div>

      {/* Wind Speed (Dual Units km/h and mph) */}
      <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50">
        <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 shrink-0">
          <Wind size={20} />
        </div>
        <div className="min-w-0">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Wind Speed</div>
          <div className="text-xs font-bold tabular-nums text-slate-800 dark:text-slate-100 truncate">
            {current.windSpeedKmh} km/h <span className="font-normal text-slate-500">·</span> {current.windSpeedMph} mph
          </div>
        </div>
      </div>

      {/* UV Index with Low/Mod/High/Very High color badge */}
      <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50">
        <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 shrink-0">
          <Sun size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">UV Index</span>
            <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold ${uvMeta.badgeClass}`}>
              {uvMeta.label}
            </span>
          </div>
          <div className="text-xs font-bold tabular-nums text-slate-800 dark:text-slate-100 truncate">
            UV {uvValue}
          </div>
        </div>
      </div>

      {/* Air Quality (US AQI / PM2.5) */}
      <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50">
        <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 shrink-0">
          <Leaf size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Air Quality</span>
            <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold ${aqiMeta.badgeClass}`}>
              {aqiMeta.label}
            </span>
          </div>
          <div className="text-xs font-bold tabular-nums text-slate-800 dark:text-slate-100 truncate">
            {aqiValue !== undefined ? `${aqiValue} AQI` : '25 AQI'}
            {current.pm25 !== undefined && (
              <span className="text-[10px] font-normal text-slate-400 ml-1">
                ({current.pm25} µg/m³)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Sunrise & Sunset */}
      <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50">
        <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 shrink-0">
          <Sunrise size={20} />
        </div>
        <div className="min-w-0">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Sunrise / Sunset</div>
          <div className="text-xs font-semibold tabular-nums text-slate-800 dark:text-slate-100 truncate">
            {current.sunrise} / {current.sunset}
          </div>
        </div>
      </div>

      {/* Barometric Pressure with Trend Arrow */}
      <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50">
        <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 shrink-0">
          <Gauge size={20} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Pressure</span>
            <span className={`text-[11px] font-bold ${trend.color} flex items-center gap-0.5`} title={trend.label}>
              <TrendIcon size={12} />
              <span>{trend.arrow}</span>
            </span>
          </div>
          <div className="text-xs font-bold tabular-nums text-slate-800 dark:text-slate-100 truncate">
            {current.surfacePressure || 1013} hPa
            <span className="text-[10px] font-normal text-slate-400 ml-1">({trend.label.split(' ')[0]})</span>
          </div>
        </div>
      </div>
    </div>
  );
};
