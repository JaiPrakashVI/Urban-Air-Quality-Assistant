import { PollutantTelemetry, IaqMitigationPlan } from '../types/aqi';

/**
 * Derives indoor air quality (IAQ) mitigation protocols based on atmospheric boundary physics,
 * ambient PM2.5 concentrations, and building envelope infiltration mechanics.
 *
 * @param telemetry Real-time atmospheric pollutant and meteorological observations
 * @param currentHour Local solar hour (0-23, defaults to local system hour)
 * @returns IaqMitigationPlan with ventilation safety, HEPA purifier mode, and evidence-based actions
 */
export function calculateIaqMitigation(
  telemetry: PollutantTelemetry,
  currentHour: number = new Date().getHours()
): IaqMitigationPlan {
  const outdoorAqi = telemetry.aqi;
  const pm25 = telemetry.pm25;

  // Atmospheric physics:
  // Is it safe to ventilate right now?
  // Solar convective mixing occurs between 12:00 (noon) and 16:00 (4 PM)
  // Stagnant inversion layer holds smog tight during 20:00 - 09:00
  const isSolarConvectiveWindow = currentHour >= 12 && currentHour <= 16;
  const isOutdoorManageable = outdoorAqi < 200;

  const ventilationRecommendedNow = isSolarConvectiveWindow && isOutdoorManageable;

  let ventilationReason = '';
  if (ventilationRecommendedNow) {
    ventilationReason = `Solar heating has dilated the atmospheric boundary layer, reducing surface particulate density. Open opposite windows for a brisk 15-20 minute cross-ventilation flush now to remove stale indoor CO2 and VOC buildup.`;
  } else if (isSolarConvectiveWindow && outdoorAqi >= 200) {
    ventilationReason = `Even during afternoon solar mixing, outdoor PM2.5 (${pm25} µg/m³) is too hazardous for open windows. Rely on indoor mechanical filtration with periodic cracked-door exhaust ventilation.`;
  } else {
    ventilationReason = `Keep all exterior windows and balcony doors sealed. Surface cold air has formed a thermal inversion ceiling that traps vehicular and industrial toxins at ground level.`;
  }

  // Purifier mode determination
  let purifierMode: IaqMitigationPlan['purifierMode'] = 'Off';
  let recommendedPurifierRuntimeHours = 0;

  if (outdoorAqi > 300) {
    purifierMode = 'Turbo / Max';
    recommendedPurifierRuntimeHours = 24; // Continuous during severe smog
  } else if (outdoorAqi > 200) {
    purifierMode = 'Medium';
    recommendedPurifierRuntimeHours = 18;
  } else if (outdoorAqi > 100) {
    purifierMode = 'Auto / Low';
    recommendedPurifierRuntimeHours = 10;
  } else {
    purifierMode = 'Auto / Low';
    recommendedPurifierRuntimeHours = 4;
  }

  const diyActionTips: string[] = [
    'Damp Mop Instead of Dry Sweeping: Dry brooms kick settled fine PM2.5 and PM10 particles back into your breathing zone. Wet microfiber mopping permanently traps settled soot.',
    'NASA Clean Air Botanical Defense: Deploy Sansevieria (Snake Plant / Mother-in-law\'s Tongue) in bedrooms for nocturnal oxygen release, and Areca Palms in living spaces for natural formaldehyde and particulate absorption.',
    'Exhaust Kitchen Infiltration: Frying with cooking oils generates localized PM2.5 spikes exceeding 450 µg/m³. Always run high-efficiency chimney/exhaust hoods and isolate kitchen doors while cooking.',
    'Door & Window Weatherstrip Seals: Apply self-adhesive foam strips or roll damp towels along door bottoms and slider tracks to cut passive smog infiltration by up to 60%.',
    'Exhaust Fan Backdraft Prevention: When purifiers run, make sure bathroom exhaust vents without one-way dampers are shut, preventing them from drawing polluted outdoor air through wall cavities.'
  ];

  return {
    ventilationRecommendedNow,
    ventilationReason,
    bestVentilationHour: '01:00 PM - 03:30 PM (Peak Solar Mixing)',
    purifierMode,
    recommendedPurifierRuntimeHours,
    diyActionTips,
  };
}
