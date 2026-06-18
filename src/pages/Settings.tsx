import React from 'react';
import { 
  User, 
  Lock, 
  Bell, 
  Globe, 
  Database, 
  CreditCard, 
  Users, 
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  ChevronLeft
} from 'lucide-react';
import { cn } from '../lib/utils';
import { mockUser } from '../mockData';

const sections = [
  { id: 'profile', icon: User, label: 'Profile Settings', desc: 'Manage your public persona' },
  { id: 'security', icon: Lock, label: 'Security & Access', desc: 'MFA and password management' },
  { id: 'notifications', icon: Bell, label: 'Notification Hub', desc: 'Configure alerts and digests' },
  { id: 'team', icon: Users, label: 'Team Governance', desc: 'Permissions and seat management' },
  { id: 'integrations', icon: Globe, label: 'External Ecosystem', desc: 'CRM and API connectivity' },
  { id: 'billing', icon: CreditCard, label: 'Plan & Billing', desc: 'Invoices and subscription' },
];

export default function Settings() {
  const [activeSection, setActiveSection] = React.useState('profile');

  return (
     <div className="max-w-6xl mx-auto py-4">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">System Settings</h1>
          <p className="text-slate-500 mt-2 font-medium">Fine-tune your AI Lead OS workspace for maximum efficiency.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Navigation */}
          <div className="lg:col-span-4 space-y-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "w-full text-left p-4 rounded-2xl flex items-center gap-4 transition-all duration-300 group",
                  activeSection === section.id 
                    ? "bg-slate-900 shadow-xl shadow-slate-900/10" 
                    : "hover:bg-white hover:shadow-sm"
                )}
              >
                <div className={cn(
                  "p-2.5 rounded-xl transition-colors",
                  activeSection === section.id 
                    ? "bg-brand-600 text-white" 
                    : "bg-slate-100 text-slate-500 group-hover:bg-brand-50 group-hover:text-brand-600"
                )}>
                  <section.icon size={20} />
                </div>
                <div className="flex-1">
                  <p className={cn(
                    "text-sm font-bold tracking-tight uppercase",
                    activeSection === section.id ? "text-white" : "text-slate-900"
                  )}>{section.label}</p>
                  <p className={cn(
                    "text-[10px] font-bold uppercase tracking-widest mt-0.5",
                    activeSection === section.id ? "text-slate-400" : "text-slate-500"
                  )}>{section.desc}</p>
                </div>
                <ChevronRight className={cn(
                  "transition-transform",
                  activeSection === section.id ? "text-slate-600 translate-x-1" : "text-slate-300 group-hover:text-slate-400"
                )} size={18} />
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="lg:col-span-8">
            <div className="glass-card p-8 min-h-[500px]">
              {activeSection === 'profile' && (
                <div className="space-y-8">
                  <div className="flex items-center gap-6">
                    <div className="relative group">
                       <img src={mockUser.avatar} alt="" className="w-24 h-24 rounded-full border-4 border-slate-50 shadow-lg" />
                       <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                         <span className="text-[10px] font-bold text-white uppercase tracking-widest underline underline-offset-4">Update</span>
                       </div>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-900 tracking-tight">{mockUser.name}</h4>
                      <p className="text-slate-500 font-medium text-sm mt-1">Administrator Access</p>
                      <div className="flex items-center gap-2 mt-4">
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-200">Verified Professional</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                       <input type="text" defaultValue={mockUser.name} className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 px-4 font-medium focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                       <input type="email" defaultValue={mockUser.email} className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 px-4 font-medium focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bio & Expertise</label>
                    <textarea 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 px-4 font-medium focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500 min-h-[120px]"
                      placeholder="Tell us about your sales focus..."
                      defaultValue="Senior SaaS Executive specializing in enterprise lead qualification and AI-driven outreach strategy."
                    ></textarea>
                  </div>

                  <div className="pt-6 flex justify-end gap-3">
                     <button className="btn-secondary">Discard Changes</button>
                     <button className="btn-primary px-8 shadow-xl shadow-brand-500/20">Save Profile</button>
                  </div>
                </div>
              )}

              {activeSection !== 'profile' && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                   <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                      <ShieldCheck size={40} />
                   </div>
                   <div>
                     <h3 className="text-xl font-bold text-slate-900 capitalize tracking-tight">{activeSection} Configuration</h3>
                     <p className="text-slate-500 mt-2 max-w-sm font-medium italic underline decoration-slate-200">These advanced modules are being provisioned for your workspace.</p>
                   </div>
                   <button className="btn-secondary flex items-center gap-2 group">
                      <span>Learn about {activeSection}</span>
                      <ExternalLink size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                   </button>
                </div>
              )}
            </div>
          </div>
        </div>
     </div>
  );
}
