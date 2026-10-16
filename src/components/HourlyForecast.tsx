import React from 'react';
import { HourlyForecast as HourlyItem, PrimaryUnit, ActivityPreferences } from '../types/weather';
import { WeatherIcon } from './WeatherIcons';
import { Clock, Zap } from 'lucide-react';

interface HourlyForecastProps {
  hourly: HourlyItem[];
  primaryUnit: PrimaryUnit;
  activityPrefs?: ActivityPreferences;
}

export const HourlyForecast: React.FC<HourlyForecastProps> = ({
  hourly,
  primaryUnit,
  activityPrefs,
}) => {
  if (!hourly || hourly.length === 0) return null;

  const isCelsiusPrimary = primaryUnit === 'C';
  const activityLabel = activityPrefs?.activityType === 'walk' ? 'Walk' : activityPrefs?.activityType === 'bike' ? 'Ride' : 'Run';

  return (
    <div className="px-4 mb-4">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          <Clock size={14} className="text-sky-500" />
          <span>Hourly Forecast</span>
        </div>
        {activityPrefs && (
          <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            <Zap size={12} className="fill-emerald-500 text-emerald-500" />
            <span>Best {activityLabel} Window</span>
          </div>
        )}
      </div>

      <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 snap-x snap-mandatory">
        {hourly.map((hour, idx) => {
          const primaryVal = isCelsiusPrimary ? `${hour.tempC}°C` : `${hour.tempF}°F`;
          const secondaryVal = isCelsiusPrimary ? `${hour.tempF}°F` : `${hour.tempC}°C`;

          return (
            <div
              key={idx}
              className={`flex flex-col items-center justify-between p-3 rounded-2xl backdrop-blur-md border min-w-[82px] shrink-0 snap-start transition-all ${
                hour.isActivityOptimal
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-400/50 dark:border-emerald-700/50 shadow-sm'
                  : 'bg-white/60 dark:bg-slate-800/60 border-slate-200/50 dark:border-slate-700/50'
              }`}
            >
              <div className="flex items-center gap-1">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {hour.hourLabel}
                </span>
                {hour.isActivityOptimal && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title={`Optimal ${activityLabel} window`} />
                )}
              </div>

              <div className="my-2">
                <WeatherIcon code={hour.conditionCode} isDay={hour.isDay} size={26} />
              </div>

              {hour.popPercent > 0 ? (
                <span className="text-[10px] font-semibold text-sky-600 dark:text-sky-400 mb-1">
                  {hour.popPercent}%
                </span>
              ) : (
                <span className="text-[10px] text-transparent mb-1" aria-hidden="true">
                  -
                </span>
              )}

              <div className="flex flex-col items-center text-center">
                <span className="text-xs font-bold tabular-nums text-slate-800 dark:text-slate-100">
                  {primaryVal}
                </span>
                <span className="text-[10px] font-normal tabular-nums text-slate-500/80 dark:text-slate-400/70">
                  {secondaryVal}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
