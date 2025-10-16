import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#4a5fc1",
          secondary: "#f2b5d4"
        }
      }
    }
  },
  plugins: []
};

export default config;
