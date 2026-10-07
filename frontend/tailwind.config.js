/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  corePlugins: {
    preflight: false, // 👈 importante: evita que o Tailwind resete o CSS do resto do dashboard
  },
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--theme-background) / <alpha-value>)",
        foreground: "rgb(var(--theme-foreground) / <alpha-value>)",
        card: "rgb(var(--theme-card) / <alpha-value>)",
        muted: "rgb(var(--theme-muted) / <alpha-value>)",
        "muted-foreground": "rgb(var(--theme-muted-foreground) / <alpha-value>)",
        border: "rgb(var(--theme-border) / <alpha-value>)",
        ring: "rgb(var(--theme-ring) / <alpha-value>)",
      },
    },
  },
  plugins: [],
};
