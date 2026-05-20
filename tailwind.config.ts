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
        kitchen: {
          DEFAULT: "#5b8fad",
          muted: "#8aa4b8",
          ink: "#3d5266",
          bg: "#dce8f2",
          card: "#faf6ef",
          cream: "#f5efe3",
          border: "#b8cee0",
          blush: "#d4c4a8",
          sky: "#c5d9ea",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
        display: ['var(--font-display)', "Nunito", "sans-serif"],
      },
      boxShadow: {
        nord: "0 4px 20px -4px rgba(91, 143, 173, 0.18), 0 2px 8px -2px rgba(61, 82, 102, 0.08)",
        "nord-sm": "0 2px 10px -2px rgba(91, 143, 173, 0.15)",
      },
      borderRadius: {
        nord: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
