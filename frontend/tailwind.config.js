/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'mac-bg': '#f5f5f7',
        'mac-panel': 'rgba(255, 255, 255, 0.65)',
        'mac-panel-dark': 'rgba(30, 30, 30, 0.65)',
        'mac-border': 'rgba(255, 255, 255, 0.4)',
        'mac-shadow': 'rgba(0, 0, 0, 0.1)',
      },
      backdropBlur: {
        'mac': '40px',
      },
      boxShadow: {
        'mac': '0 20px 40px -10px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.2) inset',
        'mac-dark': '0 20px 40px -10px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1) inset',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
        ],
      },
    },
  },
  plugins: [],
}
