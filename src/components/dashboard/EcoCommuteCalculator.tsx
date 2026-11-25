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
      className="glass-card rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between"
    >
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Compass className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="commute-calculator-heading" className="text-lg font-bold text-white">
                Low-Emission Commute & Health Impact Analyzer
              </h2>
              <span className="text-xs text-slate-400">
                Comparing deep-lung particle inhalation vs carbon footprint
              </span>
            </div>
          </div>

          {/* Distance Slider */}
          <div className="flex items-center gap-3 bg-slate-950/70 px-4 py-2 rounded-2xl border border-white/5 self-start sm:self-auto">
            <label htmlFor="commute-dist-slider" className="text-xs text-slate-300 font-bold shrink-0">
              Trip Distance: <span className="text-emerald-400 font-black">{distanceKm} km</span>
            </label>
            <input
              id="commute-dist-slider"
              type="range"
              min="3"
              max="40"
              step="1"
              value={distanceKm}
              onChange={(e) => setDistanceKm(Number(e.target.value))}
              className="w-28 accent-emerald-500 cursor-pointer"
              aria-label="Commute distance in kilometers"
            />
          </div>
        </div>

        {/* Impact Callout Card */}
        <div className="bg-gradient-to-br from-emerald-950/50 via-slate-900/90 to-teal-950/30 p-5 rounded-2xl border border-emerald-500/30 mb-6 shadow-glow-emerald">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400">
                Personal & Planetary Impact
              </div>
              <div className="text-sm font-semibold text-slate-100 mt-1 leading-relaxed">
                {avoided.justification}
              </div>
              <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-emerald-500/20">
                <div className="flex items-center gap-1.5 text-xs text-slate-300">
                  <Leaf className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                  <span>Equal to daily absorption of <strong>{avoided.treesEquivalent} mature trees</strong></span>
                </div>
                <span className="text-slate-600 hidden sm:inline">•</span>
                <div className="text-xs text-slate-300">
                  Avoids <strong>{(avoided.avoidedCo2Kg * 22).toFixed(1)} kg CO2 monthly</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transit Modes Comparison Table */}
      <div className="overflow-x-auto rounded-2xl border border-white/5 bg-slate-950/60">
        <table className="w-full text-left text-xs text-slate-300" aria-label="Transit Modes Comparison">
          <thead className="bg-slate-900/80 uppercase text-[10px] text-slate-400 font-extrabold border-b border-white/5">
            <tr>
              <th scope="col" className="p-3.5">Commute Mode</th>
              <th scope="col" className="p-3.5">Inhaled PM2.5 (µg)</th>
              <th scope="col" className="p-3.5">Carbon (kg CO2)</th>
              <th scope="col" className="p-3.5">Scientific Evaluation & Justification</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {comparison.map((c) => (
              <tr 
                key={c.mode}
                className={c.recommended ? 'bg-emerald-950/20 hover:bg-emerald-950/30' : 'hover:bg-slate-800/20'}
              >
                <td className="p-3.5 font-bold text-white flex items-center gap-2.5">
                  {c.mode === 'metro' && <Train className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />}
                  {c.mode === 'electric_bus' && <Train className="w-4 h-4 text-teal-400 shrink-0" aria-hidden="true" />}
                  {c.mode === 'carpool' && <Car className="w-4 h-4 text-cyan-400 shrink-0" aria-hidden="true" />}
                  {c.mode === 'diesel_bus' && <Car className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />}
                  {c.mode === 'solo_car' && <Car className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />}
                  {c.mode === 'two_wheeler' && <Bike className="w-4 h-4 text-rose-400 shrink-0" aria-hidden="true" />}
                  <span>{c.label}</span>
                  {c.recommended && (
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-black uppercase ml-1 border border-emerald-500/30">
                      Recommended
                    </span>
                  )}
                </td>
                <td className="p-3.5">
                  <span className={`font-mono font-bold ${
                    c.inhalationExposureMicrograms > 30 ? 'text-rose-400' : 'text-emerald-400'
                  }`}>
                    {c.inhalationExposureMicrograms} µg
                  </span>
                </td>
                <td className="p-3.5 font-mono font-semibold text-slate-200">
                  {c.co2EmissionsKg} kg
                </td>
                <td className="p-3.5 text-slate-400 max-w-sm leading-relaxed">
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
