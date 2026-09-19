import React, { useState, useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  Radar,
  Play,
  Pause,
  ZoomIn,
  ZoomOut,
  Crosshair,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import { useWeatherStore } from '../../store/weatherStore';
import { fetchRainViewerMaps } from '../../api/rainviewer';
import { getMapboxToken, MAPBOX_DARK_STYLE } from '../../utils/mapbox';

export function RadarSection() {
  const location = useWeatherStore((s) => s.location);

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const isMapLoadedRef = useRef(false);

  const [radarData, setRadarData] = useState(null);
  const [currentFrameIdx, setCurrentFrameIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [opacity, setOpacity] = useState(0.65);
  const [loading, setLoading] = useState(true);
  const [webglSupported, setWebglSupported] = useState(true);

  const playIntervalRef = useRef(null);

  // 1. Fetch real RainViewer radar timestamps (past historical frames only)
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchRainViewerMaps().then((data) => {
      if (!isMounted) return;
      if (data && data.frames?.length > 0) {
        setRadarData(data);
        // Start at latest available historical frame
        setCurrentFrameIdx(data.frames.length - 1);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [location.lat, location.lon]);

  const activeFrame = radarData?.frames?.[currentFrameIdx] || null;

  // 2. Helper to safely apply or update RainViewer raster source and layer in Mapbox GL
  const applyRadarLayer = useCallback((frame, layerOpacity) => {
    const map = mapRef.current;
    if (!map || !isMapLoadedRef.current || !frame) return;

    const SOURCE_ID = 'rainviewer-radar-source';
    const LAYER_ID = 'rainviewer-radar-layer';

    try {
      // If the layer already exists, update opacity or recreate for new tile URL
      if (map.getLayer(LAYER_ID)) {
        map.removeLayer(LAYER_ID);
      }
      if (map.getSource(SOURCE_ID)) {
        map.removeSource(SOURCE_ID);
      }

      map.addSource(SOURCE_ID, {
        type: 'raster',
        tiles: [frame.tileUrl],
        tileSize: 256,
        minzoom: 0,
        maxzoom: 7,
      });

      map.addLayer({
        id: LAYER_ID,
        type: 'raster',
        source: SOURCE_ID,
        paint: {
          'raster-opacity': layerOpacity,
          'raster-fade-duration': 0,
          'raster-resampling': 'linear',
        },
      });
    } catch (err) {
      console.warn('Mapbox radar layer update warning:', err);
    }
  }, []);

  // 3. Initialize Mapbox GL JS Map Instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapboxgl.supported()) {
      setWebglSupported(false);
      return;
    }

    const token = getMapboxToken();
    if (!token) {
      console.error('VITE_MAPBOX_TOKEN is missing or not configured in environment.');
      return;
    }
    mapboxgl.accessToken = token;

    // Use current location coordinates [longitude, latitude]
    const initialLon = typeof location.lon === 'number' ? location.lon : 77.7064;
    const initialLat = typeof location.lat === 'number' ? location.lat : 28.9845;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: MAPBOX_DARK_STYLE,
      center: [initialLon, initialLat],
      zoom: 6.8,
      minZoom: 2.5,
      maxZoom: 18,
      attributionControl: false,
      cooperativeGestures: true,
    });

    mapRef.current = map;

    // Add clean compact attribution
    map.addControl(
      new mapboxgl.AttributionControl({
        compact: true,
        customAttribution: 'Weather data by <a href="https://www.rainviewer.com" target="_blank" rel="noopener">RainViewer</a>',
      }),
      'bottom-right'
    );

    // Add pulsing target pin for the current location
    const pinEl = document.createElement('div');
    pinEl.className = 'atmos-radar-location-pin';
    pinEl.innerHTML = `
      <div style="position: relative; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 26px; height: 26px; border-radius: 50%; background: rgba(56, 189, 248, 0.4); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="width: 12px; height: 12px; border-radius: 50%; background: #38BDF8; border: 2px solid #FFFFFF; box-shadow: 0 0 10px rgba(56,189,248,0.9);"></div>
      </div>
    `;

    const marker = new mapboxgl.Marker({ element: pinEl, anchor: 'center' })
      .setLngLat([initialLon, initialLat])
      .addTo(map);

    markerRef.current = marker;

    map.on('load', () => {
      isMapLoadedRef.current = true;
      map.resize();

      if (activeFrame) {
        applyRadarLayer(activeFrame, opacity);
      }
    });

    // Handle container resize automatically
    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.resize();
      }
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      isMapLoadedRef.current = false;
      resizeObserver.disconnect();
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      map.remove();
      mapRef.current = null;
    };
  }, []); // Run once on mount

  // 4. Update map center and marker when location changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || typeof location.lon !== 'number' || typeof location.lat !== 'number') return;

    map.flyTo({
      center: [location.lon, location.lat],
      zoom: 6.8,
      essential: true,
      duration: 1200,
    });

    if (markerRef.current) {
      markerRef.current.setLngLat([location.lon, location.lat]);
    }
  }, [location.lat, location.lon]);

  // 5. Update radar raster layer when active frame changes
  useEffect(() => {
    if (activeFrame && isMapLoadedRef.current) {
      applyRadarLayer(activeFrame, opacity);
    }
  }, [activeFrame, applyRadarLayer, opacity]);

  // 6. Instant GPU opacity adjustment
  useEffect(() => {
    const map = mapRef.current;
    if (map && isMapLoadedRef.current && map.getLayer('rainviewer-radar-layer')) {
      map.setPaintProperty('rainviewer-radar-layer', 'raster-opacity', opacity);
    }
  }, [opacity]);

  // 7. Radar playback animation loop (Historical frames cycle)
  useEffect(() => {
    if (!isPlaying || !radarData?.frames?.length) {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
      return;
    }

    playIntervalRef.current = setInterval(() => {
      setCurrentFrameIdx((prev) => (prev + 1) % radarData.frames.length);
    }, 800); // 800ms per frame for smooth Doppler movement

    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [isPlaying, radarData]);

  // Map Navigation Button Handlers
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
        zoom: 6.8,
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
            <Radar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-white">
              Precipitation Radar
            </h3>
            <p className="text-xs text-slate-400">
              Interactive geographic Doppler station for {location.name}
            </p>
          </div>
        </div>

        {/* Status Badge & Provider Notice */}
        <div className="flex items-center gap-2">
          {loading ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
              <span>Loading radar…</span>
            </div>
          ) : radarData?.frames?.length ? (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Live Precipitation Radar</span>
              <span className="text-slate-400 text-[11px]">· Radar: RainViewer</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Radar coverage unavailable for this area</span>
            </div>
          )}
        </div>
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

        {/* Timestamp Floating Pill */}
        {activeFrame && (
          <div className="absolute top-4 left-4 glass-panel rounded-xl px-3 py-1.5 text-xs text-white border border-white/10 shadow-lg backdrop-blur-md z-10 flex items-center gap-2 pointer-events-none">
            <span className="font-bold font-mono text-sky-300">
              {activeFrame.timeLabel}
            </span>
            <span className="text-slate-400 text-[11px]">
              {activeFrame.isLatest ? '· Latest available' : '· Past observation'}
            </span>
          </div>
        )}

        {/* Small Elegant Precipitation Legend */}
        <div className="absolute top-4 right-4 glass-panel rounded-xl px-3 py-2 text-[11px] border border-white/10 backdrop-blur-md shadow-lg z-10 hidden sm:flex items-center gap-2.5 pointer-events-none">
          <span className="text-slate-400 font-medium">Precipitation:</span>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#74c476]" />
            <span className="text-slate-300 text-[10px]">Light</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#fecc5c]" />
            <span className="text-slate-300 text-[10px]">Moderate</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#fd8d3c]" />
            <span className="text-slate-300 text-[10px]">Heavy</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#e31a1c]" />
            <span className="text-slate-300 text-[10px]">Extreme</span>
          </div>
        </div>

        {/* Minimal On-Map Controls: Zoom & Recenter */}
        <div className="absolute right-4 bottom-28 sm:bottom-24 flex flex-col gap-1.5 z-10">
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

        {/* Playback & Scrubber Controls */}
        <div className="absolute bottom-4 inset-x-3 sm:inset-x-8 glass-panel rounded-2xl p-3 border border-white/15 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 z-10 backdrop-blur-lg">
          {/* Play / Pause Toggle */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={!radarData?.frames?.length}
            className="w-10 h-10 rounded-xl bg-sky-500 hover:bg-sky-400 text-white flex items-center justify-center shrink-0 transition-colors shadow-lg shadow-sky-500/25 cursor-pointer disabled:opacity-50"
            title={isPlaying ? 'Pause loop' : 'Play historical radar loop'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-white" />
            ) : (
              <Play className="w-4 h-4 fill-white ml-0.5" />
            )}
          </button>

          {/* Timeline Slider */}
          <div className="flex-1 w-full">
            <div className="flex justify-between text-[11px] text-slate-400 mb-1 font-mono">
              <span>{radarData?.frames?.[0]?.timeLabel || 'Past observations'}</span>
              <span className="text-sky-400 font-bold">
                {activeFrame ? `${activeFrame.timeLabel}${activeFrame.isLatest ? ' (Latest available)' : ''}` : 'Loading Station…'}
              </span>
              <span>Latest available</span>
            </div>

            <input
              type="range"
              min="0"
              max={radarData?.frames ? radarData.frames.length - 1 : 0}
              value={currentFrameIdx}
              onChange={(e) => {
                setIsPlaying(false);
                setCurrentFrameIdx(parseInt(e.target.value, 10));
              }}
              className="w-full h-4 sm:h-2 bg-slate-800 rounded-lg appearance-none cursor-ew-resize accent-sky-400 touch-none"
              style={{ touchAction: 'none' }}
              aria-label="Scrub radar time frame"
            />
          </div>

          {/* Opacity Control Slider */}
          <div className="hidden md:flex items-center gap-2 pl-2 border-l border-white/10 text-xs text-slate-300">
            <span className="text-[11px] text-slate-400">Opacity</span>
            <input
              type="range"
              min="0.2"
              max="1"
              step="0.05"
              value={opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
              className="w-16 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-ew-resize accent-sky-400"
            />
            <span className="text-[10px] text-slate-400 font-mono w-7">
              {Math.round(opacity * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RadarSection;
