import React from 'react';
import { ShieldCheck, Activity } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 py-8 mt-16 text-slate-500 dark:text-slate-400 text-xs transition-colors">
      <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-10 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Brand & Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="font-extrabold text-slate-900 dark:text-white text-sm">AeroShield</div>
            <p className="text-slate-500 dark:text-slate-400 text-[11px]">Precision Atmospheric & Clinical Smog Navigation</p>
          </div>
        </div>

        {/* Center: Live Data Source Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-[11px]">
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
            Open-Meteo European/US Atmospheric API
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
            CPCB / WHO 2021 Benchmarks
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1.5">
            <Activity className="w-3 h-3 animate-pulse text-emerald-500" />
            Live & Operational
          </span>
        </div>

        {/* Right: Copyright */}
        <div className="text-slate-400 dark:text-slate-500 text-[11px] text-center md:text-right">
          © 2026 AeroShield • All Rights Reserved
        </div>
      </div>
    </footer>
  );
};
