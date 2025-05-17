import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import MusicPlayer from "@/components/MusicPlayer";

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
        <Providers>
          {children}
          <MusicPlayer />
        </Providers>
      </body>
    </html>
  );
}
