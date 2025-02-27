import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'fingerprint-teal': '#81F7D8',
        'brand-red': '#FF5A5A',
        'brand-dark': '#111111',
        'brand-bg': '#f8fafc',
      },
      aspectRatio: {
        'ultrawide': '21/9',
      },
      height: {
        'screen-90': '90vh',
      },
      maxHeight: {
        'screen-90': '90vh',
      },
      backgroundImage: {
        'dot-pattern': "radial-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px)",
      },
      backgroundSize: {
        'dot-size': '24px 24px',
      },
      fontFamily: {
        'sans': ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
