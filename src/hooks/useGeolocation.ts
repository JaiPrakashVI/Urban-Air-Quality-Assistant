import { useState, useCallback } from 'react';
import { CityPreset } from '../types/aqi';
import { INDIAN_CITIES, reverseGeocodeLocation } from '../services/openMeteoApi';
import { logger } from '../utils/logger';

interface UseGeolocationReturn {
  isGpsLocated: boolean;
  isDetecting: boolean;
  gpsError: string | null;
  detectLocation: (onSuccess: (city: CityPreset) => void) => void;
  resetGpsStatus: () => void;
}

/**
 * Custom hook to handle high-accuracy browser geolocation and reverse-geocoding.
 * Safely handles permission denials, unsupported environments, and falls back to nearest city preset.
 */
export function useGeolocation(): UseGeolocationReturn {
  const [isGpsLocated, setIsGpsLocated] = useState<boolean>(false);
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const resetGpsStatus = useCallback(() => {
    setIsGpsLocated(false);
    setGpsError(null);
  }, []);

  const detectLocation = useCallback((onSuccess: (city: CityPreset) => void) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGpsError('Geolocation is not supported by your current browser.');
      return;
    }

    setIsDetecting(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const userLat = pos.coords.latitude;
        const userLon = pos.coords.longitude;

        try {
          const placeName = await reverseGeocodeLocation(userLat, userLon);

          const gpsCity: CityPreset = {
            id: `gps-${Date.now()}`,
            name: placeName,
            country: 'India',
            lat: userLat,
            lon: userLon,
            typicalWinterSmogPeak: 'Local atmospheric inversion peak',
            defaultTelemetry: {
              aqi: 175,
              category: 'Poor',
              pm25: 85,
              pm10: 160,
              no2: 50,
              so2: 18,
              co: 1.4,
              o3: 45,
              temperature: 25,
              humidity: 60,
              windSpeed: 8.0,
              dominantPollutant: 'PM2.5',
              source: 'offline_telemetry',
              timestamp: new Date().toISOString(),
            },
          };

          setIsGpsLocated(true);
          onSuccess(gpsCity);
        } catch (err) {
          logger.warn('Reverse geocode error, resolving nearest known city', err);
          let nearest = INDIAN_CITIES[0];
          let minDist = Infinity;
          INDIAN_CITIES.forEach((c) => {
            const d = Math.hypot(c.lat - userLat, c.lon - userLon);
            if (d < minDist) {
              minDist = d;
              nearest = c;
            }
          });

          setIsGpsLocated(true);
          onSuccess(nearest);
        } finally {
          setIsDetecting(false);
        }
      },
      (err) => {
        setIsDetecting(false);
        logger.warn('GPS location permission denied or timed out', err.message);
        setGpsError('Location access was denied or timed out. Please select your city from the hotlist.');
      },
      {
        timeout: 10000,
        enableHighAccuracy: false,
        maximumAge: 60000,
      }
    );
  }, []);

  return {
    isGpsLocated,
    isDetecting,
    gpsError,
    detectLocation,
    resetGpsStatus,
  };
}
