import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: "var(--bg-base)",
        "base-alt": "var(--bg-alt)",
        surface: "var(--surface)",
        "surface-hover": "var(--surface-hover)",
        subtle: "var(--border)",
        body: "var(--text-body)",
        muted: "var(--text-muted)",
        placeholder: "var(--text-placeholder)",
        primary: {
          DEFAULT: "#6366f1",
          light: "#8b5cf6",
        },
        accent: "#22d3ee",
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      backgroundImage: {
        "gradient-brand":
          "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #22d3ee 100%)",
      },
      boxShadow: {
        glow: "0 8px 30px rgba(99,102,241,0.35)",
        "glow-lg": "0 12px 40px rgba(139,92,246,0.45)",
        card: "0 20px 60px rgba(0,0,0,0.45)",
      },
      borderRadius: {
        xl: "18px",
      },
      animation: {
        float: "float 14s ease-in-out infinite",
        "float-slow": "float 18s ease-in-out infinite reverse",
        pulse: "pulse 1.6s ease-in-out infinite",
        "blink-caret": "blink 0.8s step-end infinite",
        bounce: "bounce 1.8s infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translate(0,0) scale(1)" },
          "50%": { transform: "translate(40px,-30px) scale(1.08)" },
        },
        pulse: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(34,197,94,0.6)" },
          "50%": { boxShadow: "0 0 0 7px rgba(34,197,94,0)" },
        },
        blink: {
          "50%": { opacity: "0" },
        },
        bounce: {
          "0%, 100%": { transform: "translate(-50%,0)" },
          "50%": { transform: "translate(-50%,8px)" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;

