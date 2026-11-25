import React from 'react';
import { Shield, CheckCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 py-10 mt-16 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-extrabold text-sm">
              <Shield className="w-4 h-4 text-emerald-400" aria-hidden="true" />
              <span>AeroShield</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Context-aware Urban Air Quality Assistant designed to help families and communities navigate severe winter smog and urban air pollution with personalized clinical decision engines.
            </p>
          </div>

          {/* Col 2 */}
          <div className="space-y-3">
            <h3 className="font-bold uppercase tracking-wider text-slate-300 text-[11px]">
              Scientific Data Sources
            </h3>
            <ul className="space-y-1.5 text-slate-400">
              <li>• Open-Meteo Real-Time Atmospheric API</li>
              <li>• Central Pollution Control Board (CPCB)</li>
              <li>• WHO 2021 Air Quality Guidelines</li>
              <li>• US EPA National Ambient Air Quality</li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-3">
            <h3 className="font-bold uppercase tracking-wider text-slate-300 text-[11px]">
              Core Capabilities
            </h3>
            <ul className="space-y-1.5 text-slate-400">
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                <span>Diurnal Atmospheric Smog Forecasting</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                <span>Personalized Biological Vulnerability Modeling</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                <span>Active Indoor Air Quality & Purifier Protocols</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                <span>Deep-Lung Inhalation vs Carbon Offset Analysis</span>
              </li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-3">
            <h3 className="font-bold uppercase tracking-wider text-slate-300 text-[11px]">
              Platform & Architecture
            </h3>
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300">Google Gemini</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300">React 18 + Vite</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300">TypeScript</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300">Tailwind CSS</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300">Vitest</span>
            </div>
            <p className="text-[11px] text-slate-500 pt-1">
              Deterministic edge clinical engine ensures continuous, zero-latency advisory protection.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500">
          <p>© 2026 AeroShield • Urban Air Quality & Smog Mitigation Platform</p>
          <div className="flex items-center gap-4 text-xs">
            <span>Precision Atmospheric Telemetry</span>
            <span>•</span>
            <span>Clinical Respiratory Protocols</span>
            <span>•</span>
            <span className="text-emerald-400">Live & Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
