"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/layouts/ThemeProvider";
import { PlayerProvider } from "@/store/PlayerContext";
import { AuthProvider } from "@/store/AuthContext";
import { WebSocketSessionProvider } from "@/store/WebSocketSessionContext";
import { useState } from "react";
import { Toaster } from "react-hot-toast";
import MusicPlayer from "../features/music/player/MusicPlayer";
import Navigation from "./Navigation";

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
            <WebSocketSessionProvider>
              <Navigation />
              {children}
              <MusicPlayer />
            </WebSocketSessionProvider>
          </PlayerProvider>
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: "var(--background)",
                color: "var(--foreground)",
                border: "1px solid var(--border)",
              },
            }}
          />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
