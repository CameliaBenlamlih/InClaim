/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          DEFAULT: '#0d0d0d',
          50: '#1a1a1a',
          100: '#222222',
          200: '#333333',
          300: '#4a4a4a',
          400: '#666666',
          500: '#8c8c8c',
          600: '#a3a3a3',
          700: '#cccccc',
          800: '#e5e5e5',
          900: '#f2f2f2',
        },
        primary: {
          50: '#1a1a1a',
          100: '#222222',
          200: '#333333',
          300: '#4a4a4a',
          400: '#8c8c8c',
          500: '#f2f2f2',
          600: '#ffffff',
          700: '#ffffff',
          800: '#ffffff',
          900: '#ffffff',
          950: '#ffffff',
        },
        accent: {
          50: '#111111',
          100: '#1a1a1a',
          200: '#222222',
          300: '#333333',
          400: '#4a4a4a',
          500: '#8c8c8c',
          600: '#a3a3a3',
          700: '#cccccc',
          800: '#e5e5e5',
          900: '#f2f2f2',
        }
      },
      fontFamily: {
        sans: ['"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
        display: ['"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['"Courier New"', 'Courier', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}
