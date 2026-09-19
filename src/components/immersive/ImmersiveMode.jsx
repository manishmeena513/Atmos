import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Wind, Droplets, Sun, Compass, MapPin } from 'lucide-react';
import { useWeatherStore } from '../../store/weatherStore';
import { WeatherEnvironment } from '../environment/WeatherEnvironment';
import { getWmoInfo } from '../../utils/wmoCodeMap';

export function ImmersiveMode({ isOpen, onClose }) {
  const weather = useWeatherStore((s) => s.weather);
  const location = useWeatherStore((s) => s.location);
  const units = useWeatherStore((s) => s.units);
  const getCurrentTheme = useWeatherStore((s) => s.getCurrentTheme);

  const rainGlassCanvasRef = useRef(null);

  // Escape key listener to exit full screen immersion
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Immersive Glass Droplets when raining
  const theme = getCurrentTheme();
  const isRaining = theme.particles?.type === 'rain';

  useEffect(() => {
    if (!isOpen || !isRaining) return;

    const canvas = rainGlassCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const droplets = [];
    for (let i = 0; i < 60; i++) {
      droplets.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 1.5 + Math.random() * 4,
        speed: 0.15 + Math.random() * 0.5,
        opacity: 0.35 + Math.random() * 0.45,
      });
    }

    let animId;
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < droplets.length; i++) {
        const d = droplets[i];
        ctx.fillStyle = `rgba(255, 255, 255, ${d.opacity})`;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(d.x - d.r * 0.3, d.y - d.r * 0.3, d.r * 0.35, 0, Math.PI * 2);
        ctx.fill();

        d.y += d.speed;
        if (d.y > height + 10) {
          d.y = -10;
          d.x = Math.random() * width;
        }
      }
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen, isRaining]);

  if (!isOpen || !weather?.current) return null;

  const current = weather.current;
  const wmo = getWmoInfo(current.weather_code);

  const displayTemp =
    units.temp === 'F'
      ? Math.round((current.temperature_2m * 9) / 5 + 32)
      : Math.round(current.temperature_2m);

  const feelsLike =
    units.temp === 'F'
      ? Math.round((current.apparent_temperature * 9) / 5 + 32)
      : Math.round(current.apparent_temperature);

  const windSpeedVal =
    units.wind === 'mph'
      ? Math.round(current.wind_speed_10m * 0.621371)
      : Math.round(current.wind_speed_10m);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-0 z-50 overflow-hidden bg-[#04070D] select-none"
      >
        {/* Living Weather Environment (Deepened with isImmersive flag) */}
        <div className="absolute inset-0 z-0 scale-105 filter brightness-110">
          <WeatherEnvironment isImmersive={true} />
        </div>

        {/* Rain Glass Condensation Overlay (Active in rain immersion) */}
        {isRaining && (
          <canvas
            ref={rainGlassCanvasRef}
            className="absolute inset-0 z-10 pointer-events-none opacity-80"
          />
        )}

        {/* Cinematic Radial Vignette & Soft Glint */}
        <div className="absolute inset-0 bg-radial from-transparent via-black/15 to-black/70 pointer-events-none z-10" />

        {/* Minimal Floating Exit Button (Top Right) */}
        <div className="absolute top-6 right-6 sm:top-9 sm:right-10 z-30 flex items-center gap-3">
          <span className="text-[11px] uppercase tracking-widest text-white/40 hidden sm:inline font-mono">
            ESC to exit
          </span>
          <button
            onClick={onClose}
            className="p-3 rounded-full bg-black/40 hover:bg-black/80 text-white/70 hover:text-white border border-white/15 backdrop-blur-xl transition-all shadow-2xl cursor-pointer active:scale-95"
            aria-label="Exit full screen weather immersion"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Minimal Ambient Location Header (Top Left) */}
        <div className="absolute top-6 left-6 sm:top-9 sm:left-10 z-30 flex items-center gap-2 text-white/90 text-sm sm:text-base font-medium tracking-tight drop-shadow-lg">
          <MapPin className="w-4 h-4 text-sky-400" />
          <span>{location.name}</span>
          {location.country && (
            <span className="text-white/45 text-xs sm:text-sm font-normal">· {location.country}</span>
          )}
        </div>

        {/* Center Floating Living Stage */}
        <div className="relative z-20 h-full flex flex-col items-center justify-center text-center px-4">
          <motion.div
            initial={{ scale: 0.94, y: 15, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center"
          >
            {/* Condition Header Tag */}
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/[0.08] border border-white/15 text-white text-xs sm:text-sm font-medium backdrop-blur-md shadow-2xl mb-4">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>{wmo.label}</span>
            </div>

            {/* Huge Floating Temperature */}
            <div className="relative">
              <span className="text-[9.5rem] sm:text-[14rem] md:text-[17rem] font-extrabold tracking-tighter leading-none text-white drop-shadow-[0_24px_80px_rgba(0,0,0,0.85)]">
                {displayTemp}
              </span>
              <span className="absolute top-5 -right-9 sm:top-12 sm:-right-16 text-3xl sm:text-6xl font-light text-white/60">
                °{units.temp}
              </span>
            </div>

            {/* Editorial Floating Telemetry Strip */}
            <div className="flex items-center gap-6 sm:gap-10 mt-3 text-xs sm:text-sm font-medium text-white/85 drop-shadow divide-x divide-white/15">
              <div className="pr-2">
                <span className="text-white/45 text-[11px] block uppercase tracking-wider">Feels Like</span>
                <span className="font-semibold text-white">{feelsLike}°{units.temp}</span>
              </div>
              <div className="px-6">
                <span className="text-white/45 text-[11px] block uppercase tracking-wider">Wind Flow</span>
                <span className="font-semibold text-white">{windSpeedVal} {units.wind}</span>
              </div>
              <div className="pl-6">
                <span className="text-white/45 text-[11px] block uppercase tracking-wider">Humidity</span>
                <span className="font-semibold text-white">{current.relative_humidity_2m}%</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Ambient Footer Tag */}
        <div className="absolute bottom-6 inset-x-0 z-30 text-center text-[10px] tracking-widest uppercase text-white/35 font-mono">
          Living Atmospheric Horizon · Atmos Full Immersion
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
