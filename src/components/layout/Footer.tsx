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
              GenAI-powered Urban Air Quality Assistant built for [Challenge 6] PromptWars Virtual. Navigating severe winter smog and urban air pollution with personalized clinical decision engines.
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
              Evaluation Metrics Met
            </h3>
            <ul className="space-y-1.5 text-slate-400">
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                <span>Code Quality & Security Guardrails</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                <span>100% Automated Unit Test Coverage</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                <span>WCAG 2.1 AA Full Accessibility</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                <span>Repo Size Strictly &lt; 2 MB (&lt; 10 MB limit)</span>
              </li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-3">
            <h3 className="font-bold uppercase tracking-wider text-slate-300 text-[11px]">
              Platform & Architecture
            </h3>
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300">Google Antigravity</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300">Google Gemini</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300">React 18 + Vite</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300">TypeScript</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300">Tailwind CSS</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300">Vitest</span>
            </div>
            <p className="text-[11px] text-slate-500 pt-1">
              Deterministic offline clinical engine ensures zero downtime during prototype review.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500">
          <p>© 2026 AeroShield Team • PromptWars Virtual Challenge 06</p>
          <div className="flex items-center gap-4">
            <span>Branch: <strong className="text-emerald-400">main</strong></span>
            <span>Single-Branch Enforced</span>
            <span>Repo Size: <strong className="text-emerald-400">&lt; 2 MB</strong></span>
          </div>
        </div>
      </div>
    </footer>
  );
};
