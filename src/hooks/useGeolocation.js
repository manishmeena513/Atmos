import { useState, useCallback } from 'react';
import { reverseGeocode } from '../api/openmeteo';
import { useWeatherStore } from '../store/weatherStore';

export function useGeolocation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const setLocation = useWeatherStore((s) => s.setLocation);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const locInfo = await reverseGeocode(latitude, longitude);
          setLocation({
            name: locInfo.name || 'Local Weather',
            country: locInfo.country || '',
            lat: latitude,
            lon: longitude,
          });
        } catch {
          setLocation({
            name: 'My Location',
            country: '',
            lat: latitude,
            lon: longitude,
          });
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setLoading(false);
        if (err.code === 1) {
          setError('Location permission denied');
        } else if (err.code === 2) {
          setError('Location position unavailable');
        } else {
          setError('Location request timed out');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  }, [setLocation]);

  return { requestLocation, loading, error };
}
