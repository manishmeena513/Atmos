import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Wind, ZoomIn, ZoomOut, Crosshair, Navigation, AlertTriangle } from 'lucide-react';
import { useWeatherStore } from '../../store/weatherStore';
import { getDeviceTier } from '../../utils/deviceTier';
import { getMapboxToken, MAPBOX_DARK_STYLE } from '../../utils/mapbox';
import { fetchRegionalWindField } from '../../api/openmeteo';

function getBeaufortScale(kmh) {
  if (kmh < 1) return { scale: 0, desc: 'Calm', color: '#94A3B8' };
  if (kmh < 6) return { scale: 1, desc: 'Light Air', color: '#38BDF8' };
  if (kmh < 12) return { scale: 2, desc: 'Light Breeze', color: '#38BDF8' };
  if (kmh < 20) return { scale: 3, desc: 'Gentle Breeze', color: '#34D399' };
  if (kmh < 29) return { scale: 4, desc: 'Moderate Breeze', color: '#34D399' };
  if (kmh < 39) return { scale: 5, desc: 'Fresh Breeze', color: '#FBBF24' };
  if (kmh < 50) return { scale: 6, desc: 'Strong Breeze', color: '#FBBF24' };
  if (kmh < 62) return { scale: 7, desc: 'High Wind / Near Gale', color: '#FB923C' };
  if (kmh < 75) return { scale: 8, desc: 'Gale', color: '#F87171' };
  return { scale: 9, desc: 'Severe Gale / Storm', color: '#EF4444' };
}

