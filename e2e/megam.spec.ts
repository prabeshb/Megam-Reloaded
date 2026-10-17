import { test, expect } from '@playwright/test';

const MOCK_OPEN_METEO_PAYLOAD = {
  current: {
    temperature_2m: 23,
    apparent_temperature: 22,
    relative_humidity_2m: 54,
    is_day: 1,
    weather_code: 1,
    wind_speed_10m: 15,
    surface_pressure: 1017,
  },
  hourly: {
    time: Array.from({ length: 48 }, (_, i) =>
      i === 24
        ? new Date().toISOString().slice(0, 13) + ':00'
        : `2026-10-16T${String(i % 24).padStart(2, '0')}:00`
    ),
    surface_pressure: Array(48).fill(1015),
    temperature_2m: Array(48).fill(23),
    relative_humidity_2m: Array(48).fill(50),
    wind_speed_10m: Array(48).fill(14),
    precipitation_probability: Array(48).fill(10),
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
    temperature_2m_max: [21, 25, 24, 23, 22, 21, 20, 19],
    temperature_2m_min: [12, 14, 13, 12, 11, 10, 9, 8],
    weather_code: [1, 1, 2, 3, 1, 0, 1, 2],
    precipitation_probability_max: [10, 15, 25, 40, 10, 5, 10, 15],
    sunrise: Array(8).fill('2026-10-16T06:20'),
    sunset: Array(8).fill('2026-10-16T18:15'),
  },
};

test.describe('Megam Weather v2.0 - End-to-End (E2E) Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept external weather & geocoding API calls for deterministic E2E execution
    await page.route('**/api.open-meteo.com/v1/forecast**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_OPEN_METEO_PAYLOAD),
      });
    });

    await page.route('**/geocoding-api.open-meteo.com/v1/search**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          results: [
            {
              id: 2950159,
              name: 'Berlin',
              latitude: 52.52437,
              longitude: 13.41053,
              country: 'Germany',
              admin1: 'Berlin',
            },
          ],
        }),
      });
    });
  });

  test('E2E 1: Renders full weather dashboard with simultaneous dual-unit hierarchy and PRD v2 niche cards', async ({
    page,
  }) => {
    await page.goto('/');

    // Header & Brand
    await expect(page.locator('header')).toContainText('Megam');

    // Dual-Unit Hero (23°C and 73°F visible simultaneously)
    await expect(page.getByText('23°C').first()).toBeVisible();
    await expect(page.getByText('73°F').first()).toBeVisible();
    await expect(page.getByText('Mainly clear').first()).toBeVisible();

    // 60-Minute Rain Bar Nowcasting
    await expect(page.getByText('Next 60 Minutes', { exact: true })).toBeVisible();
    await expect(page.getByText('Dry conditions expected for the next 60 minutes')).toBeVisible();

    // Quick Metrics Grid (Humidity, Dual Wind, Sunrise/Sunset, Barometric Pressure)
    await expect(page.getByText('Humidity')).toBeVisible();
    await expect(page.getByText('54%')).toBeVisible();
    await expect(page.getByText('Wind Speed')).toBeVisible();
    await expect(page.getByText(/15 km\/h/)).toBeVisible();
    await expect(page.getByText(/1017 hPa/)).toBeVisible();

    // Hourly Forecast & Activity Window Badge
    await expect(page.getByText('Hourly Forecast')).toBeVisible();
    await expect(page.getByText('Best Run Window')).toBeVisible();

    // Golden Hour & Blue Hour Calculator (Expand and verify all 4 windows)
    await expect(page.getByText('Golden & Blue Hours')).toBeVisible();
    await page.getByText('Golden & Blue Hours').click();
    await expect(page.getByText('Morning Golden')).toBeVisible();
    await expect(page.getByText('Evening Golden')).toBeVisible();
    await expect(page.getByText('Morning Blue')).toBeVisible();
    await expect(page.getByText('Evening Blue')).toBeVisible();

    // 7-Day Forecast & Version Footer
    await expect(page.getByText('7-Day Forecast')).toBeVisible();
    await expect(page.getByText('v2.0.1')).toBeVisible();
  });

  test('E2E 2: Configures Settings (Fahrenheit primary unit, Dark mode, Activity thresholds)', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.getByText('Mainly clear').first()).toBeVisible();

    // Open Settings Modal
    await page.getByLabel('Settings').click();
    await expect(page.getByText('Prominent Primary Unit')).toBeVisible();

    // Select Fahrenheit Primary
    await page.getByText('Fahrenheit (°F) Primary').click();

    // Verify Ideal Temp inputs automatically converted 12°C -> 54°F and 24°C -> 75°F
    const minTempInput = page.getByLabel('Min Ideal Temp');
    const maxTempInput = page.getByLabel('Max Ideal Temp');
    await expect(minTempInput).toHaveValue('54');
    await expect(maxTempInput).toHaveValue('75');

    // Verify interactive Wind & Rain sliders are present and show dual units
    await expect(page.getByText('25 km/h · 15.5 mph')).toBeVisible();
    await expect(page.getByLabel('Max Wind Threshold')).toBeVisible();
    await expect(page.getByLabel('Max Rain Probability Threshold')).toBeVisible();

    // Select Cycling Activity Window
    await page.getByText(/Cycling/).click();

    // Switch to Dark Theme
    await page.getByRole('button', { name: 'Dark' }).click();
    await expect(page.locator('html')).toHaveClass(/dark/);

    // Close Settings and verify dashboard reflects changes
    await page.getByLabel('Close').click();
    await expect(page.getByText('Best Ride Window')).toBeVisible();
    await expect(page.getByText(/Feels like 72°F/)).toBeVisible();
  });

  test('E2E 3: Searches global cities, toggles Favorites, and switches via Location Pager', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.getByText('Mainly clear').first()).toBeVisible();

    // Open Search Modal
    await page.getByLabel('Search location').click();
    const searchInput = page.getByPlaceholder('Search city, region, or country...');
    await expect(searchInput).toBeVisible();

    // Search for Berlin
    await searchInput.fill('Berlin');
    await expect(page.getByText('Germany')).toBeVisible();
    await page.getByText('Berlin').first().click();

    // Verify active city updated to Berlin
    await expect(page.getByTitle('Change location')).toContainText('Berlin');

    // Star Berlin to add to Favorites
    await page.getByLabel('Add to favorites').click();
    await expect(page.getByLabel('Remove from favorites')).toBeVisible();

    // Open Favorites Drawer and verify Berlin is listed
    await page.getByLabel('View favorite locations').click();
    await expect(page.getByText('Favorite Locations')).toBeVisible();
    await expect(page.getByText('(4)')).toBeVisible();
    await page.getByLabel('Close').click();
  });

  test('E2E 4: Previews Android Material You 4x2 and 2x2 Home Screen Widgets & Desktop Viewport Switcher', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.getByText('Mainly clear').first()).toBeVisible();

    // Open Material You Widgets Modal
    await page.getByLabel('Android Home Screen Widgets').click();
    await expect(page.getByText('Android Material You Widgets')).toBeVisible();
    await expect(page.getByText('4 × 2 Panoramic Widget')).toBeVisible();

    // Switch to 2x2 Square Glance Widget
    await page.getByText('2 × 2 Square Glance').click();
    await expect(page.getByText('H: 25°')).toBeVisible();
    await page.getByLabel('Close').click();

    // Switch Desktop Viewport between Mobile Device and Expanded View
    await page.getByRole('button', { name: 'Expanded View' }).click();
    await page.getByRole('button', { name: 'Mobile Device' }).click();
  });
});
