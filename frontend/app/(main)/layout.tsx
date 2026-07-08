'use client';
import React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { useTheme } from 'next-themes';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();

  return (
    <div className={`min-h-screen flex overflow-hidden transition-colors duration-300 ${resolvedTheme === 'light' ? 'bg-[#f8f9fb]' : 'bg-[#0A0A0C]'}`}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-screen">
        <TopBar />
        <main className="p-6 overflow-y-auto flex-1 w-full max-w-[1600px] mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
