import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        fail: {
          DEFAULT: "#ff4d4d",
          muted: "#ff6b35",
          bg: "#0a0a0a",
          card: "#141414",
          border: "#2a2a2a",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
        rock: ['var(--font-rock)', '"RocknRoll One"', "sans-serif"],
        jagged: ['var(--font-jagged)', '"Slackside One"', "sans-serif"],
        display: ['var(--font-jagged)', '"Slackside One"', '"RocknRoll One"', "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