export function WindMap() {
  const weather = useWeatherStore((s) => s.weather);
  const location = useWeatherStore((s) => s.location);
  const units = useWeatherStore((s) => s.units);

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const windFieldRef = useRef(null);

  const [loadingGrid, setLoadingGrid] = useState(true);
  const [webglSupported, setWebglSupported] = useState(true);

  // Real primary telemetry from Open-Meteo for the active city
  const windSpeedKmH = weather?.current?.wind_speed_10m ?? 10;
  const windDir = weather?.current?.wind_direction_10m ?? 0;
  const gustsKmH = weather?.current?.wind_gusts_10m ?? windSpeedKmH * 1.3;

  const beaufort = getBeaufortScale(windSpeedKmH);

  const displaySpeed =
    units.wind === 'mph'
      ? Math.round(windSpeedKmH * 0.621371)
      : Math.round(windSpeedKmH);

  const displayGusts =
    units.wind === 'mph'
      ? Math.round(gustsKmH * 0.621371)
      : Math.round(gustsKmH);

  const cardinals = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const cardinalIdx = Math.round(windDir / 22.5) % 16;
  const cardinal = cardinals[cardinalIdx];

  // 1. Fetch batched regional wind grid from Open-Meteo around active city
  useEffect(() => {
    let isMounted = true;
    setLoadingGrid(true);

    fetchRegionalWindField(location.lat, location.lon, 1.4, 7).then((field) => {
      if (!isMounted) return;
      windFieldRef.current = field;
      setLoadingGrid(false);
    });

    return () => {
      isMounted = false;
    };
  }, [location.lat, location.lon]);

  // 2. Initialize Mapbox GL JS Base Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapboxgl.supported()) {
      setWebglSupported(false);
      return;
    }

    const token = getMapboxToken();
    if (!token) return;
    mapboxgl.accessToken = token;

    const initialLon = typeof location.lon === 'number' ? location.lon : 77.7064;
    const initialLat = typeof location.lat === 'number' ? location.lat : 28.9845;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: MAPBOX_DARK_STYLE,
      center: [initialLon, initialLat],
      zoom: 7.2,
      minZoom: 3,
      maxZoom: 16,
      attributionControl: false,
      cooperativeGestures: true,
    });

    mapRef.current = map;

    // Compact attribution
    map.addControl(
      new mapboxgl.AttributionControl({
        compact: true,
        customAttribution: 'Wind: <a href="https://open-meteo.com" target="_blank" rel="noopener">Open-Meteo</a>',
      }),
      'bottom-right'
    );

    // Add city pin marker
    const pinEl = document.createElement('div');
    pinEl.className = 'atmos-wind-marker';
    pinEl.innerHTML = `
      <div style="position: relative; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 22px; height: 22px; border-radius: 50%; background: rgba(56, 189, 248, 0.4); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="width: 10px; height: 10px; border-radius: 50%; background: #38BDF8; border: 2px solid #FFFFFF; box-shadow: 0 0 10px rgba(56,189,248,0.9);"></div>
      </div>
    `;

    const marker = new mapboxgl.Marker({ element: pinEl, anchor: 'center' })
      .setLngLat([initialLon, initialLat])
      .addTo(map);

    markerRef.current = marker;

    const ro = new ResizeObserver(() => {
      if (mapRef.current) mapRef.current.resize();
    });
    ro.observe(mapContainerRef.current);

    return () => {
      ro.disconnect();
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 3. Pan and update marker when location changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || typeof location.lon !== 'number' || typeof location.lat !== 'number') return;

    map.flyTo({
      center: [location.lon, location.lat],
      zoom: 7.2,
      essential: true,
      duration: 1200,
    });

    if (markerRef.current) {
      markerRef.current.setLngLat([location.lon, location.lat]);
    }
  }, [location.lat, location.lon]);

  // 4. Real Regional Vector Field Canvas Particle Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    const map = mapRef.current;
    if (!canvas || !map) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      if (!canvas || !mapContainerRef.current) return;
      canvas.width = mapContainerRef.current.clientWidth;
      canvas.height = mapContainerRef.current.clientHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const device = getDeviceTier();
    const particleCount = device.tier === 'high' ? 850 : device.tier === 'mid' ? 480 : 220;

    // Helper: Bilinear interpolation from real 7x7 Open-Meteo wind field
    const getInterpolatedVector = (geoLat, geoLon) => {
      const field = windFieldRef.current;
      if (!field || !field.grid || !field.grid.length) {
        // Fallback to center city vector if grid not yet returned
        const flowAngle = ((windDir + 180) % 360) * (Math.PI / 180);
        return {
          u: windSpeedKmH * Math.sin(flowAngle),
          v: windSpeedKmH * Math.cos(flowAngle),
          speed: windSpeedKmH,
        };
      }

      const { minLat, maxLat, minLon, maxLon, gridSize, grid } = field;
      const fx = (geoLon - minLon) / (maxLon - minLon);
      const fy = (geoLat - minLat) / (maxLat - minLat);

      const clampedX = Math.max(0, Math.min(1, fx));
      const clampedY = Math.max(0, Math.min(1, fy));

      const gx = clampedX * (gridSize - 1);
      const gy = clampedY * (gridSize - 1);

      const c0 = Math.floor(gx);
      const c1 = Math.min(gridSize - 1, c0 + 1);
      const dx = gx - c0;

      const r0 = Math.floor(gy);
      const r1 = Math.min(gridSize - 1, r0 + 1);
      const dy = gy - r0;

      const p00 = grid[r0]?.[c0] || grid[0][0];
      const p10 = grid[r0]?.[c1] || p00;
      const p01 = grid[r1]?.[c0] || p00;
      const p11 = grid[r1]?.[c1] || p00;

      const u0 = p00.u * (1 - dx) + p10.u * dx;
      const u1 = p01.u * (1 - dx) + p11.u * dx;
      const u = u0 * (1 - dy) + u1 * dy;

      const v0 = p00.v * (1 - dx) + p10.v * dx;
      const v1 = p01.v * (1 - dy) + p11.v * dy;
      const v = v0 * (1 - dy) + v1 * dy;

      return {
        u,
        v,
        speed: Math.hypot(u, v),
      };
    };

    // Initialize particles
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        life: Math.floor(Math.random() * 80),
        maxLife: 60 + Math.floor(Math.random() * 80),
      });
    }

    let isTabVisible = !document.hidden;
    const handleVis = () => {
      isTabVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVis);

    const onMapMove = () => {
      // Refresh particle life on map pan/zoom for seamless continuity
      for (let i = 0; i < particles.length; i++) {
        if (Math.random() < 0.2) {
          particles[i].x = Math.random() * canvas.width;
          particles[i].y = Math.random() * canvas.height;
          particles[i].life = 0;
        }
      }
    };
    map.on('move', onMapMove);

    const render = () => {
      if (!isTabVisible) {
        animRef.current = requestAnimationFrame(render);
        return;
      }

      // Semi-transparent fade creates elegant aerodynamic vector tails
      ctx.fillStyle = 'rgba(11, 16, 27, 0.16)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.life++;

        if (p.life >= p.maxLife || p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height) {
          p.x = Math.random() * canvas.width;
          p.y = Math.random() * canvas.height;
          p.life = 0;
          p.maxLife = 60 + Math.floor(Math.random() * 80);
        }

        // Convert current pixel coordinate to map geographic coordinate
        let geo;
        try {
          geo = map.unproject([p.x, p.y]);
        } catch {
          geo = { lat: location.lat, lng: location.lon };
        }

        // Sample real interpolated vector from regional grid
        const vec = getInterpolatedVector(geo.lat, geo.lng);

        // Velocity scaling: screen X is East, screen Y is South (so -v is North)
        const speedScale = 0.09 + Math.min(vec.speed / 40, 1.2) * 0.12;
        const vx = vec.u * speedScale;
        const vy = -vec.v * speedScale;

        // Visual curve styling
        const progress = p.life / p.maxLife;
        const alpha = Math.sin(progress * Math.PI) * 0.8;
        const tailLength = Math.max(4, Math.min(vec.speed * 0.75, 18));

        const color =
          vec.speed > 45
            ? `rgba(248, 113, 113, ${alpha})`
            : vec.speed > 25
            ? `rgba(251, 191, 36, ${alpha})`
            : `rgba(56, 189, 248, ${alpha})`;

        ctx.strokeStyle = color;
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - vx * (tailLength * 0.3), p.y - vy * (tailLength * 0.3));
        ctx.stroke();

        p.x += vx;
        p.y += vy;
      }

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVis);
      if (mapRef.current) mapRef.current.off('move', onMapMove);
    };
  }, [location.lat, location.lon, windSpeedKmH, windDir]);

  const handleZoomIn = () => {
    if (mapRef.current) mapRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapRef.current) mapRef.current.zoomOut();
  };

  const handleRecenter = () => {
    if (mapRef.current && typeof location.lon === 'number' && typeof location.lat === 'number') {
      mapRef.current.flyTo({
        center: [location.lon, location.lat],
        zoom: 7.2,
        essential: true,
        duration: 900,
      });
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-5 sm:p-7 relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400">
            <Wind className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-white">
              Wind Telemetry & Flow Field
            </h3>
            <p className="text-xs text-slate-400">
              Live wind field from Open-Meteo
            </p>
          </div>
        </div>

        {/* Live Beaufort Classification Badge */}
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-slate-300 text-xs font-medium">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: beaufort.color }}
            />
            <span>{beaufort.desc} · Force {beaufort.scale}</span>
          </div>
        </div>
      </div>

      {/* Map Container with Animated Vector Field Canvas Overlay */}
      <div className="relative w-full h-80 sm:h-[460px] rounded-2xl overflow-hidden border border-white/10 shadow-inner bg-[#0b101b]">
        {!webglSupported ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-400">
            <AlertTriangle className="w-8 h-8 text-amber-400 mb-2" />
            <div className="text-sm font-semibold text-white">WebGL Required</div>
            <div className="text-xs max-w-sm mt-1">
              Your browser or environment does not support WebGL, which is required for Mapbox GL JS rendering.
            </div>
          </div>
        ) : (
          <>
            <div ref={mapContainerRef} className="w-full h-full" />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 pointer-events-none z-10"
            />
          </>
        )}

        {/* Live Wind Compass Telemetry Card */}
        <div className="absolute top-4 left-4 glass-panel rounded-2xl p-3 sm:p-4 border border-white/15 shadow-2xl backdrop-blur-md z-20 flex items-center gap-3 sm:gap-4 max-w-[calc(100%-4rem)]">
          {/* Compass Dial Indicator */}
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-white/20 bg-slate-900/80 flex items-center justify-center shadow-inner shrink-0">
            <div className="absolute text-[8px] text-slate-400 font-mono top-1">N</div>
            <div className="absolute text-[8px] text-slate-400 font-mono right-1.5">E</div>
            <div className="absolute text-[8px] text-slate-400 font-mono bottom-1">S</div>
            <div className="absolute text-[8px] text-slate-400 font-mono left-1.5">W</div>

            {/* Rotating Needle indicating wind direction */}
            <div
              className="w-full h-full flex items-center justify-center transition-transform duration-700"
              style={{ transform: `rotate(${windDir}deg)` }}
            >
              <Navigation className="w-6 h-6 text-sky-400 fill-sky-400" />
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-white">
                {displaySpeed}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                {units.wind}
              </span>
              <span className="text-xs font-bold text-sky-400 ml-1">
                {cardinal} ({Math.round(windDir)}°)
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Peak Gusts: {displayGusts} {units.wind}
            </div>
          </div>
        </div>

        {/* Minimal On-Map Controls: Zoom & Recenter */}
        <div className="absolute right-4 bottom-4 flex flex-col gap-1.5 z-20">
          <button
            onClick={handleZoomIn}
            className="w-8 h-8 rounded-xl glass-panel hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-center border border-white/10 shadow-md transition-colors cursor-pointer"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-8 h-8 rounded-xl glass-panel hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-center border border-white/10 shadow-md transition-colors cursor-pointer"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleRecenter}
            className="w-8 h-8 rounded-xl glass-panel hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-center border border-white/10 shadow-md transition-colors cursor-pointer"
            title={`Center on ${location.name}`}
            aria-label={`Center on ${location.name}`}
          >
            <Crosshair className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default WindMap;
