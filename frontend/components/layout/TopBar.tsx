/**
 * @file components/layout/TopBar.tsx
 * @description Dashboard Top Navigation Bar
 * Sprint 1 — Frontend Team Deliverable
 */

'use client';

import { Search, Bell, Settings, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { removeToken } from '@/lib/auth';

export default function TopBar() {
  const router = useRouter();

  const handleLogout = () => {
    removeToken();
    router.push('/login');
  };

  return (
    <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-sm flex items-center justify-between px-6 shrink-0">
      {/* Search */}
      <div className="relative w-72">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search leads, deals..."
          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-sm
                     focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400
                     placeholder:text-slate-400 transition-all"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button className="relative p-2.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full" />
        </button>
        <button className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors">
          <Settings size={18} />
        </button>
        <div className="w-[1px] h-6 bg-slate-200 mx-1" />
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-red-50 text-slate-500 hover:text-red-600 text-sm font-medium transition-colors"
        >
          <LogOut size={15} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
