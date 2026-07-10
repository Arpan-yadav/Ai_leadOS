'use client';

import { Search, Bell, Plus, Command, HelpCircle, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { removeToken } from '@/lib/auth';

export default function TopBar() {
  const router = useRouter();

  const handleLogout = () => {
    removeToken();
    router.push('/login');
  };

  return (
    <header className="h-[72px] bg-[#0A0A0C] border-b border-[#27272A] px-6 flex items-center justify-between shrink-0">
      {/* Search Bar */}
      <div className="flex-1 max-w-md">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b9cacb] group-hover:text-[#00f0ff] transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Search leads, deals, tasks..."
            className="input-field pl-10 pr-12 text-[14px]"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-bold text-[#b9cacb] border border-[#27272A] rounded px-1.5 py-0.5 bg-[#16161D] uppercase font-mono">
            <Command size={10} /> K
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="btn-primary flex items-center gap-2 px-3 py-1.5 text-xs">
          <Plus size={14} />
          <span className="hidden sm:inline">New Lead</span>
        </button>

        <div className="h-6 w-px bg-[#27272A] mx-2" />

        <div className="flex items-center gap-1">
          <button className="p-2 text-[#b9cacb] hover:text-[#00f0ff] hover:bg-[#00f0ff]/10 rounded-xl transition-all relative">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ff007a] rounded-full border-2 border-[#0A0A0C] shadow-[0_0_8px_rgba(255,0,122,0.8)]" />
          </button>
          <button className="p-2 text-[#b9cacb] hover:text-[#00f0ff] hover:bg-[#00f0ff]/10 rounded-xl transition-all">
            <HelpCircle size={18} />
          </button>
        </div>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 p-1.5 pr-2 rounded-xl hover:bg-[#16161D] border border-transparent hover:border-[#27272A] transition-all ml-2"
        >
          <div className="text-right hidden sm:block">
            <p className="text-[13px] font-bold text-[#e5e1e4] leading-none">Sarah Chen</p>
            <p className="text-[10px] text-[#00f0ff] font-bold uppercase mt-1 tracking-tighter font-mono">Admin</p>
          </div>
          <img 
            src="https://api.dicebear.com/7.x/notionists/svg?seed=Sarah&backgroundColor=16161d" 
            alt="Sarah Chen" 
            className="w-7 h-7 rounded-sm border border-slate-200"
          />
        </button>
      </div>
    </header>
  );
}
