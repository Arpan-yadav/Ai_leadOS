'use client';
import React, { useState, useEffect } from 'react';
import { Loader2, Plus, Trash2, Mail } from 'lucide-react';
import { getToken } from '@/lib/auth';
import toast from 'react-hot-toast';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function EmailSettings() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  
  // New account form state
  const [provider, setProvider] = useState<'RESEND' | 'SMTP' | 'GMAIL_OAUTH'>('SMTP');
  const [resendApiKey, setResendApiKey] = useState('');
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [dailyLimit, setDailyLimit] = useState(500);

  const token = getToken();

  const fetchAccounts = async () => {
    try {
      const res = await fetch(`${API}/settings/email-accounts`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setAccounts(await res.json());
    } catch {}
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const addAccount = async () => {
    setLoading(true);
    try {
      const payload: any = { provider, dailyLimit: Number(dailyLimit) };
      if (provider === 'RESEND') {
        if (!resendApiKey) throw new Error('API key required');
        payload.resendApiKey = resendApiKey;
      } else if (provider === 'SMTP') {
        if (!smtpHost || !smtpUser || !smtpPass) throw new Error('Missing SMTP credentials');
        payload.smtpHost = smtpHost;
        payload.smtpPort = Number(smtpPort);
        payload.smtpUser = smtpUser;
        payload.smtpPass = smtpPass;
      }
      
      const res = await fetch(`${API}/settings/email-accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        toast.success('Email account added!');
        setAdding(false);
        setResendApiKey(''); setSmtpHost(''); setSmtpUser(''); setSmtpPass('');
        fetchAccounts();
      } else {
        const err = await res.json();
        toast.error(err.message || 'Failed to add account');
      }
    } catch (e: any) {
      toast.error(e.message || 'Error adding account');
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async (id: string) => {
    try {
      const res = await fetch(`${API}/settings/email-accounts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Account deleted');
        fetchAccounts();
      }
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#27272A] pb-4">
        <h2 className="text-sm font-black text-white uppercase tracking-widest">Email Accounts Pool</h2>
        <button onClick={() => setAdding(!adding)} className="btn-secondary flex items-center gap-1 py-1 px-3 text-xs">
          {adding ? 'Cancel' : <><Plus size={14} /> Add Account</>}
        </button>
      </div>

      {adding && (
        <div className="glass-card p-4 space-y-4 animate-fade-in border border-[#00f0ff]/30">
          <h3 className="text-xs font-bold text-[#00f0ff] uppercase tracking-wider">New Email Account</h3>
          
          <div>
            <label className="text-[10px] font-black text-[#b9cacb] uppercase tracking-widest block mb-2">Provider</label>
            <div className="flex gap-2">
              {(['RESEND', 'SMTP', 'GMAIL_OAUTH'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setProvider(p)}
                  className={`px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest border transition-all ${provider === p ? 'bg-[#00f0ff]/10 text-[#00f0ff] border-[#00f0ff]/30' : 'text-[#b9cacb] border-[#27272A] hover:border-[#00f0ff]/20'}`}
                >
                  {p.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {provider === 'RESEND' && (
              <div className="col-span-2">
                <label className="text-[10px] font-black text-[#b9cacb] uppercase tracking-widest block mb-1">Resend API Key</label>
                <input type="password" value={resendApiKey} onChange={e => setResendApiKey(e.target.value)} placeholder="re_..." className="input-field w-full" />
              </div>
            )}

            {provider === 'SMTP' && (
              <>
                <div>
                  <label className="text-[10px] font-black text-[#b9cacb] uppercase tracking-widest block mb-1">SMTP Host</label>
                  <input value={smtpHost} onChange={e => setSmtpHost(e.target.value)} placeholder="smtp.gmail.com" className="input-field w-full" autoComplete="off" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-[#b9cacb] uppercase tracking-widest block mb-1">Port</label>
                  <input value={smtpPort} onChange={e => setSmtpPort(e.target.value)} placeholder="587" className="input-field w-full" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-[#b9cacb] uppercase tracking-widest block mb-1">Username / Email</label>
                  <input value={smtpUser} onChange={e => setSmtpUser(e.target.value)} placeholder="you@example.com" className="input-field w-full" autoComplete="off" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-[#b9cacb] uppercase tracking-widest block mb-1">Password</label>
                  <input type="password" value={smtpPass} onChange={e => setSmtpPass(e.target.value)} placeholder="••••••••" className="input-field w-full" />
                </div>
              </>
            )}

            {provider === 'GMAIL_OAUTH' && (
              <div className="col-span-2 text-xs text-amber-400 p-2 bg-amber-400/10 rounded">
                OAuth flow will be implemented in future phase. Please use SMTP with App Password for Gmail.
              </div>
            )}

            <div className="col-span-2">
              <label className="text-[10px] font-black text-[#b9cacb] uppercase tracking-widest block mb-1">Daily Sending Limit</label>
              <input type="number" value={dailyLimit} onChange={e => setDailyLimit(Number(e.target.value))} className="input-field w-full" />
              <p className="text-[9px] text-[#b9cacb] mt-1">AI Router will respect this limit before switching accounts.</p>
            </div>
          </div>

          <button onClick={addAccount} disabled={loading || (provider === 'GMAIL_OAUTH')} className="btn-primary w-full flex items-center justify-center gap-2 mt-4">
            {loading && <Loader2 size={14} className="animate-spin" />}
            Save Account
          </button>
        </div>
      )}

      <div className="space-y-3">
        {accounts.length === 0 ? (
          <div className="text-center p-8 border border-dashed border-[#27272A] rounded-xl">
            <Mail className="mx-auto text-[#27272A] mb-2" size={32} />
            <p className="text-sm text-[#b9cacb]">No email accounts added yet.</p>
            <p className="text-xs text-[#27272A] mt-1">Add multiple accounts to bypass strict sending limits.</p>
          </div>
        ) : (
          accounts.map(acc => (
            <div key={acc.id} className="glass-card p-4 flex items-center justify-between group">
              <div>
                <p className="text-sm font-bold text-white uppercase tracking-wider">{acc.provider}</p>
                <div className="text-xs text-[#b9cacb] mt-1 flex gap-4">
                  <span>{acc.smtpUser || 'API Key Auth'}</span>
                  <span>Quota: {acc.sentToday}/{acc.dailyLimit}</span>
                  <span className={acc.isActive ? 'text-emerald-400' : 'text-rose-400'}>{acc.isActive ? 'Active' : 'Disabled'}</span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-[#1a1a1a] h-1.5 rounded-full mt-2 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${acc.sentToday >= acc.dailyLimit ? 'bg-rose-500' : 'bg-[#00f0ff]'}`} 
                    style={{ width: `${Math.min(100, (acc.sentToday / acc.dailyLimit) * 100)}%` }} 
                  />
                </div>
              </div>
              <button onClick={() => deleteAccount(acc.id)} className="text-rose-500/50 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all p-2 rounded-lg hover:bg-rose-500/10">
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
