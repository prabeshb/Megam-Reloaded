import React from 'react';
import {
  Sun,
  Moon,
  Cloud,
  CloudSun,
  CloudMoon,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  CloudSnow,
  CloudFog,
} from 'lucide-react';

interface WeatherIconProps {
  code: number;
  isDay?: boolean;
  className?: string;
  size?: number;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({
  code,
  isDay = true,
  className = 'w-6 h-6',
  size = 24,
}) => {
  if (code === 0 || code === 1) {
    return isDay ? (
      <Sun size={size} className={`text-amber-400 ${className}`} />
    ) : (
      <Moon size={size} className={`text-indigo-200 ${className}`} />
    );
  }

  if (code === 2) {
    return isDay ? (
      <CloudSun size={size} className={`text-amber-300 ${className}`} />
    ) : (
      <CloudMoon size={size} className={`text-indigo-300 ${className}`} />
    );
  }

  if (code === 3) {
    return <Cloud size={size} className={`text-slate-300 ${className}`} />;
  }

  if (code === 45 || code === 48) {
    return <CloudFog size={size} className={`text-slate-400 ${className}`} />;
  }

  if (code >= 51 && code <= 55) {
    return <CloudDrizzle size={size} className={`text-sky-300 ${className}`} />;
  }

  if ((code >= 56 && code <= 57) || (code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
    return <CloudSnow size={size} className={`text-cyan-200 ${className}`} />;
  }

  if (code >= 61 && code <= 67) {
    return <CloudRain size={size} className={`text-sky-400 ${className}`} />;
  }

  if (code >= 80 && code <= 82) {
    return <CloudRain size={size} className={`text-blue-400 ${className}`} />;
  }

  if (code >= 95) {
    return <CloudLightning size={size} className={`text-amber-300 ${className}`} />;
  }

  return isDay ? (
    <Sun size={size} className={`text-amber-400 ${className}`} />
  ) : (
    <Moon size={size} className={`text-indigo-200 ${className}`} />
  );
};
