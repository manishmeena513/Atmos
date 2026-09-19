import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWeatherStore } from '../../store/weatherStore';

export function TemperatureDisplay({ tempCelsius }) {
  const units = useWeatherStore((s) => s.units);
  const toggleTempUnit = useWeatherStore((s) => s.toggleTempUnit);

  const displayVal =
    units.temp === 'F'
      ? Math.round((tempCelsius * 9) / 5 + 32)
      : Math.round(tempCelsius);

  return (
    <div className="flex items-start select-none">
      {/* Animated Number digits */}
      <div className="relative overflow-hidden flex items-baseline">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={displayVal}
            initial={{ y: 24, opacity: 0, filter: 'blur(4px)' }}
            animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
            exit={{ y: -24, opacity: 0, filter: 'blur(4px)' }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            className="text-7xl sm:text-8xl md:text-9xl lg:text-[10.5rem] font-extrabold tracking-tighter leading-none text-white drop-shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
          >
            {displayVal}
          </motion.span>
        </AnimatePresence>

        {/* Clickable Unit Toggle (°C / °F) */}
        <button
          onClick={toggleTempUnit}
          title="Switch temperature unit (°C / °F)"
          className="ml-2 mt-2 sm:mt-4 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-slate-300/80 hover:text-white transition-colors duration-200 cursor-pointer flex items-center group"
          aria-label={`Current unit is ${units.temp}. Click to switch.`}
        >
          <span>°{units.temp}</span>
          <span className="text-xs ml-1.5 opacity-0 group-hover:opacity-60 transition-opacity uppercase tracking-wider text-sky-400">
            Switch
          </span>
        </button>
      </div>
    </div>
  );
}
