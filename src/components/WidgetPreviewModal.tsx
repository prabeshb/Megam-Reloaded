import React, { useState } from 'react';
import { WeatherData, PrimaryUnit } from '../types/weather';
import { WeatherIcon } from './WeatherIcons';
import { X, Layers, Smartphone, ArrowUp, ArrowDown } from 'lucide-react';

interface WidgetPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  weatherData: WeatherData | null;
  primaryUnit: PrimaryUnit;
}

export const WidgetPreviewModal: React.FC<WidgetPreviewModalProps> = ({
  isOpen,
  onClose,
  weatherData,
  primaryUnit,
}) => {
  const [widgetSize, setWidgetSize] = useState<'4x2' | '2x2'>('4x2');

  if (!isOpen || !weatherData) return null;

  const { location, current, daily } = weatherData;
  const today = daily[0];
  const isC = primaryUnit === 'C';

  const primaryTemp = isC ? `${current.tempC}°` : `${current.tempF}°`;
  const secondaryTemp = isC ? `${current.tempF}°F` : `${current.tempC}°C`;

  const highPrimary = today ? (isC ? `${today.maxTempC}°` : `${today.maxTempF}°`) : '24°';
  const highSecondary = today ? (isC ? `${today.maxTempF}°F` : `${today.maxTempC}°C`) : '75°F';
  const lowPrimary = today ? (isC ? `${today.minTempC}°` : `${today.minTempF}°`) : '14°';
  const lowSecondary = today ? (isC ? `${today.minTempF}°F` : `${today.minTempC}°C`) : '57°F';

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className="relative w-full sm:max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Layers size={18} className="text-sky-500" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Android Material You Widgets
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto no-scrollbar space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Preview the glanceable Android Material You home screen widgets displaying simultaneous metric and imperial temperatures.
          </p>

          {/* Size Selector */}
          <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => setWidgetSize('4x2')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                widgetSize === '4x2'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              4 × 2 Panoramic Widget
            </button>
            <button
              onClick={() => setWidgetSize('2x2')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                widgetSize === '2x2'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              2 × 2 Square Glance
            </button>
          </div>

          {/* Simulated Android Home Screen Wall */}
          <div className="p-6 rounded-3xl bg-gradient-to-tr from-slate-800 via-slate-900 to-indigo-950 flex flex-col items-center justify-center min-h-[220px] shadow-inner border border-slate-700/50">
            {widgetSize === '4x2' ? (
              /* 4x2 Material You Widget */
              <div className="w-full max-w-[340px] p-4 rounded-3xl bg-sky-100/90 dark:bg-sky-950/80 backdrop-blur-xl border border-sky-300/40 dark:border-sky-700/40 shadow-xl text-slate-900 dark:text-white">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs font-semibold tracking-tight text-slate-800 dark:text-slate-200">
                      {location.name}
                    </div>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-3xl font-extrabold tabular-nums">
                        {primaryTemp}
                      </span>
                      <span className="text-sm font-semibold opacity-60 tabular-nums">
                        {secondaryTemp}
                      </span>
                    </div>
                    <div className="text-[11px] font-medium opacity-80 capitalize mt-0.5">
                      {current.condition}
                    </div>
                  </div>

                  <div className="p-2 rounded-2xl bg-sky-200/60 dark:bg-sky-900/60">
                    <WeatherIcon code={current.conditionCode} isDay={current.isDay} size={36} />
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-sky-200/60 dark:border-sky-800/60 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center text-rose-600 dark:text-rose-400 font-semibold">
                      <ArrowUp size={11} className="mr-0.5" />
                      {highPrimary} <span className="opacity-60 text-[10px] ml-0.5">({highSecondary})</span>
                    </span>
                    <span className="flex items-center text-sky-600 dark:text-sky-400 font-semibold">
                      <ArrowDown size={11} className="mr-0.5" />
                      {lowPrimary} <span className="opacity-60 text-[10px] ml-0.5">({lowSecondary})</span>
                    </span>
                  </div>
                  <span className="opacity-70 text-[10px]">Megam</span>
                </div>
              </div>
            ) : (
              /* 2x2 Square Widget */
              <div className="w-[170px] h-[170px] p-3.5 rounded-3xl bg-amber-100/90 dark:bg-amber-950/80 backdrop-blur-xl border border-amber-300/40 dark:border-amber-700/40 shadow-xl text-slate-900 dark:text-white flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold truncate max-w-[90px]">
                    {location.name}
                  </span>
                  <WeatherIcon code={current.conditionCode} isDay={current.isDay} size={24} />
                </div>

                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold tabular-nums">
                      {primaryTemp}
                    </span>
                    <span className="text-xs font-semibold opacity-60 tabular-nums">
                      {secondaryTemp}
                    </span>
                  </div>
                  <div className="text-[10px] opacity-75 capitalize truncate mt-0.5">
                    {current.condition}
                  </div>
                </div>

                <div className="text-[10px] font-semibold flex items-center justify-between opacity-80 pt-1 border-t border-amber-200/50 dark:border-amber-800/40">
                  <span>H: {highPrimary}</span>
                  <span>L: {lowPrimary}</span>
                </div>
              </div>
            )}
          </div>

          {/* Android Home Screen Instructions */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center gap-2 mb-1">
              <Smartphone size={15} className="text-sky-500" />
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                How to pin to Android Home Screen
              </div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              When Megam is installed as a PWA on Android or compiled via Capacitor, long-press any empty space on your Android home screen, select <strong>Widgets</strong>, and choose <strong>Megam Weather</strong> to pin glanceable dual-unit widgets.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
