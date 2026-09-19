import React from 'react';
import { Activity, ShieldCheck, AlertCircle, Info } from 'lucide-react';
import { useWeatherStore } from '../../store/weatherStore';

function getAqiCategory(aqi) {
  if (aqi <= 20) {
    return {
      label: 'Good',
      color: '#10B981',
      bgColor: 'rgba(16, 185, 129, 0.15)',
      description: 'Air quality is considered satisfactory, and air pollution poses little or no risk.',
    };
  }
  if (aqi <= 40) {
    return {
      label: 'Fair',
      color: '#34D399',
      bgColor: 'rgba(52, 211, 153, 0.15)',
      description: 'Air quality is acceptable; moderate health concern for a very small number of unusually sensitive individuals.',
    };
  }
  if (aqi <= 60) {
    return {
      label: 'Moderate',
      color: '#FBBF24',
      bgColor: 'rgba(251, 191, 36, 0.15)',
      description: 'Members of sensitive groups may experience mild respiratory symptoms. General public not likely affected.',
    };
  }
  if (aqi <= 80) {
    return {
      label: 'Poor',
      color: '#F97316',
      bgColor: 'rgba(249, 115, 22, 0.15)',
      description: 'Everyone may begin to experience health effects; sensitive groups should reduce prolonged outdoor exertion.',
    };
  }
  return {
    label: 'Very Poor',
    color: '#EF4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    description: 'Health warnings of emergency conditions. The entire population is more likely to be affected.',
  };
}

export function AirQualitySection() {
  const airQuality = useWeatherStore((s) => s.airQuality);

  const curr = airQuality?.current;
  const aqi = curr?.european_aqi ?? curr?.us_aqi ?? null;

  if (!curr || aqi === null) {
    return (
      <div className="glass-panel rounded-3xl p-5 sm:p-7 flex flex-col justify-between h-full min-h-[340px]">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
                <Activity className="w-4 h-4" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-white">
                Atmospheric Air Quality
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              EAQI Scale
            </span>
          </div>

          {/* Elegant Unavailable State */}
          <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center text-center my-6">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-slate-400 mb-3">
              <Info className="w-6 h-6" />
            </div>
            <h4 className="text-base font-semibold text-white">Air Quality Data Unavailable</h4>
            <p className="text-xs text-slate-400 max-w-sm mt-1.5 leading-relaxed">
              Real-time atmospheric air quality telemetry is currently unavailable from Open-Meteo monitoring stations for this location.
            </p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <span>Source: Open-Meteo Air Quality Model</span>
          <span>Status: Telemetry Unavailable</span>
        </div>
      </div>
    );
  }

  const aqiInfo = getAqiCategory(aqi);

  const pollutants = [
    { name: 'PM2.5', value: curr.pm2_5 != null ? `${curr.pm2_5.toFixed(1)} µg/m³` : 'N/A', status: curr.pm2_5 != null ? (curr.pm2_5 > 25 ? 'Elevated' : 'Clean') : 'N/A' },
    { name: 'PM10', value: curr.pm10 != null ? `${curr.pm10.toFixed(1)} µg/m³` : 'N/A', status: curr.pm10 != null ? (curr.pm10 > 50 ? 'Elevated' : 'Clean') : 'N/A' },
    { name: 'Ozone (O₃)', value: curr.ozone != null ? `${curr.ozone.toFixed(1)} µg/m³` : 'N/A', status: curr.ozone != null ? 'Normal' : 'N/A' },
    { name: 'Nitrogen (NO₂)', value: curr.nitrogen_dioxide != null ? `${curr.nitrogen_dioxide.toFixed(1)} µg/m³` : 'N/A', status: curr.nitrogen_dioxide != null ? 'Low' : 'N/A' },
  ];

  return (
    <div className="glass-panel rounded-3xl p-5 sm:p-7 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Activity className="w-4 h-4" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-white">
              Atmospheric Air Quality
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            European AQI Scale
          </span>
        </div>

        {/* AQI Score Dial / Banner */}
        <div className="flex items-center gap-5 p-4 rounded-2xl bg-white/[0.02] border border-white/5 mb-5">
          {/* Circular Badge */}
          <div
            className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center shrink-0 border"
            style={{
              backgroundColor: aqiInfo.bgColor,
              borderColor: aqiInfo.color,
            }}
          >
            <span className="text-2xl font-extrabold text-white leading-none">
              {Math.round(aqi)}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider mt-0.5" style={{ color: aqiInfo.color }}>
              AQI
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-lg font-bold text-white">{aqiInfo.label} Air</h4>
              <ShieldCheck className="w-4 h-4" style={{ color: aqiInfo.color }} />
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {aqiInfo.description}
            </p>
          </div>
        </div>

        {/* Pollutants Breakdown Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {pollutants.map((p, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between"
            >
              <div className="text-[11px] text-slate-400 font-medium">
                {p.name}
              </div>
              <div className="text-sm font-semibold text-slate-100 my-1">
                {p.value}
              </div>
              <div className="text-[10px] text-emerald-400 font-medium">
                {p.status}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <span>Source: Open-Meteo Air Quality Model</span>
        <span>Standard: European Air Quality Index (EAQI)</span>
      </div>
    </div>
  );
}
