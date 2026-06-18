import React from 'react';
import { 
  Search, 
  Bell, 
  Plus, 
  SearchIcon,
  Command,
  HelpCircle
} from 'lucide-react';
import { mockUser } from '../../mockData';
import { cn } from '../../lib/utils';
import { useModals } from '../../contexts/ModalContext';

interface HeaderProps {
  collapsed?: boolean;
}

export default function Header({ collapsed }: HeaderProps) {
  const { openLeadModal } = useModals();

  return (
    <header className={cn(
      "h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between fixed top-0 right-0 z-40 transition-all duration-300 overflow-hidden",
      collapsed ? "left-16" : "left-0 lg:left-[240px]"
    )}>
      {/* Search Bar */}
      <div className="flex-1 max-w-md">
        <div className="relative group">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-slate-600 transition-colors" size={14} />
          <input 
            type="text" 
            placeholder="Search leads, deals, tasks..."
            className="w-full bg-slate-100 border-transparent rounded-md py-1.5 pl-9 pr-12 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[9px] font-bold text-slate-400 border border-slate-200 rounded px-1 py-0.5 bg-white uppercase">
            <Command size={9} /> K
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={openLeadModal}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={14} />
          <span className="hidden sm:inline">New Lead</span>
        </button>

        <div className="h-6 w-[1px] bg-slate-200 mx-1" />

        <div className="flex items-center gap-0.5">
          <button className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded transition-colors relative">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full border-2 border-white" />
          </button>
          <button className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded transition-colors">
            <HelpCircle size={18} />
          </button>
        </div>

        <button className="flex items-center gap-2.5 p-1 px-1.5 rounded-md hover:bg-slate-50 transition-colors ml-1">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-900 leading-none">{mockUser.name}</p>
            <p className="text-[9px] text-slate-500 font-bold uppercase mt-0.5 tracking-tighter">{mockUser.role}</p>
          </div>
          <img 
            src={mockUser.avatar} 
            alt={mockUser.name} 
            className="w-7 h-7 rounded-sm border border-slate-200"
          />
        </button>
      </div>
    </header>
  );
}
