/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import LeadList from './pages/LeadList';
import Pipeline from './pages/Pipeline';
import AIIntelligence from './pages/AIIntelligence';
import AutomationBuilder from './pages/AutomationBuilder';
import Communications from './pages/Communications';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Auth from './pages/Auth';
import Landing from './pages/Landing';

type ViewState = 'landing' | 'auth' | 'app';

export default function App() {
  const [view, setView] = useState<ViewState>('landing');

  if (view === 'landing') {
    return <Landing onLogin={() => setView('auth')} onRegister={() => setView('auth')} />;
  }

  if (view === 'auth') {
    return <Auth onLogin={() => setView('app')} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="leads" element={<LeadList />} />
          <Route path="pipeline" element={<Pipeline />} />
          <Route path="ai-intelligence" element={<AIIntelligence />} />
          <Route path="automations" element={<AutomationBuilder />} />
          <Route path="communications" element={<Communications />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
          <Route path="tasks" element={<Navigate to="/" replace />} /> {/* Placeholder to Tasks */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

