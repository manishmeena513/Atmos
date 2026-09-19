import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function LightningLayer({ theme }) {
  const [flash, setFlash] = useState(false);
  const [boltX, setBoltX] = useState(50);

  useEffect(() => {
    if (!theme.hasLightning) {
      setFlash(false);
      return;
    }

    let timeoutId;

    const scheduleLightning = () => {
      // Occasional flash every 10-24 seconds (subtle and realistic)
      const delay = 10000 + Math.random() * 14000;
      timeoutId = setTimeout(() => {
        setBoltX(20 + Math.random() * 60);
        setFlash(true);

        // Flash duration ~180ms with double-pulse
        setTimeout(() => {
          setFlash(false);
          // 30% chance of quick secondary aftershock
          if (Math.random() < 0.3) {
            setTimeout(() => {
              setFlash(true);
              setTimeout(() => setFlash(false), 90);
            }, 100);
          }
        }, 180);

        scheduleLightning();
      }, delay);
    };

    scheduleLightning();

    return () => {
      clearTimeout(timeoutId);
    };
  }, [theme.hasLightning]);

  if (!theme.hasLightning) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
      <AnimatePresence>
        {flash && (
          <>
            {/* Ambient Flash Illumination */}
            <motion.div
              className="absolute inset-0 bg-indigo-200/20 mix-blend-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.8, 0.2, 0.9, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
            />

            {/* Stylized Forked Bolt */}
            <motion.svg
              className="absolute top-0 h-3/4 w-40 filter drop-shadow-[0_0_12px_rgba(224,231,255,0.9)]"
              style={{ left: `${boltX}%`, transform: 'translateX(-50%)' }}
              viewBox="0 0 100 300"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0.4, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <polyline
                points="50,0 42,60 58,110 38,170 54,220 30,300"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polyline
                points="58,110 75,150 70,180"
                fill="none"
                stroke="#C7D2FE"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </motion.svg>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
