import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#172033",
        wine: {
          50: "#fff6f8",
          100: "#f7dce5",
          500: "#7B1E3A",
          700: "#5d172d",
          900: "#4A0F24"
        },
        champagne: {
          50: "#FFF6E8",
          100: "#F7E7CE",
          300: "#E8D0A8",
          500: "#C8A96A"
        },
        "soft-champagne": "#FFF6E8",
        "cream-bg": "#FAF4EA",
        "gold-muted": "#C8A96A",
        clinical: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#2563eb",
          700: "#1d4ed8",
          900: "#1e3a8a"
        }
      },
      boxShadow: {
        soft: "0 16px 40px rgba(74, 15, 36, 0.10)",
        premium: "0 22px 60px rgba(74, 15, 36, 0.16)"
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" }
        }
      },
      animation: {
        "fade-up": "fade-up 520ms ease-out both",
        "fade-in": "fade-in 420ms ease-out both",
        shimmer: "shimmer 1.6s infinite"
      }
    }
  },
  plugins: []
};

export default config;
