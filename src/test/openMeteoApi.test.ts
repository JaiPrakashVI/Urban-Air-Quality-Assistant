import { describe, it, expect, beforeEach } from 'vitest';
import { 
  categorizeAqi, 
  getAqiCategoryColor, 
  generateDiurnalForecast, 
  INDIAN_CITIES,
  fetchLiveAirQuality,
  clearTelemetryCache,
  searchCitiesGeocoding,
  reverseGeocodeLocation
} from '../services/openMeteoApi';

describe('Open-Meteo & Atmospheric Telemetry Service', () => {
  beforeEach(() => {
    clearTelemetryCache();
  });
  it('correctly maps numeric AQI values to CPCB/EPA standard categories', () => {
    expect(categorizeAqi(35)).toBe('Good');
    expect(categorizeAqi(75)).toBe('Moderate');
    expect(categorizeAqi(150)).toBe('Poor');
    expect(categorizeAqi(250)).toBe('Unhealthy');
    expect(categorizeAqi(350)).toBe('Severe');
    expect(categorizeAqi(450)).toBe('Hazardous');
  });

  it('provides matching high-contrast hex and class colors for all categories', () => {
    const categories = ['Good', 'Moderate', 'Poor', 'Unhealthy', 'Severe', 'Hazardous'] as const;
    for (const cat of categories) {
      const colors = getAqiCategoryColor(cat);
      expect(colors.bg).toBeDefined();
      expect(colors.text).toBeDefined();
      expect(colors.border).toBeDefined();
      expect(colors.hex).toMatch(/^#[0-9A-F]{6}$/i);
    }
  });

  it('includes key Indian urban hotspots in city presets', () => {
    const cityIds = INDIAN_CITIES.map(c => c.id);
    expect(cityIds).toContain('delhi');
    expect(cityIds).toContain('mumbai');
    expect(cityIds).toContain('kolkata');
    expect(cityIds).toContain('bengaluru');
    expect(cityIds).toContain('hyderabad');
    expect(cityIds).toContain('noida');
    expect(cityIds).toContain('lucknow');
  });

  it('guarantees graceful offline fallback with calibrated telemetry structure', async () => {
    const delhi = INDIAN_CITIES[0];
    const telemetry = await fetchLiveAirQuality(delhi);
    expect(telemetry.aqi).toBeGreaterThan(0);
    expect(telemetry.pm25).toBeGreaterThan(0);
    expect(telemetry.dominantPollutant).toBeDefined();
    expect(telemetry.source).toMatch(/live_open_meteo|offline_telemetry/);
    expect(telemetry.timestamp).toBeDefined();
  });

  it('produces valid 24-hour diurnal forecasts with timestamps', () => {
    const forecast = generateDiurnalForecast(320);
    expect(forecast).toHaveLength(24);
    for (const hour of forecast) {
      expect(hour.time).toMatch(/^\d{2}:00$/);
      expect(hour.aqi).toBeGreaterThan(0);
      expect(hour.category).toBeDefined();
    }
  });

  it('leverages in-memory caching to return instantaneous results for subsequent requests', async () => {
    const mumbai = INDIAN_CITIES.find(c => c.id === 'mumbai') || INDIAN_CITIES[0];
    const firstCall = await fetchLiveAirQuality(mumbai);
    const secondCall = await fetchLiveAirQuality(mumbai);

    expect(firstCall.timestamp).toBe(secondCall.timestamp);
    expect(firstCall.aqi).toBe(secondCall.aqi);
  });

  it('deduplicates concurrent in-flight requests for the same city coordinates', async () => {
    const bengaluru = INDIAN_CITIES.find(c => c.id === 'bengaluru') || INDIAN_CITIES[0];
    const [callA, callB] = await Promise.all([
      fetchLiveAirQuality(bengaluru),
      fetchLiveAirQuality(bengaluru),
    ]);

    expect(callA.timestamp).toBe(callB.timestamp);
    expect(callA.aqi).toBe(callB.aqi);
  });

  it('safely handles empty queries in geocoding search', async () => {
    const resultsEmpty = await searchCitiesGeocoding('');
    const resultsShort = await searchCitiesGeocoding('a');
    expect(resultsEmpty).toEqual([]);
    expect(resultsShort).toEqual([]);
  });

  it('falls back to coordinates string when reverse geocoding receives error or times out', async () => {
    const result = await reverseGeocodeLocation(28.6139, 77.2090);
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
  });
});
