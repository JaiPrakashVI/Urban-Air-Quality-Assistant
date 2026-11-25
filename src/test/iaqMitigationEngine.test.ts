import { describe, it, expect } from 'vitest';
import { calculateIaqMitigation } from '../engines/iaqMitigationEngine';
import { PollutantTelemetry } from '../types/aqi';

describe('Indoor Air Quality (IAQ) Mitigation Engine', () => {
  const severeTelemetry: PollutantTelemetry = {
    aqi: 385,
    category: 'Severe',
    pm25: 295,
    pm10: 420,
    no2: 88,
    so2: 30,
    co: 2.8,
    o3: 45,
    temperature: 16,
    humidity: 78,
    windSpeed: 4.0,
    dominantPollutant: 'PM2.5',
    source: 'offline_telemetry',
    timestamp: new Date().toISOString(),
  };

  const moderateTelemetry: PollutantTelemetry = {
    aqi: 90,
    category: 'Moderate',
    pm25: 32,
    pm10: 65,
    no2: 30,
    so2: 10,
    co: 0.8,
    o3: 35,
    temperature: 22,
    humidity: 55,
    windSpeed: 10.0,
    dominantPollutant: 'PM2.5',
    source: 'offline_telemetry',
    timestamp: new Date().toISOString(),
  };

  it('strictly prohibits opening windows during morning thermal inversion (07:00)', () => {
    const morningPlan = calculateIaqMitigation(severeTelemetry, 7);
    expect(morningPlan.ventilationRecommendedNow).toBe(false);
    expect(morningPlan.ventilationReason).toContain('Keep all exterior windows and balcony doors sealed');
  });

  it('permits brief window flushing in moderate air quality during solar midday (14:00)', () => {
    const middayPlan = calculateIaqMitigation(moderateTelemetry, 14);
    expect(middayPlan.ventilationRecommendedNow).toBe(true);
    expect(middayPlan.ventilationReason).toContain('Solar heating has dilated the atmospheric boundary layer');
  });

  it('scales air purifier to Turbo mode and 24h continuous runtime for severe smog', () => {
    const plan = calculateIaqMitigation(severeTelemetry);
    expect(plan.purifierMode).toBe('Turbo / Max');
    expect(plan.recommendedPurifierRuntimeHours).toBe(24);
  });

  it('includes evidence-based DIY hacks (NASA clean air plants, damp mopping)', () => {
    const plan = calculateIaqMitigation(severeTelemetry);
    expect(plan.diyActionTips.some(t => t.includes('Damp Mop'))).toBe(true);
    expect(plan.diyActionTips.some(t => t.includes('NASA Clean Air'))).toBe(true);
  });
});
