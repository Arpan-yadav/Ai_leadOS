import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-8">
      <Loader2 className="animate-spin text-brand-500 mb-4" size={48} />
      <h2 className="text-xl font-bold text-slate-800 dark:text-white animate-pulse">Loading Workspace...</h2>
      <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm text-center max-w-sm">
        Just a moment while we fetch your leads, deals, and AI insights.
      </p>
    </div>
  );
}
