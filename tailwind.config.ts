import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          50: "#FAF8F5",
          100: "#F5F2EB",
          200: "#EBE6DD",
        },
        stone: {
          border: "#E7E5E4",
          subtle: "#F5F5F4",
          muted: "#78716C",
        },
        ink: {
          DEFAULT: "#1C1917",
          light: "#44403C",
          faint: "#A8A29E",
        },
        calm: {
          green: "#15803D",
          greenBg: "#DCFCE7",
          greenBorder: "#86EFAC",
          amber: "#B45309",
          amberBg: "#FEF3C7",
          amberBorder: "#FDE68A",
          indigo: "#3730A3",
          indigoBg: "#EEF2FF",
          indigoBorder: "#C7D2FE",
        },
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "Liberation Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
