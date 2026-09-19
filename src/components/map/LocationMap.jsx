import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, ZoomIn, ZoomOut, Crosshair, AlertTriangle } from 'lucide-react';
import { useWeatherStore } from '../../store/weatherStore';
import { getMapboxToken, MAPBOX_DARK_STYLE } from '../../utils/mapbox';

export function LocationMap() {
  const location = useWeatherStore((s) => s.location);

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [webglSupported, setWebglSupported] = useState(true);

  // Initialize Mapbox GL JS Base Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapboxgl.supported()) {
      setWebglSupported(false);
      return;
    }

    const token = getMapboxToken();
    if (!token) {
      console.warn('VITE_MAPBOX_TOKEN is missing or not configured in environment.');
      return;
    }
    mapboxgl.accessToken = token;

    const initialLon = typeof location.lon === 'number' ? location.lon : 77.7064;
    const initialLat = typeof location.lat === 'number' ? location.lat : 28.9845;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: MAPBOX_DARK_STYLE,
      center: [initialLon, initialLat],
      zoom: 8.5,
      minZoom: 2.5,
      maxZoom: 18,
      attributionControl: false,
      cooperativeGestures: true,
    });

    mapRef.current = map;

    // Compact attribution
    map.addControl(
      new mapboxgl.AttributionControl({
        compact: true,
      }),
      'bottom-right'
    );

    // Add pulsing target pin for the current location
    const pinEl = document.createElement('div');
    pinEl.className = 'atmos-location-pin';
    pinEl.innerHTML = `
      <div style="position: relative; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 26px; height: 26px; border-radius: 50%; background: rgba(56, 189, 248, 0.35); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="width: 12px; height: 12px; border-radius: 50%; background: #38BDF8; border: 2px solid #FFFFFF; box-shadow: 0 0 10px rgba(56,189,248,0.9);"></div>
      </div>
    `;

    const marker = new mapboxgl.Marker({ element: pinEl, anchor: 'center' })
      .setLngLat([initialLon, initialLat])
      .addTo(map);

    markerRef.current = marker;

    const ro = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.resize();
      }
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

  // Pan and update marker when location changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || typeof location.lon !== 'number' || typeof location.lat !== 'number') return;

    map.flyTo({
      center: [location.lon, location.lat],
      zoom: 8.5,
      essential: true,
      duration: 1200,
    });

    if (markerRef.current) {
      markerRef.current.setLngLat([location.lon, location.lat]);
    }
  }, [location.lat, location.lon]);

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
        zoom: 8.5,
        essential: true,
        duration: 900,
      });
    }
  };

  const latLabel = typeof location.lat === 'number'
    ? `${Math.abs(location.lat).toFixed(2)}° ${location.lat >= 0 ? 'N' : 'S'}`
    : '';
  const lonLabel = typeof location.lon === 'number'
    ? `${Math.abs(location.lon).toFixed(2)}° ${location.lon >= 0 ? 'E' : 'W'}`
    : '';

  return (
    <div className="glass-panel rounded-3xl p-5 sm:p-7 relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-white">
              Location Map
            </h3>
            <p className="text-xs text-slate-400">
              Cartographic geographic view for {location.name}{location.country ? `, ${location.country}` : ''}
            </p>
          </div>
        </div>

        {/* Coordinates Badge */}
        {latLabel && lonLabel && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-slate-300 text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            <span>{latLabel}, {lonLabel}</span>
          </div>
        )}
      </div>

      {/* Mapbox Display Container */}
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
          <div ref={mapContainerRef} className="w-full h-full" />
        )}

        {/* Floating Location Card */}
        <div className="absolute top-4 left-4 glass-panel rounded-xl px-3.5 py-2 text-xs text-white border border-white/10 shadow-lg backdrop-blur-md z-10 flex items-center gap-2 pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
          <span className="font-semibold text-white">{location.name}</span>
          <span className="text-slate-400 text-[11px]">· {latLabel}, {lonLabel}</span>
        </div>

        {/* On-Map Controls: Zoom & Recenter */}
        <div className="absolute right-4 bottom-4 flex flex-col gap-1.5 z-10">
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

export default LocationMap;
