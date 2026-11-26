import { CommuteComparison, PollutantTelemetry } from '../types/aqi';

// Physiological respiratory ventilation volumes (m³/hour)
export const BREATHING_RATES_M3_HR = {
  resting: 0.72,  // ~12 L/min baseline sedentary breathing volume
  exertion: 1.08, // ~18 L/min active outdoor driving / physical exertion
} as const;

// Typical Indian urban commuter speeds (km/h) accounting for corridor congestion
export const TRANSIT_SPEEDS_KMH = {
  metro: 35,
  electric_bus: 20,
  carpool: 22,
  diesel_bus: 18,
  solo_car: 25,
  two_wheeler: 25,
} as const;

// Fine particulate penetration coefficients through cabin/vehicle filters (0.0 = total filtration, 1.0 = ambient)
export const PM25_PENETRATION_COEFFICIENTS = {
  metro: 0.20,       // 80% filtration efficiency via industrial HVAC
  electric_bus: 0.45,// 55% filtration in modern AC EV bus coaches
  carpool: 0.35,     // 65% filtration in passenger car AC recirculation
  diesel_bus: 0.80,  // Semi-open windows with high passenger ingress
  solo_car: 0.35,    // 65% filtration in passenger car AC recirculation
  two_wheeler: 1.25, // Unshielded breathing zone in direct roadside tailpipe plume (+25% spike)
} as const;

// Well-to-wheel carbon dioxide emissions per passenger-kilometer (kg CO₂/p-km)
export const TRANSIT_CO2_EMISSIONS_KG_PER_KM = {
  metro: 0.014,        // 14g CO2/passenger-km
  electric_bus: 0.025, // 25g CO2/passenger-km
  carpool: 0.160 / 3,  // 160g shared across 3 passengers (~53g/passenger-km)
  diesel_bus: 0.065,   // 65g CO2/passenger-km
  solo_car: 0.185,     // 185g CO2/km (Single occupancy ICE)
  two_wheeler: 0.075,  // 75g CO2/km
} as const;

/**
 * Computes comparative multi-modal commute impact across 6 urban transit modes,
 * measuring direct microgram PM2.5 lung deposition and carbon footprint.
 *
 * @param telemetry Real-time atmospheric observations
 * @param distanceKm Commute distance in kilometers (default: 15 km)
 * @returns Array of CommuteComparison objects sorted with recommended sustainable alternatives
 */
