/**
 * @file components/layout/Sidebar.tsx
 * @description App Sidebar Navigation
 * Sprint 1 — Frontend Team Deliverable
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, GitBranch, Bot, Zap,
  MessageSquare, BarChart3, Settings, Bot as BotIcon,
} from 'lucide-react';
import { clsx } from 'clsx';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/leads', icon: Users, label: 'Leads' },
  { href: '/dashboard/pipeline', icon: GitBranch, label: 'Pipeline' },
  { href: '/dashboard/ai-intelligence', icon: Bot, label: 'AI Intelligence' },
  { href: '/dashboard/automations', icon: Zap, label: 'Automations' },
  { href: '/dashboard/communications', icon: MessageSquare, label: 'Comms' },
  { href: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[220px] h-screen flex flex-col bg-slate-900 border-r border-slate-800 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
          <BotIcon size={16} className="text-brand-400" />
        </div>
        <div>
          <p className="text-sm font-bold text-white leading-none">AI LeadOS</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Sales Automation</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              id={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-brand-500/20 text-brand-300 border border-brand-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800',
              )}
            >
              <item.icon size={17} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-brand-500/30 border border-brand-500/40 flex items-center justify-center text-brand-300 text-xs font-bold shrink-0">
            SC
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-300 truncate">Sarah Chen</p>
            <p className="text-[10px] text-slate-500 truncate">Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
