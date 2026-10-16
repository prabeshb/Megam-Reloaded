import React from 'react';
import { YesterdayComparison } from '../types/weather';
import { History, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface YesterdayComparisonBannerProps {
  comparison?: YesterdayComparison;
}

export const YesterdayComparisonBanner: React.FC<YesterdayComparisonBannerProps> = ({
  comparison,
}) => {
  if (!comparison || !comparison.summaryText) return null;

  const Icon = Math.abs(comparison.tempDiffC) <= 1
    ? Minus
    : comparison.isWarmer
    ? TrendingUp
    : TrendingDown;

  const iconColor = Math.abs(comparison.tempDiffC) <= 1
    ? 'text-slate-400'
    : comparison.isWarmer
    ? 'text-amber-500'
    : 'text-sky-500';

  return (
    <div className="px-4 mb-2">
      <div className="flex items-center gap-2 py-1.5 px-3 rounded-xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-md border border-slate-200/40 dark:border-slate-700/40 text-xs text-slate-700 dark:text-slate-300">
        <div className="flex items-center gap-1 shrink-0 font-medium text-slate-500 dark:text-slate-400">
          <History size={13} />
          <span className="text-[11px] uppercase tracking-wide">Vs Yesterday:</span>
        </div>
        <div className="flex items-center gap-1.5 truncate text-[11px] font-semibold text-slate-800 dark:text-slate-200">
          <Icon size={14} className={`${iconColor} shrink-0`} />
          <span className="truncate">{comparison.summaryText}</span>
        </div>
      </div>
    </div>
  );
};
