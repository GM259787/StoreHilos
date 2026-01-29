/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'rgb(var(--color-primary-rgb) / 0.1)',
          100: 'rgb(var(--color-primary-rgb) / 0.2)',
          200: 'rgb(var(--color-primary-rgb) / 0.4)',
          300: 'rgb(var(--color-primary-rgb) / 0.6)',
          400: 'rgb(var(--color-primary-rgb) / 0.8)',
          500: 'var(--color-primary)',
          600: 'var(--color-primary)',
          700: 'var(--color-primary-dark)',
          800: 'var(--color-primary-darker)',
          900: 'var(--color-primary-darkest)',
        },
        secondary: {
          500: 'var(--color-secondary)',
          600: 'var(--color-secondary)',
          700: 'var(--color-secondary-dark)',
        },
        accent: {
          500: 'var(--color-accent)',
          600: 'var(--color-accent)',
        },
      },
    },
  },
  plugins: [],
}

