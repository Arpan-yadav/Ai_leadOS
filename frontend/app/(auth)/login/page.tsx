'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TrendingUp, ArrowRight, Mail, Lock, ShieldCheck, Zap, Globe, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { saveToken } from '@/lib/auth';
import ThemeToggle from '@/components/ui/ThemeToggle';

const loginSchema = z.object({
  email: z.string().min(1, 'Please enter a valid email address or username'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const { register, handleSubmit, formState: { isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError('');
    try {
      const payload = { ...data, email: data.email.trim() };
      const res = await apiClient.post('/auth/login', payload);
      saveToken(res.data.accessToken);
      if (res.data.user) {
        import('@/lib/auth').then(({ saveUser }) => saveUser(res.data.user));
      }
      router.push('/dashboard');
    } catch (err: any) {
      setServerError(err?.response?.data?.message || 'Invalid credentials.');
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Left: Branding & Value Prop */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-0 right-0 w-125 h-125 bg-brand-500/20 blur-[120px] -translate-y-1/2 translate-x-1/4" />
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-2xl shadow-brand-500/20">
            <TrendingUp size={24} />
          </div>
          <span className="font-display font-bold text-2xl text-white tracking-tight uppercase">AI Lead OS</span>
        </div>

        <div className="relative z-10 space-y-12">
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-6xl font-bold text-white! tracking-tight leading-[1.1] uppercase">
              Scale your <br/> <span className="text-brand-400 underline decoration-brand-600 decoration-8 underline-offset-8">revenue</span> <br/> with AI.
            </h1>
            <p className="text-xl text-slate-400 font-medium max-w-lg leading-relaxed italic">
              The only sales operating system that combines CRM complexity with Gemini-powered company intelligence.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-800">
             {[
               { icon: Zap, label: 'Lead Scoring', val: 'Automated' },
               { icon: ShieldCheck, label: 'Analytics', val: 'Real-time' },
               { icon: Globe, label: 'Outreach', val: 'Omni-channel' },
               { icon: TrendingUp, label: 'Pipeline', val: 'Predictive' },
             ].map((f, i) => (
               <div key={i} className="space-y-1 group">
                  <div className="flex items-center gap-2 text-brand-400">
                    <f.icon size={16} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{f.label}</span>
                  </div>
                  <p className="text-white font-bold text-lg group-hover:text-brand-300 transition-colors">{f.val}</p>
               </div>
             ))}
          </div>
        </div>

        <div className="relative z-10 text-slate-500 text-xs font-bold uppercase tracking-widest flex items-center gap-4">
           <span>Trusted by 450+ high-growth agencies</span>
           <div className="h-px bg-slate-800 flex-1" />
        </div>
      </div>

      {/* Right: Auth Form */}
      <div className="flex flex-col items-center justify-center p-8 lg:p-24 bg-white dark:bg-slate-900 transition-colors duration-300 animate-fade-in relative">
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>
        
        <div className="w-full max-w-md space-y-10">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight uppercase transition-colors">Welcome back</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium transition-colors">Enter your credentials to access your workspace.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {serverError && (
              <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                <AlertCircle size={16} className="text-red-400 shrink-0" />
                <p className="text-red-300 text-sm">{serverError}</p>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Work Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-hover:text-brand-500 transition-colors" size={20} />
                <input 
                  type="text" 
                  {...register('email')}
                  placeholder="name@company.com or username"
                  className="w-full bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 dark:text-white rounded-xl py-4 pl-12 pr-4 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 dark:focus:border-brand-500 font-medium transition-all"
                  required 
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Password</label>
                <button type="button" onClick={() => setShowForgotModal(true)} className="text-[10px] font-black text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 uppercase tracking-widest">Forgot?</button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-hover:text-brand-500 transition-colors" size={20} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  {...register('password')}
                  placeholder="••••••••"
                  className="w-full bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 dark:text-white rounded-xl py-4 pl-12 pr-12 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 dark:focus:border-brand-500 font-medium transition-all"
                  required 
                  autoComplete="new-password"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button disabled={isSubmitting} type="submit" className="w-full btn-primary py-4 rounded-xl text-lg flex items-center justify-center gap-2 group shadow-2xl shadow-brand-500/20">
              <span>Sign In to Workspace</span>
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
            </button>
          </form>

          <p className="text-center text-sm font-medium text-slate-500 dark:text-slate-400 italic">
            Don't have a workspace?
            <Link 
              href="/register"
              className="ml-2 text-brand-600 dark:text-brand-400 font-bold uppercase tracking-widest text-[11px] underline underline-offset-4 decoration-brand-200 dark:decoration-brand-800 hover:decoration-brand-600 dark:hover:decoration-brand-400 transition-all"
            >
              Request Access
            </Link>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl w-full max-w-md shadow-2xl relative">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight uppercase mb-2">Reset Password</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            
            {forgotStatus === 'success' ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-4 rounded-xl text-sm font-medium">
                Check your email for a link to reset your password. If it doesn't appear within a few minutes, check your spam folder.
              </div>
            ) : (
              <div className="space-y-4">
                <input
                  type="text"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 dark:text-white rounded-xl py-3 px-4 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 dark:focus:border-brand-500 font-medium transition-all"
                />
                <button
                  onClick={() => {
                    setForgotStatus('loading');
                    setTimeout(() => setForgotStatus('success'), 1500); // Mock API call
                  }}
                  disabled={!forgotEmail || forgotStatus === 'loading'}
                  className="w-full btn-primary py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                >
                  {forgotStatus === 'loading' ? <Loader2 size={18} className="animate-spin" /> : 'Send Reset Link'}
                </button>
              </div>
            )}
            
            <div className="mt-6 text-center">
              <button 
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotStatus('idle');
                  setForgotEmail('');
                }} 
                className="text-xs font-black text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 uppercase tracking-widest transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
