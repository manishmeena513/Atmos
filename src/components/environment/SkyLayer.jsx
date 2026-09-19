import React from 'react';
import { motion } from 'framer-motion';

export function SkyLayer({ theme }) {
  const { skyTop, skyMid, skyBottom, ambientLight } = theme;

  return (
    <motion.div
      className="absolute inset-0 pointer-events-none transition-colors duration-1000 ease-out"
      style={{
        background: `linear-gradient(180deg, ${skyTop} 0%, ${skyMid} 45%, ${skyBottom} 100%)`,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
    >
      {/* Subtle atmospheric ambient glow */}
      <div
        className="absolute inset-0 mix-blend-soft-light transition-opacity duration-1000"
        style={{
          background: `radial-gradient(ellipse at 50% 10%, rgba(255,255,255,${ambientLight * 0.25}) 0%, transparent 70%)`,
        }}
      />
    </motion.div>
  );
}
