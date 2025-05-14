'use client';

import React from 'react';
import MusicPlayer from '@/components/MusicPlayer';
import Navigation from '@/components/Navigation';
import { QueueSidebar } from '@/components/QueueSidebar';
import { useQueueSidebar } from '@/context/QueueSidebarContext';

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isOpen, close } = useQueueSidebar();

  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      <div className="flex w-full" style={{ height: 'calc(100vh - 4rem - 5rem)' }}>
        <main className="flex-1 h-full">
          {children}
        </main>
        <QueueSidebar isOpen={isOpen} onClose={close} />
      </div>
      <MusicPlayer />
    </div>
  );
} 