# Megam Weather (v2.0) — Technical Documentation

**Version:** 2.0.1 (Build `2026.10.16.1`)  
**Specification Reference:** `docs/Megam - Weather App v2.0.docx`  
**Last Updated:** October 16, 2026

---

## 1. Technology Stack & Dependencies

### 1.1 Core Runtime Dependencies (`package.json`)
| Package | Version | Role in Application |
| :--- | :--- | :--- |
| `react` / `react-dom` | `^19.0.1` | Core UI rendering library and component model. |
| `vite` | `^8.3.0` | Frontend build tool, dev server (`port 3000`), and asset bundler. |
| `@tailwindcss/vite` / `tailwindcss` | `^4.3.3` | Utility-first CSS framework (v4 engine) with dark mode support. |
| `lucide-react` | `^0.546.0` | Crisp vector iconography for weather states, metrics, and UI controls. |
| `@capacitor/core` / `@capacitor/android` | `^8.5.3` | Native Android runtime bridge packaging the web app into `com.megam.weather`. |
| `@vercel/analytics` | `^2.0.1` | Web vitals and page view analytics on Vercel deployments. |
| `motion` | `^12.23.24` | Animation library dependency available for UI transitions. |

### 1.2 Development & Build Tooling
- **TypeScript (`^7.0.2`):** Strict static typing verified via `npm run lint` (`tsc --noEmit`).
- **Capacitor CLI (`@capacitor/cli ^8.5.3`):** Synchronizes production web assets (`dist/`) into `android/app/src/main/assets/public`.
- **NPM Configuration (`.npmrc`):** Sets `legacy-peer-deps=true` to prevent peer dependency resolution conflicts between Vite 8, Tailwind v4, and Capacitor 8 during CI/CD builds.

---

## 2. Project Directory & File Reference

```text
Megam-Reloaded/
├── android/                                   # Capacitor Native Android project
│   ├── app/
│   │   ├── build.gradle                       # App ID (com.megam.weather), SDK versions, signing config
│   │   └── src/main/
│   │       ├── AndroidManifest.xml            # Permissions (INTERNET, COARSE/FINE LOCATION) & MainActivity
│   │       ├── assets/public/                 # Synced production web bundle from dist/
│   │       └── res/                           # Launcher icons, splash screens, XML resources
│   └── build.gradle                           # Root Gradle build configuration
├── docs/                                      # Project documentation & specifications
│   ├── Megam - Weather App v2.0.docx          # Product Requirements Document (PRD v2.0)
│   ├── ARCHITECTURE_DOCUMENTATION.md          # System & component architecture reference
│   ├── TECHNICAL_DOCUMENTATION.md             # Technical reference, APIs, & algorithms
│   └── FUNCTIONAL_DOCUMENTATION.md            # Functional workflows & PRD traceability matrix
├── public/
│   ├── icon.svg                               # Scalable vector app icon
│   └── manifest.json                          # PWA Web App Manifest
├── src/
│   ├── components/                            # 17 modular React UI components
│   ├── hooks/
│   │   ├── useOnlineStatus.ts                 # Window online/offline event listener hook
│   │   └── usePWAInstall.ts                   # PWA beforeinstallprompt & iOS detection hook
│   ├── services/
│   │   └── weatherService.ts                  # API clients, caching, and meteorological math
│   ├── types/
│   │   └── weather.ts                         # TypeScript domain models & interfaces
│   ├── App.tsx                                # Root stateful container & gesture coordinator
│   ├── index.css                              # Tailwind v4 import, custom font vars, utilities
│   ├── main.tsx                               # React 19 createRoot entry point
│   └── version.ts                             # APP_VERSION ('2.0.1') & APP_BUILD ('2026.10.16.1')
├── capacitor.config.ts                        # Capacitor configuration (appId, appName, webDir)
├── index.html                                 # Entry HTML with mobile viewport meta tags
├── package.json                               # Scripts and dependencies
├── tsconfig.json                              # TypeScript compiler configuration
├── vercel.json                                # Vercel SPA rewrites & caching headers
└── vite.config.ts                             # Vite plugins & HMR configuration
```

---

## 3. Data Models & TypeScript Interfaces (`src/types/weather.ts`)

