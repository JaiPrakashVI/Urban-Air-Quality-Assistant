import { PollutantTelemetry, VulnerabilityProfile, AssistantMessage } from '../types/aqi';
import { generateContextualDecision } from '../engines/assistantDecisionEngine';

/**
 * Service to interface with Google Gemini API when configured,
 * or utilize our deterministic dynamic decision engine with zero external dependencies.
 */

export async function askAssistant(
  userQuery: string,
  telemetry: PollutantTelemetry,
  persona: VulnerabilityProfile,
  cityName: string,
  conversationHistory: AssistantMessage[] = []
): Promise<AssistantMessage> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  // If Gemini API Key is present and enabled, attempt GenAI call
  if (apiKey && apiKey !== 'your_gemini_api_key_here' && apiKey.trim().length > 10) {
    try {
      const response = await callGeminiApi(apiKey, userQuery, telemetry, persona, cityName, conversationHistory);
      return response;
    } catch (err) {
      console.warn('[Gemini] Direct GenAI call failed or rate-limited. Falling back to local smart decision engine:', err);
      // Fallback seamlessly to local intelligent decision engine
    }
  }

  // Local Intelligent Decision Engine (Zero-latency, 100% offline capable, clinical rule-trees)
  return generateContextualDecision(userQuery, telemetry, persona, cityName);
}

async function callGeminiApi(
  apiKey: string,
  userQuery: string,
  telemetry: PollutantTelemetry,
  persona: VulnerabilityProfile,
  cityName: string,
  conversationHistory: AssistantMessage[]
): Promise<AssistantMessage> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const systemContext = `
You are AeroShield, an expert GenAI Urban Air Quality Assistant specialized in navigating winter smog, thermal inversions, and hazardous urban pollution across Indian cities.
Current Live Atmospheric Telemetry:
- City: ${cityName}
- AQI: ${telemetry.aqi} (${telemetry.category})
- PM2.5: ${telemetry.pm25} µg/m³ (WHO 24h limit is 15 µg/m³)
- PM10: ${telemetry.pm10} µg/m³
- NO2: ${telemetry.no2} µg/m³
- Temperature: ${telemetry.temperature}°C, Humidity: ${telemetry.humidity}%, Wind: ${telemetry.windSpeed} km/h
- Dominant Pollutant: ${telemetry.dominantPollutant}
- Data Source: ${telemetry.source} (${telemetry.timestamp})

User Persona:
- Profile: ${persona.title} (${persona.subtitle})
- Biological Multiplier: ${persona.baselineMultiplier}x
- Max Safe Threshold: AQI ${persona.maxSafeAqi}
- Clinical Notice: ${persona.specialMedicationReminder || 'None'}

Instructions:
1. Provide a direct, compassionate, and medically accurate response tailored specifically to the user's persona and the current live pollution metrics.
2. ALWAYS provide scientific justification: explain WHY an activity is safe or unsafe (mention thermal inversion, particulate alveolar deposition, or solar convective mixing).
3. Offer actionable alternatives (indoor activities, HEPA filtration, specific travel options).
4. Keep the response crisp, structured, and easy to read.
`;

  const contents = [
    {
      role: 'user',
      parts: [
        { text: systemContext },
        { text: `Conversation History:\n${conversationHistory.slice(-4).map(m => `${m.sender}: ${m.text}`).join('\n')}` },
        { text: `User Question: ${userQuery}` }
      ]
    }
  ];

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents }),
    signal: AbortSignal.timeout(8000)
  });

  if (!res.ok) {
    throw new Error(`Gemini API returned status ${res.status}`);
  }

  const data = await res.json();
  const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!generatedText) {
    throw new Error('Gemini API returned empty candidate text');
  }

  return {
    id: `msg-${Date.now()}`,
    sender: 'assistant',
    text: generatedText,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    suggestedActions: [
      'Check Safe Window Schedule',
      'View Indoor Air Quality Tips',
      'Compare Low-Emission Commute'
    ],
    riskBadge: {
      level: telemetry.category,
      score: telemetry.aqi
    }
  };
}
