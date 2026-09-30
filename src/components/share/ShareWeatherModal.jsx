import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Share2,
  Download,
  Copy,
  Check,
  CloudSun,
  MapPin,
  Wind,
  Droplets,
  Sparkles,
} from 'lucide-react';
import { useWeatherStore } from '../../store/weatherStore';
import { getWmoInfo } from '../../utils/wmoCodeMap';
import { generateDailyBriefData } from '../hero/DailyBrief';

function convertTemp(celsius, unit) {
  if (celsius === undefined || celsius === null || isNaN(celsius)) return '--';
  return unit === 'F' ? Math.round((celsius * 9) / 5 + 32) : Math.round(celsius);
}

function convertWind(kmh, unit) {
  if (kmh === undefined || kmh === null || isNaN(kmh)) return 0;
  return unit === 'mph' ? Math.round(kmh * 0.621371) : Math.round(kmh);
}

export function ShareWeatherModal({ isOpen, onClose }) {
  const weather = useWeatherStore((s) => s.weather);
  const location = useWeatherStore((s) => s.location);
  const units = useWeatherStore((s) => s.units);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  if (!weather?.current) return null;

  const curr = weather.current;
  const daily = weather.daily;
  const wmo = getWmoInfo(curr.weather_code);

  const tempVal = convertTemp(curr.temperature_2m, units.temp);
  const feelsVal = convertTemp(curr.apparent_temperature, units.temp);
  const highVal = daily?.temperature_2m_max?.[0] !== undefined
    ? convertTemp(daily.temperature_2m_max[0], units.temp)
    : tempVal;
  const lowVal = daily?.temperature_2m_min?.[0] !== undefined
    ? convertTemp(daily.temperature_2m_min[0], units.temp)
    : tempVal;
  const windVal = convertWind(curr.wind_speed_10m, units.wind);
  const humidityVal = Math.round(curr.relative_humidity_2m || 0);

  const brief = generateDailyBriefData(weather, units);
  const summaryText =
    brief?.summary ||
    `${wmo.label} conditions with a temperature of ${tempVal}°${units.temp} (feels like ${feelsVal}°${units.temp}).`;

  const dateLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const shareText = `📍 ${location.name}${location.country ? `, ${location.country}` : ''}\n🌡️ ${tempVal}°${units.temp} — ${wmo.label} (Feels like ${feelsVal}°${units.temp})\n↑ ${highVal}° ↓ ${lowVal}° · 💨 Wind ${windVal} ${units.wind} · 💧 Humidity ${humidityVal}%\n\n"${summaryText}"\n\n— Shared via Atmos Weather Intelligence`;

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback
    }
  };

  const renderCardToCanvas = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1350;
    const ctx = canvas.getContext('2d');

    // Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1350);
    bgGrad.addColorStop(0, '#091124');
    bgGrad.addColorStop(0.5, '#0F1E3A');
    bgGrad.addColorStop(1, '#070B16');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1080, 1350);

    // Subtle Accent Glow
    const radial = ctx.createRadialGradient(840, 260, 20, 840, 260, 520);
    radial.addColorStop(0, 'rgba(56, 189, 248, 0.22)');
    radial.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, 1080, 1350);

    // Card Border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
    ctx.lineWidth = 3;
    ctx.strokeRect(56, 56, 968, 1238);

    // Header Branding
    ctx.fillStyle = '#38BDF8';
    ctx.font = '700 24px Inter, system-ui, sans-serif';
    ctx.fillText('ATMOS · WEATHER INTELLIGENCE', 110, 138);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '500 24px Inter, system-ui, sans-serif';
    ctx.fillText(dateLabel.toUpperCase(), 110, 180);

    // City & Country
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 74px Inter, system-ui, sans-serif';
    ctx.fillText(location.name || 'Unknown', 110, 300);

    if (location.country) {
      ctx.fillStyle = '#94A3B8';
      ctx.font = '600 32px Inter, system-ui, sans-serif';
      ctx.fillText(location.country.toUpperCase(), 110, 352);
    }

    // Main Temperature
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 210px Inter, system-ui, sans-serif';
    ctx.fillText(`${tempVal}°`, 104, 590);

    // Condition & Feels Like
    ctx.fillStyle = '#38BDF8';
    ctx.font = '700 46px Inter, system-ui, sans-serif';
    ctx.fillText(wmo.label, 110, 670);

    ctx.fillStyle = '#CBD5E1';
    ctx.font = '500 32px Inter, system-ui, sans-serif';
    ctx.fillText(
      `Feels like ${feelsVal}°${units.temp}  ·  High ${highVal}° / Low ${lowVal}°`,
      110,
      725
    );

    // Divider
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(110, 790);
    ctx.lineTo(970, 790);
    ctx.stroke();

    // Daily Brief Label
    ctx.fillStyle = '#38BDF8';
    ctx.font = '700 22px Inter, system-ui, sans-serif';
    ctx.fillText('DAILY WEATHER BRIEF', 110, 850);

    // Wrap Summary Text
    ctx.fillStyle = '#F1F5F9';
    ctx.font = '500 34px Inter, system-ui, sans-serif';
    const words = summaryText.split(' ');
    let line = '';
    let y = 910;
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > 840 && i > 0) {
        ctx.fillText(line.trim(), 110, y);
        line = words[i] + ' ';
        y += 50;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), 110, y);

    // Telemetry Footer Pills
    ctx.fillStyle = '#94A3B8';
    ctx.font = '600 28px Inter, system-ui, sans-serif';
    ctx.fillText(
      `Wind: ${windVal} ${units.wind}   ·   Humidity: ${humidityVal}%`,
      110,
      1140
    );

    // Bottom Tagline
    ctx.fillStyle = '#64748B';
    ctx.font = '500 24px Inter, system-ui, sans-serif';
    ctx.fillText('Atmos — "Don\'t just show the weather. Explain the day."', 110, 1230);

    return canvas;
  };

  const handleDownloadCard = () => {
    setDownloading(true);
    try {
      const canvas = renderCardToCanvas();
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      const safeCity = (location.name || 'Atmos').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      link.download = `atmos-weather-${safeCity}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setDownloading(false);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Atmos Weather — ${location.name}`,
          text: shareText,
        });
        return;
      } catch {
        // User cancelled or share failed; fallback to copy
      }
    }
    handleCopyText();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            className="relative z-10 w-full max-w-md bg-[#0b1220] border border-white/15 rounded-3xl p-5 sm:p-6 shadow-2xl overflow-hidden"
          >
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Share Weather Card
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close share modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Visual Shareable Weather Card (Screenshot & Social Ready) */}
            <div className="relative rounded-2xl p-5 sm:p-6 bg-gradient-to-br from-[#0d1b35] via-[#0a1326] to-[#060b16] border border-white/15 shadow-inner overflow-hidden">
              {/* Decorative Ambient Glow */}
              <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-sky-500/20 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />

              {/* Brand Header */}
              <div className="relative flex items-center justify-between text-[10px] uppercase tracking-widest text-sky-400 font-bold mb-3">
                <span className="flex items-center gap-1.5">
                  <CloudSun className="w-3.5 h-3.5" />
                  ATMOS WEATHER
                </span>
                <span className="text-slate-400 font-medium">{dateLabel}</span>
              </div>

              {/* Location */}
              <div className="relative flex items-center gap-1.5 text-white font-bold text-xl sm:text-2xl tracking-tight">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
                <span className="truncate">{location.name}</span>
                {location.country && (
                  <span className="text-xs font-medium text-slate-400 ml-1">
                    {location.country}
                  </span>
                )}
              </div>

              {/* Temperature & Condition */}
              <div className="relative my-4 flex items-baseline justify-between">
                <div className="text-6xl sm:text-7xl font-extrabold text-white tracking-tighter leading-none">
                  {tempVal}°
                  <span className="text-2xl font-semibold text-sky-400 ml-1">
                    {units.temp}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-base sm:text-lg font-bold text-sky-300">
                    {wmo.label}
                  </div>
                  <div className="text-xs text-slate-400">
                    Feels like {feelsVal}° · H:{highVal}° L:{lowVal}°
                  </div>
                </div>
              </div>

              {/* Short Weather Summary */}
              <div className="relative p-3.5 rounded-xl bg-white/[0.04] border border-white/10 mb-4">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-sky-400 mb-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Daily Summary</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {summaryText}
                </p>
              </div>

              {/* Metrics Row & Atmos Branding */}
              <div className="relative flex items-center justify-between pt-3 border-t border-white/10 text-xs text-slate-300">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Wind className="w-3.5 h-3.5 text-sky-400" />
                    {windVal} {units.wind}
                  </span>
                  <span className="flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5 text-sky-400" />
                    {humidityVal}%
                  </span>
                </div>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                  atmos-gules-two.vercel.app
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <button
                onClick={handleDownloadCard}
                disabled={downloading}
                className="min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{downloading ? 'Saving...' : 'Download PNG'}</span>
              </button>

              <button
                onClick={handleNativeShare}
                className="min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/10 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-sky-400" />
                    <span>Share / Copy</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
