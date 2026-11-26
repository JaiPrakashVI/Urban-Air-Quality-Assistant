import { CityPreset, PollutantTelemetry, AqiCategory, HourlyForecast } from '../types/aqi';
import { logger } from '../utils/logger';
import { AtmosphericApiError } from '../utils/errors';

// --- Telemetry & Geocoding Caching Layer (High-Efficiency Deduplication & TTL) ---
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const TELEMETRY_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const GEOCODING_CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

const telemetryCache = new Map<string, CacheEntry<PollutantTelemetry>>();
const inFlightTelemetryRequests = new Map<string, Promise<PollutantTelemetry>>();
const geocodingCache = new Map<string, CacheEntry<CityPreset[]>>();
const reverseGeocodeCache = new Map<string, CacheEntry<string>>();

/**
 * Clear internal in-memory caches (useful for manual refresh or testing).
 */
export function clearTelemetryCache(): void {
  telemetryCache.clear();
  inFlightTelemetryRequests.clear();
  geocodingCache.clear();
  reverseGeocodeCache.clear();
}


// Re-exported city presets (decoupled into src/data/cities.ts for clean separation of concerns)
export { INDIAN_CITIES } from '../data/cities';

export function categorizeAqi(aqi: number): AqiCategory {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 200) return 'Poor';
  if (aqi <= 300) return 'Unhealthy';
  if (aqi <= 400) return 'Severe';
  return 'Hazardous';
}

