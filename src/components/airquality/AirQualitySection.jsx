import React from 'react';
import { Activity, ShieldCheck, AlertCircle, Info, ChevronRight } from 'lucide-react';
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
  const openDeepDive = useWeatherStore((s) => s.openDeepDive);

  const curr = airQuality?.current;
  const rawAqi = curr?.european_aqi ?? curr?.us_aqi ?? null;
  const aqi = typeof rawAqi === 'number' && !isNaN(rawAqi) && isFinite(rawAqi) ? rawAqi : null;

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
            <h4 className="text-base font-semibold text-white">Air quality data unavailable.</h4>
            <p className="text-xs text-slate-400 max-w-sm mt-1.5 leading-relaxed">
              Real-time atmospheric air quality telemetry is currently unavailable from Open-Meteo monitoring stations for this location.
            </p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <span>Source: Open-Meteo Air Quality Model</span>
          <span>Status: AQI Unavailable</span>
        </div>
      </div>
    );
  }

  const aqiInfo = getAqiCategory(aqi);

  const formatPollutant = (val) => {
    if (typeof val !== 'number' || isNaN(val) || !isFinite(val)) return 'N/A';
    return `${val.toFixed(1)} µg/m³`;
  };

  const getPollutantStatus = (val, threshold) => {
    if (typeof val !== 'number' || isNaN(val) || !isFinite(val)) return 'N/A';
    return val > threshold ? 'Elevated' : 'Clean';
  };

  const pollutants = [
    { name: 'PM2.5', value: formatPollutant(curr.pm2_5), status: getPollutantStatus(curr.pm2_5, 25) },
    { name: 'PM10', value: formatPollutant(curr.pm10), status: getPollutantStatus(curr.pm10, 50) },
    { name: 'Ozone (O₃)', value: formatPollutant(curr.ozone), status: typeof curr.ozone === 'number' && !isNaN(curr.ozone) ? (curr.ozone > 100 ? 'Elevated' : 'Normal') : 'N/A' },
    { name: 'Nitrogen (NO₂)', value: formatPollutant(curr.nitrogen_dioxide), status: typeof curr.nitrogen_dioxide === 'number' && !isNaN(curr.nitrogen_dioxide) ? (curr.nitrogen_dioxide > 40 ? 'Elevated' : 'Low') : 'N/A' },
  ];

  // Determine what is driving air quality based on relative ratios to reference thresholds
  const driverRatios = [
    {
      label: 'PM2.5 fine particulate matter',
      ratio: typeof curr.pm2_5 === 'number' ? curr.pm2_5 / 25 : 0,
      explanation:
        curr.pm2_5 > 25
          ? `PM2.5 (${curr.pm2_5.toFixed(1)} µg/m³) is the main contributor to reduced air quality today.`
          : `Fine particulate matter (PM2.5 at ${curr.pm2_5?.toFixed(1) ?? 0} µg/m³) remains well within clean atmospheric limits.`,
    },
    {
      label: 'PM10 coarse particulates',
      ratio: typeof curr.pm10 === 'number' ? curr.pm10 / 50 : 0,
      explanation:
        curr.pm10 > 50
          ? `PM10 dust and coarse particles (${curr.pm10.toFixed(1)} µg/m³) are the primary driver of current air quality levels.`
          : `Coarse particulate levels (PM10 at ${curr.pm10?.toFixed(1) ?? 0} µg/m³) are low across the area.`,
    },
    {
      label: 'Surface Ozone (O₃)',
      ratio: typeof curr.ozone === 'number' ? curr.ozone / 100 : 0,
      explanation:
        curr.ozone > 100
          ? `Surface Ozone (${curr.ozone.toFixed(1)} µg/m³) is the primary contributor to current air quality readings.`
          : `Ground-level Ozone (${curr.ozone?.toFixed(1) ?? 0} µg/m³) is currently the highest relative trace gas but remains within normal bounds.`,
    },
    {
      label: 'Nitrogen Dioxide (NO₂)',
      ratio: typeof curr.nitrogen_dioxide === 'number' ? curr.nitrogen_dioxide / 40 : 0,
      explanation:
        curr.nitrogen_dioxide > 40
          ? `Nitrogen Dioxide (${curr.nitrogen_dioxide.toFixed(1)} µg/m³) is the primary contributor to current air quality.`
          : `Nitrogen Dioxide levels (${curr.nitrogen_dioxide?.toFixed(1) ?? 0} µg/m³) remain low.`,
    },
  ].sort((a, b) => b.ratio - a.ratio);

  const primaryDriverText =
    driverRatios[0]?.ratio > 0
      ? driverRatios[0].explanation
      : 'All measured atmospheric pollutants are at low background concentrations.';

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
          <button
            onClick={() => openDeepDive('aqi')}
            className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-mono transition-colors cursor-pointer"
          >
            <span>EAQI Scale</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* AQI Score Dial / Banner - Tap to open deep dive */}
        <div
          onClick={() => openDeepDive('aqi')}
          className="flex items-center gap-5 p-4 rounded-2xl bg-white/[0.02] border border-white/5 mb-4 hover:border-emerald-500/30 hover:bg-white/[0.04] transition-all cursor-pointer group"
          title="Tap for AQI deep dive and pollutant analysis"
        >
          {/* Circular Badge */}
          <div
            className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center shrink-0 border group-hover:scale-105 transition-transform"
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
              <h4 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                {aqiInfo.label} Air
              </h4>
              <ShieldCheck className="w-4 h-4" style={{ color: aqiInfo.color }} />
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {aqiInfo.description}
            </p>
          </div>
        </div>

        {/* What's Driving Air Quality? */}
        <div className="p-3.5 rounded-2xl bg-white/[0.025] border border-white/5 mb-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-1">
            What&apos;s Driving Air Quality?
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">
            {primaryDriverText}
          </p>
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
              <div className={`text-[10px] font-medium ${p.status === 'Elevated' ? 'text-amber-400' : 'text-emerald-400'}`}>
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
