import React, { useState, useEffect } from 'react';
import { WeatherData, PrimaryUnit } from '../types/weather';
import {
  formatPlaceWeatherShareText,
  formatAppShareText,
} from '../services/weatherService';
import { X, Share2, Copy, Check, MapPin, Sparkles, Link2 } from 'lucide-react';

export interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  weatherData: WeatherData | null;
  primaryUnit: PrimaryUnit;
  initialTab?: 'place' | 'app';
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  weatherData,
  primaryUnit,
  initialTab = 'place',
}) => {
  const [activeTab, setActiveTab] = useState<'place' | 'app'>(initialTab);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(weatherData ? initialTab : 'app');
      setCopyFeedback(null);
    }
  }, [isOpen, initialTab, weatherData]);

  if (!isOpen) return null;

  const baseOrigin =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : 'https://megam.app';

  const activePayload =
    activeTab === 'place' && weatherData
      ? formatPlaceWeatherShareText(weatherData, primaryUnit, baseOrigin)
      : formatAppShareText(baseOrigin);

  const handleCopyText = async (content: string, message: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(content);
      }
      setCopyFeedback(message);
      setTimeout(() => setCopyFeedback(null), 3000);
    } catch {
      setCopyFeedback('Ready to copy from preview box above');
    }
  };

  const handleNativeShare = async () => {
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        await navigator.share({
          title: activePayload.title,
          text: activePayload.text,
          url: activePayload.url,
        });
        return;
      }
    } catch {
      // User cancelled native share sheet or browser rejected; fall back gracefully
    }
    await handleCopyText(activePayload.text, 'Copied to clipboard!');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4 animate-fadeIn"
      data-no-page-swipe="true"
    >
      <div className="w-full sm:max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/70 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-500">
              <Share2 size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Share Weather & App
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                100% On-Device Deep Links · Zero Tracking
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close share modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="p-4 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80">
            <button
              type="button"
              disabled={!weatherData}
              onClick={() => {
                setActiveTab('place');
                setCopyFeedback(null);
              }}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'place'
                  ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <MapPin size={14} />
              <span>Share Place Weather</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('app');
                setCopyFeedback(null);
              }}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'app'
                  ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sparkles size={14} />
              <span>Share Megam App</span>
            </button>
          </div>

          {/* Live Snapshot Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                {activeTab === 'place' ? 'Live Place Forecast Snapshot' : 'App Invite Message'}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                Dual °C / °F
              </span>
            </div>

            <pre className="whitespace-pre-wrap break-words font-sans text-xs text-slate-800 dark:text-slate-200 leading-relaxed bg-white dark:bg-slate-900/90 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
              {activePayload.text}
            </pre>

            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900/50 text-[11px] text-slate-600 dark:text-slate-400 font-mono truncate">
              <Link2 size={13} className="shrink-0 text-sky-500" />
              <span className="truncate">{activePayload.url}</span>
            </div>
          </div>

          {/* Primary & Secondary Share Actions */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleNativeShare}
              className="w-full py-2.5 px-4 rounded-2xl bg-sky-500 hover:bg-sky-600 active:scale-[0.99] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Share2 size={15} />
              <span>Share via Device</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleCopyText(activePayload.text, 'Copied to clipboard!')}
                className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Copy size={14} />
                <span>Copy Summary & Link</span>
              </button>

              <button
                type="button"
                onClick={() => handleCopyText(activePayload.url, 'Link copied to clipboard!')}
                className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Link2 size={14} />
                <span>Copy Link Only</span>
              </button>
            </div>
          </div>

          {copyFeedback && (
            <div className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
              <Check size={14} />
              <span>{copyFeedback}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
