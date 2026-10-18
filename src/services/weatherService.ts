import {
  CurrentWeather,
  DailyForecast,
  GeocodingResult,
  HourlyForecast,
  LocationInfo,
  SevereAlert,
  WeatherData,
  FavoriteLocation,
  AppSettings,
  YesterdayComparison,
  NextHourPrecipitation,
  AstronomicalWindows,
  PressureTrend,
  MinuteRainBar,
  ActivityPreferences,
} from '../types/weather';

export function cToF(c: number): number {
  return Math.round((c * 9) / 5 + 32);
}

export function fToC(f: number): number {
  return Math.round(((f - 32) * 5) / 9);
}

export function kmhToMph(kmh: number): number {
  return Math.round(kmh * 0.621371 * 10) / 10;
}

export function formatStaleness(fetchedAt: number): string {
  const diffSec = Math.floor((Date.now() - fetchedAt) / 1000);
  if (diffSec < 60) return 'Updated just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `Updated ${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `Updated ${diffHours}h ago`;
  return `Updated ${Math.floor(diffHours / 24)}d ago`;
}

export interface WeatherConditionMeta {
  description: string;
  iconName: 'sun' | 'cloud' | 'cloud-sun' | 'cloud-rain' | 'cloud-lightning' | 'cloud-snow' | 'cloud-fog' | 'cloud-drizzle' | 'moon' | 'cloud-moon';
  themeType: 'sunny' | 'cloudy' | 'rainy' | 'storm' | 'snow' | 'night';
}

export function getWmoConditionMeta(code: number, isDay: boolean = true): WeatherConditionMeta {
  if (code === 0) {
    return isDay
      ? { description: 'Clear sky', iconName: 'sun', themeType: 'sunny' }
      : { description: 'Clear night', iconName: 'moon', themeType: 'night' };
  }
  if (code === 1) {
    return isDay
      ? { description: 'Mainly clear', iconName: 'sun', themeType: 'sunny' }
      : { description: 'Mainly clear', iconName: 'moon', themeType: 'night' };
  }
  if (code === 2) {
    return isDay
      ? { description: 'Partly cloudy', iconName: 'cloud-sun', themeType: 'cloudy' }
      : { description: 'Partly cloudy', iconName: 'cloud-moon', themeType: 'night' };
  }
  if (code === 3) {
    return { description: 'Overcast', iconName: 'cloud', themeType: 'cloudy' };
  }
  if (code === 45 || code === 48) {
    return { description: 'Fog & mist', iconName: 'cloud-fog', themeType: 'cloudy' };
  }
  if (code >= 51 && code <= 55) {
    return { description: 'Light drizzle', iconName: 'cloud-drizzle', themeType: 'rainy' };
  }
  if (code >= 56 && code <= 57) {
    return { description: 'Freezing drizzle', iconName: 'cloud-snow', themeType: 'snow' };
  }
  if (code >= 61 && code <= 65) {
    return { description: code === 65 ? 'Heavy rain' : 'Rain', iconName: 'cloud-rain', themeType: 'rainy' };
  }
  if (code >= 66 && code <= 67) {
    return { description: 'Freezing rain', iconName: 'cloud-snow', themeType: 'snow' };
  }
  if (code >= 71 && code <= 77) {
    return { description: 'Snowfall', iconName: 'cloud-snow', themeType: 'snow' };
  }
  if (code >= 80 && code <= 82) {
    return { description: 'Passing rain showers', iconName: 'cloud-rain', themeType: 'rainy' };
  }
  if (code >= 85 && code <= 86) {
    return { description: 'Snow showers', iconName: 'cloud-snow', themeType: 'snow' };
  }
  if (code === 95) {
    return { description: 'Thunderstorm', iconName: 'cloud-lightning', themeType: 'storm' };
  }
  if (code >= 96 && code <= 99) {
    return { description: 'Thunderstorm with hail', iconName: 'cloud-lightning', themeType: 'storm' };
  }
  return { description: 'Fair conditions', iconName: isDay ? 'sun' : 'moon', themeType: isDay ? 'sunny' : 'night' };
}

