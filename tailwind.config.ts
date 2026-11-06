import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        cozy: {
          primary: "#72A4F2",       // Soft sky blue
          "primary-60": "#9CBDF5",
          "primary-70": "#BED0F7",
          ink: "#202020",          // Deep charcoal text & border
          cream: "#F4EFE7",        // Warm cream page background
          "cream-light": "#F9F6F1",// neutral-20
          "cream-border": "#D8D0C4",// neutral-80
          surface: "#FFFFFF",
          error: "#E35A4F",
        },
      },
      fontFamily: {
        serif: ["Georgia", "serif"],
        sans: ["'DM Sans'", "Nunito", "-apple-system", "sans-serif"],
      },
      borderRadius: {
        sm: "10px",
        md: "24px",
        lg: "32px",
        xl: "48px",
      },
    },
  },
  plugins: [],
};

export default config;