### 3.1 Root Aggregate: `WeatherData`
```typescript
export interface WeatherData {
  location: LocationInfo;
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  alerts?: SevereAlert[];
  yesterdayComparison?: YesterdayComparison;
  nextHourRain?: NextHourPrecipitation;
  astronomicalWindows?: AstronomicalWindows;
  fetchedAt: number; // Unix epoch timestamp in ms
  source: 'Open-Meteo' | 'OpenWeatherMap' | 'Offline Cache';
  isOfflineCached?: boolean;
}
```

### 3.2 Supporting Domain Interfaces
- **`LocationInfo`**: `{ name: string; country: string; admin?: string; lat: number; lon: number; isCurrentLocation?: boolean }`
- **`CurrentWeather`**: Dual-unit temperatures (`tempC`, `tempF`, `feelsLikeC`, `feelsLikeF`), `humidity` (%), dual-unit wind (`windSpeedKmh`, `windSpeedMph`), `condition` description, WMO `conditionCode`, `isDay` boolean, `sunrise`/`sunset` formatted strings, `surfacePressure` (hPa), `pressureTrend` (`'rising' | 'steady' | 'falling'`), and `pressureDeltaHpa`.
- **`HourlyForecast`**: 24-hour slice containing `time` (ISO), `hourLabel` (`'Now'`, `'3 PM'`, etc.), `tempC`, `tempF`, `condition`, `conditionCode`, `popPercent` (0–100), `isDay`, `windSpeedKmh`, and `isActivityOptimal` boolean flag.
- **`DailyForecast`**: 7-day forecast entries with `date` (`YYYY-MM-DD`), `dayName` (`'Today'`, `'Mon'`, etc.), `isToday`, `maxTempC`, `maxTempF`, `minTempC`, `minTempF`, `condition`, `conditionCode`, `popPercent`, `sunrise`, and `sunset`.
- **`YesterdayComparison`**: `{ tempDiffC: number; tempDiffF: number; isWarmer: boolean; humidityDiff: number; summaryText: string }`
- **`NextHourPrecipitation`**: `{ hasRain: boolean; summaryText: string; minuteBars: MinuteRainBar[] }` where each `MinuteRainBar` represents a 5-minute step (`0, 5, 10, ..., 55`) with `intensityMm` and `level` (`'none' | 'light' | 'moderate' | 'heavy'`).
- **`AstronomicalWindows`**: `{ morningBlueHour: string; morningGoldenHour: string; eveningGoldenHour: string; eveningBlueHour: string }`
- **`AppSettings`**:
  ```typescript
  export interface AppSettings {
    theme: 'system' | 'light' | 'dark';
    primaryUnit: 'C' | 'F';
    severeAlertsEnabled: boolean;        // Default: true
    autoRefreshEnabled: boolean;         // Default: false
    autoRefreshIntervalMinutes: number;  // Default: 30 (options: 15, 30, 60)
    openWeatherMapKey: string;           // Default: ''
    activityPreferences: {
      activityType: 'run' | 'walk' | 'bike'; // Default: 'run'
      minTempC: number;                      // Default: 12
      maxTempC: number;                      // Default: 24
      maxWindKmh: number;                    // Default: 25
      maxPopPercent: number;                 // Default: 20
    };
  }
  ```

---

## 4. External API Integrations (`src/services/weatherService.ts`)

### 4.1 Open-Meteo Forecast API (Primary Provider)
- **Endpoint:** `GET https://api.open-meteo.com/v1/forecast`
- **Authentication:** None required (Free for non-commercial/open-source use, zero API keys in client bundle).
- **Query Parameters:**
  - `latitude={lat}&longitude={lon}`
  - `current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,surface_pressure`
  - `hourly=temperature_2m,precipitation_probability,precipitation,weather_code,is_day,wind_speed_10m,surface_pressure`
  - `daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max`
  - `past_days=1` *(Fetches yesterday's 24 hourly records at indices `0..23` so today's hours start at index `24`, enabling exact 24-hour relative comparisons and 3-hour barometric pressure trends even at midnight).*
  - `timezone=auto`

### 4.2 Open-Meteo Global Geocoding API
- **Endpoint:** `GET https://geocoding-api.open-meteo.com/v1/search`
- **Query Parameters:** `name={encodeURIComponent(query)}&count=6&language=en&format=json`
- **Debounce Timing:** Triggered in `SearchModal.tsx` with a `280ms` debounce when query length is `>= 2` characters.

### 4.3 BigDataCloud Reverse Geocoding API
- **Endpoint:** `GET https://api.bigdatacloud.net/data/reverse-geocode-client`
- **Query Parameters:** `latitude={lat}&longitude={lon}&localityLanguage=en`
- **Resolution Logic:** Extracts `data.city || data.locality || data.principalSubdivision || 'Current Location'`. If the network request fails, falls back gracefully to `{ name: 'Current Location', country: '${lat.toFixed(2)}°, ${lon.toFixed(2)}°' }`.

