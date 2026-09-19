import React from 'react';
import { motion } from 'framer-motion';
import { Sunrise, Sunset, Moon, Sun, Sparkles } from 'lucide-react';
import { useWeatherStore } from '../../store/weatherStore';

// Simple lunar phase calculation based on synodic month (29.5305877 days)
function getMoonPhase(date = new Date()) {
  const LUNAR_CYCLE = 29.53058770576;
  // Known new moon: Jan 11, 2024
  const reference = new Date(2024, 0, 11, 11, 57);
  const diffDays = (date.getTime() - reference.getTime()) / (1000 * 60 * 60 * 24);
  const age = ((diffDays % LUNAR_CYCLE) + LUNAR_CYCLE) % LUNAR_CYCLE;

  let name = 'New Moon';
  let illumination = 0;

  if (age < 1.84) {
    name = 'New Moon';
    illumination = 0;
  } else if (age < 5.53) {
    name = 'Waxing Crescent';
    illumination = 25;
  } else if (age < 9.22) {
    name = 'First Quarter';
    illumination = 50;
  } else if (age < 12.91) {
    name = 'Waxing Gibbous';
    illumination = 75;
  } else if (age < 16.61) {
    name = 'Full Moon';
    illumination = 100;
  } else if (age < 20.3) {
    name = 'Waning Gibbous';
    illumination = 75;
  } else if (age < 23.99) {
    name = 'Last Quarter';
    illumination = 50;
  } else if (age < 27.68) {
    name = 'Waning Crescent';
    illumination = 25;
  } else {
    name = 'New Moon';
    illumination = 0;
  }

  return { name, illumination, ageDays: age.toFixed(1) };
}

export function SunMoonArc() {
  const weather = useWeatherStore((s) => s.weather);
  const units = useWeatherStore((s) => s.units);
  const selectedHour = useWeatherStore((s) => s.selectedHour);

  if (!weather?.daily?.sunrise?.[0] || !weather?.daily?.sunset?.[0]) return null;

  const sunriseDate = new Date(weather.daily.sunrise[0]);
  const sunsetDate = new Date(weather.daily.sunset[0]);

  const sunriseH = sunriseDate.getHours() + sunriseDate.getMinutes() / 60;
  const sunsetH = sunsetDate.getHours() + sunsetDate.getMinutes() / 60;

  const currentHour = selectedHour !== null ? selectedHour : (new Date().getHours() + new Date().getMinutes() / 60);

  // Daylight duration
  const daylightHours = Math.floor(sunsetH - sunriseH);
  const daylightMinutes = Math.round(((sunsetH - sunriseH) % 1) * 60);

  // Solar progress 0 to 1
  let progress = 0;
  const isDaytime = currentHour >= sunriseH && currentHour <= sunsetH;
  if (currentHour < sunriseH) {
    progress = 0;
  } else if (currentHour > sunsetH) {
    progress = 1;
  } else {
    progress = (currentHour - sunriseH) / (sunsetH - sunriseH);
  }

  // Calculate coordinates along SVG arc: arc from (30, 110) to (270, 110) with peak at (150, 20)
  // Parametric ellipse arc:
  const angle = Math.PI - progress * Math.PI; // from PI (left) down to 0 (right)
  const cx = 150;
  const cy = 110;
  const rx = 120;
  const ry = 80;
  const dotX = cx + rx * Math.cos(angle);
  const dotY = cy - ry * Math.sin(angle);

  const formatTime = (d) =>
    d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: units.clock === '12h',
    });

  const moon = getMoonPhase();

  return (
    <div className="glass-panel rounded-3xl p-5 sm:p-7 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Sun className="w-4 h-4" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-white">
              Sun & Moon Cycle
            </h3>
          </div>
          <span className="text-xs text-slate-400">Solar Position</span>
        </div>

        {/* Daylight duration readout */}
        <div className="text-center my-1">
          <span className="text-xs text-slate-400 font-medium">
            {isDaytime ? 'Sun is up · ' : 'Nighttime · '}
            {daylightHours}h {daylightMinutes}m of daylight today
          </span>
        </div>

        {/* SVG Solar Arc */}
        <div className="relative w-full h-36 flex items-center justify-center">
          <svg viewBox="0 0 300 130" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="sunArcGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#FB923C" />
                <stop offset="50%" stopColor="#FDE047" />
                <stop offset="100%" stopColor="#F97316" />
              </linearGradient>
            </defs>

            {/* Base Arc Path */}
            <path
              d="M 30,110 A 120,80 0 0,1 270,110"
              fill="none"
              stroke="rgba(255, 255, 255, 0.12)"
              strokeWidth="2.5"
              strokeDasharray="4 4"
            />

            {/* Traversed Sun Arc Path */}
            <path
              d="M 30,110 A 120,80 0 0,1 270,110"
              fill="none"
              stroke="url(#sunArcGrad)"
              strokeWidth="3"
              strokeDasharray="300"
              strokeDashoffset={300 * (1 - progress)}
              strokeLinecap="round"
            />

            {/* Ground Horizon Base Line */}
            <line
              x1="15"
              y1="110"
              x2="285"
              y2="110"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="1"
            />

            {/* Current Sun Dot Indicator */}
            {isDaytime && (
              <g transform={`translate(${dotX}, ${dotY})`}>
                <circle r="12" fill="rgba(251, 146, 60, 0.25)" className="animate-pulse" />
                <circle r="6" fill="#FDE047" />
                <circle r="3" fill="#FFFFFF" />
              </g>
            )}
          </svg>
        </div>

        {/* Arc Endpoints: Sunrise & Sunset */}
        <div className="flex justify-between items-center px-4 -mt-2 text-xs">
          <div className="flex items-center gap-1.5 text-amber-400">
            <Sunrise className="w-4 h-4" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Sunrise</div>
              <div className="font-semibold text-slate-200">{formatTime(sunriseDate)}</div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-orange-400 text-right">
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Sunset</div>
              <div className="font-semibold text-slate-200">{formatTime(sunsetDate)}</div>
            </div>
            <Sunset className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Moon Phase Banner */}
      <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-300">
            <Moon className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-white">{moon.name}</div>
            <div className="text-[11px] text-slate-400">Lunar Day {moon.ageDays}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs font-bold text-indigo-300">{moon.illumination}%</div>
          <div className="text-[10px] text-slate-400">Illumination</div>
        </div>
      </div>
    </div>
  );
}
