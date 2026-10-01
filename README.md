# Atmos — Premium Living Weather & Personalization Experience

[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

> **Live Production Deployment**: [https://atmos-gules-two.vercel.app/](https://atmos-gules-two.vercel.app/)
>
> *"Don't just show the weather. Explain the day."*

**Atmos V2.5** is a cinematic, deeply personalizable, human-centered living weather intelligence experience engineered with React, Tailwind CSS, Zustand, and Framer Motion. Powered by high-resolution Open-Meteo atmospheric models, Atmos transforms raw meteorological telemetry into clear daily briefings, actionable outdoor guidance, interactive "Why?" deep dives, and reactive living sky visuals.

---

## ✨ What's New in Atmos V2.5

### 🎨 1. Centralized Theme Engine & 10 Presets
- **10 Master Presets**: Classic Atmos, Weather Reactive (auto-syncs with sky code), Midnight (sapphire/obsidian), AMOLED (pure #000000 black), Sunset, Ocean, Evergreen, Arctic, Aurora, and Minimal Mono.
- **Luminance Contrast Guard**: Automatically adjusts text contrast and borders to meet WCAG AA standards regardless of custom background or accent choices.
- **Dynamic CSS Variables**: Seamless DOM injection (`:root`) of `--atmos-accent`, `--atmos-bg`, `--atmos-glow`, `--atmos-surface`, and `--atmos-border`.

### 🪟 2. Glass Studio
- **Configurable Levels**: Off, Soft (subtle blur, low opacity), Medium (standard balanced glass), and Strong (deep blur, luminous border).
- **Fine-Grain Controls**: Custom Blur slider (8–32px), Opacity slider (4–25%), Border style (default, bright, off), and Tint modes (cool sky, warm sunset, custom).
- **CSS Fallback Guard**: Fully compliant `@supports (-webkit-backdrop-filter: blur(...))` fallback for older browsers.

### ✍️ 3. Typography Studio
- **5 Curated Typefaces**: Plus Jakarta Sans (default), Outfit (modern geometric), Nunito (soft rounded), Space Grotesk (tech/data), and JetBrains Mono (editorial/developer).
- **Scale Selector**: Compact, Standard, and Large viewport scaling.
- **Temperature Display Format**: Toggle between clean (`26°`), spaced (`26 °C`), and compact with unit (`26°C`).

### 🧱 4. Dashboard Builder
- **Reorderable Sections**: Drag or move sections up/down to customize your personal layout.
- **Toggle Visibility**: Show or hide any card or intelligence module (Timeline, Hourly, Day Intelligence, Insights, Activity, Forecast, Telemetry, Air Quality, Comparison).
- **Layout Density**: Compact, Comfortable, or Spacious padding modes.

### ⚡ 5. Weather Effects & Performance Modes
- **3 Performance Profiles**:
  - **Battery Saver**: 30fps cap, pauses off-screen particle systems, disables intense backdrop blurs.
  - **Balanced**: Standard 60fps, responsive visual animations.
  - **Cinematic**: Full resolution, high-density celestial particles, rich atmospheric lighting.
- **Accessibility**: First-class `prefers-reduced-motion` compliance.

### 👤 6. Personalization Profiles & Auto-Adapt
- **Saved Profiles**: Save named configuration presets (e.g., "Work Setup", "Night Walk", "Clean Minimal").
- **Auto-Adapt Mode**: Dynamically switches presets across the diurnal cycle (Daylight → Sunset → Midnight).

### 🔍 7. Weather Deep-Dive ("Why?" Explanations)
- **Interactive Metric Inspection**: Tap Temperature, Wind, Humidity, UV, Rain, Pressure, Visibility, or AQI.
- **24-Hour Telemetry Curves**: High-resolution interactive hourly trend curves rendered via Recharts.
- **Zero Fabrication**: Honest, data-driven explanations derived strictly from real Open-Meteo physical measurements.

### 📅 8. "Plan Your Day" Window Finder & Travel Mode
- **Activity Matcher**: Select activity (Running, Cycling, Photography, Outdoor Dining, Walking, Stargazing) and duration to identify the ideal window across the next 48 hours (or honestly state *"No ideal window found"*).
- **Travel Mode**: Instant dual-weather comparison sheet between your origin and destination.

### 📖 9. Weather Memories & Share Studio
- **Local Weather Journal**: Save snapshots of memorable days with weather badges, notes, and local storage persistence.
- **Share Studio**: Export high-resolution weather cards in **9:16 Story**, **1:1 Square**, or **16:9 Banner** formats across 5 visual styles (Cinematic, Glass, Minimal, AMOLED, Weather Reactive).

### 📶 10. PWA & Offline Banner
- Non-intrusive status banner indicating offline cache state and timestamp of last successful meteorological sync.

---

## 🛠️ Architecture & Tech Stack

- **Frontend Core**: React 18, Vite 6, Zustand (persisted state store with v2 migration schema), Framer Motion, Recharts
- **Styling & Visuals**: Tailwind CSS, Lucide Icons, HTML5 2D Atmospheric Canvas (procedural sky, clouds, rain, snow, stars, and lightning)
- **Data Providers**:
  - **Open-Meteo Forecast API**: High-resolution current, hourly, and 7-day weather telemetry (No API key required)
  - **Open-Meteo Air Quality API**: Real-time particulate and trace gas telemetry
  - **Open-Meteo Geocoding API** & **OpenStreetMap Nominatim**: Global city search and reverse geocoding

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.0.0 or higher
- npm

### 1. Clone & Install
```bash
git clone https://github.com/manishmeena513/Atmos.git
cd Atmos
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. No API keys or `.env` secrets are required.

### 3. Build for Production
```bash
npm run build
```

---

## 👨‍💻 Developer & Copyright

- **Developer**: Manish Meena
- **Copyright**: © 2026 Atmos. All rights reserved. Developed by Manish Meena.

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.
