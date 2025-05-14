'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/ThemeProvider';
import { PlayerProvider } from '@/context/PlayerContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { QueueSidebarProvider } from '@/context/QueueSidebarContext';
import { QueueProvider } from '@/context/QueueContext';
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 30, // 30 minutes
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <PlayerProvider>
            <QueueProvider>
              <QueueSidebarProvider>
                {children}
              </QueueSidebarProvider>
            </QueueProvider>
          </PlayerProvider>
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'var(--background)',
                color: 'var(--foreground)',
                border: '1px solid var(--border)',
              },
            }}
          />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
} 