import React, { useState } from 'react';
import { AppSettings, ThemeOption, PrimaryUnit, FavoriteLocation } from '../types/weather';
import {
  cToF,
  fToC,
  kmhToMph,
  getSavedFavorites,
  saveFavorites,
  exportAppConfiguration,
  parseImportedConfiguration,
} from '../services/weatherService';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { APP_VERSION, APP_BUILD } from '../version';
import {
  X,
  Bell,
  RefreshCw,
  Sun,
  Moon,
  Laptop,
  Key,
  ShieldCheck,
  Database,
  Download,
  Upload,
  Copy,
  Check,
  Activity,
  Share2,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  favorites?: FavoriteLocation[];
  onUpdateFavorites?: (newFavorites: FavoriteLocation[]) => void;
  onOpenShareApp?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  favorites,
  onUpdateFavorites,
  onOpenShareApp,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState(settings.openWeatherMapKey || '');
  const [keySavedStatus, setKeySavedStatus] = useState<string | null>(null);
  const [backupInput, setBackupInput] = useState('');
  const [backupStatus, setBackupStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);

  if (!isOpen) return null;

  const handleExportConfig = async () => {
    const activeFavs = favorites || getSavedFavorites();
    const jsonStr = exportAppConfiguration(settings, activeFavs);
    setBackupInput(jsonStr);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(jsonStr);
      }
    } catch {
      // Clipboard optional in non-secure or headless contexts
    }
    try {
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'megam-backup.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // Ignore blob download errors in JSDOM
    }
    setBackupStatus({
      type: 'success',
      text: 'Configuration exported (megam-backup.json & copied)!',
    });
    setTimeout(() => setBackupStatus(null), 3000);
  };

  const handleImportConfig = () => {
    try {
      const parsed = parseImportedConfiguration(backupInput);
      onUpdateSettings(parsed.settings);
      saveFavorites(parsed.favorites);
      if (onUpdateFavorites) {
        onUpdateFavorites(parsed.favorites);
      }
      setBackupStatus({
        type: 'success',
        text: `Imported ${parsed.favorites.length} favorite cities & preferences!`,
      });
      setTimeout(() => setBackupStatus(null), 3000);
    } catch (err: any) {
      setBackupStatus({
        type: 'error',
        text: err?.message || 'Invalid backup configuration.',
      });
    }
  };

  const handleThemeChange = (theme: ThemeOption) => {
    onUpdateSettings({ ...settings, theme });
  };

  const handlePrimaryUnitChange = (unit: PrimaryUnit) => {
    onUpdateSettings({ ...settings, primaryUnit: unit });
  };

  const handleAlertsToggle = () => {
    onUpdateSettings({
      ...settings,
      severeAlertsEnabled: !settings.severeAlertsEnabled,
    });
  };

  const handleAutoRefreshToggle = () => {
    onUpdateSettings({
      ...settings,
      autoRefreshEnabled: !settings.autoRefreshEnabled,
    });
  };

  const handleIntervalChange = (mins: number) => {
    onUpdateSettings({
      ...settings,
      autoRefreshIntervalMinutes: mins,
    });
  };

  const handleActivityChange = (key: string, val: any) => {
    onUpdateSettings({
      ...settings,
      activityPreferences: {
        ...settings.activityPreferences,
        [key]: val,
      },
    });
  };

  const handleSaveApiKey = () => {
    onUpdateSettings({
      ...settings,
      openWeatherMapKey: apiKeyInput.trim(),
    });
    setKeySavedStatus(apiKeyInput.trim() ? 'Key saved successfully!' : 'Cleared key');
    setTimeout(() => setKeySavedStatus(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className="relative w-full sm:max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Settings</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
          {/* Primary Unit Selection (PRD v2 Core Requirement) */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-900 dark:text-white">
                  Prominent Primary Unit
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Secondary unit remains displayed simultaneously in muted styling
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => handlePrimaryUnitChange('C')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  settings.primaryUnit === 'C'
                    ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-500 text-sky-600 dark:text-sky-400 shadow-sm'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                Celsius (°C) Primary
              </button>
              <button
                onClick={() => handlePrimaryUnitChange('F')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  settings.primaryUnit === 'F'
                    ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-500 text-sky-600 dark:text-sky-400 shadow-sm'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                Fahrenheit (°F) Primary
              </button>
            </div>
          </div>

          {/* Activity Window Preferences (PRD v2 Niche Feature) */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-3">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-emerald-500" />
              <div>
                <div className="text-xs font-semibold text-slate-900 dark:text-white">
                  Activity Window Thresholds
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Highlights optimal hours in the forecast for outdoor activities
                </div>
              </div>
            </div>

            {/* Activity Type */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'run', label: 'Running 🏃' },
                { id: 'walk', label: 'Walking 🚶' },
                { id: 'bike', label: 'Cycling 🚴' },
              ].map((act) => (
                <button
                  key={act.id}
                  onClick={() => handleActivityChange('activityType', act.id)}
                  className={`py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    settings.activityPreferences.activityType === act.id
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-semibold'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {act.label}
                </button>
              ))}
            </div>

            {/* Threshold controls */}
            <div className="space-y-3 text-[11px]">
              <div>
                <label className="text-slate-500 dark:text-slate-400 block mb-1">
                  Ideal Temp ({settings.primaryUnit === 'C' ? '°C' : '°F'})
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    aria-label="Min Ideal Temp"
                    value={
                      settings.primaryUnit === 'C'
                        ? settings.activityPreferences.minTempC
                        : cToF(settings.activityPreferences.minTempC)
                    }
                    onChange={(e) => {
                      const rawVal = Number(e.target.value);
                      const valC = settings.primaryUnit === 'C' ? rawVal : fToC(rawVal);
                      handleActivityChange('minTempC', valC);
                    }}
                    className="w-16 h-8 px-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center font-semibold text-xs text-slate-800 dark:text-white"
                  />
                  <span className="text-slate-500">to</span>
                  <input
                    type="number"
                    aria-label="Max Ideal Temp"
                    value={
                      settings.primaryUnit === 'C'
                        ? settings.activityPreferences.maxTempC
                        : cToF(settings.activityPreferences.maxTempC)
                    }
                    onChange={(e) => {
                      const rawVal = Number(e.target.value);
                      const valC = settings.primaryUnit === 'C' ? rawVal : fToC(rawVal);
                      handleActivityChange('maxTempC', valC);
                    }}
                    className="w-16 h-8 px-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center font-semibold text-xs text-slate-800 dark:text-white"
                  />
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-1">
                    ({settings.activityPreferences.minTempC}°C–{settings.activityPreferences.maxTempC}°C · {cToF(settings.activityPreferences.minTempC)}°F–{cToF(settings.activityPreferences.maxTempC)}°F)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-500 dark:text-slate-400">Max Wind</label>
                    <span className="font-semibold text-slate-700 dark:text-slate-200 tabular-nums">
                      ≤ {settings.activityPreferences.maxWindKmh} km/h · {kmhToMph(settings.activityPreferences.maxWindKmh)} mph
                    </span>
                  </div>
                  <input
                    type="range"
                    aria-label="Max Wind Threshold"
                    min={5}
                    max={60}
                    step={5}
                    value={settings.activityPreferences.maxWindKmh}
                    onChange={(e) => handleActivityChange('maxWindKmh', Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-500 dark:text-slate-400">Max Rain</label>
                    <span className="font-semibold text-slate-700 dark:text-slate-200 tabular-nums">
                      ≤ {settings.activityPreferences.maxPopPercent}% rain
                    </span>
                  </div>
                  <input
                    type="range"
                    aria-label="Max Rain Probability Threshold"
                    min={0}
                    max={100}
                    step={5}
                    value={settings.activityPreferences.maxPopPercent}
                    onChange={(e) => handleActivityChange('maxPopPercent', Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-500 dark:text-slate-400">Max Air Quality</label>
                    <span className="font-semibold text-slate-700 dark:text-slate-200 tabular-nums">
                      ≤ {settings.activityPreferences.maxAqi ?? 100} AQI
                    </span>
                  </div>
                  <input
                    type="range"
                    aria-label="Max AQI Threshold"
                    min={25}
                    max={200}
                    step={25}
                    value={settings.activityPreferences.maxAqi ?? 100}
                    onChange={(e) => handleActivityChange('maxAqi', Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-500 dark:text-slate-400">Max UV Index</label>
                    <span className="font-semibold text-slate-700 dark:text-slate-200 tabular-nums">
                      ≤ UV {settings.activityPreferences.maxUvIndex ?? 7}
                    </span>
                  </div>
                  <input
                    type="range"
                    aria-label="Max UV Index Threshold"
                    min={2}
                    max={11}
                    step={1}
                    value={settings.activityPreferences.maxUvIndex ?? 7}
                    onChange={(e) => handleActivityChange('maxUvIndex', Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Theme Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
              Appearance
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'system', label: 'System', icon: Laptop },
                { id: 'light', label: 'Light', icon: Sun },
                { id: 'dark', label: 'Dark', icon: Moon },
              ].map((item) => {
                const Icon = item.icon;
                const active = settings.theme === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleThemeChange(item.id as ThemeOption)}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-medium border transition-colors ${
                      active
                        ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-500 text-sky-600 dark:text-sky-400 font-semibold'
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon size={14} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Severe Weather Alerts (Default ON per PRD) */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center gap-3 pr-2">
              <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 shrink-0">
                <Bell size={18} />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-900 dark:text-white">
                  Severe Weather Alerts
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Local background sync via Android WorkManager without tracking location
                </div>
              </div>
            </div>
            <button
              onClick={handleAlertsToggle}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                settings.severeAlertsEnabled ? 'bg-sky-500' : 'bg-slate-300 dark:bg-slate-700'
              }`}
              aria-label="Toggle severe weather alerts"
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  settings.severeAlertsEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Periodic Background Pre-Fetching (Default OFF per PRD) */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 pr-2">
                <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 shrink-0">
                  <RefreshCw size={18} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">
                    Periodic Background Pre-Fetch
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Pre-caches forecast for 0ms startup (Default OFF)
                  </div>
                </div>
              </div>
              <button
                onClick={handleAutoRefreshToggle}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  settings.autoRefreshEnabled ? 'bg-sky-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
                aria-label="Toggle periodic background pre-fetch"
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    settings.autoRefreshEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {settings.autoRefreshEnabled && (
              <div className="pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">Pre-fetch interval:</span>
                <div className="flex items-center gap-1.5">
                  {[15, 30, 60].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => handleIntervalChange(mins)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${
                        settings.autoRefreshIntervalMinutes === mins
                          ? 'bg-sky-500 border-sky-500 text-white'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Optional OpenWeatherMap API Key */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center gap-2">
              <Key size={16} className="text-sky-500" />
              <label className="text-xs font-semibold text-slate-900 dark:text-white">
                OpenWeatherMap API Key (Optional)
              </label>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Open-Meteo is active by default. Enter your OpenWeatherMap key if you prefer to use your own account.
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="Paste API key..."
                className="flex-1 h-9 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
              <button
                onClick={handleSaveApiKey}
                className="h-9 px-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold transition-colors shrink-0"
              >
                Save
              </button>
            </div>
            {keySavedStatus && (
              <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                <Check size={13} />
                <span>{keySavedStatus}</span>
              </div>
            )}
          </div>

          {/* PWA / Android Install */}
          {!isInstalled && (
            <div className="p-3.5 rounded-2xl bg-sky-50/80 dark:bg-sky-950/40 border border-sky-200/60 dark:border-sky-800/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-sky-500 text-white shrink-0">
                  <Download size={18} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-sky-950 dark:text-sky-100">
                    Install Megam on Android
                  </div>
                  <div className="text-[11px] text-sky-700 dark:text-sky-300">
                    Add to home screen for fullscreen offline experience
                  </div>
                </div>
              </div>
              {isInstallable ? (
                <button
                  onClick={install}
                  className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold shadow-sm transition-colors"
                >
                  Install
                </button>
              ) : isIOS ? (
                <button
                  onClick={() => setShowIOSModal(true)}
                  className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold shadow-sm transition-colors"
                >
                  iOS Guide
                </button>
              ) : null}
            </div>
          )}

          {/* On-Device Coordinate Privacy Fuzzing ("Neighborhood-Only GPS" Mode) */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 pr-2">
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">
                      Neighborhood-Only GPS (~1.1 km)
                    </span>
                    <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[9px] font-bold">
                      Privacy Shield
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Rounds GPS to 2 decimal places on-device so exact street coordinates never leave your phone
                  </div>
                </div>
              </div>
              <button
                onClick={() =>
                  onUpdateSettings({
                    ...settings,
                    coordinatePrivacyFuzzing: settings.coordinatePrivacyFuzzing === false,
                  })
                }
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors shrink-0 ${
                  settings.coordinatePrivacyFuzzing !== false
                    ? 'bg-emerald-500'
                    : 'bg-slate-300 dark:bg-slate-700'
                }`}
                aria-label="Toggle coordinate privacy fuzzing"
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    settings.coordinatePrivacyFuzzing !== false ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Zero-Cloud Favorites & Settings Backup (Import / Export / Share) */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-2.5">
            <div className="flex items-center gap-2">
              <Copy size={15} className="text-sky-500" />
              <div>
                <div className="text-xs font-semibold text-slate-900 dark:text-white">
                  Zero-Cloud Backup & Portability
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Export or import your favorite cities, activity rules, and settings offline
                </div>
              </div>
            </div>

            <textarea
              aria-label="Backup JSON or Base64 string"
              value={backupInput}
              onChange={(e) => setBackupInput(e.target.value)}
              placeholder="Paste exported JSON or Base64 backup string here, or tap Export below..."
              rows={2}
              className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-mono text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleExportConfig}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors"
              >
                <Download size={13} />
                <span>Export Configuration</span>
              </button>
              <button
                type="button"
                onClick={handleImportConfig}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold transition-colors"
              >
                <Upload size={13} />
                <span>Import Configuration</span>
              </button>
            </div>

            {backupStatus && (
              <div
                className={`flex items-center gap-1 text-[11px] font-medium ${
                  backupStatus.type === 'success'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {backupStatus.type === 'success' && <Check size={13} />}
                <span>{backupStatus.text}</span>
              </div>
            )}
          </div>

          {/* Share Megam with Friends */}
          {onOpenShareApp && (
            <div className="p-3.5 rounded-2xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200/60 dark:border-sky-800/60 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400 shrink-0">
                  <Share2 size={18} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">
                    Share Megam with Friends
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Invite others to dual °C/°F privacy-first weather
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenShareApp();
                }}
                className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold shrink-0 transition-colors"
              >
                Share App
              </button>
            </div>
          )}

          {/* Data Source & Privacy Transparency */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
            <div className="flex items-center gap-2">
              <Database size={15} className="text-slate-400" />
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Transparent Data Source & Privacy
              </div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Powered by Open-Meteo & OpenWeatherMap APIs. Zero user tracking or external location logging. All coordinate calculations occur entirely on-device.
            </p>
          </div>

          {/* App Version Info */}
          <div className="pt-1 pb-3 text-center">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Megam Weather v{APP_VERSION}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono ml-1.5">
              ({APP_BUILD})
            </span>
          </div>
        </div>
      </div>

      {/* iOS Instructions Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-2xl">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
              Install on iOS Safari
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
              1. Tap the <strong>Share</strong> icon in the browser toolbar.<br />
              2. Scroll down and tap <strong>Add to Home Screen</strong>.<br />
              3. Tap <strong>Add</strong> to complete setup.
            </p>
            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-200"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
