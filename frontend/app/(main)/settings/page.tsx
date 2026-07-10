'use client';
import React, { useState } from 'react';
import { Settings, User, Bell, Shield, Palette, Database, Zap, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { removeToken } from '@/lib/auth';
import toast from 'react-hot-toast';

const sections = [
  { icon: User, label: 'Profile', id: 'profile' },
  { icon: Bell, label: 'Notifications', id: 'notifications' },
  { icon: Palette, label: 'Appearance', id: 'appearance' },
  { icon: Shield, label: 'Security', id: 'security' },
  { icon: Database, label: 'Integrations', id: 'integrations' },
  { icon: Zap, label: 'Automations', id: 'automations' },
];

export default function SettingsPage() {
  const [active, setActive] = useState('profile');
  const router = useRouter();

  const handleLogout = () => {
    removeToken();
    router.push('/login');
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <header>
        <h1 className="text-2xl font-bold text-white tracking-tight uppercase">Settings</h1>
        <p className="text-[#b9cacb] mt-1 font-mono text-[11px] uppercase tracking-wider">Manage your account, preferences and integrations</p>
      </header>

      <div className="flex gap-6">
        {/* Sidebar Nav */}
        <div className="glass-card p-3 w-48 shrink-0 h-fit">
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all mb-1 ${
                active === s.id
                  ? 'bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/20'
                  : 'text-[#b9cacb] hover:text-white hover:bg-white/5'
              }`}
            >
              <s.icon size={16} />
              {s.label}
            </button>
          ))}
          <div className="mt-2 pt-2 border-t border-[#27272A]">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>

        <div className="glass-card p-6 flex-1">
          {active === 'profile' && (() => {
            let user = { name: 'Sarah Chen', email: 'sarah.chen@proyotech.com', role: 'Admin' };
            if (typeof window !== 'undefined') {
              const str = localStorage.getItem('leados_user');
              if (str) user = JSON.parse(str);
            }
            const initials = user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

            return (
            <div className="space-y-6">
              <h2 className="text-sm font-black text-white uppercase tracking-widest border-b border-[#27272A] pb-4">Profile Settings</h2>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-xl bg-linear-to-br from-[#00f0ff]/30 to-[#bd00ff]/30 border border-[#00f0ff]/30 flex items-center justify-center text-[#00f0ff] text-xl font-bold shadow-[0_0_15px_rgba(0,240,255,0.2)]">
                  {initials}
                </div>
                <div>
                  <p className="font-bold text-white">{user.name}</p>
                  <p className="text-[11px] text-[#00f0ff] font-mono uppercase">{user.role}</p>
                  <button onClick={() => toast('Avatar selection dialog opened')} className="text-[10px] text-[#b9cacb] hover:text-[#00f0ff] transition-colors mt-1">Change avatar</button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: 'Full Name', value: user.name },
                  { label: 'Email', value: user.email },
                  { label: 'Role', value: user.role },
                  { label: 'Team', value: 'Sales' },
                ].map(f => (
                  <div key={f.label}>
                    <label className="text-[10px] font-black text-[#b9cacb] uppercase tracking-widest block mb-1">{f.label}</label>
                    <input defaultValue={f.value} className="input-field" />
                  </div>
                ))}
              </div>
              <button onClick={() => toast.success('Profile changes saved successfully!')} className="btn-primary">Save Changes</button>
            </div>
          )})()}
          {active !== 'profile' && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              {React.createElement(sections.find(s => s.id === active)?.icon || Settings, { size: 32, className: 'text-[#00f0ff]/40' })}
              <h3 className="text-sm font-black text-white uppercase tracking-widest">{sections.find(s => s.id === active)?.label}</h3>
              <p className="text-[11px] text-[#b9cacb]">Configuration panel coming soon.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
