/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        studio: {
          asphalt: '#121316',
          charcoal: '#1A1D23',
          elevated: '#21252D',
          border: '#2A2F3A',
          maple: '#D97706',
          mapleDark: '#B45309',
          court: '#1D428A',
          steel: '#9CA3AF',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Barlow Condensed', 'Oswald', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
    },
  },
  plugins: [],
}
