import React from 'react';
import { CurrentWeather, HourlyForecast, PrimaryUnit } from '../types/weather';
import { cToF, kmhToMph } from '../services/weatherService';

interface WhatToWearStripProps {
  current: CurrentWeather;
  hourly: HourlyForecast[];
  primaryUnit: PrimaryUnit;
}

export interface RecommendationChip {
  id: string;
  emoji: string;
  text: string;
  tone: 'rain' | 'layer' | 'uv' | 'wind' | 'comfort';
}

export const WhatToWearStrip: React.FC<WhatToWearStripProps> = ({
  current,
  hourly,
  primaryUnit,
}) => {
  const next6Hours = (hourly || []).slice(0, 6);
  const chips: RecommendationChip[] = [];

  // 1. Umbrella Alert: POP >= 45% in the next 6 hours
  const rainyHour = next6Hours.find(
    (h) =>
      h.popPercent >= 45 ||
      (h.conditionCode >= 51 && h.conditionCode <= 67) ||
      (h.conditionCode >= 80 && h.conditionCode <= 82) ||
      h.conditionCode >= 95
  );
  if (rainyHour) {
    chips.push({
      id: 'umbrella',
      emoji: '☂️',
      text: `Bring an umbrella (Rain likely at ${rainyHour.hourLabel})`,
      tone: 'rain',
    });
  }

  // 2. Layering / Jacket Advice: temperature drops >= 5°C in the next 6 hours (or before 10 PM)
  let minHour: HourlyForecast | null = null;
  for (const h of next6Hours) {
    if (!minHour || h.tempC < minHour.tempC) {
      minHour = h;
    }
  }
  if (minHour && current.tempC - minHour.tempC >= 5) {
    chips.push({
      id: 'jacket-drop',
      emoji: '🧥',
      text: `Light jacket (Drops to ${minHour.tempC}°C / ${minHour.tempF}°F this evening)`,
      tone: 'layer',
    });
  } else if (current.tempC <= 8) {
    chips.push({
      id: 'warm-coat',
      emoji: '🧥',
      text: `Warm coat recommended (${current.tempC}°C / ${current.tempF}°F)`,
      tone: 'layer',
    });
  } else if (current.tempC <= 15) {
    chips.push({
      id: 'light-layer',
      emoji: '🧥',
      text: `Light sweater or jacket (${current.tempC}°C / ${current.tempF}°F)`,
      tone: 'layer',
    });
  }

  // 3. UV / Sun Protection: peak UV >= 6
  const peakUvHour = next6Hours.reduce<HourlyForecast | null>((best, h) => {
    const uv = h.uvIndex ?? 0;
    if (uv >= 6 && (!best || uv > (best.uvIndex ?? 0))) return h;
    return best;
  }, null);
  const currentUv = current.uvIndex ?? 0;
  if (peakUvHour || currentUv >= 6) {
    const uvVal = Math.round(Math.max(currentUv, peakUvHour?.uvIndex ?? 0));
    const atLabel = peakUvHour ? ` at ${peakUvHour.hourLabel}` : '';
    chips.push({
      id: 'uv',
      emoji: '🕶️',
      text: `Sunglasses & SPF (UV ${uvVal}${atLabel})`,
      tone: 'uv',
    });
  }

  // 4. Wind / Hydration callouts
  const windyHour = next6Hours.find((h) => (h.windSpeedKmh ?? 0) >= 35);
  const maxWindKmh = Math.max(current.windSpeedKmh, windyHour?.windSpeedKmh ?? 0);
  if (maxWindKmh >= 35) {
    chips.push({
      id: 'wind',
      emoji: '💨',
      text: `Windbreaker advised (Gusts ${maxWindKmh} km/h · ${kmhToMph(maxWindKmh)} mph)`,
      tone: 'wind',
    });
  } else if (current.tempC >= 28 || (current.tempC >= 25 && current.humidity >= 70)) {
    chips.push({
      id: 'hydration',
      emoji: '💧',
      text: `Stay hydrated & wear breathable fabrics (${
        primaryUnit === 'C' ? `${current.tempC}°C` : `${cToF(current.tempC)}°F`
      })`,
      tone: 'comfort',
    });
  }

  // Ensure at least 2 helpful contextual chips are always shown
  if (chips.length === 0) {
    chips.push({
      id: 'comfortable-attire',
      emoji: '👕',
      text: `Comfortable everyday attire (${current.tempC}°C / ${current.tempF}°F)`,
      tone: 'comfort',
    });
  }
  if (chips.length === 1 && !rainyHour) {
    chips.push({
      id: 'clear-outdoors',
      emoji: '👟',
      text: 'Dry conditions ahead — great for outdoor plans',
      tone: 'comfort',
    });
  }

  const visibleChips = chips.slice(0, 3);

  const getToneClasses = (tone: RecommendationChip['tone']) => {
    switch (tone) {
      case 'rain':
        return 'bg-sky-50/80 dark:bg-sky-950/50 border-sky-300/60 dark:border-sky-700/60 text-sky-900 dark:text-sky-200';
      case 'layer':
        return 'bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-300/60 dark:border-indigo-700/60 text-indigo-900 dark:text-indigo-200';
      case 'uv':
        return 'bg-amber-50/80 dark:bg-amber-950/50 border-amber-300/60 dark:border-amber-700/60 text-amber-900 dark:text-amber-200';
      case 'wind':
        return 'bg-teal-50/80 dark:bg-teal-950/50 border-teal-300/60 dark:border-teal-700/60 text-teal-900 dark:text-teal-200';
      default:
        return 'bg-white/70 dark:bg-slate-800/70 border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-slate-200';
    }
  };

  return (
    <div
      data-testid="what-to-wear-strip"
      data-no-page-swipe="true"
      onTouchStart={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
      className="px-4 mb-3.5 select-none"
    >
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
        {visibleChips.map((chip) => (
          <div
            key={chip.id}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border backdrop-blur-md text-[11px] font-medium shrink-0 shadow-2xs ${getToneClasses(
              chip.tone
            )}`}
          >
            <span aria-hidden="true">{chip.emoji}</span>
            <span>{chip.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
