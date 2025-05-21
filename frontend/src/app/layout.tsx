import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/layouts/Providers";
import MusicPlayer from "@/components/features/music/MusicPlayer";
import Navigation from "@/components/layouts/Navigation";
import { AuthProvider } from "@/store/AuthContext";
import { PlayerProvider } from "@/store/PlayerContext";
import { WebSocketSessionProvider } from "@/store/WebSocketSessionContext";
import { QueueProvider } from "@/store/QueueContext";
import { QueueSidebarProvider } from "@/store/QueueSidebarContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "MusicStream - Your Modern Music Platform",
  description: "A modern music streaming platform built with Next.js and Go",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} min-h-screen bg-background text-foreground antialiased`}
      >
        <AuthProvider>
          <PlayerProvider>
            <WebSocketSessionProvider>
              <QueueProvider>
                <QueueSidebarProvider>
                  <Navigation />
                  <Providers>
                    {children}
                    <MusicPlayer />
                  </Providers>
                </QueueSidebarProvider>
              </QueueProvider>
            </WebSocketSessionProvider>
          </PlayerProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
