import { describe, it, expect } from 'vitest';
import { calculateSafeActivityWindows } from '../engines/activityPlannerEngine';
import { generateDiurnalForecast } from '../services/openMeteoApi';
import { PERSONA_PROFILES } from '../engines/vulnerabilityEngine';

describe('Activity Planner & Diurnal Smog Engine', () => {
  const forecasts = generateDiurnalForecast(350);

  it('safely handles empty or uninitialized forecasts without throwing', () => {
    const emptyResult = calculateSafeActivityWindows(
      [],
      PERSONA_PROFILES.asthmatic,
      'morning_walk'
    );
    expect(emptyResult.bestWindow).toBeDefined();
    expect(emptyResult.hours).toEqual([]);
    expect(emptyResult.safeForCurrentPersona).toBe(true);
  });

  it('generates a 24-hour diurnal forecast with atmospheric boundary layer physics', () => {
    expect(forecasts).toHaveLength(24);

    const morningHours = forecasts.filter(f => f.hour >= 5 && f.hour <= 8);
    const middayHours = forecasts.filter(f => f.hour >= 13 && f.hour <= 15);

    if (morningHours.length > 0 && middayHours.length > 0) {
      expect(morningHours[0].aqi).toBeGreaterThan(middayHours[0].aqi);
    }
  });

  it('computes optimal outdoor activity window during solar convective mixing', () => {
    const windowResult = calculateSafeActivityWindows(
      forecasts,
      PERSONA_PROFILES.asthmatic,
      'morning_walk'
    );

    expect(windowResult.bestWindow).toBeDefined();
    expect(windowResult.rationale).toContain('inversion');
    expect(windowResult.rationale).toContain('solar');
  });

  it('provides tailored rationale for parents regarding school commute', () => {
    const windowResult = calculateSafeActivityWindows(
      forecasts,
      PERSONA_PROFILES.infant_parent,
      'school_commute'
    );

    expect(windowResult.rationale).toContain('School morning drop-off');
    expect(windowResult.rationale).toContain('N95');
  });

  it('advises runners against outdoor workouts during extreme inversion', () => {
    const windowResult = calculateSafeActivityWindows(
      forecasts,
      PERSONA_PROFILES.outdoor_athlete,
      'outdoor_workout'
    );

    expect(windowResult.rationale).toContain('minute ventilation');
  });
});
