import { describe, it, expect } from 'vitest';
import { 
  categorizeAqi, 
  getAqiCategoryColor, 
  generateDiurnalForecast, 
  INDIAN_CITIES,
  fetchLiveAirQuality 
} from '../services/openMeteoApi';

describe('Open-Meteo & Atmospheric Telemetry Service', () => {
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
});
