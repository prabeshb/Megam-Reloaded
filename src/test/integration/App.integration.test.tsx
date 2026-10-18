import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../../App';

function createMockOpenMeteoResponse(tempC = 22) {
  const nowHourIso = new Date().toISOString().slice(0, 13) + ':00';
  const times = Array.from({ length: 48 }, (_, i) =>
    i === 24 ? nowHourIso : `2026-10-16T${String(i % 24).padStart(2, '0')}:00`
  );
  return {
    current: {
      temperature_2m: tempC,
      apparent_temperature: tempC - 1,
      relative_humidity_2m: 52,
      is_day: 1,
      weather_code: 1,
      wind_speed_10m: 14,
      surface_pressure: 1016,
    },
    hourly: {
      time: times,
      surface_pressure: Array(48).fill(1014),
      temperature_2m: Array(48).fill(tempC),
      relative_humidity_2m: Array(48).fill(50),
      wind_speed_10m: Array(48).fill(12),
      precipitation_probability: Array(48).fill(5),
      weather_code: Array(48).fill(1),
      is_day: Array(48).fill(1),
      precipitation: Array(48).fill(0),
    },
    daily: {
      time: [
        '2026-10-15',
        '2026-10-16',
        '2026-10-17',
        '2026-10-18',
        '2026-10-19',
        '2026-10-20',
        '2026-10-21',
        '2026-10-22',
      ],
      temperature_2m_max: [20, 25, 24, 23, 22, 21, 20, 19],
      temperature_2m_min: [12, 15, 14, 13, 12, 11, 10, 9],
      weather_code: [1, 1, 2, 3, 1, 0, 1, 2],
      precipitation_probability_max: [10, 15, 20, 30, 10, 5, 10, 15],
      sunrise: Array(8).fill('2026-10-16T06:25'),
      sunset: Array(8).fill('2026-10-16T18:10'),
    },
  };
}

describe('Megam Weather App - Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();

    // Default mock fetch for Open-Meteo & Geocoding
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('geocoding-api.open-meteo.com')) {
        return {
          ok: true,
          json: async () => ({
            results: [
              {
                id: 101,
                name: 'Toronto',
                latitude: 43.65,
                longitude: -79.38,
                country: 'Canada',
                admin1: 'Ontario',
              },
            ],
          }),
        } as Response;
      }
      return {
        ok: true,
        json: async () => createMockOpenMeteoResponse(22),
      } as Response;
    });
  });

  it('loads default location weather, renders dual units, and updates primary unit & theme via SettingsModal', async () => {
    render(<App />);

    // Wait for forecast to render
    await waitFor(() => {
      expect(screen.getAllByText('Mainly clear').length).toBeGreaterThan(0);
    });

    // Verify simultaneous Celsius and Fahrenheit display
    expect(screen.getAllByText('22°C').length).toBeGreaterThan(0);
    expect(screen.getAllByText('72°F').length).toBeGreaterThan(0);
    expect(screen.getByText(/Data sourced via Open-Meteo/)).toBeInTheDocument();

    // Open Settings Modal
    fireEvent.click(screen.getByLabelText('Settings'));
    expect(screen.getByText('Prominent Primary Unit')).toBeInTheDocument();

    // Switch Primary Unit to Fahrenheit (°F)
    fireEvent.click(screen.getByText('Fahrenheit (°F) Primary'));
    expect(JSON.parse(localStorage.getItem('megan_weather_settings') || '{}').primaryUnit).toBe('F');

    // Switch Theme to Dark Mode
    fireEvent.click(screen.getByText('Dark'));
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    // Switch Activity Type to Walking
    fireEvent.click(screen.getByText(/Walking/));

    // Close Settings Modal
    fireEvent.click(screen.getByLabelText('Close'));
    expect(screen.getByText('Best Walk Window')).toBeInTheDocument();
  });

  it('switches locations via SearchModal and LocationPagerIndicator pills', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getAllByText('Mainly clear').length).toBeGreaterThan(0);
    });

    // Open Search Modal and pick a Popular City (Paris)
    fireEvent.click(screen.getByLabelText('Search location'));
    expect(screen.getByText('Find Location')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Paris'));

    await waitFor(() => {
      expect(screen.getAllByText('Paris').length).toBeGreaterThanOrEqual(1);
    });

    // Switch to favorite location "Tokyo" using the LocationPagerIndicator pill
    const tokyoPill = screen.getByTitle('Tokyo');
    fireEvent.click(tokyoPill);

    await waitFor(() => {
      expect(screen.getAllByText('Tokyo').length).toBeGreaterThanOrEqual(2);
    });
  });

  it('manages favorite cities through the hero star toggle and FavoritesDrawer', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getAllByText('Mainly clear').length).toBeGreaterThan(0);
    });

    // Open Favorites Drawer
    fireEvent.click(screen.getByLabelText('View favorite locations'));
    expect(screen.getByText('Favorite Locations')).toBeInTheDocument();
    expect(screen.getByText('(3)')).toBeInTheDocument();

    // Remove Tokyo from favorites
    const removeButtons = screen.getAllByLabelText('Remove favorite');
    fireEvent.click(removeButtons[0]);
    expect(screen.getByText('(2)')).toBeInTheDocument();

    // Close Favorites Drawer
    fireEvent.click(screen.getByLabelText('Close'));
  });

  it('displays Offline Mode notification banner when browser goes offline', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getAllByText('Mainly clear').length).toBeGreaterThan(0);
    });

    // Simulate offline event
    fireEvent(window, new Event('offline'));

    await waitFor(() => {
      expect(
        screen.getByText('Offline Mode: Displaying last known cached forecast')
      ).toBeInTheDocument();
    });
  });

  it('renders honest No Offline Cache Available state with retry button when viewing an uncached city offline', async () => {
    Object.defineProperty(window.navigator, 'onLine', { value: false, writable: true });

    render(<App />);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'No Offline Cache Available for New York' })
      ).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();

    Object.defineProperty(window.navigator, 'onLine', { value: true, writable: true });
  });
});
