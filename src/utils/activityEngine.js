/**
 * Activity Mode Recommendation Engine
 * Analyzes hourly forecasts to compute suitability and recommended time windows.
 */

export const ACTIVITIES = [
  { id: 'walking', name: 'Walking', icon: 'Footprints' },
  { id: 'running', name: 'Running', icon: 'Flame' },
  { id: 'cycling', name: 'Cycling', icon: 'Bike' },
  { id: 'photography', name: 'Photography', icon: 'Camera' },
  { id: 'sports', name: 'Outdoor Sports', icon: 'Trophy' },
  { id: 'driving', name: 'Driving', icon: 'Car' },
  { id: 'travel', name: 'Travel & Sightseeing', icon: 'Plane' },
];

export function analyzeActivity(activityId, weatherData) {
  if (!weatherData?.hourly) {
    return {
      suitability: 'Moderate',
      score: 70,
      bestWindows: ['Afternoon'],
      factors: [],
      summary: 'Awaiting forecast calculation...',
    };
  }

  const { hourly, daily } = weatherData;
  const currentHour = new Date().getHours();

  // Extract upcoming 24 hours
  const hours = hourly.time ? hourly.time.slice(0, 24) : [];
  const temps = hourly.temperature_2m || [];
  const precips = hourly.precipitation_probability || [];
  const winds = hourly.wind_speed_10m || [];
  const uvs = hourly.uv_index || [];
  const visibilities = hourly.visibility || [];

  const sunrise = daily?.sunrise?.[0] ? new Date(daily.sunrise[0]) : null;
  const sunset = daily?.sunset?.[0] ? new Date(daily.sunset[0]) : null;

  switch (activityId) {
    case 'photography': {
      // Best around golden hours (1hr after sunrise, 1hr before sunset)
      const goldenMorning = sunrise
        ? `${String(sunrise.getHours()).padStart(2, '0')}:${String(sunrise.getMinutes()).padStart(2, '0')} – ${String(sunrise.getHours() + 1).padStart(2, '0')}:00`
        : '06:30 – 07:45';
      const goldenEvening = sunset
        ? `${String(sunset.getHours() - 1).padStart(2, '0')}:00 – ${String(sunset.getHours()).padStart(2, '0')}:${String(sunset.getMinutes()).padStart(2, '0')}`
        : '17:30 – 18:45';

      const avgVis = visibilities.slice(0, 12).reduce((a, b) => a + b, 0) / (visibilities.length || 1);
      const isCloudy = hourly.cloud_cover ? hourly.cloud_cover[currentHour] > 40 : true;

      return {
        suitability: isCloudy ? 'Dramatic Skies' : 'High Clarity',
        score: avgVis > 8000 ? 92 : 75,
        bestWindows: [goldenMorning, goldenEvening],
        factors: [
          { label: 'Golden Hour (Dawn)', value: goldenMorning, detail: 'Warm diffused sidelight' },
          { label: 'Golden Hour (Dusk)', value: goldenEvening, detail: 'Long shadows & deep hues' },
          { label: 'Cloud Cover', value: `${hourly.cloud_cover?.[currentHour] || 35}%`, detail: 'Soft natural diffuser' },
          { label: 'Avg Visibility', value: `${Math.round(avgVis / 1000)} km`, detail: 'Horizon definition' },
        ],
        summary: 'Optimal lighting occurs around golden hours. Atmospheric clouds will enhance sky contrast without direct glare.',
      };
    }

    case 'running': {
      // Best when temp is 10-18C, wind < 20, precip < 20%
      const candidateHours = [];
      for (let i = 0; i < 24; i++) {
        const t = temps[i] ?? 18;
        const p = precips[i] ?? 0;
        const w = winds[i] ?? 10;
        if (p < 25 && t >= 8 && t <= 21 && w < 28) {
          candidateHours.push(i);
        }
      }

      const windowStr = candidateHours.length > 0
        ? `${String(candidateHours[0]).padStart(2, '0')}:00 – ${String(Math.min(candidateHours[0] + 3, 23)).padStart(2, '0')}:00`
        : 'Early Morning';

      const currentTemp = temps[currentHour] || 15;
      const currentWind = winds[currentHour] || 12;

      return {
        suitability: currentTemp > 24 ? 'Challenging (Warm)' : currentTemp < 6 ? 'Crisp (Cool)' : 'Excellent',
        score: currentTemp >= 10 && currentTemp <= 19 ? 90 : 70,
        bestWindows: [windowStr, '20:00 – 22:00'],
        factors: [
          { label: 'Ideal Running Temp', value: `${Math.round(currentTemp)}°C`, detail: 'Optimal metabolic pacing' },
          { label: 'Wind Resistance', value: `${Math.round(currentWind)} km/h`, detail: currentWind > 20 ? 'Moderate headwind' : 'Light breeze' },
          { label: 'Precipitation Risk', value: `${precips[currentHour] || 0}%`, detail: 'Surface traction' },
          { label: 'UV Index Peak', value: `${Math.round(daily?.uv_index_max?.[0] || 4)}`, detail: 'Midday sun intensity' },
        ],
        summary: 'Early hours provide the coolest temperatures and lowest wind resistance for cardio stamina.',
      };
    }

    case 'cycling': {
      const windSpeed = winds[currentHour] || 12;
      const precipProb = precips[currentHour] || 0;
      return {
        suitability: windSpeed > 30 ? 'High Resistance' : precipProb > 40 ? 'Wet Roads' : 'Prime',
        score: windSpeed < 20 && precipProb < 20 ? 94 : 68,
        bestWindows: ['08:00 – 11:00', '16:00 – 18:30'],
        factors: [
          { label: 'Sustained Wind', value: `${Math.round(windSpeed)} km/h`, detail: 'Aerodynamic resistance' },
          { label: 'Road Wetness Risk', value: `${precipProb}%`, detail: 'Braking distance consideration' },
          { label: 'Ambient Temperature', value: `${Math.round(temps[currentHour] || 17)}°C`, detail: 'Thermal comfort' },
          { label: 'Visibility', value: `${Math.round((visibilities[currentHour] || 10000) / 1000)} km`, detail: 'Lane awareness' },
        ],
        summary: 'Clear line of sight with moderate winds. Choose early morning routes before crosswinds pick up.',
      };
    }

    case 'driving': {
      const vis = visibilities[currentHour] || 10000;
      const rain = precips[currentHour] || 0;
      const windSpeed = winds[currentHour] || 12;
      return {
        suitability: vis < 2000 || rain > 50 ? 'Cautious' : 'Smooth',
        score: vis > 5000 && rain < 30 ? 95 : 70,
        bestWindows: ['Throughout the day', 'Avoid rush-hour storms'],
        factors: [
          { label: 'Sight Distance', value: `${Math.round(vis / 1000)} km`, detail: vis < 3000 ? 'Reduced visibility' : 'Clear highway' },
          { label: 'Hydroplaning Risk', value: rain > 50 ? 'Elevated' : 'Minimal', detail: `${rain}% precipitation probability` },
          { label: 'Crosswind Gusts', value: `${Math.round(windSpeed)} km/h`, detail: 'Vehicle stability' },
        ],
        summary: 'Highway conditions remain stable. Maintain standard following distances and monitor sudden downpours.',
      };
    }

    case 'walking':
    default: {
      const t = temps[currentHour] || 18;
      const p = precips[currentHour] || 0;
      const uv = uvs[currentHour] || 2;
      return {
        suitability: p > 40 ? 'Damp' : t < 5 ? 'Chilly' : 'Delightful',
        score: p < 20 && t >= 14 && t <= 24 ? 96 : 74,
        bestWindows: ['09:00 – 11:30', '16:30 – 19:00'],
        factors: [
          { label: 'Comfort Temp', value: `${Math.round(t)}°C`, detail: 'Brisk, pleasant air' },
          { label: 'Chance of Rain', value: `${p}%`, detail: p > 30 ? 'Pack light umbrella' : 'Dry path' },
          { label: 'UV Factor', value: `${Math.round(uv)}`, detail: uv > 5 ? 'Sun protection advised' : 'Gentle solar angle' },
        ],
        summary: 'Great conditions for an outdoor stroll or brisk walk. Ambient air temperatures remain well within comfort thresholds.',
      };
    }
  }
}
