import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#eef6ff",
          100: "#d9ebff",
          500: "#2463eb",
          700: "#123a82",
          900: "#071b3a",
          950: "#041126"
        },
        success: "#11a36a",
        danger: "#dc2626",
        ink: "#172033"
      },
      fontFamily: {
        sans: ["Aptos", "Montserrat", "Segoe UI", "sans-serif"]
      },
      boxShadow: {
        soft: "0 18px 60px rgba(4, 17, 38, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;
