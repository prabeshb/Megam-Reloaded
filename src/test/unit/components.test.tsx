import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CurrentWeatherHero } from '../../components/CurrentWeatherHero';
import { YesterdayComparisonBanner } from '../../components/YesterdayComparisonBanner';
import { NextHourRainBar } from '../../components/NextHourRainBar';
import { QuickMetricsGrid } from '../../components/QuickMetricsGrid';
import { HourlyForecast } from '../../components/HourlyForecast';
import { GoldenHourCard } from '../../components/GoldenHourCard';
import { DailyForecast } from '../../components/DailyForecast';
import { SevereAlertBanner } from '../../components/SevereAlertBanner';
import { WidgetPreviewModal } from '../../components/WidgetPreviewModal';
import { SettingsModal } from '../../components/SettingsModal';
import { WeatherData, AppSettings } from '../../types/weather';

const MOCK_WEATHER_DATA: WeatherData = {
  location: {
    name: 'London',
    country: 'United Kingdom',
    lat: 51.51,
    lon: -0.13,
  },
  current: {
    tempC: 18,
    tempF: 64,
    feelsLikeC: 17,
    feelsLikeF: 63,
    humidity: 68,
    windSpeedKmh: 16,
    windSpeedMph: 9.9,
    condition: 'Partly cloudy',
    conditionCode: 2,
    isDay: true,
    sunrise: '6:15 AM',
    sunset: '7:45 PM',
    surfacePressure: 1018,
    pressureTrend: 'rising',
    pressureDeltaHpa: 1.8,
  },
  hourly: [
    {
      time: '2026-10-16T12:00',
      hourLabel: 'Now',
      tempC: 18,
      tempF: 64,
      condition: 'Partly cloudy',
      conditionCode: 2,
      popPercent: 15,
      isDay: true,
      windSpeedKmh: 16,
      isActivityOptimal: true,
    },
    {
      time: '2026-10-16T13:00',
      hourLabel: '1 PM',
      tempC: 28,
      tempF: 82,
      condition: 'Clear sky',
      conditionCode: 0,
      popPercent: 0,
      isDay: true,
      windSpeedKmh: 30,
      isActivityOptimal: false,
    },
  ],
  daily: [
    {
      date: '2026-10-16',
      dayName: 'Today',
      isToday: true,
      maxTempC: 20,
      maxTempF: 68,
      minTempC: 11,
      minTempF: 52,
      condition: 'Partly cloudy',
      conditionCode: 2,
      popPercent: 25,
      sunrise: '6:15 AM',
      sunset: '7:45 PM',
    },
    {
      date: '2026-10-17',
      dayName: 'Sat',
      isToday: false,
      maxTempC: 19,
      maxTempF: 66,
      minTempC: 10,
      minTempF: 50,
      condition: 'Rain',
      conditionCode: 61,
      popPercent: 70,
      sunrise: '6:17 AM',
      sunset: '7:43 PM',
      hourly: [
        {
          time: '2026-10-17T09:00',
          hourLabel: '9 AM',
          tempC: 15,
          tempF: 59,
          condition: 'Light drizzle',
          conditionCode: 51,
          popPercent: 40,
          isDay: true,
          windSpeedKmh: 12,
          isActivityOptimal: false,
        },
        {
          time: '2026-10-17T14:00',
          hourLabel: '2 PM',
          tempC: 19,
          tempF: 66,
          condition: 'Mainly clear',
          conditionCode: 1,
          popPercent: 10,
          isDay: true,
          windSpeedKmh: 10,
          isActivityOptimal: true,
        },
      ],
    },
  ],
  yesterdayComparison: {
    tempDiffC: -3,
    tempDiffF: -5,
    isWarmer: false,
    humidityDiff: -10,
    summaryText: '3°C (5°F) cooler and less humid than yesterday',
  },
  nextHourRain: {
    hasRain: true,
    summaryText: 'Light precipitation expected in ~15 minutes',
    minuteBars: Array.from({ length: 12 }, (_, i) => ({
      minute: i * 5,
      intensityMm: i >= 3 ? 1.2 : 0,
      level: i >= 3 ? 'light' : 'none',
    })),
  },
  astronomicalWindows: {
    morningBlueHour: '5:40 AM – 6:03 AM',
    morningGoldenHour: '6:03 AM – 7:00 AM',
    eveningGoldenHour: '7:00 PM – 7:57 PM',
    eveningBlueHour: '7:57 PM – 8:20 PM',
  },
  alerts: [
    {
      id: 'alert_1',
      title: 'Severe Thunderstorm Warning',
      severity: 'warning',
      description: 'Seek indoor shelter immediately.',
      source: 'Meteorological Service Feed',
      expires: 'Active for the next 2 hours',
    },
  ],
  fetchedAt: Date.now(),
  source: 'Open-Meteo',
};

