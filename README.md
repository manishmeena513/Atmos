# Atmos — Living Atmospheric Weather System

[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL-black?style=flat-square&logo=three.js&logoColor=white)](https://threejs.org/)
[![Mapbox](https://img.shields.io/badge/Mapbox_GL_JS-3.3-000000?style=flat-square&logo=mapbox&logoColor=white)](https://www.mapbox.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

> **Live Production Deployment**: [https://atmos-gules-two.vercel.app/](https://atmos-gules-two.vercel.app/)

**Atmos** is a premium, high-fidelity living atmospheric weather application engineered with React, Three.js, Mapbox GL JS, and Framer Motion. Powered by Open-Meteo APIs, Atmos bridges real-time meteorological data with real-time digital twin graphics — delivering responsive weather animations, interactive geographic maps, and planetary visualizations without compromise.

---

## ✨ Features

### 🌌 Dynamic Living Atmospheric Canvas
- **Procedural Weather Physics**: Real-time canvas particle systems simulating rain, snow, mist, thunder, and cloud cover driven directly by current meteorological telemetry (precipitation rate, wind speed, cloud density, and daylight status).
- **Sun & Moon Position Simulation**: Celestial trajectories calculated accurately based on local sunrise/sunset timings and geographic latitude.
- **Glassmorphic UI**: Ultra-thin glass panels with dynamic backdrop blur, subtle borders, and depth layering optimized for high-refresh desktop and mobile viewports.

### 🗺️ Interactive Location Map
- **High-Precision Mapbox Base**: Cartographic vector dark style base map powered by Mapbox GL JS with smooth pan, zoom, and hardware-accelerated rendering.
- **Location Pinning**: Pulsing target indicator dynamically pinned to active location coordinates with instant recenter and coordinate diagnostics.
- **Cooperative Controls**: Smooth touch and scroll gesture isolation ensuring comfortable map inspection on all devices.

### 🌍 3D Digital Twin Earth
- **WebGL Planetary System**: Rendered with Three.js featuring dual-texture day/night terminators, dynamic cloud layers, atmospheric Rayleigh glow shader, and specular ocean reflections.
- **Geographic Pinning**: Real-time lat/lon coordinate plotting with radiating pulse waves indicating current observation locations.
- **Graceful Fault Tolerance**: Automatic WebGL fallback states with full GPU memory disposal on unmount to prevent resource leaks.

### 📊 Comprehensive Meteorological Telemetry
- **Hourly Scrubber & Timeline**: Scroll-snapping 24-hour strip displaying temperature, apparent feels-like curves, weather glyphs, and precipitation probability.
- **7-Day Dynamic Forecast**: Expandable multi-day forecast cards featuring high/low temperature bars, precipitation accumulations, and dominant wind conditions.
- **Environmental Metrics**: Direct readings for UV index, surface pressure, atmospheric humidity, dew point, visibility, and daylight progression.

### 🍃 Honest Air Quality Index (AQI)
- **Multi-Standard Support**: European AQI (EAQI) and US AQI scale gauges.
- **Pollutant Breakdown**: Granular microgram metrics for PM2.5, PM10, Nitrogen Dioxide ($\text{NO}_2$), Ozone ($\text{O}_3$), Sulphur Dioxide ($\text{SO}_2$), and Carbon Monoxide ($\text{CO}$).
- **Zero-Fabrication Architecture**: If ground atmospheric stations lack air quality telemetry for remote areas, Atmos truthfully indicates data unavailability rather than displaying synthetic numbers.

### 🔍 Global Geocoding & Bookmarks
- **Instant Search**: Typeahead city searching powered by Open-Meteo Geocoding API with population and administrative hierarchy metadata.
- **Favorite Locations**: LocalStorage-persisted bookmarks for instant switching between tracked global metropolitan centers.
- **Device Geolocation**: Browser-native coordinate detection with reverse geocoding to automatically load local conditions.

---

## 🛠️ Architecture & Tech Stack

```
                                ┌────────────────────────────────┐
                                │     User Browser / Client      │
                                └───────────────┬────────────────┘
                                                │
                 ┌──────────────────────────────┴──────────────────────────────┐
                 ▼                                                             ▼
    ┌──────────────────────────┐                                  ┌──────────────────────────┐
    │     Vite / React App     │                                  │   Vercel Edge / Node     │
    │  (Zustand + Framer)      │                                  │    API Serverless        │
    └────────────┬─────────────┘                                  └────────────┬─────────────┘
                 │                                                             │
      ┌──────────┴──────────┐                                                  │
      ▼                     ▼                                                  ▼
┌─────────────┐       ┌─────────────┐                                    ┌─────────────┐
│ Three.js    │       │ Mapbox GL   │                                    │ Open-Meteo  │
│ WebGL Globe │       │ Canvas Base │                                    │ APIs        │
└─────────────┘       └─────────────┘                                    └─────────────┘
```

- **Frontend Core**: React 18, Vite 6, Zustand (atomic state store), Framer Motion
- **Styling**: Tailwind CSS, Lucide Icons, Custom CSS Glassmorphism
- **Visual Computing**: Three.js (WebGL Earth), HTML5 2D Canvas (Rain/Snow engines), Mapbox GL JS (Vector Map)
- **Data & APIs**:
  - **Open-Meteo Forecast API**: High-resolution hourly and daily weather telemetry (No API key required)
  - **Open-Meteo Air Quality API**: Atmospheric chemistry and particulate data
  - **Open-Meteo Geocoding API**: Global city name resolution
  - **Nominatim / OpenStreetMap**: Safe reverse-geocoding fallback

---

## 📂 Project Structure

```
Atmos/
├── api/                     # Vercel Serverless proxy functions
│   ├── airquality.js        # Air quality proxy with origin validation
│   ├── geocode.js           # Search geocoder proxy
│   └── weather.js           # Weather telemetry proxy with edge cache
├── public/                  # Static textures and icons
│   ├── earth-blue-marble.jpg
│   ├── earth-clouds.jpg
│   ├── earth-night.jpg
│   └── earth-specular.jpg
├── src/
│   ├── api/
│   │   └── openmeteo.js     # Unified client-side API layer & coordinate fallbacks
│   ├── components/
│   │   ├── airquality/      # Air quality gauges & pollutant grid
│   │   ├── forecast/        # Hourly timeline & 7-day forecast cards
│   │   ├── globe/           # Three.js 3D Earth digital twin
│   │   ├── hero/            # Hero temperature, sun/moon position, condition
│   │   ├── layout/          # Top navigation, search modal, settings sheet
│   │   ├── map/             # Mapbox interactive location map
│   │   ├── metrics/         # UV, humidity, pressure, visibility widgets
│   │   └── weather/         # Particle background canvas (Rain, Snow, Stars)
│   ├── store/
│   │   └── weatherStore.js  # Zustand state management (units, search, caches)
│   ├── styles/
│   │   └── index.css        # Glassmorphism, scrollbars, responsive rules
│   ├── App.jsx              # Main dashboard composition
│   └── main.jsx             # React DOM entrypoint
├── package.json
├── tailwind.config.js
└── vite.config.js           # Rollup chunking & dev API proxy middleware
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.0.0 or higher
- npm or pnpm / yarn

### 1. Clone & Install
```bash
git clone https://github.com/manishmeena513/Atmos.git
cd Atmos
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:

```env
# Optional: Mapbox public access token for vector base maps.
# If omitted, Atmos automatically falls back to CartoDB dark matter tiles.
VITE_MAPBOX_TOKEN=your_mapbox_public_token_here
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. The embedded Vite proxy automatically emulates Vercel's serverless `/api` routes locally.

### 4. Build for Production
```bash
npm run build
```
Generates optimized, tree-shaken static bundles in `dist/` with split vendor chunks for React, Framer Motion, Recharts, Mapbox, and Three.js.

---

## 🔒 Reliability & Quality Engineering (v1.0.1)

- **Strict Zero-Fabrication Metric Guard**: Fake static fallback values (e.g. synthetic AQI ratings) have been eliminated. Missing metrics display informative, non-intrusive unavailable states.
- **Cooperative Viewport Interaction**: Three.js Earth and canvas modules feature cooperative scroll zooming (`Ctrl + Scroll` / `Meta + Scroll`) and vertical pan pass-through (`touch-action: pan-y`) to prevent accidental touch lock on mobile devices.
- **Hardware Resource Teardown**: Comprehensive WebGL texture, geometry, and renderer disposal on unmount guarantees zero GPU memory accumulation during prolonged browsing sessions.

---

## 🌐 Data Providers & Credits

- Weather telemetry, hourly/daily forecasts, and air quality: [Open-Meteo](https://open-meteo.com/)
- Cartographic vector base maps: [Mapbox](https://www.mapbox.com/)
- Digital twin planetary textures: [NASA Earth Observatory](https://visibleearth.nasa.gov/)
- Geocoding and reverse location services: [Open-Meteo Geocoding](https://open-meteo.com/en/docs/geocoding-api) & [OpenStreetMap Nominatim](https://nominatim.openstreetmap.org/)

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.
