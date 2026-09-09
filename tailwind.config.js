/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        unison: {
          50: '#EAF3FD',
          100: '#D3E7FB',
          200: '#A7CFF7',
          300: '#7BB7F3',
          400: '#4F9FEF',
          500: '#208AEF',
          600: '#0B63C5',
          700: '#094C99',
          800: '#07386E',
          900: '#052646',
        },
        gold: {
          400: '#F6C36B',
          500: '#F2A93B',
          600: '#D98E1F',
        },
        // 👇 Nuevo: paleta exacta del diseño de Web.rar, solo para el dashboard
        admin: {
          primary: '#003366',
          primaryLight: '#E8F0FE',
          accent: '#E6A100',
          bg: '#F4F6F9',
          card: '#FFFFFF',
          text: '#2C3E50',
          muted: '#7F8C8D',
          border: '#E2E8F0',
        },
        reportStatus: {
          lost: '#D9534F',
          found: '#2EC4B6',
          pending: '#FF9F1C',
          verified: '#2BA84A',
        },
      },
    },
  },
  plugins: [],
}