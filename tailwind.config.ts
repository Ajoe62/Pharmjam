import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#00D4AA",
          50: "#E6FAF6",
          100: "#B3F0E6",
          200: "#80E6D6",
          300: "#4DDCC6",
          400: "#1AD2B6",
          500: "#00D4AA",
          600: "#00B094",
          700: "#008C7E",
          800: "#006868",
          900: "#004452",
        },
        secondary: {
          DEFAULT: "#2D9CDB",
          50: "#E8F4FD",
          100: "#C4E1F9",
          200: "#9FCEF5",
          300: "#7BBBF1",
          400: "#56A8ED",
          500: "#2D9CDB",
          600: "#2080C7",
          700: "#1A64A3",
          800: "#13487F",
          900: "#0D2C5B",
        },
        accent: {
          DEFAULT: "#27AE60",
          50: "#E8F8F0",
          100: "#C4EDD6",
          200: "#A0E2BC",
          300: "#7CD7A2",
          400: "#58CC88",
          500: "#27AE60",
          600: "#1F9B50",
          700: "#178840",
          800: "#0F7530",
          900: "#076220",
        },
        destructive: {
          DEFAULT: "#EB5757",
          50: "#FDF2F2",
          100: "#F9D9D9",
          200: "#F5C0C0",
          300: "#F1A7A7",
          400: "#ED8E8E",
          500: "#EB5757",
          600: "#E63946",
          700: "#D32F2F",
          800: "#C62828",
          900: "#B71C1C",
        },
        gray: {
          50: "#F8F8F8",
          100: "#F5F5F5",
          200: "#E5E5E5",
          300: "#D4D4D4",
          400: "#A0A0A0",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
        },
      },
      fontFamily: {
        // React Native uses different font naming
        sans: ["System"],
        mono: ["Courier"],
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;
