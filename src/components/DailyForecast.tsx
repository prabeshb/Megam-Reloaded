import React from 'react';
import { DailyForecast as DailyItem, PrimaryUnit } from '../types/weather';
import { WeatherIcon } from './WeatherIcons';
import { Calendar } from 'lucide-react';

interface DailyForecastProps {
  daily: DailyItem[];
  primaryUnit: PrimaryUnit;
}

export const DailyForecast: React.FC<DailyForecastProps> = ({ daily, primaryUnit }) => {
  if (!daily || daily.length === 0) return null;

  const isCelsiusPrimary = primaryUnit === 'C';

  return (
    <div className="px-4 mb-4">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2.5">
        <Calendar size={14} className="text-sky-500" />
        <span>7-Day Forecast</span>
      </div>

      <div className="flex flex-col gap-2 rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 p-2.5">
        {daily.map((item, idx) => {
          const maxPrimary = isCelsiusPrimary ? `${item.maxTempC}°C` : `${item.maxTempF}°F`;
          const maxSecondary = isCelsiusPrimary ? `${item.maxTempF}°F` : `${item.maxTempC}°C`;
          const minPrimary = isCelsiusPrimary ? `${item.minTempC}°C` : `${item.minTempF}°F`;
          const minSecondary = isCelsiusPrimary ? `${item.minTempF}°F` : `${item.minTempC}°C`;

          return (
            <div
              key={item.date}
              className={`flex items-center justify-between py-2.5 px-3 rounded-xl transition-colors ${
                item.isToday
                  ? 'bg-sky-50/70 dark:bg-sky-950/40'
                  : 'hover:bg-slate-100/40 dark:hover:bg-slate-700/30'
              } ${idx !== daily.length - 1 ? 'border-b border-slate-100 dark:border-slate-700/40' : ''}`}
            >
              {/* Day Name & Icon */}
              <div className="flex items-center gap-3 w-32 shrink-0">
                <WeatherIcon code={item.conditionCode} size={22} className="shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span
                    className={`text-xs font-semibold truncate ${
                      item.isToday ? 'text-sky-600 dark:text-sky-400' : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {item.dayName}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {item.condition}
                  </span>
                </div>
              </div>

              {/* Rain Probability badge */}
              <div className="w-12 text-center shrink-0">
                {item.popPercent > 10 ? (
                  <span className="text-[11px] font-semibold text-sky-600 dark:text-sky-400">
                    {item.popPercent}%
                  </span>
                ) : null}
              </div>

              {/* Dual High & Low Temperatures with Visual Hierarchy */}
              <div className="flex items-center justify-end gap-2 text-right">
                {/* High Temp */}
                <div className="flex items-baseline gap-1">
                  <span className="text-xs font-bold tabular-nums text-slate-900 dark:text-white">
                    {maxPrimary}
                  </span>
                  <span className="text-[10px] font-normal tabular-nums text-slate-500/70 dark:text-slate-400/60">
                    · {maxSecondary}
                  </span>
                </div>

                <span className="text-slate-300 dark:text-slate-600 font-light text-xs">/</span>

                {/* Low Temp */}
                <div className="flex items-baseline gap-1">
                  <span className="text-xs font-medium tabular-nums text-slate-600 dark:text-slate-300">
                    {minPrimary}
                  </span>
                  <span className="text-[10px] font-normal tabular-nums text-slate-400/70 dark:text-slate-500/60">
                    · {minSecondary}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