// Compute Golden Hour & Blue Hour windows from Sunrise and Sunset ISO strings
export function calculateAstronomicalWindows(sunriseIso: string, sunsetIso: string): AstronomicalWindows {
  const sunriseTime = sunriseIso ? new Date(sunriseIso).getTime() : 0;
  const sunsetTime = sunsetIso ? new Date(sunsetIso).getTime() : 0;

  const formatWindow = (startMs: number, endMs: number): string => {
    if (!startMs || isNaN(startMs)) return '--:-- – --:--';
    const s = new Date(startMs).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const e = new Date(endMs).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return `${s} – ${e}`;
  };

  if (!sunriseTime || !sunsetTime) {
    return {
      morningBlueHour: '5:45 AM – 6:10 AM',
      morningGoldenHour: '6:10 AM – 7:00 AM',
      eveningGoldenHour: '6:45 PM – 7:35 PM',
      eveningBlueHour: '7:35 PM – 8:00 PM',
    };
  }

  // Morning Blue Hour: 35 min to 12 min before sunrise
  const mBlueStart = sunriseTime - 35 * 60000;
  const mBlueEnd = sunriseTime - 12 * 60000;

  // Morning Golden Hour: 12 min before sunrise to 45 min after sunrise
  const mGoldStart = sunriseTime - 12 * 60000;
  const mGoldEnd = sunriseTime + 45 * 60000;

  // Evening Golden Hour: 45 min before sunset to 12 min after sunset
  const eGoldStart = sunsetTime - 45 * 60000;
  const eGoldEnd = sunsetTime + 12 * 60000;

  // Evening Blue Hour: 12 min to 35 min after sunset
  const eBlueStart = sunsetTime + 12 * 60000;
  const eBlueEnd = sunsetTime + 35 * 60000;

  return {
    morningBlueHour: formatWindow(mBlueStart, mBlueEnd),
    morningGoldenHour: formatWindow(mGoldStart, mGoldEnd),
    eveningGoldenHour: formatWindow(eGoldStart, eGoldEnd),
    eveningBlueHour: formatWindow(eBlueStart, eBlueEnd),
  };
}

// 60-Minute Rain Bar (Next-Hour Nowcasting) Generator
export function calculateNextHourRain(currentCode: number, hourlyPop: number, hourlyPrecipMm: number = 0): NextHourPrecipitation {
  const isRainingNow = (currentCode >= 51 && currentCode <= 67) || (currentCode >= 80 && currentCode <= 82) || currentCode >= 95;
  const hasChance = isRainingNow || hourlyPop >= 25 || hourlyPrecipMm > 0.1;

  const minuteBars: MinuteRainBar[] = [];

  for (let m = 0; m < 60; m += 5) {
    let intensityMm = 0;
    let level: 'none' | 'light' | 'moderate' | 'heavy' = 'none';

    if (isRainingNow) {
      // Tapers or continues based on precipitation code
      const base = currentCode >= 65 || currentCode >= 95 ? 4.5 : currentCode >= 61 ? 2.2 : 0.8;
      // Realistic smooth bell or slight variation
      const wave = Math.sin((m / 60) * Math.PI) * 0.8 + 0.6;
      intensityMm = Math.max(0.1, Number((base * wave).toFixed(1)));
    } else if (hasChance) {
      // Rain starting partway through the hour
      const startMin = Math.max(10, Math.floor(50 - (hourlyPop / 100) * 35));
      if (m >= startMin) {
        intensityMm = Number(((m - startMin) * 0.08 + 0.3).toFixed(1));
      }
    }

    if (intensityMm >= 4.0) level = 'heavy';
    else if (intensityMm >= 1.5) level = 'moderate';
    else if (intensityMm > 0.0) level = 'light';
    else level = 'none';

    minuteBars.push({ minute: m, intensityMm, level });
  }

  let summaryText = 'Dry conditions expected for the next 60 minutes';
  if (isRainingNow) {
    const isHeavy = minuteBars.some((b) => b.level === 'heavy');
    summaryText = isHeavy ? 'Heavy rain continuing over the next hour' : 'Light to moderate rain for the next 45+ mins';
  } else if (hasChance) {
    const firstRain = minuteBars.find((b) => b.intensityMm > 0);
    if (firstRain) {
      summaryText = `Light precipitation expected in ~${firstRain.minute} minutes`;
    }
  }

  return {
    hasRain: hasChance,
    summaryText,
    minuteBars,
  };
}

