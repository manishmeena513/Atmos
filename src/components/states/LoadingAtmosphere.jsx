import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export function LoadingAtmosphere({ city = 'Atmosphere' }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#080B10] px-4 overflow-hidden">
      {/* Ambient Pulsing Atmospheric Aura */}
      <div className="absolute w-96 h-96 rounded-full bg-sky-500/15 blur-[100px] animate-pulse-slow" />
      <div className="absolute w-80 h-80 rounded-full bg-indigo-500/10 blur-[80px] -top-10 -left-10 animate-float" />

      <div className="relative z-10 flex flex-col items-center text-center space-y-6 max-w-sm">
        {/* Animated Brand Emblem */}
        <motion.div
          animate={{ scale: [1, 1.08, 1], rotate: [0, 5, 0, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-sky-400 to-indigo-500 p-0.5 shadow-2xl shadow-sky-500/30"
        >
          <div className="w-full h-full bg-[#080B10] rounded-[22px] flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-sky-400 animate-spin-slow" />
          </div>
        </motion.div>

        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Reading Atmosphere
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Calibrating sky metrics, cloud depth, and wind telemetry for {city}...
          </p>
        </div>

        {/* Skeleton Telemetry Chips */}
        <div className="flex gap-2 w-full justify-center">
          <div className="h-7 w-20 rounded-full bg-white/10 animate-pulse" />
          <div className="h-7 w-24 rounded-full bg-white/10 animate-pulse" />
          <div className="h-7 w-16 rounded-full bg-white/10 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
