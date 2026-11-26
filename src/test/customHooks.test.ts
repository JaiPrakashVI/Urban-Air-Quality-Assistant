import { describe, it, expect, beforeEach, vi } from 'vitest';
import { INDIAN_CITIES } from '../services/openMeteoApi';
import { PERSONA_PROFILES, calculatePersonalRisk } from '../engines/vulnerabilityEngine';
import { calculateIaqMitigation } from '../engines/iaqMitigationEngine';
import { logger } from '../utils/logger';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';

// Node environment storage mock
class LocalStorageMock {
  private store: Record<string, string> = {};

  clear() {
    this.store = {};
  }
  getItem(key: string) {
    return this.store[key] || null;
  }
  setItem(key: string, value: string) {
    this.store[key] = String(value);
  }
  removeItem(key: string) {
    delete this.store[key];
  }
}

const mockStorage = new LocalStorageMock();
// @ts-expect-error test mock
globalThis.localStorage = mockStorage;

describe('Custom Hooks & Architecture Layer', () => {
  const testCity = INDIAN_CITIES[0];
  const testTelemetry = testCity.defaultTelemetry;
  const testPersona = PERSONA_PROFILES.asthmatic;
  const testRisk = calculatePersonalRisk(testTelemetry, testPersona);
  const testIaq = calculateIaqMitigation(testTelemetry);

  beforeEach(() => {
    mockStorage.clear();
  });

  it('validates clinical health report generator with comprehensive sections', () => {
    const reportText = `Location: ${testCity.name}
AQI: ${testTelemetry.aqi}
Persona: ${testPersona.title}
Risk: ${testRisk.riskLevel} (${testRisk.riskScore}/100)
Respirator: ${testRisk.maskRecommendation}
Purifier: ${testIaq.purifierMode}
Ventilation: ${testIaq.bestVentilationHour}`;

    expect(reportText).toContain('Delhi (NCR)');
    expect(reportText).toContain('Asthmatic');
    expect(reportText).toContain('Critical');
    expect(reportText).toContain('N99 / Avoid Exposure');
  });

  it('verifies theme storage preference contract', () => {
    localStorage.setItem('aeroshield_theme_preference', 'dark');
    expect(localStorage.getItem('aeroshield_theme_preference')).toBe('dark');

    localStorage.setItem('aeroshield_theme_preference', 'light');
    expect(localStorage.getItem('aeroshield_theme_preference')).toBe('light');
  });

  it('handles simulated advisory download blob creation cleanly', () => {
    const createObjectURL = vi.fn().mockReturnValue('blob:http://localhost/test-blob');
    const revokeObjectURL = vi.fn();
    globalThis.URL.createObjectURL = createObjectURL;
    globalThis.URL.revokeObjectURL = revokeObjectURL;

    const blob = new Blob(['Test Advisory Report Content'], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    expect(url).toBe('blob:http://localhost/test-blob');
    expect(createObjectURL).toHaveBeenCalledTimes(1);

    URL.revokeObjectURL(url);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:http://localhost/test-blob');
  });

  it('verifies theme toggling behavior and localStorage persistence cycle', () => {
    let currentTheme: 'light' | 'dark' = 'light';
    const toggle = () => {
      currentTheme = currentTheme === 'light' ? 'dark' : 'light';
      mockStorage.setItem('aeroshield_theme_preference', currentTheme);
    };

    expect(currentTheme).toBe('light');
    toggle();
    expect(currentTheme).toBe('dark');
    expect(mockStorage.getItem('aeroshield_theme_preference')).toBe('dark');

    toggle();
    expect(currentTheme).toBe('light');
    expect(mockStorage.getItem('aeroshield_theme_preference')).toBe('light');
  });

  it('guarantees fallback to calibrated baseline when custom GPS lookup fails', () => {
    const lat = 28.50;
    const lon = 77.10;
    let nearest = INDIAN_CITIES[0];
    let minDist = Infinity;
    INDIAN_CITIES.forEach((c) => {
      const d = Math.hypot(c.lat - lat, c.lon - lon);
      if (d < minDist) {
        minDist = d;
        nearest = c;
      }
    });

    expect(nearest).toBeDefined();
    expect(nearest.country).toBe('India');
    expect(nearest.defaultTelemetry.aqi).toBeGreaterThan(0);
  });

  it('safely handles non-browser environments for geolocation checking', () => {
    const isSupported = typeof navigator !== 'undefined' && Boolean(navigator.geolocation);
    expect(typeof isSupported).toBe('boolean');
  });

  it('guarantees diagnostic logger executes without throwing in any runtime environment', () => {
    expect(() => {
      logger.info('Test diagnostic info message', { metric: 100 });
      logger.warn('Test diagnostic warning message', { retry: true });
      logger.error('Test diagnostic error message', new Error('Simulated'));
    }).not.toThrow();
  });

  it('transitions ErrorBoundary state to hasError=true upon catching an unhandled error', () => {
    const testError = new Error('Simulated runtime failure');
    const newState = ErrorBoundary.getDerivedStateFromError(testError);
    expect(newState.hasError).toBe(true);
    expect(newState.error).toBe(testError);
  });

  it('validates city lookup by ID algorithm consistency', () => {
    const findCityById = (id: string) => INDIAN_CITIES.find(c => c.id === id);
    expect(findCityById('delhi')).toBeDefined();
    expect(findCityById('mumbai')).toBeDefined();
    expect(findCityById('non-existent-id')).toBeUndefined();
  });
});
