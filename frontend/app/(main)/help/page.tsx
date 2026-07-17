'use client';
import React, { useState } from 'react';
import { 
  HelpCircle, BookOpen, MessageSquare, ExternalLink, 
  Search, ChevronDown, ChevronUp, Send, FileText, 
  Zap, Code, Shield
} from 'lucide-react';
import toast from 'react-hot-toast';

import useSWR from 'swr';
import apiClient from '@/lib/apiClient';

const GUIDES = [
  {
    title: "Setting up AI Sequences",
    icon: Zap,
    color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    desc: "Learn how to build multi-channel outreach campaigns using AI-generated personalization.",
    link: "#"
  },
  {
    title: "Webhook Integrations",
    icon: Code,
    color: "text-[#00f0ff] bg-[#00f0ff]/10 border-[#00f0ff]/20",
    desc: "Connect AI_LeadOS with Zapier, Make.com, or your own backend using Webhooks.",
    link: "#"
  },
  {
    title: "Roles & Security",
    icon: Shield,
    color: "text-[#ff007a] bg-[#ff007a]/10 border-[#ff007a]/20",
    desc: "A comprehensive guide on managing granular permissions and tenant data isolation.",
    link: "#"
  }
];

export default function HelpCenterPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const fetchFaqs = async () => {
    const res = await apiClient.get('/support/faqs');
    return res.data;
  };

  const { data: faqs = [], isLoading: isLoadingFaqs } = useSWR('/support/faqs', fetchFaqs);

  const filteredFaqs = faqs.filter((f: any) => 
    f.question.toLowerCase().includes(search.toLowerCase()) || 
    f.answer.toLowerCase().includes(search.toLowerCase())
  );

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return toast.error('Please fill in all fields');
    
    setSending(true);
    try {
      await apiClient.post('/support/ticket', { subject, message });
      toast.success('Ticket submitted successfully! We will get back to you soon.');
      setSubject('');
      setMessage('');
    } catch (error) {
      toast.error('Failed to submit ticket. Please try again later.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-5xl mx-auto">
      <header className="flex flex-col items-center text-center py-12 px-4 rounded-3xl bg-linear-to-b from-[#0A0A0C] to-black border border-[#27272A] relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#ff007a] opacity-5 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 relative z-10">
          <HelpCircle size={32} className="text-[#00f0ff]" />
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight uppercase relative z-10">
          How can we help you today?
        </h1>
        <p className="text-[#b9cacb] mt-2 font-mono text-xs uppercase tracking-wider relative z-10">
          Search our knowledge base or contact support
        </p>
        
        <div className="relative mt-8 w-full max-w-lg z-10">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b9cacb]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search FAQs and guides..."
            className="w-full bg-[#111113] border border-[#27272A] rounded-xl py-3 pl-12 pr-4 text-sm text-white placeholder:text-[#4A4A4A] focus:outline-hidden focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] transition-all shadow-xl"
          />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex-1 min-w-[300px]">
            <div className="glass-card rounded-[24px] border border-slate-200 dark:border-[#27272A] p-6 lg:p-8">
              <div className="flex items-center gap-2 mb-6 text-sm font-bold uppercase tracking-wider font-display text-[#00f0ff]">
                <MessageSquare size={16} />
                Frequently Asked Questions
              </div>

              {isLoadingFaqs ? (
                <div className="animate-pulse space-y-4">
                  {[1,2,3].map(i => (
                    <div key={i} className="h-16 bg-slate-100 dark:bg-[#16161D] rounded-xl" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredFaqs.map((faq: any, i: number) => {
                    const isOpen = activeFaq === i;
                    return (
                      <div 
                        key={i} 
                        className={`border rounded-xl transition-colors duration-300 ${isOpen ? 'bg-slate-50 dark:bg-[#16161D] border-[#00f0ff]/30' : 'border-slate-100 dark:border-[#27272A] hover:border-slate-200 dark:hover:border-[#3f3f46]'}`}
                      >
                        <button 
                          onClick={() => setActiveFaq(isOpen ? null : i)}
                          className="w-full flex items-center justify-between p-4 text-left"
                        >
                          <span className="font-bold text-slate-800 dark:text-[#e5e1e4] pr-4">{faq.question}</span>
                          {isOpen ? <ChevronUp size={18} className="text-slate-400 shrink-0" /> : <ChevronDown size={18} className="text-slate-400 shrink-0" />}
                        </button>
                        
                        {isOpen && (
                          <div className="px-4 pb-4 text-sm text-slate-500 dark:text-[#b9cacb] leading-relaxed">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Quick Guides */}
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-widest mb-4 mt-8 flex items-center gap-2">
              <BookOpen size={16} className="text-[#bd00ff]" />
              Essential Guides
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {GUIDES.map((guide, i) => {
                const Icon = guide.icon;
                return (
                  <div key={i} className="glass-card p-5 group cursor-pointer hover:border-[#00f0ff]/30 transition-all flex flex-col h-full">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border mb-4 ${guide.color}`}>
                      <Icon size={18} />
                    </div>
                    <h3 className="font-bold text-white text-sm mb-2 group-hover:text-[#00f0ff] transition-colors">{guide.title}</h3>
                    <p className="text-[10px] text-[#b9cacb] leading-relaxed grow">{guide.desc}</p>
                    <div className="mt-4 pt-4 border-t border-[#27272A] flex items-center justify-between text-xs text-[#b9cacb] group-hover:text-[#00f0ff]">
                      Read Guide <ExternalLink size={12} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Support Ticket Form */}
          <div className="glass-card p-6">
            <h2 className="text-sm font-black text-white uppercase tracking-widest mb-2 flex items-center gap-2">
              <FileText size={16} className="text-[#ff007a]" />
              Submit a Ticket
            </h2>
            <p className="text-[10px] text-[#b9cacb] mb-6">Need technical help? Our support team typically responds within 2 hours.</p>
            
            <form onSubmit={handleTicketSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-[#b9cacb] uppercase tracking-widest mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="What do you need help with?"
                  className="input-field w-full text-xs"
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-black text-[#b9cacb] uppercase tracking-widest mb-1">Message</label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Describe your issue in detail..."
                  className="input-field w-full text-xs min-h-[120px] resize-y"
                />
              </div>
              
              <button 
                type="submit" 
                disabled={sending}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {sending ? (
                  <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full border-2 border-white/20 border-t-white animate-spin"/> Sending...</span>
                ) : (
                  <span className="flex items-center gap-2">Submit Ticket <Send size={14} /></span>
                )}
              </button>
            </form>
          </div>
          
          <div className="glass-card p-6 bg-linear-to-br from-[#00f0ff]/5 to-transparent border-[#00f0ff]/20">
             <h3 className="text-sm font-black text-white uppercase tracking-widest mb-2">Enterprise Support</h3>
             <p className="text-xs text-[#b9cacb] leading-relaxed mb-4">
               Supreme Admin users get priority support via dedicated Slack channels and phone access.
             </p>
             <button className="text-[10px] font-bold text-[#00f0ff] uppercase tracking-widest hover:underline">
               Upgrade to Priority
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
