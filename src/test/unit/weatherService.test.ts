import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  cToF,
  fToC,
  kmhToMph,
  formatStaleness,
  getWmoConditionMeta,
  calculateAstronomicalWindows,
  calculateNextHourRain,
  getCacheKey,
  saveWeatherDataToCache,
  getCachedWeatherData,
  getLastSavedLocation,
  searchLocations,
  reverseGeocode,
  fetchWeather,
  getSavedFavorites,
  saveFavorites,
  getSavedSettings,
  saveSettings,
} from '../../services/weatherService';
import { LocationInfo, WeatherData } from '../../types/weather';

const MOCK_LOCATION: LocationInfo = {
  name: 'Tokyo',
  country: 'Japan',
  lat: 35.68,
  lon: 139.65,
};

describe('weatherService - Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('Unit Conversions (cToF, fToC & kmhToMph)', () => {
    it('converts Celsius to Fahrenheit accurately', () => {
      expect(cToF(0)).toBe(32);
      expect(cToF(100)).toBe(212);
      expect(cToF(20)).toBe(68);
      expect(cToF(-40)).toBe(-40);
      expect(cToF(21)).toBe(70);
    });

    it('converts Fahrenheit to Celsius accurately', () => {
      expect(fToC(32)).toBe(0);
      expect(fToC(212)).toBe(100);
      expect(fToC(68)).toBe(20);
      expect(fToC(54)).toBe(12);
      expect(fToC(75)).toBe(24);
    });

    it('converts km/h to mph rounded to 1 decimal place', () => {
      expect(kmhToMph(0)).toBe(0);
      expect(kmhToMph(10)).toBe(6.2);
      expect(kmhToMph(25)).toBe(15.5);
      expect(kmhToMph(100)).toBe(62.1);
    });
  });

  describe('formatStaleness', () => {
    it('formats timestamps across seconds, minutes, hours, and days', () => {
      const now = Date.now();
      expect(formatStaleness(now - 15 * 1000)).toBe('Updated just now');
      expect(formatStaleness(now - 5 * 60 * 1000)).toBe('Updated 5m ago');
      expect(formatStaleness(now - 3 * 3600 * 1000)).toBe('Updated 3h ago');
      expect(formatStaleness(now - 2 * 86400 * 1000)).toBe('Updated 2d ago');
    });
  });

  describe('getWmoConditionMeta', () => {
    it('maps clear and cloudy WMO codes with day/night awareness', () => {
      expect(getWmoConditionMeta(0, true)).toEqual({
        description: 'Clear sky',
        iconName: 'sun',
        themeType: 'sunny',
      });
      expect(getWmoConditionMeta(0, false)).toEqual({
        description: 'Clear night',
        iconName: 'moon',
        themeType: 'night',
      });
      expect(getWmoConditionMeta(1, true).themeType).toBe('sunny');
      expect(getWmoConditionMeta(1, false).themeType).toBe('night');
      expect(getWmoConditionMeta(2, true)).toEqual({
        description: 'Partly cloudy',
        iconName: 'cloud-sun',
        themeType: 'cloudy',
      });
      expect(getWmoConditionMeta(2, false)).toEqual({
        description: 'Partly cloudy',
        iconName: 'cloud-moon',
        themeType: 'night',
      });
      expect(getWmoConditionMeta(3, true).description).toBe('Overcast');
    });

    it('maps fog, drizzle, rain, snow, and thunderstorm WMO codes', () => {
      expect(getWmoConditionMeta(45).iconName).toBe('cloud-fog');
      expect(getWmoConditionMeta(53).description).toBe('Light drizzle');
      expect(getWmoConditionMeta(56).description).toBe('Freezing drizzle');
      expect(getWmoConditionMeta(61).description).toBe('Rain');
      expect(getWmoConditionMeta(65).description).toBe('Heavy rain');
      expect(getWmoConditionMeta(66).description).toBe('Freezing rain');
      expect(getWmoConditionMeta(73).description).toBe('Snowfall');
      expect(getWmoConditionMeta(81).description).toBe('Passing rain showers');
      expect(getWmoConditionMeta(85).description).toBe('Snow showers');
      expect(getWmoConditionMeta(95).themeType).toBe('storm');
      expect(getWmoConditionMeta(99).description).toBe('Thunderstorm with hail');
      expect(getWmoConditionMeta(999, true).description).toBe('Fair conditions');
      expect(getWmoConditionMeta(999, false).themeType).toBe('night');
    });
  });

  describe('calculateAstronomicalWindows', () => {
    it('returns default fallback windows when sunrise or sunset is empty', () => {
      const fallback = calculateAstronomicalWindows('', '');
      expect(fallback.morningBlueHour).toBe('5:45 AM – 6:10 AM');
      expect(fallback.morningGoldenHour).toBe('6:10 AM – 7:00 AM');
      expect(fallback.eveningGoldenHour).toBe('6:45 PM – 7:35 PM');
      expect(fallback.eveningBlueHour).toBe('7:35 PM – 8:00 PM');
    });

    it('computes morning and evening golden/blue hours from valid ISO dates', () => {
      const windows = calculateAstronomicalWindows(
        '2026-10-16T06:30:00',
        '2026-10-16T18:00:00'
      );
      expect(windows.morningBlueHour).toContain('–');
      expect(windows.morningGoldenHour).toContain('–');
      expect(windows.eveningGoldenHour).toContain('–');
      expect(windows.eveningBlueHour).toContain('–');
    });
  });

  describe('calculateNextHourRain (60-Minute Nowcasting)', () => {
    it('generates dry forecast when WMO code is clear and PoP is low', () => {
      const result = calculateNextHourRain(0, 5, 0);
      expect(result.hasRain).toBe(false);
      expect(result.summaryText).toBe('Dry conditions expected for the next 60 minutes');
      expect(result.minuteBars).toHaveLength(12);
      expect(result.minuteBars.every((b) => b.level === 'none')).toBe(true);
    });

    it('generates active heavy rain bars when thunderstorm/heavy rain code is active', () => {
      const result = calculateNextHourRain(95, 90, 5.0);
      expect(result.hasRain).toBe(true);
      expect(result.summaryText).toBe('Heavy rain continuing over the next hour');
      expect(result.minuteBars.some((b) => b.level === 'heavy')).toBe(true);
    });

    it('generates approaching rain summary when currently dry but PoP >= 25%', () => {
      const result = calculateNextHourRain(2, 60, 0.5);
      expect(result.hasRain).toBe(true);
      expect(result.summaryText).toMatch(/Light precipitation expected in ~\d+ minutes/);
      expect(result.minuteBars.some((b) => b.intensityMm > 0)).toBe(true);
    });
  });

  describe('LocalStorage Persistence (Cache, Favorites, Settings)', () => {
    it('saves and retrieves location-keyed weather cache and last location', () => {
      const key = getCacheKey(35.6762, 139.6503);
      expect(key).toBe('megan_weather_cache_35.68_139.65');

      const sampleData: WeatherData = {
        location: MOCK_LOCATION,
        current: {
          tempC: 22,
          tempF: 72,
          feelsLikeC: 21,
          feelsLikeF: 70,
          humidity: 50,
          windSpeedKmh: 12,
          windSpeedMph: 7.5,
          condition: 'Clear sky',
          conditionCode: 0,
          isDay: true,
          sunrise: '6:00 AM',
          sunset: '6:00 PM',
          surfacePressure: 1015,
          pressureTrend: 'rising',
          pressureDeltaHpa: 1.5,
        },
        hourly: [],
        daily: [],
        fetchedAt: Date.now(),
        source: 'Open-Meteo',
      };

      saveWeatherDataToCache(sampleData);

      const cached = getCachedWeatherData(35.68, 139.65);
      expect(cached).not.toBeNull();
      expect(cached?.isOfflineCached).toBe(true);
      expect(cached?.source).toBe('Offline Cache');
      expect(cached?.current.tempC).toBe(22);

      const lastLoc = getLastSavedLocation();
      expect(lastLoc?.name).toBe('Tokyo');
    });

    it('manages favorite locations with defaults', () => {
      const defaultFavs = getSavedFavorites();
      expect(defaultFavs).toHaveLength(3);
      expect(defaultFavs[0].name).toBe('Tokyo');

      const customFavs = [
        { id: 'fav_1', name: 'Paris', country: 'France', lat: 48.85, lon: 2.35, addedAt: 123 },
      ];
      saveFavorites(customFavs);
      expect(getSavedFavorites()).toEqual(customFavs);
    });

    it('manages app settings with PRD v2 defaults', () => {
      const defaults = getSavedSettings();
      expect(defaults.primaryUnit).toBe('C');
      expect(defaults.severeAlertsEnabled).toBe(true);
      expect(defaults.autoRefreshEnabled).toBe(false);
      expect(defaults.activityPreferences.activityType).toBe('run');

      const updated = { ...defaults, primaryUnit: 'F' as const, theme: 'dark' as const };
      saveSettings(updated);
      expect(getSavedSettings().primaryUnit).toBe('F');
      expect(getSavedSettings().theme).toBe('dark');
    });
  });

  describe('API Integrations & Fallback Chain', () => {
    it('searches locations via Open-Meteo Geocoding API', async () => {
      expect(await searchLocations('a')).toEqual([]);

      const mockResults = [
        { id: 1, name: 'Berlin', latitude: 52.52, longitude: 13.4, country: 'Germany' },
      ];
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: mockResults }),
      } as Response);

      const results = await searchLocations('Berlin');
      expect(results).toEqual(mockResults);
    });

    it('reverse geocodes coordinates and handles fallback gracefully', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          city: 'Osaka',
          countryName: 'Japan',
          principalSubdivision: 'Osaka',
        }),
      } as Response);

      const resolved = await reverseGeocode(34.69, 135.5);
      expect(resolved).toEqual({ name: 'Osaka', country: 'Japan', admin: 'Osaka' });

      vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network fail'));
      const fallback = await reverseGeocode(34.69, 135.5);
      expect(fallback.name).toBe('Current Location');
    });

    it('fetches live Open-Meteo data and computes yesterday comparison, pressure trend, and storm alerts', async () => {
      const nowHourIso = new Date().toISOString().slice(0, 13) + ':00';
      const times = Array.from({ length: 48 }, (_, i) =>
        i === 24 ? nowHourIso : `2026-10-16T${String(i % 24).padStart(2, '0')}:00`
      );
      const pressures = Array(48).fill(1010);
      pressures[21] = 1012; // 3 hours prior to index 24 -> current is 1015 (+3.0 rising)
      const temps = Array(48).fill(20);
      temps[0] = 18; // 24 hours prior to index 24 -> current is 24 (+6C warmer)
      const humids = Array(48).fill(50);
      humids[0] = 40; // +15% more humid

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          current: {
            temperature_2m: 24,
            apparent_temperature: 25,
            relative_humidity_2m: 55,
            is_day: 1,
            weather_code: 95, // Thunderstorm -> triggers severe alert
            wind_speed_10m: 18,
            surface_pressure: 1015,
          },
          hourly: {
            time: times,
            surface_pressure: pressures,
            temperature_2m: temps,
            relative_humidity_2m: humids,
            wind_speed_10m: Array(48).fill(15),
            precipitation_probability: Array(48).fill(10),
            weather_code: Array(48).fill(1),
            is_day: Array(48).fill(1),
            precipitation: Array(48).fill(0),
          },
          daily: {
            time: ['2026-10-15', '2026-10-16', '2026-10-17'],
            temperature_2m_max: [20, 26, 24],
            temperature_2m_min: [12, 16, 15],
            weather_code: [1, 95, 2],
            precipitation_probability_max: [10, 80, 20],
            sunrise: ['2026-10-15T06:00', '2026-10-16T06:01', '2026-10-17T06:02'],
            sunset: ['2026-10-15T18:00', '2026-10-16T17:59', '2026-10-17T17:58'],
          },
        }),
      } as Response);

      const data = await fetchWeather(MOCK_LOCATION);
      expect(data.source).toBe('Open-Meteo');
      expect(data.current.tempC).toBe(24);
      expect(data.current.tempF).toBe(75);
      expect(data.current.pressureTrend).toBe('rising');
      expect(data.current.pressureDeltaHpa).toBe(3);
      expect(data.yesterdayComparison?.isWarmer).toBe(true);
      expect(data.yesterdayComparison?.tempDiffC).toBe(6);
      expect(data.yesterdayComparison?.summaryText).toContain('warmer and noticeably more humid');
      expect(data.alerts).toHaveLength(1);
      expect(data.alerts?.[0].title).toBe('Severe Thunderstorm Warning');
      expect(data.hourly).toHaveLength(24);
      expect(data.hourly[0].isActivityOptimal).toBe(true);
    });

    it('returns cached data when offline and throws explicit offline error if no cache exists for that location', async () => {
      Object.defineProperty(window.navigator, 'onLine', { value: false, writable: true });

      // No cache yet -> throws honest offline error instead of fake synthetic weather
      await expect(fetchWeather(MOCK_LOCATION)).rejects.toThrow(
        'No offline cache available for Tokyo'
      );

      // Save real cache and verify offline returns cached data
      saveWeatherDataToCache({
        location: MOCK_LOCATION,
        current: {
          tempC: 19,
          tempF: 66,
          feelsLikeC: 18,
          feelsLikeF: 64,
          humidity: 60,
          windSpeedKmh: 10,
          windSpeedMph: 6.2,
          condition: 'Clear sky',
          conditionCode: 0,
          isDay: true,
          sunrise: '6:00 AM',
          sunset: '6:00 PM',
          surfacePressure: 1013,
          pressureTrend: 'steady',
          pressureDeltaHpa: 0,
        },
        hourly: [],
        daily: [],
        fetchedAt: Date.now(),
        source: 'Open-Meteo',
      });

      const cachedResult = await fetchWeather(MOCK_LOCATION);
      expect(cachedResult.source).toBe('Offline Cache');
      expect(cachedResult.isOfflineCached).toBe(true);
      expect(cachedResult.current.tempC).toBe(19);
    });
  });
});
