'use client';
import React, { useState, useEffect } from 'react';
import { Loader2, Plus, Trash2, MessageSquare } from 'lucide-react';
import { getToken } from '@/lib/auth';
import toast from 'react-hot-toast';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function WhatsAppSettings() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  
  // New account form state
  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [businessAccountId, setBusinessAccountId] = useState('');

  const token = getToken();

  const fetchAccounts = async () => {
    try {
      const res = await fetch(`${API}/settings/whatsapp-accounts`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setAccounts(await res.json());
    } catch {}
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const addAccount = async () => {
    if (!phoneNumberId || !accessToken) return toast.error('Phone ID and Token are required');
    
    setLoading(true);
    try {
      const res = await fetch(`${API}/settings/whatsapp-accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          waPhoneNumberId: phoneNumberId,
          waAccessToken: accessToken,
          waBusinessAccountId: businessAccountId || undefined,
        })
      });
      
      if (res.ok) {
        toast.success('WhatsApp account added!');
        setAdding(false);
        setPhoneNumberId(''); setAccessToken(''); setBusinessAccountId('');
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
      const res = await fetch(`${API}/settings/whatsapp-accounts/${id}`, {
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
        <h2 className="text-sm font-black text-white uppercase tracking-widest">WhatsApp Accounts</h2>
        <button onClick={() => setAdding(!adding)} className="btn-secondary flex items-center gap-1 py-1 px-3 text-xs">
          {adding ? 'Cancel' : <><Plus size={14} /> Add Account</>}
        </button>
      </div>

      {adding && (
        <div className="glass-card p-4 space-y-4 animate-fade-in border border-[#00f0ff]/30">
          <h3 className="text-xs font-bold text-[#00f0ff] uppercase tracking-wider">New WhatsApp Account</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-[#b9cacb] uppercase tracking-widest block mb-1">Phone Number ID</label>
              <input value={phoneNumberId} onChange={e => setPhoneNumberId(e.target.value)} placeholder="1029384756..." className="input-field w-full" />
            </div>
            <div>
              <label className="text-[10px] font-black text-[#b9cacb] uppercase tracking-widest block mb-1">Permanent Access Token</label>
              <input type="password" value={accessToken} onChange={e => setAccessToken(e.target.value)} placeholder="EAA..." className="input-field w-full" />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] font-black text-[#b9cacb] uppercase tracking-widest block mb-1">Business Account ID (optional)</label>
              <input value={businessAccountId} onChange={e => setBusinessAccountId(e.target.value)} placeholder="1234567890" className="input-field w-full" />
            </div>
          </div>

          <button onClick={addAccount} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-4">
            {loading && <Loader2 size={14} className="animate-spin" />}
            Save Account
          </button>
        </div>
      )}

      <div className="space-y-3">
        {accounts.length === 0 ? (
          <div className="text-center p-8 border border-dashed border-[#27272A] rounded-xl">
            <MessageSquare className="mx-auto text-[#27272A] mb-2" size={32} />
            <p className="text-sm text-[#b9cacb]">No WhatsApp accounts added yet.</p>
          </div>
        ) : (
          accounts.map(acc => (
            <div key={acc.id} className="glass-card p-4 flex items-center justify-between group">
              <div>
                <p className="text-sm font-bold text-white uppercase tracking-wider">Meta Cloud API</p>
                <div className="text-xs text-[#b9cacb] mt-1 flex gap-4">
                  <span>ID: {acc.waPhoneNumberId}</span>
                  <span className={acc.isActive ? 'text-emerald-400' : 'text-rose-400'}>{acc.isActive ? 'Active' : 'Disabled'}</span>
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
