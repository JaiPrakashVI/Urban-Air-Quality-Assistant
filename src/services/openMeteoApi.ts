import { CityPreset, PollutantTelemetry, AqiCategory, HourlyForecast } from '../types/aqi';

export const INDIAN_CITIES: CityPreset[] = [
  {
    id: 'delhi',
    name: 'Delhi (NCR)',
    country: 'India',
    lat: 28.6139,
    lon: 77.2090,
    typicalWinterSmogPeak: 'Early morning (05:00 - 09:00) & Night (20:00 - 23:00)',
    defaultTelemetry: {
      aqi: 384,
      category: 'Severe',
      pm25: 285,
      pm10: 410,
      no2: 88,
      so2: 32,
      co: 2.8,
      o3: 45,
      temperature: 17,
      humidity: 78,
      windSpeed: 4.2,
      dominantPollutant: 'PM2.5 (Fine Particulate Matter)',
      source: 'offline_telemetry',
      timestamp: new Date().toISOString(),
    }
  },
  {
    id: 'noida',
    name: 'Noida (Uttar Pradesh)',
    country: 'India',
    lat: 28.5355,
    lon: 77.3910,
    typicalWinterSmogPeak: 'Early morning (06:00 - 09:30)',
    defaultTelemetry: {
      aqi: 395,
      category: 'Severe',
      pm25: 298,
      pm10: 430,
      no2: 92,
      so2: 35,
      co: 3.1,
      o3: 42,
      temperature: 16.5,
      humidity: 80,
      windSpeed: 3.8,
      dominantPollutant: 'PM2.5',
      source: 'offline_telemetry',
      timestamp: new Date().toISOString(),
    }
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    country: 'India',
    lat: 19.0760,
    lon: 72.8777,
    typicalWinterSmogPeak: 'Morning coastal haze (07:00 - 10:00)',
    defaultTelemetry: {
      aqi: 182,
      category: 'Poor',
      pm25: 98,
      pm10: 175,
      no2: 54,
      so2: 18,
      co: 1.4,
      o3: 62,
      temperature: 28,
      humidity: 65,
      windSpeed: 11.5,
      dominantPollutant: 'PM10 & Ozone',
      source: 'offline_telemetry',
      timestamp: new Date().toISOString(),
    }
  },
  {
    id: 'kolkata',
    name: 'Kolkata',
    country: 'India',
    lat: 22.5726,
    lon: 88.3639,
    typicalWinterSmogPeak: 'Evening & Night inversion (18:00 - 22:00)',
    defaultTelemetry: {
      aqi: 268,
      category: 'Unhealthy',
      pm25: 164,
      pm10: 245,
      no2: 66,
      so2: 24,
      co: 1.9,
      o3: 50,
      temperature: 22,
      humidity: 74,
      windSpeed: 6.2,
      dominantPollutant: 'PM2.5',
      source: 'offline_telemetry',
      timestamp: new Date().toISOString(),
    }
  },
  {
    id: 'bengaluru',
    name: 'Bengaluru',
    country: 'India',
    lat: 12.9716,
    lon: 77.5946,
    typicalWinterSmogPeak: 'Traffic peak hours (08:30 - 10:30 & 18:00 - 20:30)',
    defaultTelemetry: {
      aqi: 88,
      category: 'Moderate',
      pm25: 32,
      pm10: 68,
      no2: 42,
      so2: 12,
      co: 0.9,
      o3: 40,
      temperature: 23,
      humidity: 58,
      windSpeed: 14.0,
      dominantPollutant: 'NO2 (Traffic emissions)',
      source: 'offline_telemetry',
      timestamp: new Date().toISOString(),
    }
  },
  {
    id: 'hyderabad',
    name: 'Hyderabad',
    country: 'India',
    lat: 17.3850,
    lon: 78.4867,
    typicalWinterSmogPeak: 'Morning rush (08:00 - 10:00)',
    defaultTelemetry: {
      aqi: 135,
      category: 'Poor',
      pm25: 58,
      pm10: 120,
      no2: 48,
      so2: 16,
      co: 1.2,
      o3: 46,
      temperature: 25,
      humidity: 52,
      windSpeed: 9.8,
      dominantPollutant: 'PM2.5',
      source: 'offline_telemetry',
      timestamp: new Date().toISOString(),
    }
  },
  {
    id: 'pune',
    name: 'Pune',
    country: 'India',
    lat: 18.5204,
    lon: 73.8567,
    typicalWinterSmogPeak: 'Early morning valley smog (06:30 - 09:00)',
    defaultTelemetry: {
      aqi: 148,
      category: 'Poor',
      pm25: 64,
      pm10: 135,
      no2: 45,
      so2: 14,
      co: 1.1,
      o3: 55,
      temperature: 24,
      humidity: 56,
      windSpeed: 8.5,
      dominantPollutant: 'PM2.5',
      source: 'offline_telemetry',
      timestamp: new Date().toISOString(),
    }
  },
  {
    id: 'lucknow',
    name: 'Lucknow',
    country: 'India',
    lat: 26.8467,
    lon: 80.9462,
    typicalWinterSmogPeak: 'Night thermal inversion (19:00 - 23:00)',
    defaultTelemetry: {
      aqi: 342,
      category: 'Severe',
      pm25: 240,
      pm10: 360,
      no2: 78,
      so2: 28,
      co: 2.4,
      o3: 38,
      temperature: 18,
      humidity: 76,
      windSpeed: 4.0,
      dominantPollutant: 'PM2.5 & PM10',
      source: 'offline_telemetry',
      timestamp: new Date().toISOString(),
    }
  }
];

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
 * Fetch live telemetry from Open-Meteo Air Quality & Weather API
 * Falls back safely to city defaults if network is unavailable.
 */
