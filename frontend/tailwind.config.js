/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  corePlugins: {
    preflight: false, // 👈 importante: evita que o Tailwind resete o CSS do resto do dashboard
  },
  theme: {
    extend: {},
  },
  plugins: [],
};