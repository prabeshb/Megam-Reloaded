import React, { useState, useEffect } from 'react';
import { Smartphone, Maximize2, Wifi, Battery, Signal } from 'lucide-react';

interface MobileFrameProps {
  children: React.ReactNode;
  themeType?: 'sunny' | 'cloudy' | 'rainy' | 'storm' | 'snow' | 'night';
}

export const MobileFrame: React.FC<MobileFrameProps> = ({ children, themeType = 'sunny' }) => {
  const [isPhoneFrame, setIsPhoneFrame] = useState(true);
  const [currentTime, setCurrentTime] = useState('9:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Weather-adaptive background styling
  const getBackgroundGradient = () => {
    switch (themeType) {
      case 'sunny':
        return 'from-sky-400 via-sky-200 to-amber-50 dark:from-slate-900 dark:via-sky-950 dark:to-slate-900';
      case 'cloudy':
        return 'from-slate-300 via-slate-200 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950';
      case 'rainy':
        return 'from-slate-500 via-sky-700 to-slate-800 dark:from-slate-950 dark:via-sky-950 dark:to-slate-950';
      case 'storm':
        return 'from-slate-800 via-indigo-900 to-slate-950 dark:from-slate-950 dark:via-indigo-950 dark:to-black';
      case 'snow':
        return 'from-sky-200 via-slate-100 to-white dark:from-slate-900 dark:via-sky-950 dark:to-slate-900';
      case 'night':
        return 'from-slate-950 via-slate-900 to-indigo-950 dark:from-black dark:via-slate-950 dark:to-slate-950';
      default:
        return 'from-sky-400 via-sky-200 to-amber-50 dark:from-slate-900 dark:via-sky-950 dark:to-slate-900';
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center p-0 md:p-6 transition-colors selection:bg-sky-500/20">
      {/* Desktop Mode Switcher Bar */}
      <div className="hidden md:flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm border border-slate-200 dark:border-slate-800 z-50">
        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 pl-1">
          Viewport:
        </span>
        <button
          onClick={() => setIsPhoneFrame(true)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
            isPhoneFrame
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Smartphone size={13} />
          <span>Mobile Device</span>
        </button>
        <button
          onClick={() => setIsPhoneFrame(false)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
            !isPhoneFrame
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Maximize2 size={13} />
          <span>Expanded View</span>
        </button>
      </div>

      {/* Frame Container */}
      <div
        className={`w-full transition-all duration-300 ${
          isPhoneFrame
            ? 'md:max-w-[410px] md:h-[840px] md:max-h-[92vh] md:rounded-[44px] md:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] md:border-[8px] md:border-slate-800 dark:md:border-slate-700'
            : 'max-w-3xl min-h-screen md:min-h-[840px] md:rounded-3xl md:shadow-xl md:border md:border-slate-200 dark:md:border-slate-800'
        } overflow-hidden flex flex-col relative`}
      >
        {/* Device Frame Notch & Status Bar (on desktop mobile frame) */}
        {isPhoneFrame && (
          <div className="hidden md:flex items-center justify-between px-6 pt-3 pb-1 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md select-none shrink-0 z-40 border-b border-black/5 dark:border-white/5">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 tabular-nums">
              {currentTime}
            </span>

            {/* Dynamic Island / Punch Hole */}
            <div className="w-20 h-4 rounded-full bg-slate-900 dark:bg-black flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-slate-950 border border-slate-700 ml-auto mr-2" />
            </div>

            <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
              <Signal size={13} />
              <Wifi size={13} />
              <Battery size={15} />
            </div>
          </div>
        )}

        {/* Dynamic Weather Gradient Content Canvas */}
        <div
          className={`flex-1 flex flex-col overflow-hidden bg-gradient-to-b ${getBackgroundGradient()}`}
        >
          {children}
        </div>

        {/* Mobile Gesture Bar */}
        {isPhoneFrame && (
          <div className="hidden md:flex justify-center py-2 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md shrink-0 select-none">
            <div className="w-32 h-1 bg-slate-400 dark:bg-slate-600 rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
};
