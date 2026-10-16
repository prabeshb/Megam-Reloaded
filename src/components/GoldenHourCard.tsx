import React, { useState } from 'react';
import { AstronomicalWindows } from '../types/weather';
import { Sparkles, Sun, Moon, ChevronDown, ChevronUp } from 'lucide-react';

interface GoldenHourCardProps {
  windows?: AstronomicalWindows;
}

export const GoldenHourCard: React.FC<GoldenHourCardProps> = ({ windows }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  if (!windows) return null;

  return (
    <div className="px-4 mb-4">
      <div className="p-3.5 rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-left"
          aria-expanded={isExpanded}
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Sparkles size={16} />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-800 dark:text-white">
                Golden & Blue Hours
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Optimal light windows for photography & outdoor walks
              </div>
            </div>
          </div>
          <div className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </button>

        {/* Quick Summary glance (Evening Golden Hour) */}
        {!isExpanded && (
          <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/40 flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-400 text-[11px]">Evening Golden Hour:</span>
            <span className="font-semibold text-amber-600 dark:text-amber-400 tabular-nums text-xs">
              {windows.eveningGoldenHour}
            </span>
          </div>
        )}

        {/* Expanded 4-Window breakdown */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/40 grid grid-cols-2 gap-2 text-xs">
            {/* Morning Golden */}
            <div className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/40 dark:border-amber-800/30">
              <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300 font-medium text-[11px] mb-1">
                <Sun size={13} />
                <span>Morning Golden</span>
              </div>
              <div className="font-bold text-slate-800 dark:text-slate-100 text-[11px] tabular-nums">
                {windows.morningGoldenHour}
              </div>
            </div>

            {/* Evening Golden */}
            <div className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/40 dark:border-amber-800/30">
              <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300 font-medium text-[11px] mb-1">
                <Sun size={13} />
                <span>Evening Golden</span>
              </div>
              <div className="font-bold text-slate-800 dark:text-slate-100 text-[11px] tabular-nums">
                {windows.eveningGoldenHour}
              </div>
            </div>

            {/* Morning Blue */}
            <div className="p-2.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/40 dark:border-indigo-800/30">
              <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 font-medium text-[11px] mb-1">
                <Moon size={13} />
                <span>Morning Blue</span>
              </div>
              <div className="font-bold text-slate-800 dark:text-slate-100 text-[11px] tabular-nums">
                {windows.morningBlueHour}
              </div>
            </div>

            {/* Evening Blue */}
            <div className="p-2.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/40 dark:border-indigo-800/30">
              <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 font-medium text-[11px] mb-1">
                <Moon size={13} />
                <span>Evening Blue</span>
              </div>
              <div className="font-bold text-slate-800 dark:text-slate-100 text-[11px] tabular-nums">
                {windows.eveningBlueHour}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
