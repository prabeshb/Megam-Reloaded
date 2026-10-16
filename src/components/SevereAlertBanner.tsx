import React, { useState } from 'react';
import { SevereAlert } from '../types/weather';
import { AlertTriangle, ChevronDown, ChevronUp, X } from 'lucide-react';

interface SevereAlertBannerProps {
  alerts?: SevereAlert[];
  enabled: boolean;
}

export const SevereAlertBanner: React.FC<SevereAlertBannerProps> = ({ alerts, enabled }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (!enabled || !alerts || alerts.length === 0 || isDismissed) return null;

  const alert = alerts[0];

  const colorStyles =
    alert.severity === 'warning'
      ? 'bg-rose-500 text-white'
      : alert.severity === 'watch'
      ? 'bg-amber-500 text-slate-950'
      : 'bg-sky-600 text-white';

  return (
    <div className="px-4 mb-3">
      <div className={`rounded-2xl p-3 shadow-sm ${colorStyles} transition-all`}>
        <div className="flex items-center justify-between gap-2">
          <div
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2.5 flex-1 cursor-pointer select-none min-w-0"
          >
            <AlertTriangle size={18} className="shrink-0 animate-pulse" />
            <div className="min-w-0">
              <div className="text-xs font-bold uppercase tracking-wider truncate">
                {alert.title}
              </div>
              <div className="text-[11px] opacity-90 truncate">
                {alert.expires}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded-lg hover:bg-black/10 transition-colors"
              aria-label="Toggle alert details"
            >
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            <button
              onClick={() => setIsDismissed(true)}
              className="p-1 rounded-lg hover:bg-black/10 transition-colors"
              aria-label="Dismiss alert"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-2.5 pt-2.5 border-t border-white/20 text-xs leading-relaxed opacity-95">
            <p>{alert.description}</p>
            <div className="mt-2 text-[10px] opacity-75 font-mono">
              Source: {alert.source}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
