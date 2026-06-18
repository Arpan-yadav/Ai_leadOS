import React, { createContext, useContext, useState } from 'react';

interface ModalContextType {
  openLeadModal: () => void;
  closeLeadModal: () => void;
  isLeadModalOpen: boolean;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);

  const openLeadModal = () => setIsLeadModalOpen(true);
  const closeLeadModal = () => setIsLeadModalOpen(false);

  return (
    <ModalContext.Provider value={{ openLeadModal, closeLeadModal, isLeadModalOpen }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModals() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModals must be used within a ModalProvider');
  }
  return context;
}
