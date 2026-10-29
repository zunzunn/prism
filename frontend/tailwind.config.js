/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        creden: {
          bg: "#060709",
          surface: "#0d0f14",
          card: "#12151c",
          elevated: "#171c26",
          border: "#1f2633",
          borderLight: "#2a3445",
          primary: "#10b981", // Emerald AICTE verification green
          primaryHover: "#059669",
          primaryMuted: "rgba(16, 185, 129, 0.12)",
          accent: "#38bdf8", // Subtle cyan highlight
          warning: "#f59e0b",
          danger: "#ef4444",
          text: "#f3f4f6",
          textMuted: "#9ca3af",
          textDim: "#6b7280",
        },
        border: "hsl(var(--border, 217 19% 18%))",
        background: "hsl(var(--background, 224 71% 3%))",
        foreground: "hsl(var(--foreground, 210 20% 98%))",
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "Fira Code",
          "ui-monospace",
          "SFMono-Regular",
          "monospace",
        ],
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.35)",
        card: "0 4px 20px -2px rgba(0, 0, 0, 0.5)",
        glow: "0 0 15px -3px rgba(16, 185, 129, 0.15)",
      },
    },
  },
  plugins: [],
};
