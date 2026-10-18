export type PrimaryUnit = 'C' | 'F';

export interface LocationInfo {
  name: string;
  country: string;
  admin?: string;
  lat: number;
  lon: number;
  isCurrentLocation?: boolean;
}

export interface YesterdayComparison {
  tempDiffC: number;
  tempDiffF: number;
  isWarmer: boolean;
  humidityDiff: number;
  summaryText: string;
}

export interface MinuteRainBar {
  minute: number;
  intensityMm: number;
  level: 'none' | 'light' | 'moderate' | 'heavy';
  intensityLevel?: 'none' | 'light' | 'moderate' | 'heavy';
}

export interface NextHourPrecipitation {
  hasRain: boolean;
  summaryText: string;
  minuteBars: MinuteRainBar[];
}

export interface AstronomicalWindows {
  morningBlueHour: string;
  morningGoldenHour: string;
  eveningGoldenHour: string;
  eveningBlueHour: string;
}

export type PressureTrend = 'rising' | 'steady' | 'falling';

export interface CurrentWeather {
  tempC: number;
  tempF: number;
  feelsLikeC: number;
  feelsLikeF: number;
  humidity: number;
  windSpeedKmh: number;
  windSpeedMph: number;
  condition: string;
  conditionCode: number;
  isDay: boolean;
  sunrise: string;
  sunset: string;
  uvIndex?: number;
  surfacePressure: number;
  pressureTrend: PressureTrend;
  pressureDeltaHpa: number;
}

export interface HourlyForecast {
  time: string;
  hourLabel: string;
  tempC: number;
  tempF: number;
  condition: string;
  conditionCode: number;
  popPercent: number;
  isDay: boolean;
  windSpeedKmh?: number;
  isActivityOptimal?: boolean;
}

export interface DailyForecast {
  date: string;
  dayName: string;
  isToday: boolean;
  maxTempC: number;
  maxTempF: number;
  minTempC: number;
  minTempF: number;
  condition: string;
  conditionCode: number;
  popPercent: number;
  sunrise: string;
  sunset: string;
  hourly?: HourlyForecast[];
}

export interface SevereAlert {
  id: string;
  title: string;
  severity: 'advisory' | 'watch' | 'warning';
  description: string;
  source: string;
  expires: string;
}

export interface WeatherData {
  location: LocationInfo;
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  alerts?: SevereAlert[];
  yesterdayComparison?: YesterdayComparison;
  nextHourRain?: NextHourPrecipitation;
  astronomicalWindows?: AstronomicalWindows;
  timezone?: string;
  utcOffsetSeconds?: number;
  fetchedAt: number;
  source: 'Open-Meteo' | 'OpenWeatherMap' | 'Offline Cache';
  isOfflineCached?: boolean;
}

export interface FavoriteLocation {
  id: string;
  name: string;
  country: string;
  admin?: string;
  lat: number;
  lon: number;
  addedAt: number;
}

export type ThemeOption = 'system' | 'light' | 'dark';

export interface ActivityPreferences {
  activityType: 'run' | 'walk' | 'bike';
  minTempC: number;
  maxTempC: number;
  maxWindKmh: number;
  maxPopPercent: number;
}

export interface AppSettings {
  theme: ThemeOption;
  primaryUnit: PrimaryUnit;
  severeAlertsEnabled: boolean;
  autoRefreshEnabled: boolean;
  autoRefreshIntervalMinutes: number;
  openWeatherMapKey: string;
  activityPreferences: ActivityPreferences;
}

export interface GeocodingResult {
  id: number | string;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  country_code?: string;
  admin1?: string;
}
