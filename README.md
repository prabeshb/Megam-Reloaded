# Megam Weather (v2.0)

A fast, lightweight, mobile-first weather application delivering quick forecasts for your current or searched locations with simultaneous metric and imperial temperature displays, offline caching, and native Android packaging.

---

## Key Features

### 1. Dual-Unit Temperature Visual Hierarchy
- **Simultaneous Display**: Both Celsius (°C) and Fahrenheit (°F) are visible at all times across current conditions, hourly forecasts, and 7-day high/low predictions.
- **Configurable Primary Unit**: Select whether °C or °F is emphasized as the primary unit in Settings. The primary unit is rendered prominently at 100% scale/opacity, while the secondary unit is displayed simultaneously beside it at 60% opacity.

### 2. "Yesterday Comparison" Micro-Copy
- A human-friendly relative summary comparing today's temperature and humidity against yesterday (e.g., *"4°C (7°F) cooler and less humid than yesterday"*), calculated on-device using historical meteorological data.

### 3. 60-Minute Rain Bar (Next-Hour Nowcasting)
- A minimalist, ultra-lightweight bar chart displaying minute-by-minute precipitation forecasts for the next 60 minutes without the battery and data overhead of radar map tiles.
- Features intuitive nowcast summaries (e.g., *"Light precipitation expected in ~15 minutes"* or *"Dry conditions expected for the next 60 minutes"*).

### 4. Golden Hour & Blue Hour Calculator
- Pure client-side astronomical calculation based on local solar coordinates, displaying exact morning and evening light windows for runners, walkers, and photographers at zero network cost:
  - Morning Blue Hour
  - Morning Golden Hour
  - Evening Golden Hour
  - Evening Blue Hour

### 5. Custom "Activity Windows" (Run / Walk / Bike Indicator)
- Set personalized outdoor comfort thresholds in Settings:
  - Activity Type: Running, Walking, or Cycling
  - Ideal temperature range (Min/Max °C or °F)
  - Maximum acceptable wind speed (km/h)
  - Maximum acceptable precipitation probability (%)
- Highlights matching optimal hours directly on the hourly forecast slider with an indicator badge.

### 6. Barometric Pressure Trend Arrow (↗ ↘ →)
- Compares atmospheric pressure with 3 hours prior to indicate pressure movement:
  - ↗ **Rising**: Clearing skies and fair weather ahead
  - ↘ **Falling**: Potential storm or precipitation approaching
  - → **Steady**: Stable atmospheric conditions

### 7. Horizontal Swipeable Location Pager
- Effortlessly switch between your auto-detected **Current GPS Location** and all your **Favorite Locations** via horizontal swipe gestures or by tapping the location indicator pills at the top.

### 8. Instant Cache-First Launch & Staleness Tracking
- **0ms Initial Render**: The app renders cached weather data immediately on startup so you never wait on an empty screen.
- **Asynchronous Refresh**: Automatically queries a fresh GPS coordinate fix and weather update in the background.
- **Staleness Badge**: Displays explicit last-updated metadata (e.g., *"Updated 12m ago"* or *"Offline Mode: Cached data"*).

### 9. Pull-To-Refresh Gesture
- Native-feeling touch drag-down gesture with spring resistance, release threshold, and rotating refresh indicator.

### 10. Android Material You Home Screen Widgets
- An interactive **Material You Widget Preview** modal (accessible via the widget icon in the top header) showing glanceable 4×2 and 2×2 widgets with side-by-side metric and imperial temperatures.

### 11. Privacy & Zero-Tracking Guarantee
- No user analytics, advertising SDKs, or third-party trackers.
- Location coordinates are used solely for weather queries and processed entirely on-device.

---

## Technical Architecture & Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Motion.
- **Native Android Wrapper**: Capacitor 8 (`@capacitor/core`, `@capacitor/android`, `@capacitor/cli`).
- **Weather APIs**:
  - **Open-Meteo API**: Primary out-of-the-box provider with global coverage, no API key required, and Open Database License (ODbL) compliance.
  - **OpenWeatherMap API**: Optional custom API key integration configurable in Settings.