### 4.4 OpenWeatherMap 2.5 API (Optional Secondary Provider)
- **Endpoints:**
  - Current: `GET https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={apiKey}&units=metric`
  - Forecast: `GET https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={apiKey}&units=metric`
- **Activation Condition:** Invoked first only when `navigator.onLine` is `true` and `settings.openWeatherMapKey.trim().length > 10`. Automatically falls back to Open-Meteo on any HTTP or network failure.

---

## 5. Core Meteorological Algorithms & Calculations

### 5.1 Unit Conversion Formulas
- **Celsius to Fahrenheit (`cToF`):**
  $$F = \text{round}\left(\frac{C \times 9}{5} + 32\right)$$
- **Kilometers per hour to Miles per hour (`kmhToMph`):**
  $$\text{mph} = \frac{\text{round}(\text{km/h} \times 0.621371 \times 10)}{10}$$

### 5.2 WMO Weather Interpretation Code Mapping (`getWmoConditionMeta`)
Maps World Meteorological Organization (WMO) numeric codes (`0–99`) and `isDay` (`boolean`) to human descriptions, Lucide icon identifiers, and dynamic background themes:

| WMO Code(s) | Day Description | Night Description | Icon Name | Theme Type |
| :--- | :--- | :--- | :--- | :--- |
| `0` | Clear sky | Clear night | `sun` / `moon` | `sunny` / `night` |
| `1` | Mainly clear | Mainly clear | `sun` / `moon` | `sunny` / `night` |
| `2` | Partly cloudy | Partly cloudy | `cloud-sun` / `cloud-moon` | `cloudy` / `night` |
| `3` | Overcast | Overcast | `cloud` | `cloudy` |
| `45, 48` | Fog & mist | Fog & mist | `cloud-fog` | `cloudy` |
| `51–55` | Light drizzle | Light drizzle | `cloud-drizzle` | `rainy` |
| `56–57` | Freezing drizzle | Freezing drizzle | `cloud-snow` | `snow` |
| `61–65` | Rain (`65`: Heavy rain) | Rain (`65`: Heavy rain) | `cloud-rain` | `rainy` |
| `66–67` | Freezing rain | Freezing rain | `cloud-snow` | `snow` |
| `71–77` | Snowfall | Snowfall | `cloud-snow` | `snow` |
| `80–82` | Passing rain showers | Passing rain showers | `cloud-rain` | `rainy` |
| `85–86` | Snow showers | Snow showers | `cloud-snow` | `snow` |
| `95` | Thunderstorm | Thunderstorm | `cloud-lightning` | `storm` |
| `96–99` | Thunderstorm with hail | Thunderstorm with hail | `cloud-lightning` | `storm` |

### 5.3 Barometric Pressure 3-Hour Trend Calculation
Compares current surface pressure ($P_{\text{now}}$) against the hourly surface pressure recorded 3 hours earlier ($P_{\text{now}-3}$):
$$\Delta P = \text{round}((P_{\text{now}} - P_{\text{now}-3}) \times 10) / 10$$
- **Rising (`↗`):** $\Delta P \ge +1.0\text{ hPa}$ — Indicates clearing skies and improving weather.
- **Falling (`↘`):** $\Delta P \le -1.0\text{ hPa}$ — Indicates approaching low-pressure front or storm system.
- **Steady (`→`):** $-1.0\text{ hPa} < \Delta P < +1.0\text{ hPa}$ — Stable atmospheric conditions.

### 5.4 "Yesterday Comparison" 24-Hour Relative Summary
Compares current temperature ($T_{\text{now}}$) and humidity ($H_{\text{now}}$) with index `nowIdx - 24` ($T_{\text{yest}}, H_{\text{yest}}$):
- Temperature Delta: $\Delta T_C = T_{\text{now}} - T_{\text{yest}}$, $\Delta T_F = \text{cToF}(T_{\text{now}}) - \text{cToF}(T_{\text{yest}})$
- Humidity Delta: $\Delta H = H_{\text{now}} - H_{\text{yest}}$
- **Summary Generation Rules:**
  - If $|\Delta T_C| \le 1$: `"About the same temperature as yesterday ({tempC}°C · {tempF}°F)"`
  - If $|\Delta T_C| > 1$: `"{|ΔT_C|}°C ({|ΔT_F|}°F) {warmer|cooler} {humidityPhrase} than yesterday"`
    - $\Delta H > +8\%$: `"and noticeably more humid"`
    - $\Delta H < -8\%$: `"and less humid"`
    - $-8\% \le \Delta H \le +8\%$: `"with similar humidity"`

