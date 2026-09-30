# Atmos — Premium Weather Intelligence Experience

[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

> **Live Production Deployment**: [https://atmos-gules-two.vercel.app/](https://atmos-gules-two.vercel.app/)
>
> *"Don't just show the weather. Explain the day."*

**Atmos V2.0** is a cinematic, human-centered weather intelligence application engineered with React, Tailwind CSS, Zustand, and Framer Motion. Powered by high-resolution Open-Meteo atmospheric models, Atmos transforms raw meteorological telemetry into clear daily briefings, actionable outdoor guidance, and reactive living sky visuals.

---

## ✨ Key V2.0 Features

### 🌅 Atmos Daily Brief
- **Time-Aware Greeting**: Greets users (`GOOD MORNING`, `GOOD AFTERNOON`, `GOOD EVENING`, `GOOD NIGHT`) alongside current and apparent temperatures.
- **Natural-Language Day Summary**: Explains what the day will feel like, when temperatures peak, and whether rain or wind will impact plans.
- **4-Part Diurnal Breakdown**: Summarizes **Morning**, **Afternoon**, **Evening**, and **Night** temperatures and conditions from real hourly data.

### ⏱️ Interactive Weather Timeline & Time Machine
- **24-Hour Scrubber**: Smoothly scrub through today's hourly progression to watch the atmospheric sky and metrics respond in real time.
- **Expandable Hourly Cards**: Inspect formatted hourly slots (`08 AM`, `09 AM` / 24h) with temperature, feels-like, precipitation probability, wind speed, **wind gusts**, UV index, and humidity.

### 🧠 Day Intelligence Suite
- **Rain Intelligence**: Detects rain windows across the next 24 hours, identifies peak probability timing, and renders a 24-hour precipitation probability bar chart (with a clean `"Rain forecast unavailable."` fallback if data is missing).
- **What Should I Wear?**: Generates practical, non-medical clothing and gear suggestions based on real temperature, UV index, wind speed, and rain probability.
- **Atmos Comfort (`0–100`)**: Transparent, rule-based comfort indicator breaking down **Temperature**, **Humidity**, **Wind**, **Rain Risk**, and **UV Exposure**.

### 💡 Weather Insights, Trends & Changes
- **Weather Changes Alert Strip**: Highlights upcoming rain windows, rising afternoon gusts, elevated UV, or rapid evening cooling.
- **What This Weather Means**: Translates humidity, wind, UV, and apparent temperature into plain English.
- **Weather Trend**: Summarizes directional shifts in **Temperature**, **Wind**, **Rain**, and **Humidity** over the next 12 hours.

### 🏃 "Should I Go Out?" Activity Engine
- Evaluates 8 real-world activities (**Walking**, **Running**, **Cycling**, **Photography**, **Outdoor Study**, **Sports**, **Travel**, **General Outdoor**) with `GOOD CONDITIONS`, `MODERATE CONDITIONS`, or `POOR CONDITIONS` status badges, plain-language weather reasons, and prime time windows.

### 📅 Advanced 7-Day Forecast & Daylight Cycle
- **Expandable 7-Day Outlook**: Daily high/low temperature range bars with accordion inspection for UV peak, wind max, precipitation totals (`mm`), sunrise, and sunset.
- **Sun & Moon Progression**: Visual solar/lunar arc plus a linear daylight timeline (`🌅 Sunrise ───● NOW ─── 🌇 Sunset`) displaying remaining and total daylight duration.

### 🍃 Honest Air Quality Index (AQI)
- **European AQI & Pollutant Breakdown**: Live readings for PM2.5, PM10, Ozone ($\text{O}_3$), and Nitrogen Dioxide ($\text{NO}_2$).
- **"What's Driving Air Quality?"**: Automatically identifies the primary pollutant contributor from real station data.
- **Strict Zero-Fabrication Guard**: Displays `"Air quality data unavailable."` if monitoring data is unavailable — never fabricated numbers.

### 📤 Shareable Weather Card & Saved Cities
- **Share Weather Card**: Generate a high-resolution visual weather card (`PNG` download or one-tap copy/share) ready for WhatsApp, Instagram, and social sharing.
- **Saved Cities Switcher**: Pin favorite global cities with live temperature and condition badges for instant switching.

---

## 🛠️ Architecture & Tech Stack

- **Frontend Core**: React 18, Vite 6, Zustand (persisted state store), Framer Motion
- **Styling & Visuals**: Tailwind CSS, Lucide Icons, HTML5 2D Atmospheric Canvas (procedural sky, clouds, rain, snow, stars, and lightning)
- **Serverless API Layer**: Vercel Node/Edge functions (`/api/weather`, `/api/airquality`, `/api/geocode`) with caching and validation
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
