import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        pixel: ["var(--font-pixel)", "monospace"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      colors: {
        background: "#F4F1EA",
        surface: "#FFFFFF",
        arcade: {
          bg: "#F4F1EA",
          ink: "#18181B",
          indigo: "#4F46E5",
          coin: "#F59E0B",
          mint: "#10B981",
          heart: "#EF4444",
          panel: "#FFFFFF",
        },
        primary: {
          50: "#EEF2FF",
          100: "#E0E7FF",
          500: "#4F46E5",
          600: "#4338CA",
          700: "#3730A3",
        },
      },
      boxShadow: {
        "pixel-xs": "1px 1px 0px 0px #18181B",
        "pixel-sm": "2px 2px 0px 0px #18181B",
        pixel: "4px 4px 0px 0px #18181B",
        "pixel-lg": "6px 6px 0px 0px #18181B",
        "pixel-indigo": "4px 4px 0px 0px #312E81",
        "pixel-amber": "4px 4px 0px 0px #78350F",
        "pixel-emerald": "4px 4px 0px 0px #064E3B",
        "pixel-inset": "inset 2px 2px 0px 0px rgba(24,24,27,0.15)",
      },
    },
  },
  plugins: [],
};

export default config;

