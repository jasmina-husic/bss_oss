
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        badgeOnline: '#22c55e',
        badgeWarn: '#facc15',
        badgeCritical: '#dc2626',
      },
    },
  },
  plugins: [],
};
