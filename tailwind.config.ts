import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#1f2925",
        cream: "#f7f3ea",
        sage: {
          50: "#f2f7f3",
          100: "#e2eee5",
          500: "#4f7b60",
          600: "#3e674e",
          700: "#31513e",
          900: "#1d3226"
        },
        terracotta: {
          100: "#f8e4d8",
          500: "#c96f45",
          600: "#ae5934"
        }
      },
      boxShadow: {
        card: "0 20px 60px -28px rgb(33 52 42 / 0.35)",
      },
      keyframes: {
        "check-in": {
          "0%": { opacity: "0", transform: "scale(0.65)" },
          "70%": { transform: "scale(1.1)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "spin-soft": {
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "check-in": "check-in 420ms ease-out both",
        "spin-soft": "spin-soft 750ms linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
