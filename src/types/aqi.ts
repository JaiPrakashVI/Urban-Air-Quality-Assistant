export type AqiCategory = 
  | 'Good' 
  | 'Moderate' 
  | 'Poor' 
  | 'Unhealthy' 
  | 'Severe' 
  | 'Hazardous';

export interface PollutantTelemetry {
  aqi: number;
  category: AqiCategory;
  pm25: number;      // µg/m³
  pm10: number;      // µg/m³
  no2: number;       // µg/m³
  so2: number;       // µg/m³
  co: number;        // mg/m³
  o3: number;        // µg/m³
  temperature: number; // °C
  humidity: number;    // %
  windSpeed: number;   // km/h
  dominantPollutant: string;
  source: 'live_open_meteo' | 'offline_telemetry';
  timestamp: string;
}

export interface HourlyForecast {
  time: string; // e.g. "06:00"
  hour: number;
  aqi: number;
  pm25: number;
  category: AqiCategory;
  ventilationSafe: boolean;
  outdoorSafe: boolean;
  recommendation: string;
}

export type PersonaType = 
  | 'asthmatic' 
  | 'infant_parent' 
  | 'elderly' 
  | 'outdoor_athlete' 
  | 'commuter' 
  | 'healthy_adult';

export interface VulnerabilityProfile {
  id: PersonaType;
  title: string;
  subtitle: string;
  avatar: string;
  baselineMultiplier: number;
  targetConditions: string[];
  keyRiskPollutant: 'pm25' | 'no2' | 'o3' | 'pm10';
  maxSafeAqi: number;
  specialMedicationReminder?: string;
  description: string;
}

export interface ActivityContext {
  activityType: 'indoor_work' | 'commute' | 'outdoor_exercise' | 'school_run' | 'market_errands';
  durationMinutes: number;
  exertionLevel: 'low' | 'moderate' | 'high'; // affects lung ventilation rate (L/min)
}

export interface RiskAssessment {
  riskScore: number; // 0 to 100
  riskLevel: 'Minimal' | 'Guarded' | 'Elevated' | 'High' | 'Critical';
  summary: string;
  primaryAlert: string;
  clinicalActions: string[];
  maskRecommendation: 'None Required' | 'Surgical/Cloth Optional' | 'N95 / FFP2 Mandatory' | 'N99 / Avoid Exposure';
  indoorActionRequired: boolean;
}

export interface SafeActivityWindow {
  bestWindow: string; // e.g. "1:00 PM - 3:30 PM"
  rationale: string;
  hours: HourlyForecast[];
  safeForCurrentPersona: boolean;
}

export interface IaqMitigationPlan {
  ventilationRecommendedNow: boolean;
  ventilationReason: string;
  bestVentilationHour: string;
  purifierMode: 'Off' | 'Auto / Low' | 'Medium' | 'Turbo / Max';
  recommendedPurifierRuntimeHours: number;
  diyActionTips: string[];
}

export interface CommuteComparison {
  mode: 'metro' | 'electric_bus' | 'diesel_bus' | 'carpool' | 'solo_car' | 'two_wheeler';
  label: string;
  inhalationExposureMicrograms: number;
  co2EmissionsKg: number;
  recommended: boolean;
  notes: string;
}

export interface AssistantMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedActions?: string[];
  riskBadge?: {
    level: string;
    score: number;
  };
}

export interface CityPreset {
  id: string;
  name: string;
  country: string;
  lat: number;
  lon: number;
  typicalWinterSmogPeak: string;
  defaultTelemetry: PollutantTelemetry;
}
