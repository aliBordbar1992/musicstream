import { Inter } from 'next/font/google';
import './globals.css';
import MusicPlayer from '@/components/MusicPlayer';
import Navigation from '@/components/Navigation';
import Providers from '@/components/Providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'MusicStream - Your Modern Music Platform',
  description: 'A modern music streaming platform built with Next.js and Go',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased`}>
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Navigation />
            <main className="flex-1 pt-16">
              {children}
            </main>
            <MusicPlayer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
