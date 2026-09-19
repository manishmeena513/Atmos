import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
  { id: 'hero-section', label: 'Atmosphere' },
  { id: 'timeline-section', label: 'Timeline' },
  { id: 'hourly-section', label: 'Hourly' },
  { id: 'forecast-section', label: '7-Day' },
  { id: 'map-section', label: 'Map' },
  { id: 'globe-section', label: 'Planet 3D' },
  { id: 'compare-section', label: 'Compare' },
  { id: 'airquality-section', label: 'Air Quality' },
  { id: 'insights-section', label: 'Insights' },
  { id: 'activity-section', label: 'Activities' },
];

export function Navigation() {
  const [activeSection, setActiveSection] = useState('hero-section');
  const navTrackRef = useRef(null);
  const itemRefs = useRef({});

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 220;

      for (let i = NAV_ITEMS.length - 1; i >= 0; i--) {
        const item = NAV_ITEMS[i];
        const el = document.getElementById(item.id);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(item.id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Gently scroll ONLY the horizontal pill container when active section changes
  // NEVER call scrollIntoView because that scrolls the entire page window and interrupts vertical scroll!
  useEffect(() => {
    const track = navTrackRef.current;
    const button = itemRefs.current[activeSection];
    if (track && button) {
      const trackWidth = track.clientWidth;
      const buttonLeft = button.offsetLeft;
      const buttonWidth = button.clientWidth;
      track.scrollTo({
        left: buttonLeft - trackWidth / 2 + buttonWidth / 2,
        behavior: 'smooth',
      });
    }
  }, [activeSection]);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav
      aria-label="Section navigation"
      className="sticky top-14 sm:top-18 z-30 py-2 flex justify-center px-3 sm:px-4 pointer-events-none"
    >
      <div
        ref={navTrackRef}
        className="bg-[#0c121e]/85 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.5)] rounded-full p-1 flex items-center gap-1 overflow-x-auto max-w-full scrollbar-none no-scrollbar pointer-events-auto touch-pan-x overscroll-x-contain"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              ref={(el) => (itemRefs.current[item.id] = el)}
              onClick={() => scrollToSection(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`relative px-3 sm:px-3.5 py-1.5 min-h-[36px] rounded-full text-[11px] sm:text-xs font-medium tracking-normal transition-colors whitespace-nowrap cursor-pointer select-none flex items-center ${
                isActive
                  ? 'text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNavHighlight"
                  className="absolute inset-0 bg-white/[0.12] border border-white/20 rounded-full shadow-inner"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                )}
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
