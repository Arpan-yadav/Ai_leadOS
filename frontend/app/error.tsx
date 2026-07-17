'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white dark:bg-[#0A0A0C] border border-red-200 dark:border-red-900/50 rounded-2xl p-8 text-center shadow-xl">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Something went wrong!</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
          An unexpected error occurred in the application. We've been notified and are looking into it.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="btn-primary flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl text-sm font-bold"
          >
            <RefreshCw size={16} /> Try again
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-slate-100 hover:bg-slate-200 dark:bg-[#16161D] dark:hover:bg-[#27272A] text-slate-700 dark:text-white flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl text-sm font-bold transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
