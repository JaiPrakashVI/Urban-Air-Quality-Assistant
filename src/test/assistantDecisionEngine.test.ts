import { describe, it, expect } from 'vitest';
import { generateContextualDecision } from '../engines/assistantDecisionEngine';
import { PERSONA_PROFILES } from '../engines/vulnerabilityEngine';
import { PollutantTelemetry } from '../types/aqi';

describe('Assistant Contextual Decision Engine', () => {
  const severeDelhiTelemetry: PollutantTelemetry = {
    aqi: 390,
    category: 'Severe',
    pm25: 310,
    pm10: 440,
    no2: 95,
    so2: 35,
    co: 3.2,
    o3: 42,
    temperature: 15,
    humidity: 82,
    windSpeed: 3.5,
    dominantPollutant: 'PM2.5',
    source: 'offline_telemetry',
    timestamp: new Date().toISOString(),
  };

  it('generates personalized refusal and indoor alternatives for child outdoor play in severe smog', () => {
    const res = generateContextualDecision(
      'Can my 6-year-old child play outside this evening?',
      severeDelhiTelemetry,
      PERSONA_PROFILES.infant_parent,
      'Delhi (NCR)'
    );

    expect(res.text).toContain('allow children to play outdoors');
    expect(res.text.toLowerCase()).toContain('developing lung tissue');
    expect(res.suggestedActions?.length).toBeGreaterThan(0);
    expect(res.riskBadge?.level).toBe('Critical');
  });

  it('warns senior citizens against 6 AM morning walks citing thermal inversion', () => {
    const res = generateContextualDecision(
      'Is my 6:00 AM morning walk safe today?',
      severeDelhiTelemetry,
      PERSONA_PROFILES.elderly,
      'Delhi (NCR)'
    );

    expect(res.text).toContain('thermal inversion');
    expect(res.text).toContain('blood pressure');
    expect(res.text).toContain('1:00 PM');
  });

  it('recommends Metro transit and explains HEPA filtration over road transport', () => {
    const res = generateContextualDecision(
      'How should I commute 15km to my office today?',
      severeDelhiTelemetry,
      PERSONA_PROFILES.commuter,
      'Delhi (NCR)'
    );

    expect(res.text).toContain('Metro');
    expect(res.text).toContain('HEPA');
    expect(res.text).toContain('CO2');
  });

  it('advises on window ventilation and purifier settings accurately', () => {
    const res = generateContextualDecision(
      'Should I open my windows and how long should I run the purifier?',
      severeDelhiTelemetry,
      PERSONA_PROFILES.healthy_adult,
      'Delhi (NCR)'
    );

    expect(res.text).toContain('purifier');
    expect(res.text).toContain('Damp Mopping');
  });
});
