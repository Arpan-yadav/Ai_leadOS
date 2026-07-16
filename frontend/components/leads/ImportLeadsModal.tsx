import React, { useState, useRef } from 'react';
import { X, UploadCloud, Webhook, CheckCircle2, FileJson, Copy, ArrowRight, Loader2 } from 'lucide-react';
import Papa from 'papaparse';
import { getToken } from '@/lib/auth';
import toast from 'react-hot-toast';

interface Props {
  onClose: () => void;
  onSuccess: (count: number) => void;
}

export default function ImportLeadsModal({ onClose, onSuccess }: Props) {
  const [activeTab, setActiveTab] = useState<'csv' | 'webhook'>('csv');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const webhookUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/webhooks/incoming-lead`;

  const copyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    toast.success('Webhook URL copied to clipboard');
  };

  const copyPayload = () => {
    const payload = `{
  "name": "John Doe",
  "email": "john@example.com",
  "company": "Acme Corp",
  "title": "CEO",
  "source": "META",
  "phone": "+123456789"
}`;
    navigator.clipboard.writeText(payload);
    toast.success('Payload copied to clipboard');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) return;

    setUploading(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const data = results.data.map((row: any) => ({
            name: row.name || row.Name || 'Unknown',
            email: row.email || row.Email,
            company: row.company || row.Company || 'Unknown',
            title: row.title || row.Title,
            phone: row.phone || row.Phone,
            source: (row.source || row.Source || 'CSV').toUpperCase()
          })).filter(lead => lead.email); // Must have email

          if (data.length === 0) {
            toast.error('No valid leads found. Check CSV format.');
            setUploading(false);
            return;
          }

          const token = getToken();
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/leads/bulk`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(data),
          });

          if (!res.ok) throw new Error('Upload failed');
          const responseData = await res.json();
          
          toast.success(`Successfully imported ${responseData.count} leads! AI is scoring them in the background.`);
          onSuccess(responseData.count);
        } catch (error) {
          console.error(error);
          toast.error('Failed to import leads.');
        } finally {
          setUploading(false);
        }
      },
      error: (error) => {
        console.error(error);
        toast.error('Failed to parse CSV file.');
        setUploading(false);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-[#111114] light:bg-white w-full max-w-2xl rounded-2xl border border-[#27272A] light:border-slate-200 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#27272A] light:border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#00f0ff] to-[#bd00ff] flex items-center justify-center">
              <UploadCloud size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white light:text-slate-900 uppercase tracking-widest">Import & Automate</h2>
              <p className="text-xs text-[#b9cacb] light:text-slate-500 font-mono">Bring leads into AI LeadOS</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#27272A] light:border-slate-200">
          <button 
            onClick={() => setActiveTab('csv')}
            className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'csv' ? 'border-[#00f0ff] text-[#00f0ff]' : 'border-transparent text-slate-400 hover:text-white light:hover:text-slate-800'}`}
          >
            <FileJson size={16} /> Bulk CSV Import
          </button>
          <button 
            onClick={() => setActiveTab('webhook')}
            className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'webhook' ? 'border-[#bd00ff] text-[#bd00ff]' : 'border-transparent text-slate-400 hover:text-white light:hover:text-slate-800'}`}
          >
            <Webhook size={16} /> Automated Webhooks
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'csv' && (
            <div className="space-y-6">
              <div 
                className="border-2 border-dashed border-[#27272A] hover:border-[#00f0ff]/50 light:border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-[#0A0A0C] light:bg-slate-50"
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  accept=".csv" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                <UploadCloud size={48} className="text-slate-400 mb-4" />
                <h3 className="text-lg font-bold text-white light:text-slate-900 mb-2">
                  {file ? file.name : 'Click to upload CSV'}
                </h3>
                <p className="text-sm text-slate-400">
                  Required columns: <span className="font-mono text-[#00f0ff]">name, email, company</span>
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Optional: title, phone, source
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button onClick={onClose} className="px-6 py-2 rounded-lg text-sm font-bold text-slate-400 hover:text-white transition-colors">
                  Cancel
                </button>
                <button 
                  onClick={handleUpload}
                  disabled={!file || uploading}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50"
                >
                  {uploading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                  Import Leads
                </button>
              </div>
            </div>
          )}

          {activeTab === 'webhook' && (
            <div className="space-y-6">
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg p-4 flex gap-3 text-sm">
                <CheckCircle2 size={20} className="shrink-0 mt-0.5" />
                <p>Connect tools like <b>Meta Ads</b>, <b>Zapier</b>, or <b>LinkedIn Forms</b> by sending an HTTP POST request to your unique webhook URL below.</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your Webhook URL</label>
                <div className="flex bg-[#0A0A0C] light:bg-slate-100 rounded-lg border border-[#27272A] light:border-slate-300 p-1">
                  <div className="flex-1 px-3 py-2 font-mono text-sm text-[#00f0ff] overflow-hidden text-ellipsis whitespace-nowrap">
                    {webhookUrl}
                  </div>
                  <button onClick={copyWebhook} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-md text-slate-300 transition-colors flex items-center gap-2">
                    <Copy size={14} /> Copy
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Expected JSON Payload</label>
                <div className="relative">
                  <pre className="bg-[#0A0A0C] light:bg-slate-100 rounded-lg border border-[#27272A] light:border-slate-300 p-4 font-mono text-sm text-amber-400 overflow-x-auto">
{`{
  "name": "John Doe",
  "email": "john@example.com",
  "company": "Acme Corp",
  "title": "CEO",
  "source": "META",
  "phone": "+123456789"
}`}
                  </pre>
                  <button onClick={copyPayload} className="absolute top-2 right-2 p-2 bg-white/5 hover:bg-white/10 rounded-md text-slate-300 transition-colors">
                    <Copy size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
