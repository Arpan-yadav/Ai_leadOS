/**
 * @file app/(auth)/register/page.tsx
 * @description Register Page — Next.js App Router
 * Sprint 1 — Frontend Team Deliverable
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Bot, Eye, EyeOff, Mail, Lock, User, AlertCircle, Loader2, Sparkles,
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { saveToken } from '@/lib/auth';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterFormData) => {
    setServerError('');
    try {
      const res = await apiClient.post('/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
      });
      saveToken(res.data.accessToken);
      router.push('/dashboard');
    } catch (err: any) {
      setServerError(
        err?.response?.data?.message || 'Registration failed. Please try again.',
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-500/20 border border-brand-500/30 mb-4">
            <Bot className="text-brand-400" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create your account</h1>
          <p className="text-slate-400 mt-1 text-sm">Join AI LeadOS — start closing smarter</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="text-brand-400" size={16} />
            <span className="text-xs font-semibold text-brand-300 uppercase tracking-[0.2em]">
              Free to get started
            </span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {serverError && (
              <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                <AlertCircle size={16} className="text-red-400 shrink-0" />
                <p className="text-red-300 text-sm">{serverError}</p>
              </div>
            )}

            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  {...register('name')}
                  type="text"
                  id="register-name"
                  placeholder="Sarah Chen"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4
                             text-white placeholder:text-slate-600 text-sm
                             focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500/50 transition-all"
                />
              </div>
              {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Work Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  {...register('email')}
                  type="email"
                  id="register-email"
                  placeholder="you@company.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4
                             text-white placeholder:text-slate-600 text-sm
                             focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500/50 transition-all"
                />
              </div>
              {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  id="register-password"
                  placeholder="Min 8 characters"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-12
                             text-white placeholder:text-slate-600 text-sm
                             focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  {...register('confirmPassword')}
                  type="password"
                  id="register-confirm-password"
                  placeholder="Repeat password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4
                             text-white placeholder:text-slate-600 text-sm
                             focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500/50 transition-all"
                />
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-400">{errors.confirmPassword.message}</p>}
            </div>

            <button
              type="submit"
              id="register-submit"
              disabled={isSubmitting}
              className="w-full bg-brand-500 hover:bg-brand-400 text-white font-semibold
                         py-3 rounded-xl transition-all duration-200 mt-2
                         shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50
                         active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <><Loader2 size={18} className="animate-spin" /><span>Creating account...</span></>
              ) : (
                <span>Create Account</span>
              )}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
