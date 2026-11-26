import { useState, useEffect, useCallback, useMemo } from 'react';
import { CityPreset, PollutantTelemetry, HourlyForecast } from '../types/aqi';
import { INDIAN_CITIES, fetchLiveAirQuality, generateDiurnalForecast } from '../services/openMeteoApi';

interface UseAirQualityReturn {
  selectedCity: CityPreset;
  telemetry: PollutantTelemetry;
  forecasts: HourlyForecast[];
  isLoading: boolean;
  selectCity: (city: CityPreset) => void;
  selectCityById: (cityId: string) => boolean;
  refreshTelemetry: () => Promise<void>;
  setCustomCityTelemetry: (city: CityPreset, telemetry: PollutantTelemetry) => void;
}

/**
 * Custom hook to manage active city telemetry and diurnal forecasts.
 * Leverages in-memory caching and request deduplication in openMeteoApi.
 */
export function useAirQuality(initialCity: CityPreset = INDIAN_CITIES[0]): UseAirQualityReturn {
  const [selectedCity, setSelectedCity] = useState<CityPreset>(initialCity);
  const [telemetry, setTelemetry] = useState<PollutantTelemetry>(initialCity.defaultTelemetry);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Compute 24-hour diurnal forecast via memoization to avoid recalculating on unneeded renders
  const forecasts = useMemo(() => {
    return generateDiurnalForecast(telemetry.aqi);
  }, [telemetry.aqi]);

  const loadTelemetry = useCallback(async (city: CityPreset, forceRefresh: boolean = false) => {
    setIsLoading(true);
    try {
      const data = await fetchLiveAirQuality(city, forceRefresh);
      setTelemetry(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch telemetry whenever selectedCity changes
  useEffect(() => {
    let isSubscribed = true;
    (async () => {
      setIsLoading(true);
      try {
        const data = await fetchLiveAirQuality(selectedCity, false);
        if (isSubscribed) {
          setTelemetry(data);
        }
      } finally {
        if (isSubscribed) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      isSubscribed = false;
    };
  }, [selectedCity]);

  const selectCity = useCallback((city: CityPreset) => {
    setSelectedCity(city);
  }, []);

  const selectCityById = useCallback((cityId: string): boolean => {
    const city = INDIAN_CITIES.find((c) => c.id === cityId);
    if (city) {
      setSelectedCity(city);
      return true;
    }
    return false;
  }, []);

  const refreshTelemetry = useCallback(async () => {
    await loadTelemetry(selectedCity, true);
  }, [loadTelemetry, selectedCity]);

  const setCustomCityTelemetry = useCallback((city: CityPreset, customTelemetry: PollutantTelemetry) => {
    setSelectedCity(city);
    setTelemetry(customTelemetry);
  }, []);

  return {
    selectedCity,
    telemetry,
    forecasts,
    isLoading,
    selectCity,
    selectCityById,
    refreshTelemetry,
    setCustomCityTelemetry,
  };
}
