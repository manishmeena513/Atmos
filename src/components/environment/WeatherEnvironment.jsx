import React, { useState, useEffect } from 'react';
import { useWeatherStore } from '../../store/weatherStore';
import { SkyLayer } from './SkyLayer';
import { SunLayer } from './SunLayer';
import { MoonStarLayer } from './MoonStarLayer';
import { CloudLayer } from './CloudLayer';
import { RainLayer } from './RainLayer';
import { SnowLayer } from './SnowLayer';
import { FogLayer } from './FogLayer';
import { LightningLayer } from './LightningLayer';

export function WeatherEnvironment({ className = '', isImmersive = false }) {
  const getCurrentTheme = useWeatherStore((s) => s.getCurrentTheme);
  const weather = useWeatherStore((s) => s.weather);
  const animationIntensity = useWeatherStore((s) => s.animationIntensity);
  const reducedMotion = useWeatherStore((s) => s.reducedMotion);

  const theme = getCurrentTheme();
  const windSpeed = weather?.current?.wind_speed_10m || 12;
  const windDirection = weather?.current?.wind_direction_10m || 180;

  // Mouse parallax state for depth layering
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Disable parallax if reduced motion or touch device
    if (reducedMotion || typeof window === 'undefined' || !window.matchMedia('(hover: hover)').matches) {
      return;
    }

    let rafId;
    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      const nx = (e.clientX / innerWidth - 0.5) * 2; // -1 to +1
      const ny = (e.clientY / innerHeight - 0.5) * 2; // -1 to +1
      rafId = requestAnimationFrame(() => {
        setMouseOffset({ x: nx, y: ny });
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [reducedMotion]);

  // Depth offsets:
  // FAR: very small movement (±3px)
  // MID: moderate movement (±8px)
  // NEAR: slightly stronger movement (±16px)
  const farOffset = { x: mouseOffset.x * 4, y: mouseOffset.y * 4 };
  const midOffset = { x: mouseOffset.x * 9, y: mouseOffset.y * 9 };
  const nearOffset = { x: mouseOffset.x * 16, y: mouseOffset.y * 16 };

  const enableParticles = !reducedMotion && animationIntensity !== 'minimal';

  return (
    <div
      className={`relative w-full h-full overflow-hidden select-none pointer-events-none ${className}`}
      aria-hidden="true"
    >
      {/* 1. Dynamic Sky Gradient (Base) */}
      <SkyLayer theme={theme} />

      {/* 2. Celestial: Stars and Moon (Far depth) */}
      <MoonStarLayer theme={theme} parallaxOffset={farOffset} />

      {/* 3. Celestial: Sun (Far depth) */}
      <SunLayer theme={theme} parallaxOffset={farOffset} />

      {/* 4. Atmospheric Clouds (Mid & Near depth) */}
      <CloudLayer
        theme={theme}
        farOffset={farOffset}
        midOffset={midOffset}
        nearOffset={nearOffset}
        isImmersive={isImmersive}
      />

      {/* 5. Precipitation Particles */}
      {enableParticles && theme.particles?.type === 'rain' && (
        <RainLayer
          theme={theme}
          windSpeed={windSpeed}
          windDirection={windDirection}
          isImmersive={isImmersive}
        />
      )}

      {enableParticles && theme.particles?.type === 'snow' && (
        <SnowLayer
          theme={theme}
          windSpeed={windSpeed}
          windDirection={windDirection}
          isImmersive={isImmersive}
        />
      )}

      {/* 6. Fog Mist */}
      <FogLayer theme={theme} parallaxOffset={nearOffset} />

      {/* 7. Subtle Thunderstorm Lightning */}
      {enableParticles && <LightningLayer theme={theme} />}

      {/* 8. Horizon Vignette & Atmospheric Depth Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#080B10] via-transparent to-black/25 pointer-events-none" />
    </div>
  );
}
