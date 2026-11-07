/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        easyRed: '#D20D1B',
        goYellow: '#FFB900',
        lightBg: '#F5F6F8',
        darkText: '#333333'
      }
    },
  },
  plugins: [],
}