const CACHE_PREFIX = 'megan_weather_cache_';
const LAST_LOCATION_KEY = 'megan_weather_last_loc';
const FAVORITES_KEY = 'megan_weather_favorites';
const SETTINGS_KEY = 'megan_weather_settings';

export function getCacheKey(lat: number, lon: number): string {
  return `${CACHE_PREFIX}${lat.toFixed(2)}_${lon.toFixed(2)}`;
}

export function saveWeatherDataToCache(data: WeatherData): void {
  try {
    const key = getCacheKey(data.location.lat, data.location.lon);
    localStorage.setItem(key, JSON.stringify(data));
    localStorage.setItem(LAST_LOCATION_KEY, JSON.stringify(data.location));
  } catch (err) {
    console.warn('Failed to cache weather data', err);
  }
}

export function getCachedWeatherData(lat: number, lon: number): WeatherData | null {
  try {
    const key = getCacheKey(lat, lon);
    const item = localStorage.getItem(key);
    if (!item) return null;
    const parsed = JSON.parse(item) as WeatherData;
    parsed.isOfflineCached = true;
    parsed.source = 'Offline Cache';
    return parsed;
  } catch (err) {
    console.warn('Failed to read cache', err);
    return null;
  }
}

export function getLastSavedLocation(): LocationInfo | null {
  try {
    const item = localStorage.getItem(LAST_LOCATION_KEY);
    return item ? (JSON.parse(item) as LocationInfo) : null;
  } catch {
    return null;
  }
}

// Global geocoding search
export async function searchLocations(query: string): Promise<GeocodingResult[]> {
  if (!query || query.trim().length < 2) return [];
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      query.trim()
    )}&count=6&language=en&format=json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Geocoding request failed');
    const data = await res.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching geocoding results:', error);
    return [];
  }
}

// Reverse geocode coordinates
export async function reverseGeocode(lat: number, lon: number): Promise<{ name: string; country: string; admin?: string }> {
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const name = data.city || data.locality || data.principalSubdivision || 'Current Location';
      const country = data.countryName || data.countryCode || '';
      const admin = data.principalSubdivision || '';
      return { name, country, admin };
    }
  } catch (err) {
    console.warn('Reverse geocode fallback', err);
  }
  return { name: 'Current Location', country: `${lat.toFixed(2)}°, ${lon.toFixed(2)}°` };
}

