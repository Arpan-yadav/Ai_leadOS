import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { cn } from '../../lib/utils';
import { ModalProvider, useModals } from '../../contexts/ModalContext';
import Modal from '../Modal';
import LeadForm from '../LeadForm';

function LayoutContent() {
  const [collapsed, setCollapsed] = useState(false);
  const { isLeadModalOpen, closeLeadModal } = useModals();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300",
        collapsed ? "ml-16" : "ml-0 lg:ml-[240px]"
      )}>
        <Header collapsed={collapsed} />
        <main className="p-6 mt-14 max-w-[1600px] mx-auto w-full">
          <Outlet />
        </main>
      </div>

      <Modal 
        isOpen={isLeadModalOpen} 
        onClose={closeLeadModal} 
        title="Create New Enterprise Lead"
      >
        <LeadForm 
          onSubmit={() => closeLeadModal()} 
          onCancel={closeLeadModal} 
        />
      </Modal>
    </div>
  );
}

export default function Layout() {
  return (
    <ModalProvider>
      <LayoutContent />
    </ModalProvider>
  );
}