export function getAqiCategoryColor(category: AqiCategory): {
  bg: string;
  text: string;
  border: string;
  hex: string;
} {
  switch (category) {
    case 'Good':
      return { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30', hex: '#10B981' };
    case 'Moderate':
      return { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30', hex: '#F59E0B' };
    case 'Poor':
      return { bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/30', hex: '#F97316' };
    case 'Unhealthy':
      return { bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/30', hex: '#EF4444' };
    case 'Severe':
      return { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/30', hex: '#A855F7' };
    case 'Hazardous':
      return { bg: 'bg-red-950/40', text: 'text-rose-300', border: 'border-red-600/40', hex: '#881337' };
  }
}

/**
 * Fetch live atmospheric telemetry from Open-Meteo Air Quality & Weather API
 * Implements high-efficiency in-memory caching and request deduplication.
 * Falls back safely to calibrated city baseline if offline or rate-limited.
 */
export async function fetchLiveAirQuality(city: CityPreset, forceRefresh: boolean = false): Promise<PollutantTelemetry> {
  const cacheKey = `${city.lat.toFixed(4)}_${city.lon.toFixed(4)}`;

  if (!forceRefresh) {
    const cached = telemetryCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }
    const pending = inFlightTelemetryRequests.get(cacheKey);
    if (pending) {
      return pending;
    }
  }

  const fetchPromise = (async () => {
    const airQualityUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${city.lat}&longitude=${city.lon}&current=european_aqi,us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone`;
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m`;

    try {
      const [aqiRes, weatherRes] = await Promise.all([
        fetch(airQualityUrl, { signal: AbortSignal.timeout(6000) }),
        fetch(weatherUrl, { signal: AbortSignal.timeout(6000) })
      ]);

      if (!aqiRes.ok || !weatherRes.ok) {
        throw new AtmosphericApiError(`API status: AQI=${aqiRes.status}, Weather=${weatherRes.status}`, aqiRes.status);
      }

      const aqiData = await aqiRes.json();
      const weatherData = await weatherRes.json();

      const currentAqi = aqiData.current || {};
      const currentWeather = weatherData.current || {};

      const calculatedAqi = Math.round(currentAqi.us_aqi || currentAqi.european_aqi || city.defaultTelemetry.aqi);
      const pm25 = Math.round(currentAqi.pm2_5 ?? city.defaultTelemetry.pm25);
      const pm10 = Math.round(currentAqi.pm10 ?? city.defaultTelemetry.pm10);
      const no2 = Math.round(currentAqi.nitrogen_dioxide ?? city.defaultTelemetry.no2);
      const so2 = Math.round(currentAqi.sulphur_dioxide ?? city.defaultTelemetry.so2);
      const co = Number(((currentAqi.carbon_monoxide ?? 1200) / 1000).toFixed(1));
      const o3 = Math.round(currentAqi.ozone ?? city.defaultTelemetry.o3);

      const temp = Math.round(currentWeather.temperature_2m ?? city.defaultTelemetry.temperature);
      const humidity = Math.round(currentWeather.relative_humidity_2m ?? city.defaultTelemetry.humidity);
      const windSpeed = Number((currentWeather.wind_speed_10m ?? city.defaultTelemetry.windSpeed).toFixed(1));

      let dominant = 'PM2.5';
      if (pm10 > pm25 * 2.5) dominant = 'PM10 (Coarse Dust)';
      else if (no2 > 75) dominant = 'NO2 (Traffic Exhaust)';
      else if (o3 > 115) dominant = 'Ozone (Photochemical Smog)';

      const telemetry: PollutantTelemetry = {
        aqi: calculatedAqi,
        category: categorizeAqi(calculatedAqi),
        pm25,
        pm10,
        no2,
        so2,
        co,
        o3,
        temperature: temp,
        humidity,
        windSpeed,
        dominantPollutant: dominant,
        source: 'live_open_meteo',
        timestamp: new Date().toISOString(),
      };

      telemetryCache.set(cacheKey, {
        data: telemetry,
        expiresAt: Date.now() + TELEMETRY_CACHE_TTL_MS,
      });

      return telemetry;
    } catch (error) {
      logger.warn(`Live fetch failed for ${city.name}, using calibrated baseline`, error);
      return {
        ...city.defaultTelemetry,
        timestamp: new Date().toISOString(),
        source: 'offline_telemetry' as const,
      };
    } finally {
      inFlightTelemetryRequests.delete(cacheKey);
    }
  })();

  inFlightTelemetryRequests.set(cacheKey, fetchPromise);
  return fetchPromise;
}

interface OpenMeteoGeocodingRawItem {
  id?: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
}

/**
 * Live Open-Meteo Geocoding: Search ANY Indian city, town, or district by name
 * Uses 30-minute in-memory caching to prevent duplicate lookups.
 */
export async function searchCitiesGeocoding(query: string): Promise<CityPreset[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const cacheKey = trimmed.toLowerCase();
  const cached = geocodingCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmed)}&count=6&language=en&format=json`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return [];
    const data = await res.json();
    const results: OpenMeteoGeocodingRawItem[] = data.results || [];

    const mapped: CityPreset[] = results.map((r, idx) => {
      const state = r.admin1 ? ` (${r.admin1})` : '';
      return {
        id: `custom-${r.id || idx}-${Date.now()}`,
        name: `${r.name}${state}`,
        country: r.country || 'India',
        lat: r.latitude,
        lon: r.longitude,
        typicalWinterSmogPeak: 'Morning and evening commuter peaks',
        defaultTelemetry: {
          aqi: 160,
          category: 'Poor',
          pm25: 75,
          pm10: 150,
          no2: 45,
          so2: 15,
          co: 1.2,
          o3: 45,
          temperature: 24,
          humidity: 60,
          windSpeed: 8.0,
          dominantPollutant: 'PM2.5',
          source: 'offline_telemetry',
          timestamp: new Date().toISOString(),
        }
      };
    });

    geocodingCache.set(cacheKey, {
      data: mapped,
      expiresAt: Date.now() + GEOCODING_CACHE_TTL_MS,
    });

    return mapped;
  } catch (err) {
    logger.warn('Geocoding search failed', err);
    return [];
  }
}

/**
 * Reverse-geocode latitude and longitude into human-readable city/district
 * Cached for 30 minutes to reduce redundant geolocating queries.
 */
export async function reverseGeocodeLocation(lat: number, lon: number): Promise<string> {
  const cacheKey = `${lat.toFixed(3)}_${lon.toFixed(3)}`;
  const cached = reverseGeocodeCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const data = await res.json();
      const city = data.city || data.locality || data.principalSubdivision;
      if (city) {
        reverseGeocodeCache.set(cacheKey, {
          data: city,
          expiresAt: Date.now() + GEOCODING_CACHE_TTL_MS,
        });
        return city;
      }
    }
  } catch (err) {
    logger.warn('Reverse geocode lookup failed', err);
  }
  return `GPS (${lat.toFixed(2)}, ${lon.toFixed(2)})`;
}

/**
 * Generate 24-hour diurnal forecast based on solar inversion mechanics
 */
export function generateDiurnalForecast(baseAqi: number): HourlyForecast[] {
  const hours: HourlyForecast[] = [];
  const currentHour = new Date().getHours();

  for (let i = 0; i < 24; i++) {
    const hour = (currentHour + i) % 24;
    
    let diurnalMultiplier = 1.0;
    if (hour >= 4 && hour <= 8) {
      diurnalMultiplier = 1.32;
    } else if (hour >= 9 && hour <= 11) {
      diurnalMultiplier = 1.05;
    } else if (hour >= 12 && hour <= 16) {
      diurnalMultiplier = 0.68;
    } else if (hour >= 17 && hour <= 18) {
      diurnalMultiplier = 0.95;
    } else if (hour >= 19 && hour <= 23) {
      diurnalMultiplier = 1.22;
    } else {
      diurnalMultiplier = 1.15;
    }

    const estimatedAqi = Math.max(25, Math.round(baseAqi * diurnalMultiplier));
    const estimatedPm25 = Math.round(estimatedAqi * 0.72);
    const category = categorizeAqi(estimatedAqi);

    const outdoorSafe = estimatedAqi <= 150;
    const ventilationSafe = estimatedAqi <= 180 && (hour >= 12 && hour <= 16);

    let recommendation = 'Air quality stable.';
    if (hour >= 5 && hour <= 9) {
      recommendation = 'Smog trapped in thermal inversion. Keep windows sealed.';
    } else if (hour >= 12 && hour <= 16) {
      recommendation = 'Solar convective mixing window. Best time for brief indoor air exchange.';
    } else if (hour >= 18 && hour <= 21) {
      recommendation = 'Evening vehicular rush & cool air trapping pollutants. Stay indoors.';
    }

    const formattedTime = `${hour.toString().padStart(2, '0')}:00`;

    hours.push({
      time: formattedTime,
      hour,
      aqi: estimatedAqi,
      pm25: estimatedPm25,
      category,
      ventilationSafe,
      outdoorSafe,
      recommendation,
    });
  }

  return hours;
}
