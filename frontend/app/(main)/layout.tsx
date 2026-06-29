import React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
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
