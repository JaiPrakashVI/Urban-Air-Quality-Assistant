import { useState, useCallback } from 'react';
import { CityPreset, PollutantTelemetry, VulnerabilityProfile, RiskAssessment, IaqMitigationPlan } from '../types/aqi';

interface UseHealthReportParams {
  city: CityPreset;
  telemetry: PollutantTelemetry;
  persona: VulnerabilityProfile;
  riskAssessment: RiskAssessment;
  iaqPlan: IaqMitigationPlan;
}

interface UseHealthReportReturn {
  reportExported: boolean;
  exportHealthReport: () => void;
}

/**
 * Custom hook to generate and export personalized clinical health advisories.
 */
export function useHealthReport(params: UseHealthReportParams): UseHealthReportReturn {
  const [reportExported, setReportExported] = useState<boolean>(false);

  const exportHealthReport = useCallback(() => {
    const { city, telemetry, persona, riskAssessment, iaqPlan } = params;

    const reportText = `======================================================================
AEROSHIELD CLINICAL HEALTH & SMOG ADVISORY REPORT
======================================================================
Location: ${city.name} (${city.lat.toFixed(4)}°N, ${city.lon.toFixed(4)}°E)
Timestamp: ${new Date().toLocaleString()}
Atmospheric Source: ${telemetry.source === 'live_open_meteo' ? 'Open-Meteo European/US Atmospheric API (Live)' : 'Calibrated Historical CPCB Baseline'}

1. AMBIENT ATMOSPHERIC TELEMETRY:
   - AQI: ${telemetry.aqi} (${telemetry.category})
   - PM2.5 (Fine Soot): ${telemetry.pm25} µg/m³ [WHO 24h Guideline: 15 µg/m³ - ${(telemetry.pm25 / 15).toFixed(1)}x above guideline]
   - PM10 (Coarse Dust): ${telemetry.pm10} µg/m³
   - NO2 (Traffic Exhaust): ${telemetry.no2} µg/m³
   - SO2 (Industrial Emissions): ${telemetry.so2} µg/m³
   - Carbon Monoxide: ${telemetry.co} mg/m³
   - Surface Ozone: ${telemetry.o3} µg/m³
   - Ambient Temp: ${telemetry.temperature}°C | Relative Humidity: ${telemetry.humidity}% | Wind: ${telemetry.windSpeed} km/h

2. PERSONALIZED VULNERABILITY PROFILE:
   - Persona: ${persona.title}
   - Biological Sensitivity Multiplier: ${persona.baselineMultiplier}x
   - Calculated Health Vulnerability Index: ${riskAssessment.riskScore} / 100 (${riskAssessment.riskLevel} Risk)
   - Certified Protective Respirator: ${riskAssessment.maskRecommendation}
   ${persona.specialMedicationReminder ? `- Clinical Medication Protocol: ${persona.specialMedicationReminder}` : ''}

3. DIURNAL ROUTINE & ACTIVITY WINDOW:
   - Optimal Outdoor Window Today: ${iaqPlan.bestVentilationHour}
   - Rationale: Ground-level radiational inversion traps soot early morning (05:00-09:00 AM). Solar convective mixing dilutes surface particulate mid-day.

4. INDOOR AIR QUALITY (IAQ) MITIGATION:
   - Exterior Windows Status: ${iaqPlan.ventilationRecommendedNow ? 'OPEN SAFE FOR BRIEF FLUSH' : 'KEEP ALL WINDOWS SEALED'}
   - HEPA Air Purifier Operational Mode: ${iaqPlan.purifierMode}
   - Recommended Daily Runtime: ${iaqPlan.recommendedPurifierRuntimeHours} hours
   - Evidence-Based DIY Hacks:
     * Damp mopping over dry sweeping (prevents PM2.5 resuspension)
     * Weatherstripping exterior doors & window frame seals
     * NASA Clean-Air botanicals (Snake Plant, Areca Palm)

5. LOW-EMISSION TRANSIT IMPACT (15 km Commute):
   - Recommended Mode: Metro Rail / Filtered Electric Transit
   - CO2 Avoided vs Solo Driving: ~2.5 kg CO2
   - Inhaled PM2.5 Reduction vs Two-Wheeler: ~80% reduction

======================================================================
AeroShield Clean Air Intelligence • Winter Smog Mitigation Platform
Report Generated: ${new Date().toLocaleString()}
======================================================================`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AeroShield_Advisory_${city.name.replace(/\s+/g, '_')}_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setReportExported(true);
    setTimeout(() => setReportExported(false), 3000);
  }, [params]);

  return { reportExported, exportHealthReport };
}
