import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["Lora", "Georgia", "serif"],
      },
      colors: {
        brand: {
          primary: "#2d3a6e",
          secondary: "#f2b5d4",
          accent: "#c9a96e",
        },
        warm: {
          50: "#faf8f5",
          100: "#f5f0e8",
          200: "#ede5d8",
          300: "#ddd2c0",
          400: "#c4b49e",
          500: "#a89478",
          600: "#8b7560",
          700: "#6e5c4c",
          800: "#4a3d33",
          900: "#2d251f",
        },
      },
    }
  },
  plugins: []
};

export default config;
