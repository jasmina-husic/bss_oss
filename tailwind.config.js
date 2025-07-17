export default {
  content: ['./index.html','./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#000',
        secondary: '#fff',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