- **Offline Storage**: LocalStorage caching with location-keyed snapshots.

---

## Project Structure

```
├── android/                         # Native Android Studio project
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── AndroidManifest.xml # Location & Internet permissions
│   │   │   ├── java/               # Native Android MainActivity
│   │   │   └── res/                # App icons, splash screens, strings
│   │   └── build.gradle            # App-level Gradle build configuration
│   ├── build.gradle                # Project-level Gradle build configuration
│   └── gradlew                     # Gradle wrapper script
├── public/
│   ├── icon.svg                    # Vector brand icon
│   └── manifest.json               # Web App Manifest for PWA installation
├── src/
│   ├── components/
│   │   ├── CurrentWeatherHero.tsx  # Dual-unit hero with primary/secondary hierarchy
│   │   ├── DailyForecast.tsx       # 7-day forecast with dual high/lows
│   │   ├── FavoritesDrawer.tsx     # Favorite cities manager
│   │   ├── GoldenHourCard.tsx      # Astronomical golden/blue hour light windows
│   │   ├── HourlyForecast.tsx      # 24-hour carousel with activity window highlights
│   │   ├── LocationPagerIndicator.tsx # Horizontal swipe pager indicator
│   │   ├── MobileFrame.tsx         # Realistic mobile device preview on desktop
│   │   ├── NextHourRainBar.tsx     # 60-minute nowcasting precipitation bar chart
│   │   ├── PullToRefresh.tsx       # Touch pull-to-refresh container
│   │   ├── QuickMetricsGrid.tsx    # Humidity, wind, sunrise/sunset, pressure trend
│   │   ├── SearchModal.tsx         # Global geocoding search & GPS trigger
│   │   ├── SettingsModal.tsx       # Primary unit, activity thresholds, theme, API key
│   │   ├── SevereAlertBanner.tsx   # Active weather warning banners
│   │   ├── WeatherHeader.tsx       # Top app bar with staleness timestamp
│   │   ├── WeatherIcons.tsx        # Weather condition icon mapping
│   │   └── WidgetPreviewModal.tsx  # Material You 4x2 and 2x2 widget simulator
│   ├── hooks/
│   │   ├── useOnlineStatus.ts      # Real-time network connectivity tracker
│   │   └── usePWAInstall.ts        # PWA beforeinstallprompt & iOS guidance
│   ├── services/
│   │   └── weatherService.ts       # Open-Meteo, OWM, geocoding, and astronomical math
│   ├── types/
│   │   └── weather.ts              # TypeScript interfaces and data models
│   ├── App.tsx                     # Main application container
│   ├── index.css                   # Global styles and font definitions
│   ├── main.tsx                    # React DOM entry point
│   └── version.ts                  # App version & build number tracker
├── .npmrc                          # npm configuration (legacy-peer-deps for Vercel builds)
├── capacitor.config.ts             # Capacitor Android configuration
├── index.html                      # HTML entry with mobile viewport tags
├── package.json                    # Dependencies and build scripts
├── vercel.json                     # Vercel deployment & SPA routing configuration
└── vite.config.ts                  # Vite build configuration
```

---

## Development & Usage

### 1. Web Development (Chrome / Browser / PWA)
Run the local development server:
```bash
npm run dev
```
Open `http://localhost:3000` in Google Chrome or any modern browser.

### 2. Build for Production Web
```bash
npm run build
```

### 3. Lint & Typecheck
```bash
npm run lint
```

### 4. Version Management & Code Commits
The currently running application version is managed in `src/version.ts`:
```typescript
export const APP_VERSION = '2.0.1';
export const APP_BUILD = '2026.10.16.1';
```

With each code commit or feature release:
1. Increment `APP_VERSION` (e.g. `2.0.1` -> `2.0.2`) and update `APP_BUILD` in `src/version.ts`.
2. Update `"version"` in `package.json`.
3. If deploying an Android update, increment `versionCode` and update `versionName` in `android/app/build.gradle`.
4. Run `npm run android:sync` to propagate the new version into the native Android platform.

