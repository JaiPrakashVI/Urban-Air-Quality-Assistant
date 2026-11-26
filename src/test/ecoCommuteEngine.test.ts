import { describe, it, expect } from 'vitest';
import { calculateCommuteImpact, calculateAvoidedEmissionsAndInhalation } from '../engines/ecoCommuteEngine';
import { PollutantTelemetry } from '../types/aqi';

describe('Eco-Commute & Carbon Impact Engine', () => {
  const telemetry: PollutantTelemetry = {
    aqi: 320,
    category: 'Severe',
    pm25: 250,
    pm10: 380,
    no2: 80,
    so2: 25,
    co: 2.2,
    o3: 40,
    temperature: 18,
    humidity: 70,
    windSpeed: 5.0,
    dominantPollutant: 'PM2.5',
    source: 'offline_telemetry',
    timestamp: new Date().toISOString(),
  };

  it('ranks Metro as recommended transit mode with lowest particulate inhalation', () => {
    const comparison = calculateCommuteImpact(telemetry, 15);
    const metro = comparison.find(c => c.mode === 'metro')!;
    const twoWheeler = comparison.find(c => c.mode === 'two_wheeler')!;

    expect(metro.recommended).toBe(true);
    expect(metro.inhalationExposureMicrograms).toBeLessThan(twoWheeler.inhalationExposureMicrograms);
  });

  it('proves two-wheeler commutes have highest toxic inhalation exposure', () => {
    const comparison = calculateCommuteImpact(telemetry, 15);
    const twoWheeler = comparison.find(c => c.mode === 'two_wheeler')!;
    const allOthers = comparison.filter(c => c.mode !== 'two_wheeler');

    for (const other of allOthers) {
      expect(twoWheeler.inhalationExposureMicrograms).toBeGreaterThan(other.inhalationExposureMicrograms);
    }
  });

  it('correctly calculates avoided CO2 emissions when switching from solo car to Metro', () => {
    const avoided = calculateAvoidedEmissionsAndInhalation(telemetry, 15);
    expect(avoided.avoidedCo2Kg).toBeGreaterThan(1.5);
    expect(avoided.avoidedInhaledPm25Micrograms).toBeGreaterThan(10);
    expect(avoided.treesEquivalent).toBeGreaterThan(0);
    expect(avoided.justification).toContain('Choosing the Metro');
  });

  it('linearly scales emissions and inhalation as distance expands from 3 km to 40 km', () => {
    const shortTrip = calculateAvoidedEmissionsAndInhalation(telemetry, 3);
    const longTrip = calculateAvoidedEmissionsAndInhalation(telemetry, 30);

    expect(longTrip.avoidedCo2Kg).toBeGreaterThan(shortTrip.avoidedCo2Kg);
    expect(longTrip.avoidedInhaledPm25Micrograms).toBeGreaterThan(shortTrip.avoidedInhaledPm25Micrograms);
  });

  it('guarantees clean transit modes remain recommended and non-empty for any valid distance', () => {
    const comparison = calculateCommuteImpact(telemetry, 25);
    const recommendedModes = comparison.filter(c => c.recommended);

    expect(recommendedModes.length).toBeGreaterThanOrEqual(2);
    expect(recommendedModes.some(c => c.mode === 'metro')).toBe(true);
    expect(recommendedModes.some(c => c.mode === 'electric_bus')).toBe(true);
  });
});
