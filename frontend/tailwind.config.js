/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: { 50: '#f0f4f8', 100: '#d9e2ec', 200: '#bcccdc', 300: '#9fb3c8', 400: '#829ab1', 500: '#627d98', 600: '#486581', 700: '#334e68', 800: '#243b53', 900: '#0D1B2A', DEFAULT: '#0D1B2A' },
        mint: { 50: '#f0fdfa', 100: '#ccfbf1', 200: '#99f6e4', 300: '#5eead4', 400: '#2DD4BF', 500: '#14b8a6', 600: '#0d9488', 700: '#0f766e', DEFAULT: '#2DD4BF' },
        gold: { 100: '#fef3c7', 300: '#fcd34d', 500: '#C9A84C', 700: '#92400e', DEFAULT: '#C9A84C' }
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
}
