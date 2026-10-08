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
  Layers,
  Ratio,
  Palette,
  Eye,
  Sun,
  CloudRain,
  ShieldAlert,
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

const ASPECT_RATIOS = [
  { id: '9:16', label: '9:16 Story', width: 1080, height: 1920, previewClass: 'aspect-[9/16] max-h-[380px]' },
  { id: '1:1', label: '1:1 Square', width: 1080, height: 1080, previewClass: 'aspect-square max-h-[320px]' },
  { id: '16:9', label: '16:9 Banner', width: 1920, height: 1080, previewClass: 'aspect-[16/9] max-h-[220px]' },
];

const CARD_STYLES = [
  { id: 'cinematic', label: 'Cinematic', desc: 'Deep atmospheric tones & glowing accents' },
  { id: 'glass', label: 'Glass', desc: 'Frosted translucency & luminous borders' },
  { id: 'minimal', label: 'Minimal', desc: 'Clean high-legibility typography' },
  { id: 'amoled', label: 'AMOLED', desc: 'Deep black & high-contrast neon' },
  { id: 'weather-reactive', label: 'Reactive', desc: 'Colors tint to live weather state' },
];

export function ShareWeatherModal({ isOpen, onClose }) {
  const weather = useWeatherStore((s) => s.weather);
  const location = useWeatherStore((s) => s.location);
  const units = useWeatherStore((s) => s.units);
  const airQuality = useWeatherStore((s) => s.airQuality);

  const [aspectRatio, setAspectRatio] = useState('9:16');
  const [cardStyle, setCardStyle] = useState('cinematic');
  const [showBrief, setShowBrief] = useState(true);
  const [showMetrics, setShowMetrics] = useState(true);
  const [showBranding, setShowBranding] = useState(true);
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
    `${wmo.label} conditions with ${tempVal}°${units.temp} (feels like ${feelsVal}°${units.temp}).`;

  const dateLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const getStyleColors = (style, code) => {
    if (style === 'amoled') {
      return {
        bg: ['#000000', '#000000', '#000000'],
        accent: '#38BDF8',
        border: 'rgba(255, 255, 255, 0.25)',
        text: '#FFFFFF',
        textMuted: '#94A3B8',
      };
    }
    if (style === 'minimal') {
      return {
        bg: ['#0f172a', '#1e293b', '#0f172a'],
        accent: '#94a3b8',
        border: 'rgba(255, 255, 255, 0.1)',
        text: '#F8FAFC',
        textMuted: '#64748B',
      };
    }
    if (style === 'glass') {
      return {
        bg: ['#1e1b4b', '#0f172a', '#020617'],
        accent: '#a78bfa',
        border: 'rgba(255, 255, 255, 0.3)',
        text: '#FFFFFF',
        textMuted: '#CBD5E1',
      };
    }
    if (style === 'weather-reactive') {
      // Warm sunny
      if ([0, 1].includes(code)) {
        return {
          bg: ['#2e1065', '#451a03', '#1e1b4b'],
          accent: '#fbbf24',
          border: 'rgba(251, 191, 36, 0.3)',
          text: '#FFFFFF',
          textMuted: '#fde68a',
        };
      }
      // Rain / drizzle
      if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
        return {
          bg: ['#082f49', '#0f172a', '#020617'],
          accent: '#38bdf8',
          border: 'rgba(56, 189, 248, 0.3)',
          text: '#FFFFFF',
          textMuted: '#bae6fd',
        };
      }
      // Clouds / overcast
      return {
        bg: ['#1e293b', '#0f172a', '#020617'],
        accent: '#94a3b8',
        border: 'rgba(148, 163, 184, 0.25)',
        text: '#FFFFFF',
        textMuted: '#cbd5e1',
      };
    }
    // Default cinematic
    return {
      bg: ['#091124', '#0F1E3A', '#070B16'],
      accent: '#38BDF8',
      border: 'rgba(255, 255, 255, 0.16)',
      text: '#FFFFFF',
      textMuted: '#94A3B8',
    };
  };

  const currentColors = getStyleColors(cardStyle, curr.weather_code);

  const renderCardToCanvas = () => {
    const activeRatio = ASPECT_RATIOS.find((r) => r.id === aspectRatio) || ASPECT_RATIOS[0];
    const width = activeRatio.width;
    const height = activeRatio.height;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    const colors = getStyleColors(cardStyle, curr.weather_code);

    // Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, colors.bg[0]);
    bgGrad.addColorStop(0.5, colors.bg[1]);
    bgGrad.addColorStop(1, colors.bg[2]);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Accent Glow (Cinematic / Glass / Reactive)
    if (cardStyle !== 'minimal' && cardStyle !== 'amoled') {
      const radial = ctx.createRadialGradient(width * 0.75, height * 0.25, 20, width * 0.75, height * 0.25, width * 0.6);
      radial.addColorStop(0, `${colors.accent}40`);
      radial.addColorStop(1, 'transparent');
      ctx.fillStyle = radial;
      ctx.fillRect(0, 0, width, height);
    }

    // Outer Border Padding
    const margin = Math.round(width * 0.05);
    const innerW = width - margin * 2;
    const innerH = height - margin * 2;

    ctx.strokeStyle = colors.border;
    ctx.lineWidth = 3;
    ctx.strokeRect(margin, margin, innerW, innerH);

    // Dynamic scale for typography based on dimensions
    const isLandscape = width > height;
    const isSquare = width === height;
    const scale = isLandscape ? 0.9 : isSquare ? 0.85 : 1;

    let cursorX = margin + Math.round(width * 0.05);
    let cursorY = margin + Math.round(height * 0.08);

    // Header Branding
    ctx.fillStyle = colors.accent;
    ctx.font = `700 ${Math.round(26 * scale)}px 'Plus Jakarta Sans', system-ui, sans-serif`;
    ctx.fillText('ATMOS · LIVING WEATHER INTELLIGENCE', cursorX, cursorY);

    cursorY += Math.round(44 * scale);
    ctx.fillStyle = colors.textMuted;
    ctx.font = `500 ${Math.round(24 * scale)}px 'Plus Jakarta Sans', system-ui, sans-serif`;
    ctx.fillText(dateLabel.toUpperCase(), cursorX, cursorY);

    // City & Country
    cursorY += Math.round(90 * scale);
    ctx.fillStyle = colors.text;
    ctx.font = `800 ${Math.round(76 * scale)}px 'Plus Jakarta Sans', system-ui, sans-serif`;
    ctx.fillText(location.name || 'Unknown', cursorX, cursorY);

    if (location.country) {
      cursorY += Math.round(44 * scale);
      ctx.fillStyle = colors.textMuted;
      ctx.font = `600 ${Math.round(30 * scale)}px 'Plus Jakarta Sans', system-ui, sans-serif`;
      ctx.fillText(location.country.toUpperCase(), cursorX, cursorY);
    }

    // Main Temperature
    cursorY += Math.round(180 * scale);
    ctx.fillStyle = colors.text;
    ctx.font = `800 ${Math.round((isLandscape ? 170 : 210) * scale)}px 'Plus Jakarta Sans', system-ui, sans-serif`;
    ctx.fillText(`${tempVal}°`, cursorX - 6, cursorY);

    // Condition & Feels Like
    cursorY += Math.round(75 * scale);
    ctx.fillStyle = colors.accent;
    ctx.font = `700 ${Math.round(46 * scale)}px 'Plus Jakarta Sans', system-ui, sans-serif`;
    ctx.fillText(wmo.label, cursorX, cursorY);

    cursorY += Math.round(50 * scale);
    ctx.fillStyle = colors.textMuted;
    ctx.font = `500 ${Math.round(32 * scale)}px 'Plus Jakarta Sans', system-ui, sans-serif`;
    ctx.fillText(
      `Feels like ${feelsVal}°${units.temp}  ·  High ${highVal}° / Low ${lowVal}°`,
      cursorX,
      cursorY
    );

    // Divider
    cursorY += Math.round(55 * scale);
    ctx.strokeStyle = colors.border;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cursorX, cursorY);
    ctx.lineTo(width - cursorX, cursorY);
    ctx.stroke();

    // Daily Brief
    if (showBrief && !isLandscape) {
      cursorY += Math.round(55 * scale);
      ctx.fillStyle = colors.accent;
      ctx.font = `700 ${Math.round(24 * scale)}px 'Plus Jakarta Sans', system-ui, sans-serif`;
      ctx.fillText('WEATHER BRIEF', cursorX, cursorY);

      cursorY += Math.round(50 * scale);
      ctx.fillStyle = colors.text;
      ctx.font = `500 ${Math.round(32 * scale)}px 'Plus Jakarta Sans', system-ui, sans-serif`;

      const words = summaryText.split(' ');
      let line = '';
      const maxLineWidth = innerW - Math.round(width * 0.1);
      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxLineWidth && i > 0) {
          ctx.fillText(line.trim(), cursorX, cursorY);
          line = words[i] + ' ';
          cursorY += Math.round(48 * scale);
          if (cursorY > height - margin - 220) break;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line.trim(), cursorX, cursorY);
    }

    // Telemetry Footer
    if (showMetrics) {
      const footerY = height - margin - Math.round(80 * scale);
      ctx.fillStyle = colors.textMuted;
      ctx.font = `600 ${Math.round(28 * scale)}px 'Plus Jakarta Sans', system-ui, sans-serif`;
      ctx.fillText(
        `Wind: ${windVal} ${units.wind}   ·   Humidity: ${humidityVal}%   ·   Pressure: ${Math.round(curr.surface_pressure || 1013)} hPa`,
        cursorX,
        footerY
      );
    }

    // Tagline / Branding
    if (showBranding) {
      const brandingY = height - margin - Math.round(30 * scale);
      ctx.fillStyle = colors.textMuted;
      ctx.font = `500 ${Math.round(20 * scale)}px 'Plus Jakarta Sans', system-ui, sans-serif`;
      ctx.fillText('Atmos — "Don\'t just show the weather. Explain the day."', cursorX, brandingY);
    }

    return canvas;
  };

  const handleDownloadCard = () => {
    setDownloading(true);
    try {
      const canvas = renderCardToCanvas();
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      const safeCity = (location.name || 'Atmos').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const ratioTag = aspectRatio.replace(':', 'x');
      link.download = `atmos-${safeCity}-${cardStyle}-${ratioTag}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyImage = async () => {
    try {
      const canvas = renderCardToCanvas();
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          if (navigator.clipboard && window.ClipboardItem) {
            await navigator.clipboard.write([
              new window.ClipboardItem({ 'image/png': blob })
            ]);
            setCopied(true);
            setTimeout(() => setCopied(false), 2200);
            return;
          }
        } catch {
          // Clipboard write failed, fallback to text
        }
        handleCopyText();
      });
    } catch {
      handleCopyText();
    }
  };

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

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Atmos Weather — ${location.name}`,
          text: shareText,
        });
        return;
      } catch {
        // Fallback
      }
    }
    handleCopyImage();
  };

  const activeRatioConfig = ASPECT_RATIOS.find((r) => r.id === aspectRatio) || ASPECT_RATIOS[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            className="relative z-10 w-full max-w-xl glass-surface-modal border border-white/15 rounded-3xl p-5 sm:p-6 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
          >
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-sky-400" />
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    Share Studio
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/30">
                      V3.1
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">Export high-resolution weather cards</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close share modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto py-4 space-y-4 pr-1">
              {/* Aspect Ratio Selector */}
              <div>
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-2">
                  <Ratio className="w-3.5 h-3.5 text-sky-400" />
                  Aspect Ratio
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {ASPECT_RATIOS.map((ratio) => (
                    <button
                      key={ratio.id}
                      onClick={() => setAspectRatio(ratio.id)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        aspectRatio === ratio.id
                          ? 'bg-sky-500/20 text-sky-300 border-sky-400 shadow-sm'
                          : 'bg-white/[0.04] text-slate-400 border-white/10 hover:bg-white/[0.08]'
                      }`}
                    >
                      {ratio.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Style Selector */}
              <div>
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-2">
                  <Palette className="w-3.5 h-3.5 text-sky-400" />
                  Visual Aesthetic
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                  {CARD_STYLES.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setCardStyle(style.id)}
                      className={`p-2 rounded-xl text-xs text-center font-medium border transition-all cursor-pointer ${
                        cardStyle === style.id
                          ? 'bg-white/15 text-white border-white/40 shadow-sm'
                          : 'bg-white/[0.03] text-slate-400 border-white/10 hover:bg-white/[0.06]'
                      }`}
                      title={style.desc}
                    >
                      <div className="font-semibold">{style.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-black/40 border border-white/10">
                <div className="w-full flex items-center justify-between text-[11px] text-slate-400 font-semibold mb-2 px-1">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-sky-400" /> Live Preview
                  </span>
                  <span>{activeRatioConfig.id} ({activeRatioConfig.width}×{activeRatioConfig.height})</span>
                </div>

                <div
                  className={`w-full ${activeRatioConfig.previewClass} rounded-xl p-4 border transition-all flex flex-col justify-between overflow-hidden relative shadow-lg`}
                  style={{
                    backgroundColor: currentColors.bg[0],
                    borderColor: currentColors.border,
                    backgroundImage: `linear-gradient(135deg, ${currentColors.bg[0]} 0%, ${currentColors.bg[1]} 50%, ${currentColors.bg[2]} 100%)`,
                  }}
                >
                  {/* Subtle Glow */}
                  {cardStyle !== 'minimal' && cardStyle !== 'amoled' && (
                    <div
                      className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl pointer-events-none"
                      style={{ backgroundColor: `${currentColors.accent}30` }}
                    />
                  )}

                  {/* Header */}
                  <div className="relative flex items-center justify-between text-[9px] uppercase tracking-wider font-bold" style={{ color: currentColors.accent }}>
                    <span>ATMOS · WEATHER</span>
                    <span style={{ color: currentColors.textMuted }}>{dateLabel}</span>
                  </div>

                  {/* Location & Temp */}
                  <div className="relative my-auto">
                    <div className="text-sm font-extrabold truncate" style={{ color: currentColors.text }}>
                      {location.name} {location.country ? `· ${location.country}` : ''}
                    </div>
                    <div className="text-4xl font-extrabold tracking-tight my-1" style={{ color: currentColors.text }}>
                      {tempVal}°
                      <span className="text-lg font-bold ml-1" style={{ color: currentColors.accent }}>
                        {units.temp}
                      </span>
                    </div>
                    <div className="text-xs font-semibold" style={{ color: currentColors.accent }}>
                      {wmo.label} · H:{highVal}° L:{lowVal}°
                    </div>

                    {showBrief && (
                      <p className="text-[11px] mt-2 line-clamp-2 leading-relaxed" style={{ color: currentColors.textMuted }}>
                        {summaryText}
                      </p>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="relative pt-2 border-t text-[10px] flex items-center justify-between" style={{ borderColor: currentColors.border, color: currentColors.textMuted }}>
                    {showMetrics ? (
                      <span>💨 {windVal}{units.wind} · 💧 {humidityVal}%</span>
                    ) : <span />}
                    {showBranding && (
                      <span className="font-medium text-[9px]">atmos weather</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Toggle Options */}
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  onClick={() => setShowBrief(!showBrief)}
                  className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                    showBrief ? 'bg-white/10 text-white border-white/20' : 'bg-transparent text-slate-500 border-white/5'
                  }`}
                >
                  {showBrief ? '✓' : '✗'} Daily Brief
                </button>
                <button
                  onClick={() => setShowMetrics(!showMetrics)}
                  className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                    showMetrics ? 'bg-white/10 text-white border-white/20' : 'bg-transparent text-slate-500 border-white/5'
                  }`}
                >
                  {showMetrics ? '✓' : '✗'} Telemetry
                </button>
                <button
                  onClick={() => setShowBranding(!showBranding)}
                  className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                    showBranding ? 'bg-white/10 text-white border-white/20' : 'bg-transparent text-slate-500 border-white/5'
                  }`}
                >
                  {showBranding ? '✓' : '✗'} Atmos Branding
                </button>
              </div>
            </div>

            {/* Action Footer */}
            <div className="pt-3 border-t border-white/10 grid grid-cols-2 gap-3 shrink-0">
              <button
                onClick={handleDownloadCard}
                disabled={downloading}
                className="min-h-[46px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs sm:text-sm transition-all cursor-pointer active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>{downloading ? 'Rendering...' : 'Download PNG'}</span>
              </button>

              <button
                onClick={handleNativeShare}
                className="min-h-[46px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-white border border-white/15 font-semibold text-xs sm:text-sm transition-all cursor-pointer active:scale-95"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300">Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-sky-400" />
                    <span>Copy Card Image</span>
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
