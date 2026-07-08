'use client';

import { Search, Bell, Plus, Command, HelpCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { removeToken } from '@/lib/auth';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

export default function TopBar() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleLogout = () => {
    removeToken();
    router.push('/login');
  };

  const isDark = !mounted || resolvedTheme === 'dark';

  return (
    <header className={`h-[72px] px-6 flex items-center justify-between shrink-0 border-b transition-colors duration-300 ${
      isDark 
        ? 'bg-[#0A0A0C] border-[#27272A]' 
        : 'bg-white border-slate-200'
    }`}>
      {/* Search Bar */}
      <div className="flex-1 max-w-md">
        <div className="relative group">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-[#b9cacb]' : 'text-slate-400'} group-hover:text-[#00f0ff]`} size={16} />
          <input 
            type="text" 
            placeholder="Search leads, deals, tasks..."
            className="input-field pl-10 pr-12 text-[14px]"
          />
          <div className={`absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-bold border rounded px-1.5 py-0.5 uppercase font-mono ${
            isDark ? 'text-[#b9cacb] border-[#27272A] bg-[#16161D]' : 'text-slate-400 border-slate-200 bg-slate-50'
          }`}>
            <Command size={10} /> K
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="btn-primary flex items-center gap-2 px-3 py-1.5 text-xs">
          <Plus size={14} />
          <span className="hidden sm:inline">New Lead</span>
        </button>

        <div className={`h-6 w-px mx-2 ${isDark ? 'bg-[#27272A]' : 'bg-slate-200'}`} />

        <div className="flex items-center gap-1">
          <button className={`p-2 rounded-xl transition-all relative ${isDark ? 'text-[#b9cacb] hover:text-[#00f0ff] hover:bg-[#00f0ff]/10' : 'text-slate-500 hover:text-[#00a3ff] hover:bg-[#00a3ff]/10'}`}>
            <Bell size={18} />
            <span className={`absolute top-1.5 right-1.5 w-2 h-2 bg-[#ff007a] rounded-full ${isDark ? 'border-2 border-[#0A0A0C] shadow-[0_0_8px_rgba(255,0,122,0.8)]' : 'border-2 border-white'}`} />
          </button>
          <button className={`p-2 rounded-xl transition-all ${isDark ? 'text-[#b9cacb] hover:text-[#00f0ff] hover:bg-[#00f0ff]/10' : 'text-slate-500 hover:text-[#00a3ff] hover:bg-[#00a3ff]/10'}`}>
            <HelpCircle size={18} />
          </button>
        </div>

        <button 
          onClick={handleLogout}
          className={`flex items-center gap-3 p-1.5 pr-2 rounded-xl border border-transparent transition-all ml-2 ${
            isDark ? 'hover:bg-[#16161D] hover:border-[#27272A]' : 'hover:bg-slate-50 hover:border-slate-200'
          }`}
        >
          <div className="text-right hidden sm:block">
            <p className={`text-[13px] font-bold leading-none ${isDark ? 'text-[#e5e1e4]' : 'text-slate-800'}`}>Sarah Chen</p>
            <p className="text-[10px] text-[#00f0ff] font-bold uppercase mt-1 tracking-tighter font-mono">Admin</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00f0ff]/30 to-[#bd00ff]/30 border border-[#00f0ff]/30 flex items-center justify-center text-[#00f0ff] text-[11px] font-bold shadow-[0_0_8px_rgba(0,240,255,0.2)]">
            SC
          </div>
        </button>
      </div>
    </header>
  );
}
