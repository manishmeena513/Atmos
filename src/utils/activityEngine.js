/**
 * "Should I Go Out?" Activity Assessment Engine
 * Analyzes current and hourly forecasts to compute transparent weather-based assessments.
 * Strictly avoids medical or personal health claims.
 */

export const ACTIVITIES = [
  { id: 'walking', name: 'Walking', icon: 'Footprints' },
  { id: 'running', name: 'Running', icon: 'Flame' },
  { id: 'cycling', name: 'Cycling', icon: 'Bike' },
  { id: 'photography', name: 'Photography', icon: 'Camera' },
  { id: 'study', name: 'Outdoor Study', icon: 'BookOpen' },
  { id: 'sports', name: 'Sports', icon: 'Trophy' },
  { id: 'travel', name: 'Travel', icon: 'Plane' },
  { id: 'outdoor', name: 'General Outdoor', icon: 'Sun' },
];

export function analyzeActivity(activityId, weatherData, units = { temp: 'C', wind: 'kmh' }) {
  if (!weatherData?.hourly || !weatherData?.current) {
    return {
      status: 'MODERATE CONDITIONS',
      suitability: 'Moderate',
      score: 70,
      bestWindows: ['Afternoon'],
      factors: [],
      summary: 'Awaiting forecast data...',
    };
  }

  const { current, hourly, daily } = weatherData;
  const currentHour = new Date().getHours();

  const temps = hourly.temperature_2m || [];
  const precips = hourly.precipitation_probability || [];
  const winds = hourly.wind_speed_10m || [];
  const uvs = hourly.uv_index || [];
  const visibilities = hourly.visibility || [];
  const clouds = hourly.cloud_cover || [];

  const curTempC = current.temperature_2m ?? temps[currentHour] ?? 20;
  const curWindKmh = current.wind_speed_10m ?? winds[currentHour] ?? 10;
  const curPrecipProb = precips[currentHour] ?? 0;
  const curUv = current.uv_index ?? uvs[currentHour] ?? 2;
  const curVisKm = (visibilities[currentHour] || 10000) / 1000;

  const toDispTemp = (c) =>
    units.temp === 'F' ? `${Math.round((c * 9) / 5 + 32)}°F` : `${Math.round(c)}°C`;
  const toDispWind = (kmh) =>
    units.wind === 'mph' ? `${Math.round(kmh * 0.621371)} mph` : `${Math.round(kmh)} km/h`;

  const rainDescriptor =
    (current.precipitation || 0) > 0
      ? 'Active precipitation'
      : curPrecipProb >= 50
      ? `High rain probability (${curPrecipProb}%)`
      : curPrecipProb >= 25
      ? `Moderate rain chance (${curPrecipProb}%)`
      : `Low rain probability (${curPrecipProb}%)`;

  const windDescriptor =
    curWindKmh >= 32
      ? `Strong wind (${toDispWind(curWindKmh)})`
      : curWindKmh >= 18
      ? `Moderate wind (${toDispWind(curWindKmh)})`
      : `Light wind (${toDispWind(curWindKmh)})`;

  const sunrise = daily?.sunrise?.[0] ? new Date(daily.sunrise[0]) : null;
  const sunset = daily?.sunset?.[0] ? new Date(daily.sunset[0]) : null;

  switch (activityId) {
    case 'running': {
      const isGood = curPrecipProb < 30 && curTempC >= 7 && curTempC <= 26 && curWindKmh < 28 && (current.precipitation || 0) === 0;
      const isPoor = (current.precipitation || 0) > 0.5 || curPrecipProb >= 60 || curTempC >= 33 || curTempC <= 0;

      return {
        status: isPoor ? 'POOR CONDITIONS' : isGood ? 'GOOD CONDITIONS' : 'MODERATE CONDITIONS',
        suitability: isPoor ? 'Challenging' : isGood ? 'Favorable' : 'Fair',
        score: isPoor ? 45 : isGood ? 90 : 72,
        bestWindows: ['06:30 – 09:30', '18:00 – 20:30'],
        factors: [
          { label: 'Temperature', value: toDispTemp(curTempC), detail: curTempC > 26 ? 'Warm ambient air' : 'Comfortable range' },
          { label: 'Precipitation', value: `${curPrecipProb}%`, detail: rainDescriptor },
          { label: 'Wind', value: toDispWind(curWindKmh), detail: windDescriptor },
          { label: 'UV Index', value: `${curUv.toFixed(1)}`, detail: curUv >= 6 ? 'High solar intensity' : 'Low to moderate UV' },
        ],
        summary: isPoor
          ? 'Elevated rain probability or temperature extremes make outdoor running less comfortable right now.'
          : isGood
          ? 'Temperature and precipitation conditions are favorable for outdoor running.'
          : 'Conditions are acceptable, though wind or daytime warmth may be noticeable.',
      };
    }

    case 'cycling': {
      const isGood = curWindKmh < 22 && curPrecipProb < 25 && (current.precipitation || 0) === 0;
      const isPoor = curWindKmh >= 35 || curPrecipProb >= 55 || (current.precipitation || 0) > 0;

      return {
        status: isPoor ? 'POOR CONDITIONS' : isGood ? 'GOOD CONDITIONS' : 'MODERATE CONDITIONS',
        suitability: isPoor ? 'High Wind / Wet' : isGood ? 'Smooth Ride' : 'Moderate',
        score: isPoor ? 42 : isGood ? 92 : 68,
        bestWindows: ['07:00 – 10:30', '16:30 – 19:00'],
        factors: [
          { label: 'Temperature', value: toDispTemp(curTempC), detail: 'Ambient air' },
          { label: 'Wind Speed', value: toDispWind(curWindKmh), detail: curWindKmh >= 24 ? 'Noticeable crosswind' : 'Low wind resistance' },
          { label: 'Rain Risk', value: `${curPrecipProb}%`, detail: curPrecipProb >= 35 ? 'Possible wet pavement' : 'Dry road surface' },
          { label: 'Visibility', value: `${curVisKm.toFixed(1)} km`, detail: 'Road sightline' },
        ],
        summary: isPoor
          ? 'Strong wind gusts or wet road conditions reduce cycling comfort and stability.'
          : isGood
          ? 'Dry pavement and manageable wind speeds provide favorable conditions for cycling.'
          : 'Moderate winds or cloud cover present; morning and late afternoon hours offer the calmest ride.',
      };
    }

    case 'photography': {
      const goldenMorning = sunrise
        ? `${String(sunrise.getHours()).padStart(2, '0')}:${String(sunrise.getMinutes()).padStart(2, '0')} – ${String(sunrise.getHours() + 1).padStart(2, '0')}:00`
        : '06:15 – 07:30';
      const goldenEvening = sunset
        ? `${String(sunset.getHours() - 1).padStart(2, '0')}:00 – ${String(sunset.getHours()).padStart(2, '0')}:${String(sunset.getMinutes()).padStart(2, '0')}`
        : '17:30 – 18:30';
      const cloudPct = current.cloud_cover ?? clouds[currentHour] ?? 30;
      const isPoor = (current.precipitation || 0) > 0.5 || curVisKm < 2;

      return {
        status: isPoor ? 'POOR CONDITIONS' : 'GOOD CONDITIONS',
        suitability: isPoor ? 'Low Visibility' : cloudPct > 40 ? 'Soft Diffused Light' : 'Crisp Sunlight',
        score: isPoor ? 48 : 91,
        bestWindows: [goldenMorning, goldenEvening],
        factors: [
          { label: 'Golden Hour (AM)', value: goldenMorning, detail: 'Warm directional light' },
          { label: 'Golden Hour (PM)', value: goldenEvening, detail: 'Long sunset shadows' },
          { label: 'Cloud Cover', value: `${cloudPct}%`, detail: cloudPct > 50 ? 'Natural sky diffusion' : 'Direct sun contrast' },
          { label: 'Visibility', value: `${curVisKm.toFixed(1)} km`, detail: 'Horizon clarity' },
        ],
        summary: isPoor
          ? 'Active precipitation or reduced visibility limits clear landscape photography.'
          : 'Good optical clarity and sky contrast. Golden hours around sunrise and sunset offer the best natural lighting.',
      };
    }

    case 'study': {
      const isGood = curWindKmh < 18 && curPrecipProb < 20 && curTempC >= 16 && curTempC <= 28 && (current.precipitation || 0) === 0;
      const isPoor = (current.precipitation || 0) > 0 || curPrecipProb >= 45 || curWindKmh >= 28 || curTempC >= 34 || curTempC <= 10;

      return {
        status: isPoor ? 'POOR CONDITIONS' : isGood ? 'GOOD CONDITIONS' : 'MODERATE CONDITIONS',
        suitability: isPoor ? 'Indoor Advised' : isGood ? 'Calm & Comfortable' : 'Seek Shade / Shelter',
        score: isPoor ? 40 : isGood ? 93 : 70,
        bestWindows: ['09:30 – 12:30', '16:00 – 18:30'],
        factors: [
          { label: 'Temperature', value: toDispTemp(curTempC), detail: 'Outdoor seating comfort' },
          { label: 'Wind', value: toDispWind(curWindKmh), detail: curWindKmh > 18 ? 'May disturb loose pages' : 'Calm airflow' },
          { label: 'Rain Risk', value: `${curPrecipProb}%`, detail: rainDescriptor },
          { label: 'Solar Glare', value: `UV ${curUv.toFixed(1)}`, detail: curUv >= 5 ? 'Shaded table recommended' : 'Low screen glare' },
        ],
        summary: isPoor
          ? 'Wind, rain risk, or temperature extremes make indoor study spaces more practical today.'
          : isGood
          ? 'Calm winds and dry, mild air provide comfortable conditions for outdoor reading or laptop work.'
          : 'Outdoor study is possible in a sheltered or shaded spot away from direct midday sun and breeze.',
      };
    }

    case 'sports': {
      const isGood = curPrecipProb < 25 && curWindKmh < 24 && curTempC >= 10 && curTempC <= 29 && (current.precipitation || 0) === 0;
      const isPoor = (current.precipitation || 0) > 0 || curPrecipProb >= 55 || curWindKmh >= 35 || curTempC >= 35;

      return {
        status: isPoor ? 'POOR CONDITIONS' : isGood ? 'GOOD CONDITIONS' : 'MODERATE CONDITIONS',
        suitability: isPoor ? 'Disrupted Play' : isGood ? 'Game Ready' : 'Playable',
        score: isPoor ? 44 : isGood ? 91 : 72,
        bestWindows: ['08:00 – 11:00', '16:00 – 18:30'],
        factors: [
          { label: 'Temperature', value: toDispTemp(curTempC), detail: 'Court & field conditions' },
          { label: 'Precipitation', value: `${curPrecipProb}%`, detail: curPrecipProb >= 35 ? 'Surface may be slick' : 'Dry playing surface' },
          { label: 'Wind Drift', value: toDispWind(curWindKmh), detail: curWindKmh >= 22 ? 'Affects ball flight' : 'Minimal ball drift' },
          { label: 'UV Exposure', value: `${curUv.toFixed(1)}`, detail: 'Daytime solar level' },
        ],
        summary: isPoor
          ? 'Wet turf or high wind speeds may interfere with outdoor court and field sports.'
          : isGood
          ? 'Dry surfaces and light winds create favorable conditions for outdoor sports.'
          : 'Playable conditions overall, though wind or afternoon warmth should be factored into scheduling.',
      };
    }

    case 'travel': {
      const isGood = curPrecipProb < 30 && curVisKm >= 6 && (current.precipitation || 0) === 0;
      const isPoor = (current.precipitation || 0) > 1.0 || curPrecipProb >= 65 || curVisKm < 2 || curWindKmh >= 40;

      return {
        status: isPoor ? 'POOR CONDITIONS' : isGood ? 'GOOD CONDITIONS' : 'MODERATE CONDITIONS',
        suitability: isPoor ? 'Weather Delays Possible' : isGood ? 'Smooth Transit' : 'Pack Rain Gear',
        score: isPoor ? 48 : isGood ? 94 : 74,
        bestWindows: ['09:00 – 13:00', '15:00 – 19:00'],
        factors: [
          { label: 'Visibility', value: `${curVisKm.toFixed(1)} km`, detail: curVisKm >= 8 ? 'Clear sightseeing views' : 'Hazy horizon' },
          { label: 'Temperature', value: toDispTemp(curTempC), detail: 'Transit comfort' },
          { label: 'Rain Probability', value: `${curPrecipProb}%`, detail: rainDescriptor },
          { label: 'Wind', value: toDispWind(curWindKmh), detail: windDescriptor },
        ],
        summary: isPoor
          ? 'Precipitation or reduced visibility may slow local transit and outdoor sightseeing.'
          : isGood
          ? 'Clear visibility and dry weather support smooth travel and sightseeing.'
          : 'Generally manageable travel weather; keep an umbrella handy for passing showers.',
      };
    }

    case 'outdoor': {
      const isGood = curPrecipProb < 25 && curTempC >= 14 && curTempC <= 29 && curWindKmh < 25 && (current.precipitation || 0) === 0;
      const isPoor = (current.precipitation || 0) > 0 || curPrecipProb >= 55 || curTempC >= 35 || curTempC <= 4;

      return {
        status: isPoor ? 'POOR CONDITIONS' : isGood ? 'GOOD CONDITIONS' : 'MODERATE CONDITIONS',
        suitability: isPoor ? 'Unfavorable' : isGood ? 'Great Outdoors' : 'Mixed Conditions',
        score: isPoor ? 45 : isGood ? 93 : 73,
        bestWindows: ['09:00 – 12:00', '16:30 – 19:00'],
        factors: [
          { label: 'Temperature', value: toDispTemp(curTempC), detail: `Feels like ${toDispTemp(current.apparent_temperature ?? curTempC)}` },
          { label: 'Rain Risk', value: `${curPrecipProb}%`, detail: rainDescriptor },
          { label: 'Wind', value: toDispWind(curWindKmh), detail: windDescriptor },
          { label: 'Humidity', value: `${current.relative_humidity_2m ?? 50}%`, detail: 'Ambient moisture' },
        ],
        summary: isPoor
          ? 'Rain probability or uncomfortable temperatures make extended outdoor plans less ideal right now.'
          : isGood
          ? 'Balanced temperatures, low rain risk, and light winds make this a great time to be outdoors.'
          : 'Outdoor plans are feasible; check the hourly timeline to pick the most comfortable time slot.',
      };
    }

    case 'walking':
    default: {
      const isGood = curPrecipProb < 25 && curTempC >= 12 && curTempC <= 28 && curWindKmh < 26 && (current.precipitation || 0) === 0;
      const isPoor = (current.precipitation || 0) > 0 || curPrecipProb >= 55 || curTempC >= 35 || curTempC <= 2;

      return {
        status: isPoor ? 'POOR CONDITIONS' : isGood ? 'GOOD CONDITIONS' : 'MODERATE CONDITIONS',
        suitability: isPoor ? 'Rain / Extreme Temp' : isGood ? 'Pleasant Walk' : 'Fair Conditions',
        score: isPoor ? 45 : isGood ? 95 : 74,
        bestWindows: ['08:30 – 11:00', '17:00 – 19:30'],
        factors: [
          { label: 'Temperature', value: toDispTemp(curTempC), detail: `Feels like ${toDispTemp(current.apparent_temperature ?? curTempC)}` },
          { label: 'Precipitation', value: `${curPrecipProb}%`, detail: rainDescriptor },
          { label: 'Wind', value: toDispWind(curWindKmh), detail: windDescriptor },
          { label: 'UV Index', value: `${curUv.toFixed(1)}`, detail: curUv >= 6 ? 'Shade advised' : 'Comfortable solar angle' },
        ],
        summary: isPoor
          ? 'Wet weather or uncomfortable temperatures make walking less pleasant at this hour.'
          : isGood
          ? 'Temperature and precipitation conditions are favorable for a comfortable walk.'
          : 'Acceptable conditions for a walk; dressing for the current breeze or warmth is helpful.',
      };
    }
  }
}
