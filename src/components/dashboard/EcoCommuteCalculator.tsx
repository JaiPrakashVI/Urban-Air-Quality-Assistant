import React, { useState } from 'react';
import { PollutantTelemetry } from '../../types/aqi';
import { calculateCommuteImpact, calculateAvoidedEmissionsAndInhalation } from '../../engines/ecoCommuteEngine';
import { Compass, Train, Car, Bike, Leaf, Award } from 'lucide-react';

interface EcoCommuteCalculatorProps {
  telemetry: PollutantTelemetry;
}

export const EcoCommuteCalculator: React.FC<EcoCommuteCalculatorProps> = ({ telemetry }) => {
  const [distanceKm, setDistanceKm] = useState<number>(15);
  const comparison = calculateCommuteImpact(telemetry, distanceKm);
  const avoided = calculateAvoidedEmissionsAndInhalation(telemetry, distanceKm);

  return (
    <section 
      aria-labelledby="commute-calculator-heading"
      className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-lg"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-emerald-400" aria-hidden="true" />
          <h2 id="commute-calculator-heading" className="text-lg font-bold text-white">
            Low-Emission Commute & Health Impact Analyzer
          </h2>
        </div>

        {/* Distance Slider */}
        <div className="flex items-center gap-3 bg-slate-950/60 px-4 py-2 rounded-xl border border-slate-800">
          <label htmlFor="commute-dist-slider" className="text-xs text-slate-300 font-semibold shrink-0">
            One-Way Distance: <span className="text-emerald-400 font-black">{distanceKm} km</span>
          </label>
          <input
            id="commute-dist-slider"
            type="range"
            min="3"
            max="40"
            step="1"
            value={distanceKm}
            onChange={(e) => setDistanceKm(Number(e.target.value))}
            className="w-24 sm:w-32 accent-emerald-500 cursor-pointer"
            aria-label="Commute distance in kilometers"
          />
        </div>
      </div>

      {/* Avoided Emissions & Inhalation Highlight Box */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/40 p-5 rounded-xl border border-emerald-500/30 mb-5">
        <div className="flex items-start gap-3">
          <Award className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Personal & Planetary Impact
            </div>
            <div className="text-sm font-semibold text-slate-200 mt-1">
              {avoided.justification}
            </div>
            <div className="flex flex-wrap gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-300">
                <Leaf className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                <span>Equivalent to the daily absorption of <strong>{avoided.treesEquivalent} mature trees</strong></span>
              </div>
              <div className="text-slate-600 hidden sm:block">•</div>
              <div className="text-xs text-slate-300">
                Carbon reduction: <strong>{(avoided.avoidedCo2Kg * 22).toFixed(1)} kg CO2/month</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transit Modes Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300" aria-label="Transit Modes Comparison">
          <thead className="bg-slate-950/70 uppercase text-[10px] text-slate-400 font-bold border-b border-slate-800">
            <tr>
              <th scope="col" className="p-3">Commute Mode</th>
              <th scope="col" className="p-3">Inhaled PM2.5 (µg)</th>
              <th scope="col" className="p-3">Carbon (kg CO2)</th>
              <th scope="col" className="p-3">Scientific Evaluation & Justification</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {comparison.map((c) => (
              <tr 
                key={c.mode}
                className={c.recommended ? 'bg-emerald-950/15 hover:bg-emerald-950/25' : 'hover:bg-slate-800/30'}
              >
                <td className="p-3 font-bold text-white flex items-center gap-2">
                  {c.mode === 'metro' && <Train className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />}
                  {c.mode === 'electric_bus' && <Train className="w-4 h-4 text-teal-400 shrink-0" aria-hidden="true" />}
                  {c.mode === 'carpool' && <Car className="w-4 h-4 text-cyan-400 shrink-0" aria-hidden="true" />}
                  {c.mode === 'diesel_bus' && <Car className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />}
                  {c.mode === 'solo_car' && <Car className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />}
                  {c.mode === 'two_wheeler' && <Bike className="w-4 h-4 text-rose-400 shrink-0" aria-hidden="true" />}
                  <span>{c.label}</span>
                  {c.recommended && (
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-extrabold uppercase ml-1">
                      Recommended
                    </span>
                  )}
                </td>
                <td className="p-3">
                  <span className={`font-mono font-bold ${
                    c.inhalationExposureMicrograms > 30 ? 'text-rose-400' : 'text-emerald-400'
                  }`}>
                    {c.inhalationExposureMicrograms} µg
                  </span>
                </td>
                <td className="p-3 font-mono font-semibold text-slate-200">
                  {c.co2EmissionsKg} kg
                </td>
                <td className="p-3 text-slate-400 max-w-sm">
                  {c.notes}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
