'use client';
import React, { useState, useEffect } from 'react';
import {
  User, Bell, Shield, Palette, Database, Zap, LogOut,
  Key, MessageSquare, Mail, Eye, EyeOff, CheckCircle2,
  XCircle, Loader2, Save, ExternalLink, ChevronRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { removeToken, getToken } from '@/lib/auth';
import toast from 'react-hot-toast';
import { useTheme } from 'next-themes';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const sections = [
  { icon: User, label: 'Profile', id: 'profile' },
  { icon: Key, label: 'AI Configuration', id: 'ai' },
  { icon: MessageSquare, label: 'WhatsApp', id: 'whatsapp' },
  { icon: Mail, label: 'Email', id: 'email' },
  { icon: Bell, label: 'Notifications', id: 'notifications' },
  { icon: Shield, label: 'Security', id: 'security' },
];

function StatusBadge({ connected, loading }: { connected: boolean; loading?: boolean }) {
  if (loading) return <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 uppercase"><Loader2 size={10} className="animate-spin" /> Testing...</span>;
  return connected
    ? <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 uppercase"><CheckCircle2 size={10} /> Connected</span>
    : <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase"><XCircle size={10} /> Not configured</span>;
}

function SecretInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder || 'Enter key...'}
        className="input-field w-full pr-10"
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
      >
        {show ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const [active, setActive] = useState('profile');
  const [settings, setSettings] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [profile, setProfile] = useState({ name: '', email: '', role: '' });
  const router = useRouter();
  const token = getToken();
  const { resolvedTheme } = useTheme();

  // AI settings
  const [geminiKey, setGeminiKey] = useState('');

  // WhatsApp settings
  const [waPhoneNumberId, setWaPhoneNumberId] = useState('');
  const [waAccessToken, setWaAccessToken] = useState('');
  const [waBusinessAccountId, setWaBusinessAccountId] = useState('');
  const [waTestPhone, setWaTestPhone] = useState('');

  // Email settings
  const [emailProvider, setEmailProvider] = useState<'SMTP' | 'RESEND' | 'GMAIL_OAUTH'>('SMTP');
  const [resendApiKey, setResendApiKey] = useState('');
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [gmailClientId, setGmailClientId] = useState('');
  const [gmailClientSecret, setGmailClientSecret] = useState('');
  const [gmailRefreshToken, setGmailRefreshToken] = useState('');
  const [testEmailAddr, setTestEmailAddr] = useState('');

  // Security
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');

  useEffect(() => {
    fetchProfile();
    fetchSettings();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setProfile(await res.json());
    } catch {}
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API}/settings`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        setEmailProvider(data.email?.provider || 'SMTP');
        setSmtpHost(data.email?.smtpHost || '');
        setSmtpPort(String(data.email?.smtpPort || '587'));
        setSmtpUser(data.email?.smtpUser || '');
        setWaPhoneNumberId(data.whatsapp?.phoneNumberId || '');
        setWaBusinessAccountId(data.whatsapp?.businessAccountId || '');
      }
    } catch {}
  };

  const handleLogout = () => { removeToken(); router.push('/login'); };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/users/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: profile.name })
      });
      if (res.ok) { toast.success('Profile saved!'); fetchProfile(); }
      else toast.error('Failed to save profile');
    } catch { toast.error('Network error'); } finally { setSaving(false); }
  };

  const saveGeminiKey = async () => {
    if (!geminiKey.trim()) return toast.error('Please enter your Gemini API key');
    setSaving(true);
    try {
      const res = await fetch(`${API}/settings/ai`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ geminiApiKey: geminiKey })
      });
      const data = await res.json();
      if (res.ok) { toast.success('Gemini API key saved!'); setGeminiKey(''); fetchSettings(); }
      else toast.error(data.message || 'Failed to save key');
    } catch { toast.error('Network error'); } finally { setSaving(false); }
  };

  const saveWhatsApp = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/settings/whatsapp`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ waPhoneNumberId, waAccessToken, waBusinessAccountId })
      });
      if (res.ok) { toast.success('WhatsApp credentials saved!'); setWaAccessToken(''); fetchSettings(); }
      else toast.error('Failed to save WhatsApp credentials');
    } catch { toast.error('Network error'); } finally { setSaving(false); }
  };

  const testWhatsApp = async () => {
    if (!waTestPhone) return toast.error('Enter a phone number to test');
    setTesting(true);
    try {
      const res = await fetch(`${API}/settings/whatsapp/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ testPhone: waTestPhone })
      });
      const data = await res.json();
      if (data.success) { toast.success(data.message); fetchSettings(); }
      else toast.error(data.message);
    } catch { toast.error('Test failed'); } finally { setTesting(false); }
  };

  const saveEmail = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/settings/email`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          emailProvider,
          resendApiKey: resendApiKey || undefined,
          smtpHost: smtpHost || undefined,
          smtpPort: smtpPort ? parseInt(smtpPort) : undefined,
          smtpUser: smtpUser || undefined,
          smtpPass: smtpPass || undefined,
          gmailClientId: gmailClientId || undefined,
          gmailClientSecret: gmailClientSecret || undefined,
          gmailRefreshToken: gmailRefreshToken || undefined,
        })
      });
      if (res.ok) { 
        toast.success('Email configuration saved!'); 
        setResendApiKey(''); 
        setSmtpPass(''); 
        setGmailClientSecret('');
        setGmailRefreshToken('');
        fetchSettings(); 
      }
      else toast.error('Failed to save email config');
    } catch { toast.error('Network error'); } finally { setSaving(false); }
  };

  const testEmail = async () => {
    if (!testEmailAddr) return toast.error('Enter a test email address');
    setTesting(true);
    try {
      const res = await fetch(`${API}/settings/email/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ testEmail: testEmailAddr })
      });
      const data = await res.json();
      if (data.success) toast.success(data.message);
      else toast.error(data.message);
    } catch { toast.error('Test failed'); } finally { setTesting(false); }
  };

  const changePassword = async () => {
    if (newPwd !== confirmPwd) return toast.error('Passwords do not match');
    if (newPwd.length < 8) return toast.error('Password must be at least 8 characters');
    setSaving(true);
    try {
      const res = await fetch(`${API}/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: currentPwd, newPassword: newPwd })
      });
      const data = await res.json();
      if (res.ok) { toast.success('Password changed!'); setCurrentPwd(''); setNewPwd(''); setConfirmPwd(''); }
      else toast.error(data.message || 'Failed to change password');
    } catch { toast.error('Network error'); } finally { setSaving(false); }
  };

  const initials = profile.name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || '??';

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <header>
        <h1 className="text-2xl font-bold text-white dark:text-white tracking-tight uppercase">Settings</h1>
        <p className="text-[#b9cacb] mt-1 font-mono text-[11px] uppercase tracking-wider">
          Manage your account, API integrations and preferences
        </p>
      </header>

      <div className="flex gap-6">
        {/* Sidebar Nav */}
        <div className="glass-card p-3 w-52 shrink-0 h-fit">
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all mb-1 ${
                active === s.id
                  ? 'bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/20'
                  : 'text-[#b9cacb] hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <s.icon size={15} />
                {s.label}
              </span>
              {active === s.id && <ChevronRight size={12} />}
            </button>
          ))}
          <div className="mt-2 pt-2 border-t border-[#27272A]">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all"
            >
              <LogOut size={15} />
              Logout
            </button>
          </div>
        </div>

        {/* Content Panel */}
        <div className="glass-card p-6 flex-1">

          {/* ─── PROFILE ─── */}
          {active === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-sm font-black text-white uppercase tracking-widest border-b border-[#27272A] pb-4">Profile Settings</h2>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-xl bg-linear-to-br from-[#00f0ff]/30 to-[#bd00ff]/30 border border-[#00f0ff]/30 flex items-center justify-center text-[#00f0ff] text-xl font-bold shadow-[0_0_15px_rgba(0,240,255,0.2)]">
                  {initials}
                </div>
                <div>
                  <p className="font-bold text-white">{profile.name}</p>
                  <p className="text-[11px] text-[#00f0ff] font-mono uppercase">{profile.role}</p>
                  <p className="text-[10px] text-[#b9cacb] mt-0.5">{profile.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-[#b9cacb] uppercase tracking-widest block mb-1">Full Name</label>
                  <input value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-[#b9cacb] uppercase tracking-widest block mb-1">Email</label>
                  <input value={profile.email} disabled className="input-field opacity-50 cursor-not-allowed" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-[#b9cacb] uppercase tracking-widest block mb-1">Role</label>
                  <input value={profile.role} disabled className="input-field opacity-50 cursor-not-allowed" />
                </div>
              </div>
              <button onClick={saveProfile} disabled={saving} className="btn-primary flex items-center gap-2">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Save Profile
              </button>
            </div>
          )}

          {/* ─── AI CONFIGURATION ─── */}
          {active === 'ai' && (
            <div className="space-y-6">
              <h2 className="text-sm font-black text-white uppercase tracking-widest border-b border-[#27272A] pb-4">AI Configuration</h2>
              <div className="glass-card p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-white">Gemini API Key</p>
                  <p className="text-[11px] text-[#b9cacb] mt-0.5">
                    {settings?.hasGeminiKey ? `Active key ending in ${settings.geminiKeyLast4}` : 'No key configured — using system key (demo mode)'}
                  </p>
                </div>
                <StatusBadge connected={settings?.hasGeminiKey} />
              </div>
              <div>
                <label className="text-[10px] font-black text-[#b9cacb] uppercase tracking-widest block mb-1">Your Gemini API Key</label>
                <SecretInput value={geminiKey} onChange={setGeminiKey} placeholder="AIzaSy..." />
                <p className="text-[10px] text-[#b9cacb] mt-1.5 flex items-center gap-1">
                  Get your key at{' '}
                  <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-[#00f0ff] hover:underline flex items-center gap-0.5">
                    Google AI Studio <ExternalLink size={10} />
                  </a>
                </p>
              </div>
              <button onClick={saveGeminiKey} disabled={saving || !geminiKey.trim()} className="btn-primary flex items-center gap-2">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Save API Key
              </button>
            </div>
          )}

          {/* ─── WHATSAPP ─── */}
          {active === 'whatsapp' && (
            <div className="space-y-6">
              <h2 className="text-sm font-black text-white uppercase tracking-widest border-b border-[#27272A] pb-4">WhatsApp Integration</h2>
              <div className="glass-card p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-white">Meta Cloud API</p>
                  <p className="text-[11px] text-[#b9cacb] mt-0.5">
                    {settings?.whatsapp?.status === 'CONNECTED'
                      ? `Connected — Phone ID: ${settings.whatsapp.phoneNumberId}`
                      : 'Not configured'}
                  </p>
                </div>
                <StatusBadge connected={settings?.whatsapp?.status === 'CONNECTED'} />
              </div>
              <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl text-[11px] text-[#b9cacb]">
                Get your credentials from{' '}
                <a href="https://developers.facebook.com/apps" target="_blank" rel="noopener noreferrer" className="text-[#00f0ff] hover:underline inline-flex items-center gap-0.5">
                  Meta for Developers <ExternalLink size={10} />
                </a>
                {' '}→ Your App → WhatsApp → API Setup
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-[10px] font-black text-[#b9cacb] uppercase tracking-widest block mb-1">Phone Number ID</label>
                  <input value={waPhoneNumberId} onChange={e => setWaPhoneNumberId(e.target.value)} placeholder="123456789012345" className="input-field w-full" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-[#b9cacb] uppercase tracking-widest block mb-1">Permanent Access Token</label>
                  <SecretInput value={waAccessToken} onChange={setWaAccessToken} placeholder="EAA..." />
                </div>
                <div>
                  <label className="text-[10px] font-black text-[#b9cacb] uppercase tracking-widest block mb-1">Business Account ID (optional)</label>
                  <input value={waBusinessAccountId} onChange={e => setWaBusinessAccountId(e.target.value)} placeholder="987654321" className="input-field w-full" />
                </div>
              </div>
              <button onClick={saveWhatsApp} disabled={saving} className="btn-primary flex items-center gap-2">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Save Credentials
              </button>
              <div className="border-t border-[#27272A] pt-4">
                <p className="text-[11px] font-black text-white uppercase tracking-widest mb-3">Test Connection</p>
                <div className="flex gap-2">
                  <input value={waTestPhone} onChange={e => setWaTestPhone(e.target.value)} placeholder="+919876543210" className="input-field flex-1" />
                  <button onClick={testWhatsApp} disabled={testing || !waTestPhone} className="btn-secondary flex items-center gap-2 whitespace-nowrap">
                    {testing ? <Loader2 size={13} className="animate-spin" /> : <MessageSquare size={13} />}
                    Send Test
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ─── EMAIL ─── */}
          {active === 'email' && (
            <div className="space-y-6">
              <h2 className="text-sm font-black text-white uppercase tracking-widest border-b border-[#27272A] pb-4">Email Configuration</h2>
              <div className="glass-card p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-white">Email Provider: <span className="text-[#00f0ff]">{settings?.email?.provider || 'SMTP'}</span></p>
                  <p className="text-[11px] text-[#b9cacb] mt-0.5">{settings?.email?.hasResendKey || settings?.email?.hasSmtpPass ? 'Credentials saved' : 'Using demo Ethereal account'}</p>
                </div>
                <StatusBadge connected={settings?.email?.hasResendKey || settings?.email?.hasSmtpPass} />
              </div>
              <div>
                <label className="text-[10px] font-black text-[#b9cacb] uppercase tracking-widest block mb-2">Provider</label>
                <div className="flex gap-2">
                  {(['RESEND', 'SMTP', 'GMAIL_OAUTH'] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => setEmailProvider(p)}
                      className={`px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest border transition-all ${emailProvider === p ? 'bg-[#00f0ff]/10 text-[#00f0ff] border-[#00f0ff]/30' : 'text-[#b9cacb] border-[#27272A] hover:border-[#00f0ff]/20'}`}
                    >
                      {p.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
              {emailProvider === 'RESEND' && (
                <div>
                  <label className="text-[10px] font-black text-[#b9cacb] uppercase tracking-widest block mb-1">Resend API Key</label>
                  <SecretInput value={resendApiKey} onChange={setResendApiKey} placeholder="re_..." />
                  <p className="text-[10px] text-[#b9cacb] mt-1.5 flex items-center gap-1">
                    Get your key at <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-[#00f0ff] hover:underline inline-flex items-center gap-0.5">Resend.com <ExternalLink size={10} /></a>
                  </p>
                </div>
              )}
              {emailProvider === 'SMTP' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-[10px] font-black text-[#b9cacb] uppercase tracking-widest block mb-1">SMTP Host</label>
                    <input value={smtpHost} onChange={e => setSmtpHost(e.target.value)} placeholder="smtp.gmail.com" className="input-field w-full" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-[#b9cacb] uppercase tracking-widest block mb-1">Port</label>
                    <input value={smtpPort} onChange={e => setSmtpPort(e.target.value)} placeholder="587" className="input-field w-full" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-[#b9cacb] uppercase tracking-widest block mb-1">Username / Email</label>
                    <input value={smtpUser} onChange={e => setSmtpUser(e.target.value)} placeholder="you@gmail.com" className="input-field w-full" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-[#b9cacb] uppercase tracking-widest block mb-1">Password / App Password</label>
                    <SecretInput value={smtpPass} onChange={setSmtpPass} placeholder="••••••••" />
                  </div>
                </div>
              )}
              {emailProvider === 'GMAIL_OAUTH' && (
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl text-[11px] text-[#b9cacb] mb-2">
                    Gmail OAuth requires a Google Cloud Console project setup with the Gmail API enabled.
                    <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-[#00f0ff] hover:underline ml-1 inline-flex items-center gap-0.5">
                      Open Cloud Console <ExternalLink size={10} />
                    </a>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-[#b9cacb] uppercase tracking-widest block mb-1">Client ID</label>
                    <input value={gmailClientId} onChange={e => setGmailClientId(e.target.value)} placeholder="123456789-abc.apps.googleusercontent.com" className="input-field w-full" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-[#b9cacb] uppercase tracking-widest block mb-1">Client Secret</label>
                    <SecretInput value={gmailClientSecret} onChange={setGmailClientSecret} placeholder="GOCSPX-..." />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-[#b9cacb] uppercase tracking-widest block mb-1">Refresh Token</label>
                    <SecretInput value={gmailRefreshToken} onChange={setGmailRefreshToken} placeholder="1//04..." />
                  </div>
                </div>
              )}
              <button onClick={saveEmail} disabled={saving} className="btn-primary flex items-center gap-2">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Save Email Config
              </button>
              <div className="border-t border-[#27272A] pt-4">
                <p className="text-[11px] font-black text-white uppercase tracking-widest mb-3">Send Test Email</p>
                <div className="flex gap-2">
                  <input value={testEmailAddr} onChange={e => setTestEmailAddr(e.target.value)} placeholder="yourtest@email.com" className="input-field flex-1" />
                  <button onClick={testEmail} disabled={testing || !testEmailAddr} className="btn-secondary flex items-center gap-2 whitespace-nowrap">
                    {testing ? <Loader2 size={13} className="animate-spin" /> : <Mail size={13} />}
                    Send Test
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ─── NOTIFICATIONS ─── */}
          {active === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-sm font-black text-white uppercase tracking-widest border-b border-[#27272A] pb-4">Notification Preferences</h2>
              {[
                { label: 'New lead assigned to me', desc: 'Get notified when a lead is assigned to you' },
                { label: 'Sequence step executed', desc: 'Alert when an automated sequence step runs' },
                { label: 'AI insight available', desc: 'Alert when Gemini completes a company analysis' },
                { label: 'Deal stage changed', desc: 'When a deal moves to a new pipeline stage' },
              ].map(n => (
                <div key={n.label} className="flex items-center justify-between py-3 border-b border-[#27272A]">
                  <div>
                    <p className="text-sm font-bold text-white">{n.label}</p>
                    <p className="text-[11px] text-[#b9cacb]">{n.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-9 h-5 bg-[#27272A] peer-checked:bg-[#00f0ff]/80 rounded-full transition-all peer-checked:shadow-[0_0_8px_rgba(0,240,255,0.4)]"></div>
                    <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-all peer-checked:translate-x-4"></div>
                  </label>
                </div>
              ))}
            </div>
          )}

          {/* ─── SECURITY ─── */}
          {active === 'security' && (
            <div className="space-y-6">
              <h2 className="text-sm font-black text-white uppercase tracking-widest border-b border-[#27272A] pb-4">Security Settings</h2>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-[10px] font-black text-[#b9cacb] uppercase tracking-widest block mb-1">Current Password</label>
                  <SecretInput value={currentPwd} onChange={setCurrentPwd} placeholder="Enter current password..." />
                  <p className="text-[10px] text-[#b9cacb] mt-1">Click the eye icon to show/hide your password as you type</p>
                </div>
                <div>
                  <label className="text-[10px] font-black text-[#b9cacb] uppercase tracking-widest block mb-1">New Password</label>
                  <SecretInput value={newPwd} onChange={setNewPwd} placeholder="Min 8 characters..." />
                </div>
                <div>
                  <label className="text-[10px] font-black text-[#b9cacb] uppercase tracking-widest block mb-1">Confirm New Password</label>
                  <SecretInput value={confirmPwd} onChange={setConfirmPwd} placeholder="Repeat new password..." />
                  {confirmPwd && newPwd && confirmPwd !== newPwd && (
                    <p className="text-[10px] text-rose-400 mt-1 flex items-center gap-1">
                      <XCircle size={10} /> Passwords do not match
                    </p>
                  )}
                  {confirmPwd && newPwd && confirmPwd === newPwd && (
                    <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                      <CheckCircle2 size={10} /> Passwords match
                    </p>
                  )}
                </div>
              </div>
              <button onClick={changePassword} disabled={saving || !currentPwd || !newPwd || !confirmPwd || newPwd !== confirmPwd} className="btn-primary flex items-center gap-2">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Shield size={14} />}
                Change Password
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