export async function fetchLiveAirQuality(city: CityPreset): Promise<PollutantTelemetry> {
  const airQualityUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${city.lat}&longitude=${city.lon}&current=european_aqi,us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone`;
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m`;

  try {
    const [aqiRes, weatherRes] = await Promise.all([
      fetch(airQualityUrl, { signal: AbortSignal.timeout(5000) }),
      fetch(weatherUrl, { signal: AbortSignal.timeout(5000) })
    ]);

    if (!aqiRes.ok || !weatherRes.ok) {
      throw new Error(`API response status: AQI=${aqiRes.status}, Weather=${weatherRes.status}`);
    }

    const aqiData = await aqiRes.json();
    const weatherData = await weatherRes.json();

    const currentAqi = aqiData.current || {};
    const currentWeather = weatherData.current || {};

    // Open-Meteo provides US AQI or European AQI. In Indian context (CPCB), US AQI standard is most equivalent.
    const calculatedAqi = Math.round(currentAqi.us_aqi || currentAqi.european_aqi || city.defaultTelemetry.aqi);
    const pm25 = Math.round(currentAqi.pm2_5 ?? city.defaultTelemetry.pm25);
    const pm10 = Math.round(currentAqi.pm10 ?? city.defaultTelemetry.pm10);
    const no2 = Math.round(currentAqi.nitrogen_dioxide ?? city.defaultTelemetry.no2);
    const so2 = Math.round(currentAqi.sulphur_dioxide ?? city.defaultTelemetry.so2);
    const co = Number(((currentAqi.carbon_monoxide ?? 1200) / 1000).toFixed(1)); // Convert µg/m³ to mg/m³
    const o3 = Math.round(currentAqi.ozone ?? city.defaultTelemetry.o3);

    const temp = Math.round(currentWeather.temperature_2m ?? city.defaultTelemetry.temperature);
    const humidity = Math.round(currentWeather.relative_humidity_2m ?? city.defaultTelemetry.humidity);
    const windSpeed = Number((currentWeather.wind_speed_10m ?? city.defaultTelemetry.windSpeed).toFixed(1));

    let dominant = 'PM2.5';
    if (pm10 > pm25 * 2.5) dominant = 'PM10 (Coarse Dust)';
    else if (no2 > 80) dominant = 'NO2 (Traffic Exhaust)';
    else if (o3 > 120) dominant = 'Ozone (Photochemical Smog)';

    return {
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
  } catch (error) {
    console.warn(`[OpenMeteo] Live fetch failed for ${city.name}, using calibrated seasonal telemetry. Reason:`, error);
    return {
      ...city.defaultTelemetry,
      timestamp: new Date().toISOString(),
      source: 'offline_telemetry',
    };
  }
}

/**
 * Generate 24-hour diurnal forecast based on solar inversion mechanics
 */
export function generateDiurnalForecast(baseAqi: number): HourlyForecast[] {
  const hours: HourlyForecast[] = [];
  const currentHour = new Date().getHours();

  for (let i = 0; i < 24; i++) {
    const hour = (currentHour + i) % 24;
    
    // Atmospheric Boundary Layer Physics:
    // Thermal inversion layer traps pollutants lowest during 04:00 - 08:30 (peak factor 1.35)
    // Solar insolation causes convective mixing between 12:00 - 15:30 (minimum factor 0.65)
    // Evening traffic + radiation cooling builds smog again between 19:00 - 22:30 (factor 1.20)
    let diurnalMultiplier = 1.0;
    if (hour >= 4 && hour <= 8) {
      diurnalMultiplier = 1.32;
    } else if (hour >= 9 && hour <= 11) {
      diurnalMultiplier = 1.05;
    } else if (hour >= 12 && hour <= 16) {
      diurnalMultiplier = 0.68; // Best dispersion window!
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
      recommendation = 'Solar mixing window. Best time for brief indoor air exchange.';
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
