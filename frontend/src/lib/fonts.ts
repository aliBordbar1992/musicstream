import localFont from "next/font/local";
import { Inter } from "next/font/google";

// RTL font for Farsi text
export const iranYekan = localFont({
  src: [
    {
      path: "../../public/fonts/IRANYekanX-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/IRANYekanX-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-iran-yekan",
  display: "swap",
  preload: true,
});

// Latin font for English text
export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
