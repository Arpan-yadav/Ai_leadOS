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
  Bot as BotIcon
} from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Users, label: 'Leads', path: '/leads' },
  { icon: Kanban, label: 'Pipeline', path: '/pipeline' },
  { icon: MessageSquare, label: 'Communications', path: '/dashboard/communications' },
  { icon: Bot, label: 'AI Intelligence', path: '/dashboard/ai-intelligence' },
  { icon: Workflow, label: 'Automations', path: '/dashboard/automations' },
  { icon: TrendingUp, label: 'Analytics', path: '/dashboard/analytics' },
  { icon: BarChart3, label: 'Settings', path: '/dashboard/settings' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <motion.div 
      initial={false}
      animate={{ width: collapsed ? 80 : 260 }}
      className="h-screen bg-white border-r border-slate-200 flex flex-col shrink-0 relative transition-all duration-300"
    >
      <div className="flex items-center gap-3 px-6 h-[72px] border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center shrink-0 shadow-sm shadow-brand-500/30">
          <BotIcon size={18} className="text-white" />
        </div>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden whitespace-nowrap">
            <span className="font-display font-bold text-lg text-slate-900">AI Lead</span>
            <span className="font-display font-bold text-lg text-brand-600">OS</span>
          </motion.div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1">
        {!collapsed && <div className="px-2 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Main Menu</div>}
        
        {navItems.map((item) => {
          const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
          return (
            <Link 
              key={item.label}
              href={item.path}
              className={clsx(
                "sidebar-link group",
                isActive && "active",
                collapsed && "justify-center px-0"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={18} className={clsx(isActive ? "text-brand-600" : "text-slate-400 group-hover:text-brand-600", "shrink-0 transition-colors duration-200")} />
              {!collapsed && (
                <span className="truncate">{item.label}</span>
              )}
            </Link>
          );
        })}

        {!collapsed && (
          <div className="mt-8 mb-4 px-3 py-4 rounded-xl bg-brand-50 border border-brand-100">
            <h4 className="text-xs font-bold text-brand-900 mb-1">AI Copilot Focus</h4>
            <p className="text-[11px] text-brand-700/80 mb-3 leading-tight">3 High-intent opportunities detected today.</p>
            <button className="w-full bg-brand-600 hover:bg-brand-700 text-white text-[10px] font-bold uppercase tracking-wider py-2 rounded-lg transition-colors">
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
      </div>
    </motion.div>
  );
}
