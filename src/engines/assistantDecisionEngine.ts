import { PollutantTelemetry, VulnerabilityProfile, AssistantMessage } from '../types/aqi';
import { calculatePersonalRisk } from './vulnerabilityEngine';
import { calculateIaqMitigation } from './iaqMitigationEngine';

/**
 * Deterministic local conversational decision engine providing immediate, offline-capable,
 * clinically grounded guidance tailored to user query intent, atmospheric metrics, and vulnerability profiles.
 *
 * @param query Free-form user input query
 * @param telemetry Real-time atmospheric pollutant concentrations and weather metrics
 * @param persona Selected biological vulnerability profile
 * @param cityName Target municipality or urban agglomeration name
 * @returns Structured AssistantMessage containing synthesized clinical advice and action chips
 */
export function generateContextualDecision(
  query: string,
  telemetry: PollutantTelemetry,
  persona: VulnerabilityProfile,
  cityName: string
): AssistantMessage {
  const q = query.toLowerCase();
  const risk = calculatePersonalRisk(telemetry, persona);
  const iaq = calculateIaqMitigation(telemetry);
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  let text = '';
  const suggestedActions: string[] = [];

  // Intent 1: Children / School / Outdoor Play
  if (q.includes('child') || q.includes('kid') || q.includes('play') || q.includes('school') || q.includes('evening')) {
    if (telemetry.aqi > 180) {
      text = `**[IMMEDIATE ADVISORY] Guidance for ${cityName} (${persona.title}):**
Do **not** allow children to play outdoors this evening. 

**Scientific Justification:**
The current ambient AQI is **${telemetry.aqi} (${telemetry.category})** with PM2.5 at **${telemetry.pm25} µg/m³** (nearly ${(telemetry.pm25 / 15).toFixed(1)}x above safe WHO thresholds). Children have smaller airways, immature alveolar membranes, and breathe 2-3x faster than adults. Strenuous outdoor play will deposit toxic combustion soot directly into developing lung tissue.

**Recommended Actionable Alternatives:**
1. **Indoor Play & Creative Games:** Shift play entirely indoors. Keep windows sealed.
2. **HEPA Air Cleaning:** Ensure bedroom air purifier is active on **${iaq.purifierMode}** mode.
3. **School Commute Precaution:** If school opens tomorrow morning, ensure children wear sealed child-size N95 masks; avoid open e-rickshaws or walking beside congested bus corridors.`;
      suggestedActions.push('View Safe Activity Hours', 'Indoor Air Purification Hacks');
    } else {
      text = `**[PLAY ASSESSMENT] Assessment for ${cityName}:**
Current air quality is **${telemetry.category} (AQI ${telemetry.aqi})**. Moderate outdoor play is acceptable, but prefer shaded parks away from heavy arterial roads. Keep total exertion under 45 minutes.`;
      suggestedActions.push('Check Hourly Smog Forecast', 'Review Mask Requirements');
    }
  }

  // Intent 2: Windows / Ventilation / Air Purifier / IAQ
  else if (q.includes('window') || q.includes('ventilate') || q.includes('purifier') || q.includes('indoor') || q.includes('house') || q.includes('home')) {
    text = `**[INDOOR AIR QUALITY ADVISORY] Strategy for ${cityName}:**
${iaq.ventilationRecommendedNow 
  ? '**Window Opening Safe Now:** Yes, you can perform a 15-20 minute cross-ventilation flush right now during midday solar convective mixing.'
  : '**Keep Windows Sealed:** Do NOT open exterior windows right now. Ground-level cold inversion will flood your living space with toxic fine particulates.'}

**Air Purifier Recommendations:**
- **Recommended Fan Mode:** **${iaq.purifierMode}**
- **Recommended Daily Runtime:** **${iaq.recommendedPurifierRuntimeHours} hours** (Continuous circulation recommended during severe smog).
- **Placement:** Place purifier centrally, elevated 1 foot off the ground, away from open doors.

**DIY Mitigation Hacks:**
1. **Damp Mopping:** Never use a dry broom (which resuspends fine PM2.5). Mop with a damp microfiber cloth to permanently trap micro-soot.
2. **Door Draft Seals:** Roll a damp towel along main entrance door bottoms to stop external smog leakage.
3. **NASA Air-Purifying Plants:** Place Snake Plants (Sansevieria) in bedrooms for night-time oxygen enrichment.`;
    suggestedActions.push('View Full IAQ Guide', 'Check Outdoor AQI Trend');
  }

  // Intent 3: Morning Walk / Exercise / Running / Cycling
  else if (q.includes('walk') || q.includes('jog') || q.includes('running') || q.includes('marathon') || /\brun\b/.test(q) || q.includes('exercise') || q.includes('cycle') || q.includes('workout')) {
    if (telemetry.aqi > 150) {
      text = `**[WORKOUT ADVISORY] Exercise Advisory for ${cityName}:**
**Suspend early morning outdoor walks and outdoor aerobic workouts.**

**Scientific Justification:**
During early morning hours (05:00 - 08:30 AM), ground-level radiational cooling forms a dense **thermal inversion ceiling** that traps diesel exhaust and particulate matter directly in the human breathing zone. 

For **${persona.title}**, aerobic exertion increases pulmonary minute ventilation from ~8 L/min to over 60 L/min, driving fine PM2.5 directly into deep alveoli and elevating blood pressure.

**Optimal Schedule & Alternatives:**
- **Best Solar Window:** Postpone walks to **1:00 PM – 3:30 PM**, when solar heating dilates the atmospheric boundary layer and cuts ground smog by ~35%.
- **Indoor Alternative:** Perform stretching, yoga, or indoor bodyweight training in a closed room with HEPA filtration.
- **Mask:** If stepping outside for essential tasks, wear a certified **${risk.maskRecommendation}**.`;
      suggestedActions.push('Find Cleanest Hour Today', 'Calculate Commute Exposure');
    } else {
      text = `Outdoor exercise is manageable today (AQI ${telemetry.aqi}). Pace your intensity and avoid high-traffic corridors where NO2 levels are elevated.`;
      suggestedActions.push('Check 24h Hourly Forecast');
    }
  }

  // Intent 4: Commute / Transit / Travel / Metro / Car / Office
  else if (q.includes('commute') || q.includes('travel') || q.includes('metro') || q.includes('bus') || q.includes('car') || q.includes('traffic') || q.includes('office') || q.includes('route')) {
    text = `**[COMMUTE PLAN] Low-Emission Transit Strategy for ${cityName}:**
With current PM2.5 at **${telemetry.pm25} µg/m³**, travel mode dramatically shapes both your personal lung exposure and urban emissions.

**Recommended Transit Choice:**
- **Primary Choice: Metro Rail / Electric Suburban Transit**
  - **Why:** Metro coaches utilize sealed, HEPA-filtered HVAC systems, eliminating ~80% of ambient street smog. Inhaled PM2.5 is restricted to < 10 µg over a 15 km trip.
  - **Emissions:** Prevents **~2.5 kg of CO2** compared to a solo petrol car.
- **Avoid:** Open two-wheelers, auto-rickshaws, and non-AC buses. Commuters at tailpipe level inhale up to 12x more toxic particulates and reactive NO2.

**In-Transit Protection:**
Wear a snug **N95 respirator** at boarding platforms, and keep car AC set strictly to **Internal Air Recirculation** mode.`;
    suggestedActions.push('Open Commute Carbon Calculator', 'View Risk Mitigation');
  }

  // Intent 5: Mask / Respirator
  else if (q.includes('mask') || q.includes('n95') || q.includes('protection') || q.includes('filter')) {
    text = `**[RESPIRATOR ADVISORY] Protection Guidelines for ${cityName}:**
**Current Mandate:** **${risk.maskRecommendation}**

**Why Cloth / Surgical Masks Fail in Severe Smog:**
Standard surgical and cloth masks only block coarse particles (> 10 µm) like dust and pollen. They have < 25% filtration efficiency against sub-micron **PM2.5 combustion particles** (${telemetry.pm25} µg/m³ currently present) which easily bypass loose fabric gaps.

**Certified Selection:**
- Use **N95 (NIOSH certified), FFP2 (EN 149), or KN95**.
- Ensure a tight nose-bridge seal without facial hair gaps.
- Discard or replace after 40 hours of active wear, or when breathing resistance increases.`;
    suggestedActions.push('View Personal Risk Score', 'Safe Activity Windows');
  }

  // Intent 6: Symptoms / Health / Inhaler / Chest
  else if (q.includes('inhaler') || q.includes('cough') || q.includes('chest') || q.includes('throat') || q.includes('breath') || q.includes('symptom') || q.includes('doctor')) {
    text = `**[CLINICAL ALERT] Health Precaution for ${persona.title}:**
Your calculated Vulnerability Risk Score is **${risk.riskScore}/100 (${risk.riskLevel})**.

${persona.specialMedicationReminder ? `**Medication Reminder:** ${persona.specialMedicationReminder}\n` : ''}
**Symptom Mitigation Checklist:**
1. **Saline Nasal Rinse:** Perform a gentle warm saline gargle and nasal rinse after outdoor exposure to wash away trapped particulate and sulfur compounds.
2. **Hydration:** Drink 2.5–3 liters of warm water to keep mucous membranes moist and facilitate natural ciliary clearance of inhaled soot.
3. **Emergency Warning Signs:** If experiencing persistent wheezing, chest tightness, or peak flow drop below 80% personal best, consult your physician immediately.`;
    suggestedActions.push('View Emergency Risk Assessment', 'Explore Commute Alternatives');
  }

  // Default Intent: Dynamic Comprehensive Briefing
  else {
    text = `**AeroShield Contextual Briefing for ${cityName}:**
Currently, ${cityName} is experiencing an **AQI of ${telemetry.aqi} (${telemetry.category})** with PM2.5 at **${telemetry.pm25} µg/m³** and dominant pollutant **${telemetry.dominantPollutant}**.

Tailored for your profile (**${persona.title}**, biological risk multiplier: **${persona.baselineMultiplier}x**):
- **Personal Risk Level:** **${risk.riskLevel} (${risk.riskScore}/100)**
- **Protective Gear:** **${risk.maskRecommendation}**
- **Indoor Air Status:** ${iaq.ventilationRecommendedNow ? 'Midday ventilation possible.' : 'Keep windows sealed; run purifiers on ' + iaq.purifierMode + '.'}

Ask me anything about:
- *“Can my children play outside this evening?”*
- *“When is the safest window for my walk or run?”*
- *“What is the healthiest, lowest-emission way to commute to work?”*
- *“How should I configure my indoor air purifier today?”*`;
    suggestedActions.push(
      'Can children play outside today?',
      'Best time for outdoor exercise',
      'Compare Metro vs Carpool commute',
      'Indoor Air Quality & window timing'
    );
  }

  return {
    id: `msg-${Date.now()}`,
    sender: 'assistant',
    text,
    timestamp: timeStr,
    suggestedActions,
    riskBadge: {
      level: risk.riskLevel,
      score: risk.riskScore
    }
  };
}