The running version badge is rendered live at the bottom of the main screen and inside the **Settings** modal.

---

## Building the Native Android APK

The project is already pre-configured with a complete native Android project in the `/android` directory.

### Step 1: Synchronize Web Assets to Android
Whenever you update code in `src/`, sync the changes into the Android project:
```bash
npm run android:sync
```
*(This automatically runs `npm run build` and copies production assets into `android/app/src/main/assets/public`)*.

### Step 2: Open in Android Studio
Open the project in Android Studio:
```bash
npm run android:open
```
*Or manually:*
1. Launch **Android Studio**.
2. Select **Open an existing project**.
3. Choose the `/android` folder in this repository.

### Step 3: Build APK or AAB
In Android Studio:
1. Wait for Gradle sync to complete.
2. Select **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
3. Once built, click **locate** to retrieve your compiled `app-debug.apk` file to install on any Android smartphone.
4. For Google Play Store submission, choose **Build** > **Generate Signed Bundle / APK** to create an `.aab` (Android App Bundle).

---

## Deploying to Vercel

The application is pre-configured for zero-configuration, one-click deployment on **Vercel** via the included `vercel.json` file.

### Option A: Deploy via Git Integration (Recommended)
1. Push your repository to **GitHub**, **GitLab**, or **Bitbucket**.
2. Go to [vercel.com/new](https://vercel.com/new) and log in.
3. Import your Megam Weather repository.
4. Vercel automatically detects the project settings:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install --legacy-peer-deps` *(pre-configured via `.npmrc` and `vercel.json`)*
5. Click **Deploy**. Your app will build and go live with full HTTPS, edge caching, and global CDN delivery in seconds.

### Option B: Deploy via Vercel CLI
If you prefer deploying directly from your terminal:
```bash
# 1. Install Vercel CLI globally (if not already installed)
npm install -g vercel

# 2. Deploy preview build
vercel

# 3. Deploy to production
vercel --prod
```

### Dependency Resolution Fix (`--legacy-peer-deps`)
Modern npm uses strict peer-dependency validation by default, which can cause an `ERESOLVE` conflict when packaging newer Vite and Tailwind versions alongside Capacitor. This project includes two automatic safeguards so you never see this error on Vercel:
1. **`.npmrc`**: Contains `legacy-peer-deps=true` so all Vercel build runners resolve peer dependencies cleanly.
2. **`vercel.json`**: Explicitly defines `"installCommand": "npm install --legacy-peer-deps"` to override default strict install behavior.
3. If you manually configure the project in the Vercel Dashboard, ensure **Settings > General > Install Command** is set to `npm install --legacy-peer-deps` (or left to default, which reads `.npmrc`).

### Pre-Configured `vercel.json` Features
The repository includes a root `vercel.json` file that handles:
- **Install Command**: `npm install --legacy-peer-deps` for zero-friction builds.
- **SPA Rewrites**: Redirects all inbound routes (`/(.*)`) to `/index.html` so client-side state, modal paths, and deep links load seamlessly without 404 errors.
- **PWA Asset Headers**: Sets `Content-Type: application/manifest+json` on `/manifest.json` and configures immutable HTTP cache-control headers on `/icon.svg` for optimal Lighthouse PWA scores.
- **Environment Variables**: If you use any optional server-side keys (like `GEMINI_API_KEY`), add them in your Vercel Project Settings under **Settings > Environment Variables**.

---

## Publishing to Google Play Store

Follow this step-by-step guide to package, sign, and publish Megam Weather to the **Google Play Store**.

### Prerequisites
1. A **Google Play Developer Account** (register at [play.google.com/console](https://play.google.com/console) with a one-time $25 fee).
2. **Android Studio** installed on your workstation.

---

### Step 1: Sync the Latest Web Build
Before building the native bundle, always compile your web assets and sync them to the Android project:
```bash
npm run android:sync
```

---

### Step 2: Configure Versioning
Open `android/app/build.gradle` and ensure your release version codes are set:
```groovy
defaultConfig {
    applicationId "com.megam.weather"
    minSdkVersion 24
    targetSdkVersion 36
    versionCode 1          // Increment with every update (1, 2, 3...)
    versionName "2.0.0"    // User-visible version string
}
```

---

### Step 3: Generate a Production Signing Keystore (`.jks`)
Google Play requires all release builds to be cryptographically signed. You can generate an upload keystore via the terminal or Android Studio:

**Option A: Via Terminal (Mac/Linux/Windows WSL)**
```bash
keytool -genkey -v -keystore megam-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias megam-key
```
*(Store `megam-release-key.jks` in a secure location outside your git repository. It is already excluded in `.gitignore`)*.

**Option B: Via Android Studio UI**
1. In Android Studio, go to **Build** > **Generate Signed Bundle / APK**.
2. Select **Android App Bundle** and click **Next**.
3. Under *Key store path*, click **Create new...** and fill in your password and developer certificate details.

---

### Step 4: Build the Signed Android App Bundle (`.aab`)
Google Play requires the **AAB (Android App Bundle)** format rather than a standard APK for production uploads:

1. In Android Studio, go to **Build** > **Generate Signed Bundle / APK...**
2. Choose **Android App Bundle**, click **Next**.
3. Select your keystore (`megam-release-key.jks`), enter your passwords, and click **Next**.
4. Choose **release** as the build variant and click **Create**.
5. Once complete, Android Studio will output:
   `android/app/release/app-release.aab`

*(Or from terminal: `cd android && ./gradlew bundleRelease`)*

---

### Step 5: Prepare Store Listing Assets
Prepare the following graphic assets for your Google Play Console store listing:
- **App Title**: `Megam Weather` (≤ 30 characters).
- **Short Description**: `Fast, lightweight weather with simultaneous metric and imperial temperatures.` (≤ 80 characters).
- **Full Description**: Detailed overview of dual-unit forecasts, 60-min nowcasting, golden hour calculator, and offline caching.
- **App Icon**: 512 × 512 px PNG (32-bit with alpha, max 1MB).
- **Feature Graphic**: 1024 × 500 px JPEG or 24-bit PNG.
- **Phone Screenshots**: Minimum 2 screenshots (16:9 or 9:16 aspect ratio, min 320px, max 3840px).

---

### Step 6: Google Play Console Policies & Declarations

When setting up your app in the **Google Play Console**, fill out the required policy questionnaires as follows:

1. **Privacy Policy**:
   - Provide a public URL to your Privacy Policy (e.g., `https://your-app.vercel.app/privacy` or a GitHub Pages URL).
   - Required because the app requests location permissions (`ACCESS_FINE_LOCATION` and `ACCESS_COARSE_LOCATION`).

2. **Data Safety Section**:
   - **Location Data Collected**: Yes (Approximate location & Precise location).
   - **Data Sharing**: No — location data is **not** shared with third parties.
   - **Data Processing**: Ephemeral (used on-device strictly to query weather stations and not stored on external servers).
   - **Tracking / Ads**: Not used for advertising, tracking, or marketing.

3. **Location Permissions Declaration**:
   - State clearly: *"Location permissions are requested strictly while the app is in use to fetch local weather forecasts, hourly projections, and severe storm warnings for the user's current city."*

4. **App Content & Rating**:
   - Complete the IARC rating questionnaire (select News/Weather/Informational — rating is typically **Everyone / PEGI 3**).
   - Ads: Select **"No, my app does not contain ads"**.

---

### Step 7: Upload Release & Launch
1. In Google Play Console, go to **Testing > Internal testing** (or **Production**).
2. Click **Create new release**.
3. Upload your `app-release.aab` bundle.
4. Add release notes (e.g., *"Initial release of Megam Weather v2.0 with dual-unit temperature hierarchy, 60-minute rain nowcasting, and golden hour windows"*).
5. Click **Next**, review the pre-launch report, and submit for rollout!

---

## License
Apache-2.0