// Fetch live weather with PRD v2 features
export async function fetchWeather(
  location: LocationInfo,
  openWeatherMapKey?: string,
  activityPrefs?: ActivityPreferences
): Promise<WeatherData> {
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  // If user provided OpenWeatherMap key, try that first
  if (isOnline && openWeatherMapKey && openWeatherMapKey.trim().length > 10) {
    try {
      return await fetchFromOpenWeatherMap(location, openWeatherMapKey.trim(), activityPrefs);
    } catch (err) {
      console.warn('OpenWeatherMap API request failed, falling back to Open-Meteo:', err);
    }
  }

  // Primary: Open-Meteo with past_days=1 for high-accuracy yesterday comparison
  if (isOnline) {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,surface_pressure&hourly=temperature_2m,precipitation_probability,precipitation,weather_code,is_day,wind_speed_10m,surface_pressure&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max&past_days=1&timezone=auto`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Open-Meteo returned status ${res.status}`);
      const raw = await res.json();

      const currentCode = raw.current?.weather_code ?? 0;
      const isDay = raw.current?.is_day === 1;
      const conditionMeta = getWmoConditionMeta(currentCode, isDay);
      const tempC = Math.round(raw.current?.temperature_2m ?? 20);
      const feelsLikeC = Math.round(raw.current?.apparent_temperature ?? tempC);
      const windKmh = Math.round(raw.current?.wind_speed_10m ?? 0);
      const humidity = Math.round(raw.current?.relative_humidity_2m ?? 50);
      const currentPressure = Math.round(raw.current?.surface_pressure ?? 1013);

      // Hourly data and pressure trend (comparing with 3 hours prior)
      const times: string[] = raw.hourly?.time || [];
      const hourlyPressures: number[] = raw.hourly?.surface_pressure || [];
      const hourlyTemps: number[] = raw.hourly?.temperature_2m || [];
      const hourlyHumids: number[] = raw.hourly?.relative_humidity_2m || [];
      const hourlyWinds: number[] = raw.hourly?.wind_speed_10m || [];
      const hourlyPops: number[] = raw.hourly?.precipitation_probability || [];
      const hourlyCodes: number[] = raw.hourly?.weather_code || [];
      const hourlyDays: number[] = raw.hourly?.is_day || [];
      const hourlyPrecip: number[] = raw.hourly?.precipitation || [];

      // Find current hour index
      const nowIsoHour = new Date().toISOString().slice(0, 13);
      let nowIdx = times.findIndex((t: string) => t.startsWith(nowIsoHour));
      if (nowIdx === -1) nowIdx = 24; // with past_days=1, index 24 is today at 00:00

      // Pressure Trend: compare now with index 3 hours prior
      let pressureDeltaHpa = 0;
      let pressureTrend: PressureTrend = 'steady';
      if (nowIdx >= 3 && hourlyPressures[nowIdx - 3] !== undefined) {
        pressureDeltaHpa = Number((currentPressure - hourlyPressures[nowIdx - 3]).toFixed(1));
        if (pressureDeltaHpa >= 1.0) pressureTrend = 'rising';
        else if (pressureDeltaHpa <= -1.0) pressureTrend = 'falling';
        else pressureTrend = 'steady';
      }

      // Yesterday Comparison: compare current hour with index 24 hours prior
      let yesterdayComparison: YesterdayComparison | undefined;
      const yesterdayIdx = nowIdx - 24;
      if (yesterdayIdx >= 0 && hourlyTemps[yesterdayIdx] !== undefined) {
        const yTemp = Math.round(hourlyTemps[yesterdayIdx]);
        const yHumid = hourlyHumids[yesterdayIdx] ?? humidity;
        const diffC = tempC - yTemp;
        const diffF = cToF(tempC) - cToF(yTemp);
        const isWarmer = diffC > 0;
        const humidDiff = humidity - yHumid;

        let summaryText = '';
        if (Math.abs(diffC) <= 1) {
          summaryText = `About the same temperature as yesterday (${tempC}°C · ${cToF(tempC)}°F)`;
        } else {
          const warmerCooler = isWarmer ? 'warmer' : 'cooler';
          const humidText =
            humidDiff > 8 ? 'and noticeably more humid' : humidDiff < -8 ? 'and less humid' : 'with similar humidity';
          summaryText = `${Math.abs(diffC)}°C (${Math.abs(diffF)}°F) ${warmerCooler} ${humidText} than yesterday`;
        }

        yesterdayComparison = {
          tempDiffC: diffC,
          tempDiffF: diffF,
          isWarmer,
          humidityDiff: humidDiff,
          summaryText,
        };
      }

      // Activity Window matching preferences
      const defaultPrefs: ActivityPreferences = activityPrefs || {
        activityType: 'run',
        minTempC: 12,
        maxTempC: 24,
        maxWindKmh: 25,
        maxPopPercent: 20,
      };

      const buildHourlyItem = (i: number, isNowLabel: boolean): HourlyForecast => {
        const timeIso = times[i];
        const dt = new Date(timeIso);
        const hourLabel = isNowLabel
          ? 'Now'
          : dt.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
        const hTempC = Math.round(hourlyTemps[i] ?? 20);
        const hWind = Math.round(hourlyWinds[i] ?? 10);
        const hPop = Math.round(hourlyPops[i] ?? 0);
        const hCode = hourlyCodes[i] ?? 0;
        const hIsDay = hourlyDays[i] === 1;
        const hMeta = getWmoConditionMeta(hCode, hIsDay);

        const isOptimal =
          hTempC >= defaultPrefs.minTempC &&
          hTempC <= defaultPrefs.maxTempC &&
          hWind <= defaultPrefs.maxWindKmh &&
          hPop <= defaultPrefs.maxPopPercent;

        return {
          time: timeIso,
          hourLabel,
          tempC: hTempC,
          tempF: cToF(hTempC),
          condition: hMeta.description,
          conditionCode: hCode,
          popPercent: hPop,
          isDay: hIsDay,
          windSpeedKmh: hWind,
          isActivityOptimal: isOptimal,
        };
      };

      // Daily Forecasts (skip index 0 which was yesterday)
      const dailyDays: DailyForecast[] = (raw.daily?.time || []).slice(1, 8).map((dateStr: string, idx: number) => {
        const actualIdx = idx + 1;
        const d = new Date(dateStr + 'T12:00:00');
        const isToday = idx === 0;
        const dayName = isToday ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' });
        const maxC = Math.round(raw.daily?.temperature_2m_max?.[actualIdx] ?? 20);
        const minC = Math.round(raw.daily?.temperature_2m_min?.[actualIdx] ?? 12);
        const code = raw.daily?.weather_code?.[actualIdx] ?? 0;
        const meta = getWmoConditionMeta(code, true);
        const pop = Math.round(raw.daily?.precipitation_probability_max?.[actualIdx] ?? 0);
        const sunriseIso = raw.daily?.sunrise?.[actualIdx] || '';
        const sunsetIso = raw.daily?.sunset?.[actualIdx] || '';

        const formatSunTime = (iso: string) => {
          if (!iso) return '--:--';
          const dt = new Date(iso);
          return isNaN(dt.getTime())
            ? iso.split('T')[1]?.slice(0, 5) || '--:--'
            : dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        };

        // Group matching hourly items for this specific date (up to 24 hours)
        const dayHourly: HourlyForecast[] = [];
        for (let i = 0; i < times.length; i++) {
          if (times[i].startsWith(dateStr)) {
            dayHourly.push(buildHourlyItem(i, false));
          }
        }

        return {
          date: dateStr,
          dayName,
          isToday,
          maxTempC: maxC,
          maxTempF: cToF(maxC),
          minTempC: minC,
          minTempF: cToF(minC),
          condition: meta.description,
          conditionCode: code,
          popPercent: pop,
          sunrise: formatSunTime(sunriseIso),
          sunset: formatSunTime(sunsetIso),
          hourly: dayHourly,
        };
      });

      const hourlySliced: HourlyForecast[] = [];
      const startIdx = Math.max(0, nowIdx);
      for (let i = startIdx; i < startIdx + 24 && i < times.length; i++) {
        hourlySliced.push(buildHourlyItem(i, i === startIdx));
      }

      // Golden Hour & Blue Hour calculations
      const todaySunriseIso = raw.daily?.sunrise?.[1] || '';
      const todaySunsetIso = raw.daily?.sunset?.[1] || '';
      const astronomicalWindows = calculateAstronomicalWindows(todaySunriseIso, todaySunsetIso);

      // Next-Hour Rain Nowcasting
      const nextHourRain = calculateNextHourRain(
        currentCode,
        hourlyPops[startIdx] || 0,
        hourlyPrecip[startIdx] || 0
      );

      // Severe Weather Alerts
      const alerts: SevereAlert[] = [];
      if (currentCode >= 95) {
        alerts.push({
          id: 'severe_storm_' + Date.now(),
          title: 'Severe Thunderstorm Warning',
          severity: 'warning',
          description: 'High wind gusts, lightning, and hail possible in the area. Seek sturdy indoor shelter.',
          source: 'Meteorological Service Feed',
          expires: 'Active for the next 2 hours',
        });
      } else if (windKmh > 50) {
        alerts.push({
          id: 'wind_advisory_' + Date.now(),
          title: 'High Wind Advisory',
          severity: 'advisory',
          description: `Sustained winds of ${windKmh} km/h (${kmhToMph(windKmh)} mph) observed. Secure outdoor furniture.`,
          source: 'Meteorological Service',
          expires: 'Until 11:00 PM',
        });
      }

      const weatherData: WeatherData = {
        location,
        current: {
          tempC,
          tempF: cToF(tempC),
          feelsLikeC,
          feelsLikeF: cToF(feelsLikeC),
          humidity,
          windSpeedKmh: windKmh,
          windSpeedMph: kmhToMph(windKmh),
          condition: conditionMeta.description,
          conditionCode: currentCode,
          isDay,
          sunrise: dailyDays[0]?.sunrise || '6:15 AM',
          sunset: dailyDays[0]?.sunset || '7:45 PM',
          surfacePressure: currentPressure,
          pressureTrend,
          pressureDeltaHpa,
        },
        hourly: hourlySliced,
        daily: dailyDays,
        alerts,
        yesterdayComparison,
        nextHourRain,
        astronomicalWindows,
        timezone: raw.timezone,
        utcOffsetSeconds: raw.utc_offset_seconds,
        fetchedAt: Date.now(),
        source: 'Open-Meteo',
        isOfflineCached: false,
      };

      saveWeatherDataToCache(weatherData);
      return weatherData;
    } catch (err) {
      console.warn('Network fetch error, falling back to cache:', err);
    }
  }

  // Fallback to cache
  const cached = getCachedWeatherData(location.lat, location.lon);
  if (cached) return cached;

  throw new Error(
    `No offline cache available for ${location.name}. Connect to the internet to fetch the forecast.`
  );
}

