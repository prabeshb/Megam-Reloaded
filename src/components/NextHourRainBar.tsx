import React from 'react';
import { NextHourPrecipitation } from '../types/weather';
import { CloudRain } from 'lucide-react';

interface NextHourRainBarProps {
  rainData?: NextHourPrecipitation;
}

export const NextHourRainBar: React.FC<NextHourRainBarProps> = ({ rainData }) => {
  if (!rainData) return null;

  const { summaryText, minuteBars, hasRain, isLiveNowcast } = rainData;

  const getBarHeight = (intensityMm: number) => {
    if (intensityMm <= 0) return 'h-1.5 opacity-30';
    if (intensityMm < 1.0) return 'h-3';
    if (intensityMm < 2.5) return 'h-5';
    if (intensityMm < 4.0) return 'h-7';
    return 'h-9';
  };

  const getBarColor = (level: string) => {
    switch (level) {
      case 'heavy':
        return 'bg-indigo-600 dark:bg-indigo-400';
      case 'moderate':
        return 'bg-blue-500 dark:bg-sky-400';
      case 'light':
        return 'bg-sky-400 dark:bg-sky-300';
      default:
        return 'bg-slate-300 dark:bg-slate-700';
    }
  };

  return (
    <div
      data-no-page-swipe="true"
      onTouchStart={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
      className="px-4 mb-4 select-none"
    >
      <div className="p-3.5 rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5">
            <CloudRain size={15} className="text-sky-500 shrink-0" />
            <span className="text-xs font-semibold text-slate-800 dark:text-white">
              Next 60 Minutes
            </span>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
              isLiveNowcast
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-300/60 dark:border-emerald-700/60'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
          >
            {isLiveNowcast ? 'Live Radar Nowcast' : 'Hourly Trend Estimate'}
          </span>
        </div>
        <div className="text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-2">
          {summaryText}
        </div>

        {/* 60-Minute Bars */}
        <div className="mt-3">
          <div className="h-10 flex items-end justify-between gap-1 px-1">
            {minuteBars.map((bar) => (
              <div
                key={bar.minute}
                className="flex-1 flex flex-col items-center justify-end h-full group relative"
              >
                <div
                  className={`w-full rounded-sm transition-all duration-300 ${getBarHeight(
                    bar.intensityMm
                  )} ${getBarColor(bar.level)}`}
                  title={`${bar.minute}m: ${bar.intensityMm} mm/h`}
                />
              </div>
            ))}
          </div>

          {/* Minute Labels */}
          <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 px-0.5 tabular-nums">
            <span>Now</span>
            <span>15m</span>
            <span>30m</span>
            <span>45m</span>
            <span>60m</span>
          </div>
        </div>

        {/* Intensity Legend */}
        {hasRain && (
          <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/40 flex items-center justify-end gap-3 text-[10px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" /> Light
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Mod
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" /> Heavy
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