describe('UI Components - Unit Tests', () => {
  it('renders CurrentWeatherHero with simultaneous dual units for both C and F primary settings', () => {
    const onOpenSearch = vi.fn();
    const onToggleFavorite = vi.fn();

    const { rerender } = render(
      <CurrentWeatherHero
        location={MOCK_WEATHER_DATA.location}
        current={MOCK_WEATHER_DATA.current}
        todayForecast={MOCK_WEATHER_DATA.daily[0]}
        primaryUnit="C"
        onOpenSearch={onOpenSearch}
        isFavorite={false}
        onToggleFavorite={onToggleFavorite}
        timezone="Europe/London"
        utcOffsetSeconds={3600}
      />
    );

    expect(screen.getByText('London')).toBeInTheDocument();
    expect(screen.getByText(/Local time ·/)).toBeInTheDocument();
    expect(screen.getByText('18°C')).toBeInTheDocument();
    expect(screen.getByText('64°F')).toBeInTheDocument();
    expect(screen.getByText(/Feels like 17°C/)).toBeInTheDocument();

    fireEvent.click(screen.getByTitle('Change location'));
    expect(onOpenSearch).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByLabelText('Add to favorites'));
    expect(onToggleFavorite).toHaveBeenCalledTimes(1);

    // Rerender with Fahrenheit primary
    rerender(
      <CurrentWeatherHero
        location={MOCK_WEATHER_DATA.location}
        current={MOCK_WEATHER_DATA.current}
        todayForecast={MOCK_WEATHER_DATA.daily[0]}
        primaryUnit="F"
        onOpenSearch={onOpenSearch}
        isFavorite={true}
        onToggleFavorite={onToggleFavorite}
      />
    );
    expect(screen.getByText(/Feels like 63°F/)).toBeInTheDocument();
    expect(screen.getByLabelText('Remove from favorites')).toBeInTheDocument();
  });

  it('renders YesterdayComparisonBanner accurately', () => {
    render(<YesterdayComparisonBanner comparison={MOCK_WEATHER_DATA.yesterdayComparison} />);
    expect(
      screen.getByText('3°C (5°F) cooler and less humid than yesterday')
    ).toBeInTheDocument();
  });

  it('renders NextHourRainBar with 12 5-minute bars, intensity legend, and Live Radar Nowcast vs Hourly Trend Estimate badge', () => {
    const { rerender } = render(<NextHourRainBar rainData={MOCK_WEATHER_DATA.nextHourRain} />);
    expect(screen.getByText('Next 60 Minutes')).toBeInTheDocument();
    expect(screen.getByText('Hourly Trend Estimate')).toBeInTheDocument();
    expect(screen.getByText('Light precipitation expected in ~15 minutes')).toBeInTheDocument();
    expect(screen.getByText('Light')).toBeInTheDocument();
    expect(screen.getByText('Heavy')).toBeInTheDocument();

    rerender(
      <NextHourRainBar
        rainData={{ ...MOCK_WEATHER_DATA.nextHourRain!, isLiveNowcast: true }}
      />
    );
    expect(screen.getByText('Live Radar Nowcast')).toBeInTheDocument();
  });

  it('renders QuickMetricsGrid with dual wind speed and pressure trend arrow', () => {
    render(<QuickMetricsGrid current={MOCK_WEATHER_DATA.current} />);
    expect(screen.getByText('68%')).toBeInTheDocument();
    expect(screen.getByText(/16 km\/h/)).toBeInTheDocument();
    expect(screen.getByText(/9\.9 mph/)).toBeInTheDocument();
    expect(screen.getByText('6:15 AM / 7:45 PM')).toBeInTheDocument();
    expect(screen.getByText(/1018 hPa/)).toBeInTheDocument();
    expect(screen.getByText('↗')).toBeInTheDocument();
  });

  it('renders HourlyForecast with optimal activity window indicator', () => {
    render(
      <HourlyForecast
        hourly={MOCK_WEATHER_DATA.hourly}
        primaryUnit="C"
        activityPrefs={{
          activityType: 'run',
          minTempC: 12,
          maxTempC: 24,
          maxWindKmh: 25,
          maxPopPercent: 20,
        }}
      />
    );
    expect(screen.getByText('Best Run Window')).toBeInTheDocument();
    expect(screen.getByTitle('Optimal Run window')).toBeInTheDocument();
    expect(screen.getByText('15%')).toBeInTheDocument();
  });

  it('expands and collapses GoldenHourCard to show all 4 astronomical windows', () => {
    render(<GoldenHourCard windows={MOCK_WEATHER_DATA.astronomicalWindows} />);
    expect(screen.getByText('Evening Golden Hour:')).toBeInTheDocument();
    expect(screen.getByText('7:00 PM – 7:57 PM')).toBeInTheDocument();

    // Expand card
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Morning Golden')).toBeInTheDocument();
    expect(screen.getByText('6:03 AM – 7:00 AM')).toBeInTheDocument();
    expect(screen.getByText('Morning Blue')).toBeInTheDocument();
    expect(screen.getByText('5:40 AM – 6:03 AM')).toBeInTheDocument();
    expect(screen.getByText('Evening Blue')).toBeInTheDocument();
  });

  it('renders DailyForecast with dual-unit highs and lows and expands a day row to show its horizontal hourly strip', () => {
    render(<DailyForecast daily={MOCK_WEATHER_DATA.daily} primaryUnit="C" />);
    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getByText('Sat')).toBeInTheDocument();
    expect(screen.getByText('20°C')).toBeInTheDocument();
    expect(screen.getByText('· 68°F')).toBeInTheDocument();
    expect(screen.getByText('70%')).toBeInTheDocument();

    // Tap 'Sat' row to expand its 24-hour forecast strip
    fireEvent.click(screen.getByText('Sat'));
    expect(screen.getByText('9 AM')).toBeInTheDocument();
    expect(screen.getByText('2 PM')).toBeInTheDocument();
    expect(screen.getByText('40%')).toBeInTheDocument();

    // Tap 'Sat' again to collapse
    fireEvent.click(screen.getByText('Sat'));
    expect(screen.queryByText('9 AM')).not.toBeInTheDocument();
  });

  it('expands and dismisses SevereAlertBanner', () => {
    render(<SevereAlertBanner alerts={MOCK_WEATHER_DATA.alerts} enabled={true} />);
    expect(screen.getByText('Severe Thunderstorm Warning')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Toggle alert details'));
    expect(screen.getByText('Seek indoor shelter immediately.')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Dismiss alert'));
    expect(screen.queryByText('Severe Thunderstorm Warning')).not.toBeInTheDocument();
  });

  it('toggles WidgetPreviewModal between 4x2 Panoramic and 2x2 Square Glance widgets', () => {
    const onClose = vi.fn();
    render(
      <WidgetPreviewModal
        isOpen={true}
        onClose={onClose}
        weatherData={MOCK_WEATHER_DATA}
        primaryUnit="C"
      />
    );

    expect(screen.getByText('Android Material You Widgets')).toBeInTheDocument();
    expect(screen.getByText('4 × 2 Panoramic Widget')).toBeInTheDocument();

    fireEvent.click(screen.getByText('2 × 2 Square Glance'));
    expect(screen.getByText('H: 20°')).toBeInTheDocument();
    expect(screen.getByText('L: 11°')).toBeInTheDocument();
  });

  it('converts Activity Window temperature thresholds between °C and °F and provides interactive wind/rain sliders in SettingsModal', () => {
    const onUpdateSettings = vi.fn();
    const baseSettings: AppSettings = {
      theme: 'system',
      primaryUnit: 'F',
      severeAlertsEnabled: true,
      autoRefreshEnabled: false,
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

    render(
      <SettingsModal
        isOpen={true}
        onClose={vi.fn()}
        settings={baseSettings}
        onUpdateSettings={onUpdateSettings}
      />
    );

    // When primaryUnit is 'F', minTempC=12 -> 54°F and maxTempC=24 -> 75°F
    const minTempInput = screen.getByLabelText('Min Ideal Temp') as HTMLInputElement;
    const maxTempInput = screen.getByLabelText('Max Ideal Temp') as HTMLInputElement;
    expect(minTempInput.value).toBe('54');
    expect(maxTempInput.value).toBe('75');

    // Editing minTemp in °F (e.g. 68°F) converts back to 20°C in settings
    fireEvent.change(minTempInput, { target: { value: '68' } });
    expect(onUpdateSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        activityPreferences: expect.objectContaining({
          minTempC: 20,
        }),
      })
    );

    // Interactive Max Wind slider shows dual km/h · mph and updates maxWindKmh
    expect(screen.getByText(/25 km\/h · 15\.5 mph/)).toBeInTheDocument();
    const windSlider = screen.getByLabelText('Max Wind Threshold') as HTMLInputElement;
    fireEvent.change(windSlider, { target: { value: '35' } });
    expect(onUpdateSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        activityPreferences: expect.objectContaining({
          maxWindKmh: 35,
        }),
      })
    );

    // Interactive Max Rain slider updates maxPopPercent
    const rainSlider = screen.getByLabelText('Max Rain Probability Threshold') as HTMLInputElement;
    fireEvent.change(rainSlider, { target: { value: '40' } });
    expect(onUpdateSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        activityPreferences: expect.objectContaining({
          maxPopPercent: 40,
        }),
      })
    );
  });
});
