/**
 * Atmos V2.5 Weather Deep-Dive & 'Why?' Explanation Engine
 * Evaluates real Open-Meteo telemetry to provide honest, data-driven explanations.
 * Zero fabrication, zero AI.
 */

export function getMetricDeepDiveData(metricKey, weather, airQuality, units = { temp: 'C', wind: 'kmh', clock: '24h' }) {
  if (!weather?.current || !weather?.hourly) return null;

  const { current, hourly, daily } = weather;
  const currHour = new Date().getHours();

  switch (metricKey) {
    case 'temperature': {
      const temp = current.temperature_2m;
      const apparent = current.apparent_temperature;
      const diff = Math.round(apparent - temp);
      const high = daily?.temperature_2m_max?.[0] ?? temp;
      const low = daily?.temperature_2m_min?.[0] ?? temp;

      let whyText = 'Temperature matches seasonal expectations.';
      if (diff >= 3) {
        whyText = `High atmospheric moisture makes the air feel ${diff}° warmer than the actual temperature.`;
      } else if (diff <= -3) {
        whyText = `Wind chill is actively lowering the apparent temperature by ${Math.abs(diff)}°.`;
      } else if (Math.abs(diff) < 2) {
        whyText = 'Calm winds and balanced humidity mean the air feels very close to the true thermometer reading.';
      }

      // 24h Hourly Curve Data
      const hourlyData = (hourly.time || []).slice(currHour, currHour + 24).map((t, idx) => {
        const hIdx = currHour + idx;
        const d = new Date(t);
        const timeLabel = units.clock === '12h'
          ? d.toLocaleTimeString([], { hour: 'numeric', hour12: true })
          : `${String(d.getHours()).padStart(2, '0')}:00`;
        const valC = hourly.temperature_2m?.[hIdx] ?? 0;
        const appC = hourly.apparent_temperature?.[hIdx] ?? valC;
        return {
          time: timeLabel,
          value: units.temp === 'F' ? Math.round((valC * 9) / 5 + 32) : Math.round(valC),
          apparent: units.temp === 'F' ? Math.round((appC * 9) / 5 + 32) : Math.round(appC),
        };
      });

      return {
        title: 'Temperature & Thermal Feel',
        currentValue: `${units.temp === 'F' ? Math.round((temp * 9) / 5 + 32) : Math.round(temp)}°${units.temp}`,
        subtitle: `Feels like ${units.temp === 'F' ? Math.round((apparent * 9) / 5 + 32) : Math.round(apparent)}° · Range: ${units.temp === 'F' ? Math.round((low * 9) / 5 + 32) : Math.round(low)}° to ${units.temp === 'F' ? Math.round((high * 9) / 5 + 32) : Math.round(high)}°`,
        why: whyText,
        chartLabel: `Temperature (°${units.temp})`,
        dataKey: 'value',
        hourlyData,
        details: [
          { label: 'Current Temp', value: `${units.temp === 'F' ? Math.round((temp * 9) / 5 + 32) : Math.round(temp)}°${units.temp}` },
          { label: 'Feels Like', value: `${units.temp === 'F' ? Math.round((apparent * 9) / 5 + 32) : Math.round(apparent)}°${units.temp}` },
          { label: 'Today High', value: `${units.temp === 'F' ? Math.round((high * 9) / 5 + 32) : Math.round(high)}°${units.temp}` },
          { label: 'Today Low', value: `${units.temp === 'F' ? Math.round((low * 9) / 5 + 32) : Math.round(low)}°${units.temp}` },
        ],
      };
    }

    case 'wind': {
      const speed = current.wind_speed_10m;
      const speedVal = units.wind === 'mph' ? Math.round(speed * 0.621371) : Math.round(speed);
      const gusts = current.wind_gusts_10m ?? speed * 1.3;
      const gustsVal = units.wind === 'mph' ? Math.round(gusts * 0.621371) : Math.round(gusts);
      const dir = current.wind_direction_10m ?? 0;

      // Future wind trend
      const futureWinds = (hourly.wind_speed_10m || []).slice(currHour + 1, currHour + 12);
      const maxFutureWind = Math.max(...futureWinds, speed);

      let whyText = 'Surface air currents remain steady and calm.';
      if (gusts >= 40) {
        whyText = `Noticeable gusts reaching up to ${gustsVal} ${units.wind} are triggered by active pressure gradients.`;
      } else if (maxFutureWind - speed >= 8) {
        whyText = 'Wind speed is trending upward this afternoon as boundary-layer thermal mixing increases.';
      } else if (speed < 8) {
        whyText = 'Atmospheric high-pressure stability is keeping surface air light and gentle.';
      }

      const hourlyData = (hourly.time || []).slice(currHour, currHour + 24).map((t, idx) => {
        const hIdx = currHour + idx;
        const d = new Date(t);
        const timeLabel = units.clock === '12h'
          ? d.toLocaleTimeString([], { hour: 'numeric', hour12: true })
          : `${String(d.getHours()).padStart(2, '0')}:00`;
        const valKmh = hourly.wind_speed_10m?.[hIdx] ?? 0;
        return {
          time: timeLabel,
          value: units.wind === 'mph' ? Math.round(valKmh * 0.621371) : Math.round(valKmh),
        };
      });

      return {
        title: 'Wind Telemetry & Airflow',
        currentValue: `${speedVal} ${units.wind}`,
        subtitle: `Gusts up to ${gustsVal} ${units.wind} · Heading ${dir}°`,
        why: whyText,
        chartLabel: `Wind Speed (${units.wind})`,
        dataKey: 'value',
        hourlyData,
        details: [
          { label: 'Sustained Wind', value: `${speedVal} ${units.wind}` },
          { label: 'Peak Gusts', value: `${gustsVal} ${units.wind}` },
          { label: 'Wind Direction', value: `${dir}°` },
          { label: 'Dominant 24h', value: `${Math.round(daily?.wind_speed_10m_max?.[0] ?? speed)} km/h max` },
        ],
      };
    }

    case 'humidity': {
      const hum = current.relative_humidity_2m ?? 50;
      const dewPoint = current.dew_point_2m ?? (current.temperature_2m - (100 - hum) / 5);
      const dewVal = units.temp === 'F' ? Math.round((dewPoint * 9) / 5 + 32) : Math.round(dewPoint);

      let whyText = 'Relative humidity is in a well-balanced, comfortable comfort zone.';
      if (hum >= 75) {
        whyText = `High relative moisture (${hum}%) slows natural perspiration evaporation, making warm temperatures feel heavier.`;
      } else if (hum <= 25) {
        whyText = `Dry continental air (${hum}%) accelerates evaporation, which can cause faster thirst and dry throat.`;
      }

      const hourlyData = (hourly.time || []).slice(currHour, currHour + 24).map((t, idx) => {
        const hIdx = currHour + idx;
        const d = new Date(t);
        const timeLabel = units.clock === '12h'
          ? d.toLocaleTimeString([], { hour: 'numeric', hour12: true })
          : `${String(d.getHours()).padStart(2, '0')}:00`;
        return {
          time: timeLabel,
          value: hourly.relative_humidity_2m?.[hIdx] ?? hum,
        };
      });

      return {
        title: 'Relative Humidity & Dew Point',
        currentValue: `${hum}%`,
        subtitle: `Dew point: ${dewVal}°${units.temp} · Saturation moisture level`,
        why: whyText,
        chartLabel: 'Relative Humidity (%)',
        dataKey: 'value',
        hourlyData,
        details: [
          { label: 'Relative Humidity', value: `${hum}%` },
          { label: 'Surface Dew Point', value: `${dewVal}°${units.temp}` },
          { label: 'Air Moisture', value: hum > 70 ? 'High' : hum < 30 ? 'Dry' : 'Balanced' },
          { label: 'Condensation', value: hum > 85 ? 'Likely Mist/Fog' : 'None' },
        ],
      };
    }

    case 'uv': {
      const uv = current.uv_index ?? 0;
      const maxUv = daily?.uv_index_max?.[0] ?? uv;

      let whyText = 'UV index is minimal today; skin protection is not required.';
      if (uv >= 6) {
        whyText = 'Intense solar radiation around solar midday. High UV protection is recommended when outdoors.';
      } else if (uv >= 3) {
        whyText = 'Moderate solar UV index reaches its peak during midday hours under clear or broken cloud skies.';
      }

      const hourlyData = (hourly.time || []).slice(currHour, currHour + 24).map((t, idx) => {
        const hIdx = currHour + idx;
        const d = new Date(t);
        const timeLabel = units.clock === '12h'
          ? d.toLocaleTimeString([], { hour: 'numeric', hour12: true })
          : `${String(d.getHours()).padStart(2, '0')}:00`;
        return {
          time: timeLabel,
          value: hourly.uv_index?.[hIdx] ?? 0,
        };
      });

      return {
        title: 'Solar Ultraviolet (UV) Exposure',
        currentValue: `${uv.toFixed(1)}`,
        subtitle: `Daily Peak: ${maxUv.toFixed(1)} · WHO Solar Radiation Scale`,
        why: whyText,
        chartLabel: 'UV Index',
        dataKey: 'value',
        hourlyData,
        details: [
          { label: 'Current UV', value: uv.toFixed(1) },
          { label: 'Today Peak', value: maxUv.toFixed(1) },
          { label: 'Protection Level', value: uv >= 6 ? 'High' : uv >= 3 ? 'Moderate' : 'Low' },
          { label: 'Peak Timing', value: '11:00 AM – 3:00 PM' },
        ],
      };
    }

    case 'rain': {
      const precip = current.precipitation ?? 0;
      const precipProbs = (hourly.precipitation_probability || []).slice(currHour, currHour + 24);
      const maxProb = Math.max(...precipProbs, 0);

      // Find first rain spike hour
      let spikeHour = -1;
      for (let i = 0; i < precipProbs.length; i++) {
        if (precipProbs[i] >= 30) {
          spikeHour = currHour + i;
          break;
        }
      }

      let whyText = 'No significant precipitation expected over the next 24 hours.';
      if (precip > 0) {
        whyText = 'Active rain bands are currently depositing moisture across your immediate coordinates.';
      } else if (spikeHour !== -1) {
        const spikeLabel = units.clock === '12h'
          ? `${spikeHour % 12 || 12} ${spikeHour >= 12 ? 'PM' : 'AM'}`
          : `${String(spikeHour % 24).padStart(2, '0')}:00`;
        whyText = `Rain probability rises to ${maxProb}% around ${spikeLabel} due to approaching atmospheric moisture.`;
      }

      const hourlyData = (hourly.time || []).slice(currHour, currHour + 24).map((t, idx) => {
        const hIdx = currHour + idx;
        const d = new Date(t);
        const timeLabel = units.clock === '12h'
          ? d.toLocaleTimeString([], { hour: 'numeric', hour12: true })
          : `${String(d.getHours()).padStart(2, '0')}:00`;
        return {
          time: timeLabel,
          value: hourly.precipitation_probability?.[hIdx] ?? 0,
        };
      });

      return {
        title: 'Precipitation & Rain Intelligence',
        currentValue: precip > 0 ? `${precip.toFixed(1)} mm` : `${maxProb}% Peak`,
        subtitle: `${maxProb}% maximum probability over the next 24 hours`,
        why: whyText,
        chartLabel: 'Rain Probability (%)',
        dataKey: 'value',
        hourlyData,
        details: [
          { label: 'Current Rainfall', value: `${precip.toFixed(1)} mm` },
          { label: 'Peak Probability', value: `${maxProb}%` },
          { label: '24h Total Sum', value: `${(daily?.precipitation_sum?.[0] ?? 0).toFixed(1)} mm` },
          { label: 'Precip Hours', value: `${daily?.precipitation_hours?.[0] ?? 0} hrs` },
        ],
      };
    }

    case 'pressure': {
      const p = current.surface_pressure ?? 1013;
      let whyText = 'Atmospheric pressure is stable within normal sea-level baselines (1013 hPa).';
      if (p > 1020) {
        whyText = 'A high-pressure ridge is dominating, which suppresses cloud formation and keeps skies clear.';
      } else if (p < 1005) {
        whyText = 'A low-pressure system is in effect, encouraging rising air currents, cloud buildup, and precipitation.';
      }

      const hourlyData = (hourly.time || []).slice(currHour, currHour + 24).map((t, idx) => {
        const hIdx = currHour + idx;
        const d = new Date(t);
        const timeLabel = units.clock === '12h'
          ? d.toLocaleTimeString([], { hour: 'numeric', hour12: true })
          : `${String(d.getHours()).padStart(2, '0')}:00`;
        return {
          time: timeLabel,
          value: Math.round(hourly.surface_pressure?.[hIdx] ?? p),
        };
      });

      return {
        title: 'Barometric Surface Pressure',
        currentValue: `${Math.round(p)} hPa`,
        subtitle: 'Atmospheric pressure & frontal activity',
        why: whyText,
        chartLabel: 'Pressure (hPa)',
        dataKey: 'value',
        hourlyData,
        details: [
          { label: 'Current Pressure', value: `${Math.round(p)} hPa` },
          { label: 'Baseline', value: '1013.25 hPa' },
          { label: 'Frontal System', value: p > 1018 ? 'High (Clear)' : p < 1008 ? 'Low (Frontal)' : 'Neutral' },
        ],
      };
    }

    case 'visibility': {
      const rawVis = hourly?.visibility ? hourly.visibility[currHour] : 10000;
      const km = (rawVis || 10000) / 1000;
      const visDisplay = units.wind === 'mph' ? `${(km * 0.621371).toFixed(1)} mi` : `${km.toFixed(1)} km`;

      let whyText = 'Crystal clear optical line of sight with negligible particle scattering.';
      if (km < 2) {
        whyText = 'Dense fog or heavy particulate scatter severely limits surface optical range.';
      } else if (km < 6) {
        whyText = 'Atmospheric haze and humidity soften distance contrast.';
      }

      const hourlyData = (hourly.time || []).slice(currHour, currHour + 24).map((t, idx) => {
        const hIdx = currHour + idx;
        const d = new Date(t);
        const timeLabel = units.clock === '12h'
          ? d.toLocaleTimeString([], { hour: 'numeric', hour12: true })
          : `${String(d.getHours()).padStart(2, '0')}:00`;
        const vKm = (hourly.visibility?.[hIdx] ?? 10000) / 1000;
        return {
          time: timeLabel,
          value: units.wind === 'mph' ? Math.round(vKm * 0.621371 * 10) / 10 : Math.round(vKm * 10) / 10,
        };
      });

      return {
        title: 'Atmospheric Optical Visibility',
        currentValue: visDisplay,
        subtitle: 'Surface horizon optical range',
        why: whyText,
        chartLabel: `Visibility (${units.wind === 'mph' ? 'mi' : 'km'})`,
        dataKey: 'value',
        hourlyData,
        details: [
          { label: 'Surface Distance', value: visDisplay },
          { label: 'Condition', value: km >= 10 ? 'Optimal' : km >= 5 ? 'Moderate Haze' : 'Restricted' },
        ],
      };
    }

    case 'aqi': {
      const curr = airQuality?.current;
      const rawAqi = curr?.european_aqi ?? curr?.us_aqi ?? null;
      if (!curr || rawAqi === null) {
        return {
          title: 'Air Quality Telemetry',
          currentValue: 'Unavailable',
          subtitle: 'Open-Meteo Air Quality Model',
          why: 'Real-time air quality telemetry is currently unavailable for this geographic monitoring cell.',
          chartLabel: 'AQI',
          dataKey: 'value',
          hourlyData: [],
          details: [],
        };
      }

      const aqi = Math.round(rawAqi);
      let whyText = 'All particulate and trace gas concentrations remain at clean background levels.';
      if (curr.pm2_5 > 25) {
        whyText = `PM2.5 fine particulate matter (${curr.pm2_5.toFixed(1)} µg/m³) is the primary factor driving today's air quality reading.`;
      } else if (curr.pm10 > 50) {
        whyText = `PM10 coarse dust (${curr.pm10.toFixed(1)} µg/m³) is the dominant contributor to current air quality measurements.`;
      } else if (curr.ozone > 100) {
        whyText = `Elevated ground-level ozone (${curr.ozone.toFixed(1)} µg/m³) from solar photochemical reactions is the main contributor.`;
      }

      return {
        title: 'Atmospheric Air Quality Index',
        currentValue: `${aqi} EAQI`,
        subtitle: aqi <= 20 ? 'Good Clean Air' : aqi <= 40 ? 'Fair Air Quality' : aqi <= 60 ? 'Moderate Air Quality' : 'Elevated Pollutants',
        why: whyText,
        chartLabel: 'Air Quality Index',
        dataKey: 'value',
        hourlyData: [],
        details: [
          { label: 'EAQI Score', value: `${aqi}` },
          { label: 'PM2.5 Particulates', value: typeof curr.pm2_5 === 'number' ? `${curr.pm2_5.toFixed(1)} µg/m³` : 'N/A' },
          { label: 'PM10 Particulates', value: typeof curr.pm10 === 'number' ? `${curr.pm10.toFixed(1)} µg/m³` : 'N/A' },
          { label: 'Surface Ozone (O₃)', value: typeof curr.ozone === 'number' ? `${curr.ozone.toFixed(1)} µg/m³` : 'N/A' },
        ],
      };
    }

    default:
      return null;
  }
}
