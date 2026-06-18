import React from 'react';
import { NavLink } from 'react-router-dom';
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
  Mail,
  CheckSquare,
  MessageSquare,
  BarChart3
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Users, label: 'Leads', path: '/leads' },
  { icon: Kanban, label: 'Pipeline', path: '/pipeline' },
  { icon: MessageSquare, label: 'Communications', path: '/communications' },
  { icon: Bot, label: 'AI Intelligence', path: '/ai-intelligence' },
  { icon: Workflow, label: 'Automations', path: '/automations' },
  { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
];

export default function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 64 : 240 }}
      className={cn(
        "fixed left-0 top-0 h-screen bg-white text-slate-600 z-50 flex flex-col border-r border-slate-200",
        collapsed ? "items-center" : "items-stretch"
      )}
    >
      <div className={cn("p-5 flex items-center gap-2 border-b border-slate-100", collapsed ? "justify-center" : "justify-start")}>
        <div className="w-8 h-8 bg-brand-600 rounded flex items-center justify-center text-white shrink-0 font-bold">
          <TrendingUp size={18} />
        </div>
        {!collapsed && (
          <span className="font-display font-bold text-lg text-slate-800 tracking-tight">AI Lead OS</span>
        )}
      </div>

      <nav className="flex-1 px-3 space-y-0.5 mt-4">
        {!collapsed && <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold px-3 mb-2">Main Menu</div>}
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-1.5 rounded-md transition-all duration-150 group relative truncate text-sm font-medium",
              isActive 
                ? "text-brand-700 bg-slate-100 font-semibold shadow-sm border border-slate-200" 
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            )}
          >
            <item.icon size={16} className="shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}

        {!collapsed && (
          <div className="mt-8 px-2">
            <div className="p-3 bg-brand-50 border border-brand-100 rounded-lg">
              <p className="text-xs text-brand-700 font-semibold mb-1">AI Copilot Focus</p>
              <p className="text-[10px] text-brand-600 leading-relaxed mb-3 font-medium">3 High-intent opportunities detected today.</p>
              <button className="w-full py-1 bg-brand-600 text-white text-[10px] font-bold rounded shadow-sm hover:bg-brand-700 transition-colors uppercase tracking-widest">View Insights</button>
            </div>
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-slate-100 space-y-0.5">
        <NavLink
          to="/settings"
          className={({ isActive }) => cn(
            "flex items-center gap-3 px-3 py-1.5 rounded-md transition-all duration-150 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-sm font-medium truncate",
            isActive && "text-brand-700 bg-slate-100 font-semibold"
          )}
        >
          <Settings size={16} className="shrink-0" />
          {!collapsed && <span>Settings</span>}
        </NavLink>
        
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center gap-3 px-3 py-1.5 rounded-md transition-all duration-150 text-slate-500 hover:text-brand-600 hover:bg-slate-50 text-sm font-medium"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </motion.aside>
  );
}
