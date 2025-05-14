"use client";

import React, { createContext, useContext, useState } from 'react';

interface QueueSidebarContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const QueueSidebarContext = createContext<QueueSidebarContextType | undefined>(undefined);

export function QueueSidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen(prev => !prev);

  return (
    <QueueSidebarContext.Provider value={{ isOpen, open, close, toggle }}>
      {children}
    </QueueSidebarContext.Provider>
  );
}

export function useQueueSidebar() {
  const context = useContext(QueueSidebarContext);
  if (context === undefined) {
    throw new Error('useQueueSidebar must be used within a QueueSidebarProvider');
  }
  return context;
} 