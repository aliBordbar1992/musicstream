import { iranYekan, inter } from "@/lib/fonts";
import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/layouts/Providers";

export const metadata: Metadata = {
  title: "MusicStream",
  description: "Listen to music together with friends",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${iranYekan.variable} ${inter.variable}`}>
      <body className={`${iranYekan.className} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