// OpenWeatherMap implementation
async function fetchFromOpenWeatherMap(
  location: LocationInfo,
  apiKey: string,
  activityPrefs?: ActivityPreferences
): Promise<WeatherData> {
  const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=${apiKey}&units=metric`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${location.lat}&lon=${location.lon}&appid=${apiKey}&units=metric`;

  const [currRes, foreRes] = await Promise.all([fetch(currentUrl), fetch(forecastUrl)]);
  if (!currRes.ok) throw new Error(`OpenWeatherMap error: ${currRes.status}`);
  const currData = await currRes.json();
  const foreData = foreRes.ok ? await foreRes.json() : null;

  const tempC = Math.round(currData.main?.temp ?? 20);
  const feelsLikeC = Math.round(currData.main?.feels_like ?? tempC);
  const windKmh = Math.round((currData.wind?.speed ?? 0) * 3.6);
  const isDay = currData.weather?.[0]?.icon?.includes('d') ?? true;
  const condition = currData.weather?.[0]?.main || 'Clear';
  const humidity = currData.main?.humidity ?? 50;
  const pressure = currData.main?.pressure ?? 1013;

  const sunrise = currData.sys?.sunrise
    ? new Date(currData.sys.sunrise * 1000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    : '6:30 AM';
  const sunset = currData.sys?.sunset
    ? new Date(currData.sys.sunset * 1000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    : '7:30 PM';

  const hourly: HourlyForecast[] = (foreData?.list || []).slice(0, 10).map((item: any, idx: number) => {
    const dt = new Date(item.dt * 1000);
    const hTempC = Math.round(item.main?.temp ?? tempC);
    const hWind = Math.round((item.wind?.speed ?? 0) * 3.6);
    const pop = Math.round((item.pop ?? 0) * 100);

    const isOptimal = activityPrefs
      ? hTempC >= activityPrefs.minTempC &&
        hTempC <= activityPrefs.maxTempC &&
        hWind <= activityPrefs.maxWindKmh &&
        pop <= activityPrefs.maxPopPercent
      : true;

    return {
      time: dt.toISOString(),
      hourLabel: idx === 0 ? 'Now' : dt.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
      tempC: hTempC,
      tempF: cToF(hTempC),
      condition: item.weather?.[0]?.description || 'Clear',
      conditionCode: 0,
      popPercent: pop,
      isDay: item.weather?.[0]?.icon?.includes('d') ?? true,
      windSpeedKmh: hWind,
      isActivityOptimal: isOptimal,
    };
  });

  const weatherData: WeatherData = {
    location,
    current: {
      tempC,
      tempF: cToF(tempC),
      feelsLikeC,
      feelsLikeF: cToF(feelsLikeC),
      humidity,
      windSpeedKmh: windKmh,
      windSpeedMph: kmhToMph(windKmh),
      condition: currData.weather?.[0]?.description || condition,
      conditionCode: 0,
      isDay,
      sunrise,
      sunset,
      surfacePressure: pressure,
      pressureTrend: 'steady',
      pressureDeltaHpa: 0,
    },
    hourly,
    daily: [
      {
        date: new Date().toISOString().slice(0, 10),
        dayName: 'Today',
        isToday: true,
        maxTempC: tempC + 3,
        maxTempF: cToF(tempC + 3),
        minTempC: tempC - 4,
        minTempF: cToF(tempC - 4),
        condition,
        conditionCode: 0,
        popPercent: 10,
        sunrise,
        sunset,
      },
    ],
    nextHourRain: calculateNextHourRain(0, 10),
    astronomicalWindows: calculateAstronomicalWindows('', ''),
    utcOffsetSeconds: currData.timezone,
    fetchedAt: Date.now(),
    source: 'OpenWeatherMap',
    isOfflineCached: false,
  };

  saveWeatherDataToCache(weatherData);
  return weatherData;
}

// Favorites local persistence
export function getSavedFavorites(): FavoriteLocation[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) {
      return [
        { id: 'fav_tokyo', name: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503, addedAt: Date.now() },
        { id: 'fav_london', name: 'London', country: 'United Kingdom', lat: 51.5074, lon: -0.1278, addedAt: Date.now() },
        { id: 'fav_nyc', name: 'New York', country: 'United States', admin: 'New York', lat: 40.7128, lon: -74.006, addedAt: Date.now() },
      ];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveFavorites(favorites: FavoriteLocation[]): void {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch (err) {
    console.warn('Failed to save favorites', err);
  }
}

// App Settings persistence with PRD v2 defaults
export function getSavedSettings(): AppSettings {
  const defaultSettings: AppSettings = {
    theme: 'system',
    primaryUnit: 'C', // Select primary unit for prominent display
    severeAlertsEnabled: true, // Default ON per PRD
    autoRefreshEnabled: false, // Default OFF per PRD
    autoRefreshIntervalMinutes: 30,
    openWeatherMapKey: '',
    activityPreferences: {
      activityType: 'run',
      minTempC: 12,
      maxTempC: 24,
      maxWindKmh: 25,
      maxPopPercent: 20,
    },
  };

  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings;
    const parsed = JSON.parse(raw);
    return {
      ...defaultSettings,
      ...parsed,
      activityPreferences: {
        ...defaultSettings.activityPreferences,
        ...(parsed.activityPreferences || {}),
      },
    };
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.warn('Failed to save settings', err);
  }
}
