import React from 'react';

/**
 * Route-Level Async Suspense Fallback Component.
 * Displays accessible loading placeholder cards matching the dimensions of split modules.
 */
export const TabLoadingSkeleton: React.FC = () => {
  return (
    <div 
      role="status" 
      aria-label="Loading diagnostic intelligence module..." 
      className="glass-card rounded-3xl p-8 space-y-6 animate-pulse border border-slate-200 dark:border-white/5"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800" />
          <div className="space-y-2">
            <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded-md" />
            <div className="h-3 w-32 bg-slate-100 dark:bg-slate-900 rounded-md" />
          </div>
        </div>
        <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded-full" />
      </div>

      <div className="h-28 bg-slate-100 dark:bg-slate-900/60 rounded-2xl" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-36 bg-slate-100 dark:bg-slate-900/60 rounded-2xl" />
        <div className="h-36 bg-slate-100 dark:bg-slate-900/60 rounded-2xl" />
      </div>

      <span className="sr-only">Loading atmospheric calculation data...</span>
    </div>
  );
};
