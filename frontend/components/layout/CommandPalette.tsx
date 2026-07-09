'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Command, Users, LayoutGrid, Workflow, Settings, Activity } from 'lucide-react'

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const router = useRouter()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (!isOpen) return null

  const items = [
    { label: 'Leads Universe', path: '/leads', icon: <Users size={14} /> },
    { label: 'Sales Pipeline', path: '/pipeline', icon: <LayoutGrid size={14} /> },
    { label: 'Outreach Sequences', path: '/sequences', icon: <Workflow size={14} /> },
    { label: 'Analytics Dashboard', path: '/analytics', icon: <Activity size={14} /> },
    { label: 'Settings', path: '/settings', icon: <Settings size={14} /> },
  ]

  const filteredItems = items.filter(item => item.label.toLowerCase().includes(search.toLowerCase()))

  const handleSelect = (path: string) => {
    setIsOpen(false)
    setSearch('')
    router.push(path)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-xl glass-panel overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)] animate-fade-in border-[#27272A] light:border-slate-300 flex flex-col">
        
        <div className="flex items-center px-4 py-3 border-b border-white/10 light:border-slate-200">
          <Search size={18} className="text-[#00f0ff] shrink-0" />
          <input 
            autoFocus
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="What are you looking for?" 
            className="flex-1 bg-transparent border-none outline-none text-white light:text-slate-900 px-4 text-lg placeholder:text-slate-500"
          />
          <div className="flex items-center gap-1 text-[10px] font-bold border border-white/10 light:border-slate-300 rounded px-1.5 py-0.5 text-slate-400 bg-black/20 light:bg-slate-100 uppercase">
            ESC
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {filteredItems.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-sm">No results found for "{search}"</div>
          ) : (
            filteredItems.map((item, idx) => (
              <button 
                key={idx}
                onClick={() => handleSelect(item.path)}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 light:hover:bg-slate-100 transition-colors group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-black/20 light:bg-white text-slate-400 group-hover:text-[#00f0ff] transition-colors shadow-sm">
                    {item.icon}
                  </div>
                  <span className="font-bold text-sm text-slate-300 light:text-slate-700 group-hover:text-white light:group-hover:text-slate-900 transition-colors">
                    {item.label}
                  </span>
                </div>
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Jump</span>
              </button>
            ))
          )}
        </div>
        
        <div className="px-4 py-2 border-t border-white/5 light:border-slate-100 bg-black/20 light:bg-slate-50/50 flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          <span>Search or jump to...</span>
          <span className="flex gap-1 items-center"><Command size={10} /> K to reopen</span>
        </div>
      </div>
    </div>
  )
}