### 5.5 60-Minute Rain Bar Nowcasting (`calculateNextHourRain`)
Generates 12 five-minute bars (`minute = 0, 5, 10, ..., 55`) from the current WMO code, current hour precipitation probability (`hourlyPop`), and hourly precipitation (`hourlyPrecipMm`):
1. **Active Precipitation Detection (`isRainingNow`):** True if WMO code is in `[51..67]`, `[80..82]`, or `>= 95`.
2. **Upcoming Precipitation Probability (`hasChance`):** True if `isRainingNow || hourlyPop >= 25 || hourlyPrecipMm > 0.1`.
3. **Curve Synthesis:**
   - When `isRainingNow`: Uses a base intensity (`4.5 mm/h` for heavy/storm, `2.2 mm/h` for moderate rain, `0.8 mm/h` for drizzle) modulated by a sine wave $\sin\left(\frac{m}{60}\pi\right) \times 0.8 + 0.6$.
   - When `hasChance` (not currently raining): Computes estimated onset minute `startMin = max(10, floor(50 - (hourlyPop / 100) * 35))` and ramps intensity linearly (`(m - startMin) * 0.08 + 0.3`).
4. **Intensity Classification:**
   - `heavy`: $\ge 4.0\text{ mm/h}$
   - `moderate`: $1.5\text{ to }3.9\text{ mm/h}$
   - `light`: $0.1\text{ to }1.4\text{ mm/h}$
   - `none`: $0.0\text{ mm/h}$

### 5.6 Golden Hour & Blue Hour Astronomical Calculator (`calculateAstronomicalWindows`)
Computes four daily light windows relative to local sunrise ($t_{\text{sunrise}}$) and sunset ($t_{\text{sunset}}$) timestamps:
- **Morning Blue Hour:** $[t_{\text{sunrise}} - 35\text{ min},\ t_{\text{sunrise}} - 12\text{ min}]$
- **Morning Golden Hour:** $[t_{\text{sunrise}} - 12\text{ min},\ t_{\text{sunrise}} + 45\text{ min}]$
- **Evening Golden Hour:** $[t_{\text{sunset}} - 45\text{ min},\ t_{\text{sunset}} + 12\text{ min}]$
- **Evening Blue Hour:** $[t_{\text{sunset}} + 12\text{ min},\ t_{\text{sunset}} + 35\text{ min}]$

### 5.7 Personalized Activity Window Matching
Each hourly forecast item ($i \in [0..23]$) is flagged with `isActivityOptimal = true` when all four user-configured constraints are satisfied simultaneously:
$$\text{minTempC} \le T_{C,i} \le \text{maxTempC} \quad \land \quad W_{\text{kmh},i} \le \text{maxWindKmh} \quad \land \quad \text{PoP}_i \le \text{maxPopPercent}$$

---

## 6. Build, Verification & Deployment Pipelines

### 6.1 NPM Scripts (`package.json`)
| Command | Execution | Description |
| :--- | :--- | :--- |
| `npm run dev` | `vite --port=3000 --host=0.0.0.0` | Starts local development server with HMR on port 3000. |
| `npm run build` | `vite build` | Bundles optimized production web assets into `dist/`. |
| `npm run preview` | `vite preview` | Previews the production `dist/` bundle locally. |
| `npm run lint` | `tsc --noEmit` | Runs TypeScript type-checking across the entire repository. |
| `npm run android:sync` | `npm run build && npx cap sync android` | Builds production web assets and syncs them into the Android project. |
| `npm run android:open` | `npx cap open android` | Launches Android Studio with the `/android` project. |

### 6.2 Versioning Protocol
Application version metadata is centralized in `src/version.ts`:
```typescript
export const APP_VERSION = '2.0.1';
export const APP_BUILD = '2026.10.16.1';
```
When cutting a release:
1. Update `APP_VERSION` and `APP_BUILD` in `src/version.ts`.
2. Synchronize `"version"` in `package.json`.
3. Increment `versionCode` and update `versionName` in `android/app/build.gradle`.
4. Run `npm run android:sync` to propagate the updated bundle into Android assets.
