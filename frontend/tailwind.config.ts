import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-inter)"],
        iranYekan: ["var(--font-iran-yekan)"],
        vazirmatn: ["var(--font-vazirmatn)"],
        mono: ["JetBrains Mono", "monospace"],
      },
      fontSize: {
        // Adjust base font sizes for IRANYekan
        "iran-xs": [
          "0.75rem",
          { lineHeight: "1rem", letterSpacing: "-0.01em" },
        ],
        "iran-sm": [
          "0.875rem",
          { lineHeight: "1.25rem", letterSpacing: "-0.01em" },
        ],
        "iran-base": [
          "0.9375rem",
          { lineHeight: "1.5rem", letterSpacing: "-0.01em" },
        ],
        "iran-lg": [
          "1rem",
          { lineHeight: "1.75rem", letterSpacing: "-0.01em" },
        ],
        "iran-xl": [
          "1.125rem",
          { lineHeight: "1.75rem", letterSpacing: "-0.01em" },
        ],
        "iran-2xl": [
          "1.25rem",
          { lineHeight: "2rem", letterSpacing: "-0.01em" },
        ],
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out",
        "fade-out": "fade-out 0.5s ease-in",
        "slide-in": "slide-in 0.5s ease-out",
        "slide-out": "slide-out 0.5s ease-in",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-out": {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        "slide-in": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "slide-out": {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(100%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
