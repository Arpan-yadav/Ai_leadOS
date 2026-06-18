import React from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Users, 
  Bot, 
  Workflow, 
  Zap, 
  Shield, 
  BarChart3,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

interface LandingProps {
  onLogin: () => void;
  onRegister: () => void;
}

export default function Landing({ onLogin, onRegister }: LandingProps) {
  return (
    <div className="min-h-screen bg-white selection:bg-brand-100 selection:text-brand-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-brand-500/20">
              <TrendingUp size={22} />
            </div>
            <span className="font-display font-bold text-2xl text-slate-900 tracking-tight uppercase">AI Lead OS</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-bold text-slate-500 hover:text-brand-600 transition-colors uppercase tracking-widest">Features</a>
            <a href="#platform" className="text-sm font-bold text-slate-500 hover:text-brand-600 transition-colors uppercase tracking-widest">Platform</a>
            <a href="#customers" className="text-sm font-bold text-slate-500 hover:text-brand-600 transition-colors uppercase tracking-widest">Enterprise</a>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={onLogin}
              className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-brand-600 transition-colors uppercase tracking-widest"
            >
              Login
            </button>
            <button 
              onClick={onRegister}
              className="btn-primary"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-50 rounded-full border border-brand-100">
              <Zap size={14} className="text-brand-600" />
              <span className="text-[10px] font-black text-brand-700 uppercase tracking-[0.2em]">Next-Gen Lead Intelligence</span>
            </div>
            
            <h1 className="text-7xl font-bold text-slate-900 tracking-tight leading-[0.95] uppercase">
              Scale Your <span className="text-brand-600 underline decoration-8 underline-offset-8 decoration-brand-100">Revenue</span> <br/> 
              with Autonomous AI.
            </h1>
            
            <p className="text-xl text-slate-500 max-w-lg font-medium leading-relaxed">
              The first OS for sales intelligence. Identify high-intent leads, automate outreach, and close deals 3x faster with AI Copilot.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button 
                onClick={onRegister}
                className="w-full sm:w-auto px-8 py-4 bg-brand-600 text-white font-black uppercase text-sm tracking-widest rounded transition-all hover:bg-brand-700 hover:scale-[1.02] active:scale-95 shadow-xl shadow-brand-500/20"
              >
                Join the Private Beta
              </button>
              <div className="flex items-center gap-2 text-slate-400">
                <Shield size={16} />
                <span className="text-xs font-bold uppercase tracking-widest">Enterprise Secured</span>
              </div>
            </div>

            <div className="pt-8 flex items-center gap-8">
              <div className="space-y-1">
                <p className="text-2xl font-bold text-slate-900 tracking-tight">$4.2B+</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pipeline Managed</p>
              </div>
              <div className="h-12 w-px bg-slate-100" />
              <div className="space-y-1">
                <p className="text-2xl font-bold text-slate-900 tracking-tight">84%</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lead Accuracy</p>
              </div>
              <div className="h-12 w-px bg-slate-100" />
              <div className="space-y-1">
                <p className="text-2xl font-bold text-slate-900 tracking-tight">3.5x</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ROI Average</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-brand-600/10 blur-[120px] rounded-full" />
            <div className="relative bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden aspect-[4/3] group">
              <img 
                src="https://images.unsplash.com/photo-1551288049-bbbda50a867c?auto=format&fit=crop&q=80&w=1200" 
                alt="Dashboard Preview"
                className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
              
              {/* Floating Element */}
              <div className="absolute top-8 right-8 bg-white/90 backdrop-blur-md p-4 rounded-xl border border-slate-200 shadow-xl max-w-[200px]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">AI Opportunity</p>
                </div>
                <p className="text-[11px] font-bold text-slate-600 leading-tight">Hyperion Corp showing high purchase signals in EMEA.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-12 border-y border-slate-100 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-8">Trusted by Global Sales Organizations</p>
          <div className="flex flex-wrap justify-center items-center gap-16 opacity-30 grayscale contrast-125">
            <span className="text-2xl font-black tracking-tighter">NEXUS</span>
            <span className="text-2xl font-black tracking-tighter">ORBITAL</span>
            <span className="text-2xl font-black tracking-tighter">SYNERGY</span>
            <span className="text-2xl font-black tracking-tighter">VANTAGE</span>
            <span className="text-2xl font-black tracking-tighter">ELITE</span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto text-center mb-20 space-y-4">
          <h2 className="text-4xl font-bold text-slate-900 tracking-tight uppercase">Everything you need to <span className="text-brand-600">dominate</span></h2>
          <p className="text-slate-500 font-medium max-w-2xl mx-auto">Enterprise-grade tools powered by autonomous intelligence agents.</p>
        </div>

        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Users,
              title: "Lead Intelligence",
              desc: "Identify ICP-aligned leads with real-time intent scoring and automated enrichment."
            },
            {
              icon: Bot,
              title: "AI Copilot",
              desc: "Get strategic recommendations on who to prioritize and what messaging will resonate."
            },
            {
              icon: Workflow,
              title: "Automation Hub",
              desc: "Build complex multi-channel outreach flows that run 24/7 without human intervention."
            },
            {
              icon: Zap,
              title: "Real-time Sync",
              desc: "Your data stays fresh with live updates from LinkedIn, Email, and CRM platforms."
            },
            {
              icon: Shield,
              title: "Bank-Level Security",
              desc: "Protect your sensitive enterprise data with military-grade encryption and SOC2 compliance."
            },
            {
              icon: BarChart3,
              title: "Revenue Analytics",
              desc: "Uncover bottleneck in your sales funnel with high-density data visualizations."
            }
          ].map((feature, i) => (
            <div key={i} className="p-8 rounded-2xl border border-slate-100 hover:border-brand-200 transition-all group">
              <div className="w-12 h-12 bg-slate-50 text-slate-900 rounded-xl flex items-center justify-center mb-6 group-hover:bg-brand-600 group-hover:text-white transition-all">
                <feature.icon size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight mb-3">{feature.title}</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto bg-slate-900 rounded-[2rem] p-12 lg:p-24 relative overflow-hidden text-center lg:text-left">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-600/20 blur-[120px] -translate-y-1/2 translate-x-1/4" />
          <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h2 className="text-5xl font-bold text-white tracking-tight leading-tight uppercase">Ready to out-compete <br/> the entire market?</h2>
              <div className="space-y-4">
                {[
                  "No credit card required",
                  "Unlimited lead enrichment for 14 days",
                  "Dedicated AI model training"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-slate-300">
                    <CheckCircle2 size={18} className="text-brand-400" />
                    <span className="font-bold text-sm uppercase tracking-widest">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col items-center lg:items-end gap-6">
              <button 
                onClick={onRegister}
                className="px-12 py-5 bg-white text-brand-900 font-black uppercase text-lg tracking-widest rounded hover:bg-brand-50 transition-all flex items-center gap-3 active:scale-95 shadow-2xl"
              >
                Get Started Now <ArrowRight size={20} />
              </button>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Join 4,000+ sales leaders worldwide</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2.5 opacity-50 grayscale">
            <div className="w-6 h-6 bg-slate-900 rounded flex items-center justify-center text-white font-bold">
              <TrendingUp size={14} />
            </div>
            <span className="font-display font-bold text-lg text-slate-900 tracking-tight uppercase">AI Lead OS</span>
          </div>
          <div className="flex items-center gap-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <a href="#" className="hover:text-brand-600">Privacy Policy</a>
            <a href="#" className="hover:text-brand-600">Terms of Service</a>
            <a href="#" className="hover:text-brand-600">Cookie Policy</a>
            <span className="text-slate-300">© 2026 AI Lead OS Enterprise</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
