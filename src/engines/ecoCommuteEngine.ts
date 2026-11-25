import { CommuteComparison, PollutantTelemetry } from '../types/aqi';

export function calculateCommuteImpact(
  telemetry: PollutantTelemetry,
  distanceKm: number = 15
): CommuteComparison[] {
  const ambientPm25 = telemetry.pm25; // µg/m³
  
  // Normal resting/light walking ventilation: ~12 L/min = 0.72 m³/hour
  // Average travel time per mode for distanceKm
  
  const modes: CommuteComparison[] = [
    {
      mode: 'metro',
      label: 'Metro Rail (High-Capacity Filtered Transit)',
      // Metro air systems filter out ~80% of outdoor PM2.5; travel speed ~35 km/h
      // Travel time: ~26 mins = 0.43 hr -> Air inhaled: 0.31 m³ -> Inhaled PM2.5 = 0.31 * (ambientPm25 * 0.20)
      inhalationExposureMicrograms: Math.round(0.31 * (ambientPm25 * 0.20) * 10) / 10,
      co2EmissionsKg: Math.round(distanceKm * 0.014 * 100) / 100, // 14g CO2/passenger-km
      recommended: true,
      notes: 'HEPA-conditioned cabins remove 80%+ of roadside fine soot. Zero street-level tailpipe emissions.'
    },
    {
      mode: 'electric_bus',
      label: 'Electric Bus (Public EV Transit)',
      // Air filter efficiency ~55%; speed ~20 km/h -> travel time: 45 mins = 0.75 hr
      inhalationExposureMicrograms: Math.round(0.54 * (ambientPm25 * 0.45) * 10) / 10,
      co2EmissionsKg: Math.round(distanceKm * 0.025 * 100) / 100, // 25g CO2/passenger-km
      recommended: true,
      notes: 'Clean propulsion; closed AC coaches isolate passengers from immediate tailpipe plumes.'
    },
    {
      mode: 'carpool',
      label: 'Carpooling (3+ Passengers in EV/CNG Car)',
      // AC recirculate cabin filter ~65% efficiency; speed ~22 km/h -> time: 40 mins = 0.67 hr
      inhalationExposureMicrograms: Math.round(0.48 * (ambientPm25 * 0.35) * 10) / 10,
      co2EmissionsKg: Math.round((distanceKm * 0.160 / 3) * 100) / 100, // Shared across 3 people
      recommended: true,
      notes: 'Reduces per-person carbon emissions by 66% while maintaining enclosed cabin filtration.'
    },
    {
      mode: 'diesel_bus',
      label: 'Standard City Bus (CNG/Diesel)',
      // Semi-open windows; filter efficiency ~20%; speed ~18 km/h -> time: 50 mins = 0.83 hr
      inhalationExposureMicrograms: Math.round(0.60 * (ambientPm25 * 0.80) * 10) / 10,
      co2EmissionsKg: Math.round(distanceKm * 0.065 * 100) / 100,
      recommended: false,
      notes: 'Mass transit efficiency is good, but frequent door openings draw in roadside exhaust; N95 mask required.'
    },
    {
      mode: 'solo_car',
      label: 'Solo Passenger Car (Single Occupancy ICE)',
      // Enclosed cabin AC in recirculate mode protects passenger (~65% filter), BUT worst emissions
      inhalationExposureMicrograms: Math.round(0.48 * (ambientPm25 * 0.35) * 10) / 10,
      co2EmissionsKg: Math.round(distanceKm * 0.185 * 100) / 100, // 185g CO2/km
      recommended: false,
      notes: 'Heaviest carbon burden (~2.8 kg CO2). Directly compounds urban traffic gridlock and evening smog trapping.'
    },
    {
      mode: 'two_wheeler',
      label: 'Two-Wheeler (Motorcycle / Scooter / Auto)',
      // Completely exposed to breathing zone at tailpipe height! Physical effort increases ventilation to ~18 L/min
      // Travel time: 35 mins = 0.58 hr -> Inhaled volume: 0.63 m³ -> 100% of ambient + localized exhaust spike (+25%)
      inhalationExposureMicrograms: Math.round(0.63 * (ambientPm25 * 1.25) * 10) / 10,
      co2EmissionsKg: Math.round(distanceKm * 0.075 * 100) / 100,
      recommended: false,
      notes: 'HAZARDOUS IN HIGH AQI: Commuter sits directly in the hot exhaust plume of diesel trucks and buses with zero physical barrier.'
    }
  ];

  return modes;
}

export function calculateAvoidedEmissionsAndInhalation(
  telemetry: PollutantTelemetry,
  distanceKm: number = 15
): {
  avoidedCo2Kg: number;
  avoidedInhaledPm25Micrograms: number;
  treesEquivalent: number;
  justification: string;
} {
  const comparison = calculateCommuteImpact(telemetry, distanceKm);
  const soloCar = comparison.find(m => m.mode === 'solo_car')!;
  const metro = comparison.find(m => m.mode === 'metro')!;

  const avoidedCo2Kg = Math.max(0, Number((soloCar.co2EmissionsKg - metro.co2EmissionsKg).toFixed(2)));
  const avoidedInhaledPm25Micrograms = Math.max(0, Number((comparison.find(m => m.mode === 'two_wheeler')!.inhalationExposureMicrograms - metro.inhalationExposureMicrograms).toFixed(1)));
  const treesEquivalent = Number((avoidedCo2Kg / 0.06).toFixed(1)); // Approx daily carbon absorption of 1 mature tree

  return {
    avoidedCo2Kg,
    avoidedInhaledPm25Micrograms,
    treesEquivalent,
    justification: `Choosing the Metro instead of a solo car for your ${distanceKm} km commute prevents ${avoidedCo2Kg} kg of CO2 from entering your city's atmosphere, and cuts deep-lung PM2.5 inhalation by ${avoidedInhaledPm25Micrograms} µg compared to a two-wheeler.`
  };
}
