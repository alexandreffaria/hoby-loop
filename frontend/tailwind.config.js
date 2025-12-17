/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        'main-text': 'var(--main-text)',
        secondary: 'var(--secondary)',
        tertiary: 'var(--tertiary)',
        forth: 'var(--forth)',
      },
      backgroundImage: {
        'gradient-secondary-tertiary': 'linear-gradient(to right, var(--secondary), var(--tertiary))',
        'gradient-tertiary-forth': 'linear-gradient(to right, var(--tertiary), var(--forth))',
        'gradient-secondary-forth': 'linear-gradient(to right, var(--secondary), var(--forth))',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}