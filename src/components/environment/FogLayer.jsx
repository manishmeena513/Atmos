import React from 'react';
import { motion } from 'framer-motion';

export function FogLayer({ theme }) {
  if (theme.category !== 'fog') return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {/* Lower ground fog band */}
      <motion.div
        className="absolute bottom-0 left-0 w-[200%] h-96 opacity-60 animate-drift-slow"
        style={{
          background: 'linear-gradient(0deg, rgba(203, 213, 225, 0.4) 0%, rgba(148, 163, 184, 0.15) 70%, transparent 100%)',
          filter: 'blur(30px)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.65 }}
        transition={{ duration: 2 }}
      />

      {/* Mid horizon fog band */}
      <motion.div
        className="absolute top-1/3 -left-1/4 w-[180%] h-80 opacity-40 animate-drift-mid"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(226, 232, 240, 0.35) 0%, transparent 80%)',
          filter: 'blur(40px)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.45 }}
        transition={{ duration: 2.5 }}
      />

      {/* Atmospheric softening wash */}
      <div className="absolute inset-0 bg-slate-800/25 backdrop-blur-[2px]" />
    </div>
  );
}
