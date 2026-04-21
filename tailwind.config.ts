import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#EEF5EE",
          100: "#DCF1E1",
          200: "#B9E3C5",
          500: "#1E9E5B",
          600: "#127A4B",
          700: "#00A19B",
          800: "#0A5B3A",
          900: "#0A4B2F",
        },
        warn: {
          50: "#FAF1DC",
          100: "#FCEFCF",
          500: "#E5B94A",
          700: "#8A5A1F",
        },
        danger: {
          50: "#FBE6E8",
          100: "#FADDE1",
          500: "#E63946",
          700: "#D62839",
        },
        gold: {
          500: "#C9981C",
        },
        ink: {
          900: "#0B0B0B",
          700: "#404040",
          500: "#707070",
          400: "#8A8A8A",
          300: "#A5A5A5",
          200: "#D0D6D0",
          100: "#E3ECE4",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      fontSize: {
        eyebrow: ["12px", { lineHeight: "14px", letterSpacing: "0.08em" }],
        "body-sm": ["13px", "18px"],
        body: ["14px", "20px"],
        "body-md": ["15px", "22px"],
        h3: ["17px", "22px"],
        h2: ["20px", "24px"],
        h1: ["26px", "30px"],
        display: ["30px", "34px"],
        hero: ["34px", "38px"],
      },
      borderRadius: {
        card: "18px",
        "card-lg": "20px",
        pill: "9999px",
      },
      boxShadow: {
        card: "0 2px 6px rgba(0,0,0,0.04)",
        "card-hi": "0 4px 18px rgba(0,0,0,0.06)",
        fab: "0 6px 14px rgba(12,107,63,0.25)",
      },
      spacing: {
        screen: "16px",
        gap: "10px",
        section: "24px",
      },
    },
  },
  plugins: [],
};

export default config;
