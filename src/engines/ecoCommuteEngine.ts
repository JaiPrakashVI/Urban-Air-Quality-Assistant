import { CommuteComparison, PollutantTelemetry } from '../types/aqi';

export function calculateCommuteImpact(
  telemetry: PollutantTelemetry,
  distanceKm: number = 15
): CommuteComparison[] {
  const ambientPm25 = telemetry.pm25; // µg/m³
  
  // Resting breathing rate: ~12 L/min = 0.72 m³/hour
  // Exertion breathing rate (two-wheeler): ~18 L/min = 1.08 m³/hour
  const safeDistance = Math.max(1, distanceKm);

  // Time in hours based on typical urban transit speeds
  const metroHours = safeDistance / 35;
  const eBusHours = safeDistance / 20;
  const carpoolHours = safeDistance / 22;
  const dieselBusHours = safeDistance / 18;
  const soloCarHours = safeDistance / 25;
  const twoWheelerHours = safeDistance / 25;

  const modes: CommuteComparison[] = [
    {
      mode: 'metro',
      label: 'Metro Rail (High-Capacity Filtered Transit)',
      // Metro air systems filter out ~80% of outdoor PM2.5 (0.20 penetration)
      inhalationExposureMicrograms: Math.round(metroHours * 0.72 * (ambientPm25 * 0.20) * 10) / 10,
      co2EmissionsKg: Math.round(safeDistance * 0.014 * 100) / 100, // 14g CO2/passenger-km
      recommended: true,
      notes: 'HEPA-conditioned cabins remove 80%+ of roadside fine soot. Zero street-level tailpipe emissions.'
    },
    {
      mode: 'electric_bus',
      label: 'Electric Bus (Public EV Transit)',
      // Air filter efficiency ~55% (0.45 penetration)
      inhalationExposureMicrograms: Math.round(eBusHours * 0.72 * (ambientPm25 * 0.45) * 10) / 10,
      co2EmissionsKg: Math.round(safeDistance * 0.025 * 100) / 100, // 25g CO2/passenger-km
      recommended: true,
      notes: 'Clean propulsion; closed AC coaches isolate passengers from immediate tailpipe plumes.'
    },
    {
      mode: 'carpool',
      label: 'Carpooling (3+ Passengers in EV/CNG Car)',
      // AC recirculate cabin filter ~65% efficiency (0.35 penetration)
      inhalationExposureMicrograms: Math.round(carpoolHours * 0.72 * (ambientPm25 * 0.35) * 10) / 10,
      co2EmissionsKg: Math.round((safeDistance * 0.160 / 3) * 100) / 100, // Shared across 3 people
      recommended: true,
      notes: 'Reduces per-person carbon emissions by 66% while maintaining enclosed cabin filtration.'
    },
    {
      mode: 'diesel_bus',
      label: 'Standard City Bus (CNG/Diesel)',
      // Semi-open windows; filter efficiency ~20% (0.80 penetration)
      inhalationExposureMicrograms: Math.round(dieselBusHours * 0.72 * (ambientPm25 * 0.80) * 10) / 10,
      co2EmissionsKg: Math.round(safeDistance * 0.065 * 100) / 100,
      recommended: false,
      notes: 'Mass transit efficiency is good, but frequent door openings draw in roadside exhaust; N95 mask required.'
    },
    {
      mode: 'solo_car',
      label: 'Solo Passenger Car (Single Occupancy ICE)',
      // Enclosed cabin AC in recirculate mode protects passenger (~65% filter), BUT worst emissions
      inhalationExposureMicrograms: Math.round(soloCarHours * 0.72 * (ambientPm25 * 0.35) * 10) / 10,
      co2EmissionsKg: Math.round(safeDistance * 0.185 * 100) / 100, // 185g CO2/km
      recommended: false,
      notes: 'Heaviest carbon burden (~2.8 kg CO2). Directly compounds urban traffic gridlock and evening smog trapping.'
    },
    {
      mode: 'two_wheeler',
      label: 'Two-Wheeler (Motorcycle / Scooter / Auto)',
      // Exposed to breathing zone at tailpipe height (+25% spike) with high physical ventilation
      inhalationExposureMicrograms: Math.round(twoWheelerHours * 1.08 * (ambientPm25 * 1.25) * 10) / 10,
      co2EmissionsKg: Math.round(safeDistance * 0.075 * 100) / 100,
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
