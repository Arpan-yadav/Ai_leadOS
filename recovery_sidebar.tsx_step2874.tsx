'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Kanban, 
  Bot, 
  Workflow, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  MessageSquare,
  BarChart3,
  Bot as BotIcon,
  Moon,
  Sun,
  CheckSquare
} from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Users, label: 'Leads', path: '/leads' },
  { icon: Kanban, label: 'Pipeline', path: '/pipeline' },
  { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
  { icon: Workflow, label: 'Sequences', path: '/sequences' },
  { icon: Bot, label: 'AI Intelligence', path: '/ai-intelligence' },
  { icon: MessageSquare, label: 'Communications', path: '/communications' },
  { icon: TrendingUp, label: 'Analytics', path: '/analytics' },
  { icon: BarChart3, label: 'Settings', path: '/settings' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <motion.div 
      initial={false}
      animate={{ width: collapsed ? 80 : 260 }}
      className="h-screen bg-[#0A0A0C] border-r border-[#27272A] flex flex-col shrink-0 relative transition-all duration-300"
    >
      <div className="flex items-center gap-3 px-6 h-[72px] border-b border-[#27272A]">
        <div className="w-8 h-8 rounded-[12px] bg-gradient-to-br from-[#00f0ff] to-[#bd00ff] flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(0,240,255,0.4)]">
          <BotIcon size={18} className="text-[#0A0A0C]" />
        </div>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden whitespace-nowrap">
            <span className="font-display font-bold text-lg text-[#e5e1e4]">AI Lead</span>
            <span className="font-display font-bold text-lg text-[#00f0ff]">OS</span>
          </motion.div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1">
        {!collapsed && <div className="px-2 mb-2 text-[10px] font-bold text-[#b9cacb] uppercase tracking-wider font-mono">Main Menu</div>}
        
        {navItems.map((item) => {
          const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
          return (
            <Link 
              key={item.path} 
              href={item.path}
              className={clsx(
                'sidebar-link group',
                isActive && 'active',
                collapsed && 'justify-center px-0'
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={18} className={clsx(
                'transition-colors duration-300 shrink-0',
                isActive ? 'text-[#00f0ff]' : 'text-[#b9cacb] group-hover:text-[#00f0ff]'
              )} />
              {!collapsed && (
                <span className="truncate">{item.label}</span>
              )}
            </Link>
          );
        })}

        {!collapsed && (
          <div className="mt-8 mb-4 px-4 py-4 rounded-[16px] glass-card border border-[#ff007a]/20 shadow-[0_0_15px_rgba(255,0,122,0.1)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#ff007a]/10 rounded-full blur-[20px]" />
            <h4 className="text-[12px] font-bold text-[#ff007a] mb-1 font-display">AI Copilot Focus</h4>
            <p className="text-[12px] text-[#e5e1e4] mb-4 leading-relaxed">3 <span className="text-[#ff007a] font-bold">High-intent</span> opportunities detected.</p>
            <button className="w-full bg-[#ff007a]/10 hover:bg-[#ff007a]/20 border border-[#ff007a]/30 text-[#ff007a] hover:shadow-[0_0_15px_rgba(255,0,122,0.3)] text-[10px] font-bold uppercase tracking-wider py-2.5 rounded-[12px] transition-all duration-300">
              View Insights
            </button>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-100 flex flex-col gap-2">
        <Link 
          href="/dashboard/settings"
          className={clsx(
            "sidebar-link group",
            pathname === '/dashboard/settings' && "active",
            collapsed && "justify-center px-0"
          )}
          title={collapsed ? "Settings" : undefined}
        >
          <Settings size={18} className="text-slate-400 group-hover:text-slate-600 shrink-0 transition-colors duration-200" />
          {!collapsed && <span>Settings</span>}
        </Link>
        
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-2.5 px-3 py-2 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors w-full"
        >
          {collapsed ? <ChevronRight size={18} className="mx-auto" /> : <><ChevronLeft size={18} /> <span className="text-sm font-medium">Collapse</span></>}
        </button>

        {mounted && (
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors w-full mt-2"
            title="Toggle Theme"
          >
            {theme === 'dark' ? (
              <><Sun size={18} className={collapsed ? "mx-auto" : ""} /> {!collapsed && <span className="text-sm font-medium">Light Mode</span>}</>
            ) : (
              <><Moon size={18} className={collapsed ? "mx-auto" : ""} /> {!collapsed && <span className="text-sm font-medium">Dark Mode</span>}</>
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
}