export function calculateCommuteImpact(
  telemetry: PollutantTelemetry,
  distanceKm: number = 15
): CommuteComparison[] {
  const ambientPm25 = telemetry.pm25;
  const safeDistance = Math.max(1, distanceKm);

  // Travel duration in hours derived from realistic urban speeds
  const metroHours = safeDistance / TRANSIT_SPEEDS_KMH.metro;
  const eBusHours = safeDistance / TRANSIT_SPEEDS_KMH.electric_bus;
  const carpoolHours = safeDistance / TRANSIT_SPEEDS_KMH.carpool;
  const dieselBusHours = safeDistance / TRANSIT_SPEEDS_KMH.diesel_bus;
  const soloCarHours = safeDistance / TRANSIT_SPEEDS_KMH.solo_car;
  const twoWheelerHours = safeDistance / TRANSIT_SPEEDS_KMH.two_wheeler;

  const modes: CommuteComparison[] = [
    {
      mode: 'metro',
      label: 'Metro Rail (High-Capacity Filtered Transit)',
      inhalationExposureMicrograms: Math.round(metroHours * BREATHING_RATES_M3_HR.resting * (ambientPm25 * PM25_PENETRATION_COEFFICIENTS.metro) * 10) / 10,
      co2EmissionsKg: Math.round(safeDistance * TRANSIT_CO2_EMISSIONS_KG_PER_KM.metro * 100) / 100,
      recommended: true,
      notes: 'HEPA-conditioned cabins remove 80%+ of roadside fine soot. Zero street-level tailpipe emissions.'
    },
    {
      mode: 'electric_bus',
      label: 'Electric Bus (Public EV Transit)',
      inhalationExposureMicrograms: Math.round(eBusHours * BREATHING_RATES_M3_HR.resting * (ambientPm25 * PM25_PENETRATION_COEFFICIENTS.electric_bus) * 10) / 10,
      co2EmissionsKg: Math.round(safeDistance * TRANSIT_CO2_EMISSIONS_KG_PER_KM.electric_bus * 100) / 100,
      recommended: true,
      notes: 'Clean propulsion; closed AC coaches isolate passengers from immediate tailpipe plumes.'
    },
    {
      mode: 'carpool',
      label: 'Carpooling (3+ Passengers in EV/CNG Car)',
      inhalationExposureMicrograms: Math.round(carpoolHours * BREATHING_RATES_M3_HR.resting * (ambientPm25 * PM25_PENETRATION_COEFFICIENTS.carpool) * 10) / 10,
      co2EmissionsKg: Math.round(safeDistance * TRANSIT_CO2_EMISSIONS_KG_PER_KM.carpool * 100) / 100,
      recommended: true,
      notes: 'Reduces per-person carbon emissions by 66% while maintaining enclosed cabin filtration.'
    },
    {
      mode: 'diesel_bus',
      label: 'Standard City Bus (CNG/Diesel)',
      inhalationExposureMicrograms: Math.round(dieselBusHours * BREATHING_RATES_M3_HR.resting * (ambientPm25 * PM25_PENETRATION_COEFFICIENTS.diesel_bus) * 10) / 10,
      co2EmissionsKg: Math.round(safeDistance * TRANSIT_CO2_EMISSIONS_KG_PER_KM.diesel_bus * 100) / 100,
      recommended: false,
      notes: 'Mass transit efficiency is good, but frequent door openings draw in roadside exhaust; N95 mask required.'
    },
    {
      mode: 'solo_car',
      label: 'Solo Passenger Car (Single Occupancy ICE)',
      inhalationExposureMicrograms: Math.round(soloCarHours * BREATHING_RATES_M3_HR.resting * (ambientPm25 * PM25_PENETRATION_COEFFICIENTS.solo_car) * 10) / 10,
      co2EmissionsKg: Math.round(safeDistance * TRANSIT_CO2_EMISSIONS_KG_PER_KM.solo_car * 100) / 100,
      recommended: false,
      notes: 'Heaviest carbon burden (~2.8 kg CO2). Directly compounds urban traffic gridlock and evening smog trapping.'
    },
    {
      mode: 'two_wheeler',
      label: 'Two-Wheeler (Motorcycle / Scooter / Auto)',
      inhalationExposureMicrograms: Math.round(twoWheelerHours * BREATHING_RATES_M3_HR.exertion * (ambientPm25 * PM25_PENETRATION_COEFFICIENTS.two_wheeler) * 10) / 10,
      co2EmissionsKg: Math.round(safeDistance * TRANSIT_CO2_EMISSIONS_KG_PER_KM.two_wheeler * 100) / 100,
      recommended: false,
      notes: 'HAZARDOUS IN HIGH AQI: Commuter sits directly in the hot exhaust plume of diesel trucks and buses with zero physical barrier.'
    }
  ];

  return modes;
}

/**
 * Computes comparative carbon dioxide emissions and direct particulate inhalation
 * avoided by selecting mass transit (Metro) over individual private transport (Solo ICE / Two-Wheeler).
 *
 * @param telemetry Atmospheric pollutant measurements including ambient PM2.5 (µg/m³)
 * @param distanceKm One-way transit distance in kilometers (default: 15 km)
 * @returns Quantified avoided CO2 (kg), avoided inhaled PM2.5 (µg), mature tree equivalent, and clinical rationale.
 */
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
  const soloCar = comparison.find(m => m.mode === 'solo_car') ?? comparison[4];
  const metro = comparison.find(m => m.mode === 'metro') ?? comparison[0];
  const twoWheeler = comparison.find(m => m.mode === 'two_wheeler') ?? comparison[5];

  const soloCarCo2 = soloCar ? soloCar.co2EmissionsKg : 0;
  const metroCo2 = metro ? metro.co2EmissionsKg : 0;
  const twoWheelerExposure = twoWheeler ? twoWheeler.inhalationExposureMicrograms : 0;
  const metroExposure = metro ? metro.inhalationExposureMicrograms : 0;

  const avoidedCo2Kg = Math.max(0, Number((soloCarCo2 - metroCo2).toFixed(2)));
  const avoidedInhaledPm25Micrograms = Math.max(0, Number((twoWheelerExposure - metroExposure).toFixed(1)));
  const treesEquivalent = Number((avoidedCo2Kg / 0.06).toFixed(1)); // Approx daily carbon absorption of 1 mature tree

  return {
    avoidedCo2Kg,
    avoidedInhaledPm25Micrograms,
    treesEquivalent,
    justification: `Choosing the Metro instead of a solo car for your ${distanceKm} km commute prevents ${avoidedCo2Kg} kg of CO2 from entering your city's atmosphere, and cuts deep-lung PM2.5 inhalation by ${avoidedInhaledPm25Micrograms} µg compared to a two-wheeler.`
  };
}
