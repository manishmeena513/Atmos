/**
 * Atmospheric Weather Data Client
 * Communicates with /api serverless endpoints with direct Open-Meteo fallback
 * and client-side session caching.
 */

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

function getCached(key) {
  try {
    const raw = sessionStorage.getItem(`atmos_cache_${key}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.timestamp > CACHE_TTL_MS) {
      sessionStorage.removeItem(`atmos_cache_${key}`);
      return null;
    }
    return parsed.data;
  } catch {
    return null;
  }
}

function setCached(key, data) {
  try {
    sessionStorage.setItem(
      `atmos_cache_${key}`,
      JSON.stringify({ timestamp: Date.now(), data })
    );
  } catch (e) {
    console.warn('Session cache storage error:', e);
  }
}

export async function fetchWeather(lat, lon) {
  const cacheKey = `weather_${Number(lat).toFixed(3)}_${Number(lon).toFixed(3)}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const serverlessUrl = `/api/weather?lat=${lat}&lon=${lon}`;
  const directUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,surface_pressure,visibility,wind_speed_10m,wind_direction_10m,uv_index,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,daylight_duration,sunshine_duration,uv_index_max,precipitation_sum,precipitation_hours,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant&timezone=auto`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  let response;
  try {
    try {
      response = await fetch(serverlessUrl, { signal: controller.signal });
      if (!response.ok) throw new Error(`Serverless status ${response.status}`);
    } catch {
      response = await fetch(directUrl, { signal: controller.signal });
    }

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to load weather from Open-Meteo (${response.status})`);
    }

    const data = await response.json();
    setCached(cacheKey, data);
    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

export async function fetchAirQuality(lat, lon) {
  const cacheKey = `aq_${Number(lat).toFixed(3)}_${Number(lon).toFixed(3)}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const serverlessUrl = `/api/airquality?lat=${lat}&lon=${lon}`;
  const directUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=european_aqi,us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,dust&hourly=pm10,pm2_5,european_aqi&timezone=auto`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    let response;
    try {
      response = await fetch(serverlessUrl, { signal: controller.signal });
      if (!response.ok) throw new Error(`Serverless status ${response.status}`);
    } catch {
      response = await fetch(directUrl, { signal: controller.signal });
    }

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Air quality status ${response.status}`);
    }

    const data = await response.json();
    if (data.error || !data.current) {
      return { current: null, error: 'AQI_UNAVAILABLE' };
    }
    setCached(cacheKey, data);
    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn('Open-Meteo Air Quality telemetry unavailable:', err.message);
    return { current: null, error: 'AQI_UNAVAILABLE' };
  }
}

export async function searchGeocode(query, count = 8) {
  if (!query || query.trim().length < 2) return [];

  const trimmed = query.trim();
  const serverlessUrl = `/api/geocode?q=${encodeURIComponent(trimmed)}&count=${count}`;
  const directUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmed)}&count=${count}&language=en&format=json`;

  let response;
  try {
    response = await fetch(serverlessUrl);
    if (!response.ok) throw new Error(`Serverless geocode error`);
  } catch (err) {
    response = await fetch(directUrl);
  }

  if (!response.ok) return [];

  const data = await response.json();
  return (data.results || []).map((item) => ({
    id: `${item.id || item.name}-${item.latitude}-${item.longitude}`,
    name: item.name,
    country: item.country,
    countryCode: item.country_code,
    admin1: item.admin1,
    lat: item.latitude,
    lon: item.longitude,
    timezone: item.timezone,
    elevation: item.elevation,
  }));
}

export async function reverseGeocode(lat, lon) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'AtmosWeatherApp/1.0.1',
      },
    });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error('Reverse geocode failed');
    const data = await res.json();
    const addr = data?.address || {};
    const city =
      addr.city ||
      addr.town ||
      addr.village ||
      addr.municipality ||
      addr.county ||
      addr.state ||
      `${Number(lat).toFixed(2)}°, ${Number(lon).toFixed(2)}°`;
    const country = addr.country || '';
    return { name: city, country, lat, lon };
  } catch (err) {
    clearTimeout(timeoutId);
    return { name: `${Number(lat).toFixed(2)}°, ${Number(lon).toFixed(2)}°`, country: '', lat, lon };
  }
}

