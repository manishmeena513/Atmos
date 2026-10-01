import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWeatherStore } from '../../store/weatherStore';

export function TemperatureDisplay({ tempCelsius }) {
  const units = useWeatherStore((s) => s.units);
  const toggleTempUnit = useWeatherStore((s) => s.toggleTempUnit);
  const tempFormat = useWeatherStore((s) => s.typography?.tempFormat || 'clean');

  const displayVal =
    units.temp === 'F'
      ? Math.round((tempCelsius * 9) / 5 + 32)
      : Math.round(tempCelsius);

  const renderUnitLabel = () => {
    if (tempFormat === 'spaced') {
      return ` °${units.temp}`;
    }
    if (tempFormat === 'unit') {
      return `°${units.temp}`;
    }
    return '°';
  };

  return (
    <div className="flex items-start select-none">
      {/* Animated Number digits */}
      <div className="relative overflow-hidden flex items-baseline">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={displayVal}
            initial={{ y: 20, opacity: 0, filter: 'blur(4px)' }}
            animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
            exit={{ y: -20, opacity: 0, filter: 'blur(4px)' }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            className="text-[clamp(3.75rem,15vw,5.5rem)] lg:text-[7.5rem] font-extrabold tracking-tighter leading-none text-white drop-shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
          >
            {displayVal}
          </motion.span>
        </AnimatePresence>

        {/* Clickable Unit Toggle (°C / °F) */}
        <button
          onClick={toggleTempUnit}
          title={`Switch temperature unit (°C / °F) — Currently °${units.temp}`}
          className="ml-1 sm:ml-1.5 text-2xl sm:text-3xl lg:text-4xl font-light text-sky-400/90 hover:text-white transition-colors duration-200 cursor-pointer flex items-baseline group"
          aria-label={`Current unit is ${units.temp}. Click to switch.`}
        >
          <span>{renderUnitLabel()}</span>
          {tempFormat === 'clean' && (
            <span className="text-[10px] text-sky-400/60 font-semibold group-hover:text-sky-300 ml-0.5 tracking-wider uppercase">
              {units.temp}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
