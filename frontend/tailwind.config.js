/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: '#050811',
          card: '#0a101f',
          border: '#1e293b',
          cyan: '#00f0ff',
          emerald: '#10b981',
          rose: '#ef4444',
          amber: '#f59e0b',
        }
      },
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
