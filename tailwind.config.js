/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        body: '#F3F2EE',
        surface: '#FFFFFF',
        dark: {
          DEFAULT: '#050505',
          50: '#FAFAF8',
          100: '#F3F2EE',
          200: '#E6E4DE',
          300: '#D1CFC8',
          400: '#999999',
          500: '#555555',
          600: '#333333',
          700: '#1a1a1a',
          800: '#111111',
          900: '#050505',
        },
        accent: {
          DEFAULT: '#FF3B00',
          light: '#FF5C2A',
          dark: '#E03500',
          purple: '#9E9EF0',
        },
        primary: {
          50: '#FFF5F2',
          100: '#FFE8E0',
          200: '#FFD0C0',
          300: '#FFB09A',
          400: '#FF7A55',
          500: '#FF3B00',
          600: '#E03500',
          700: '#B82C00',
          800: '#8A2100',
          900: '#5C1600',
          950: '#2E0B00',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        serif: ['"Times New Roman"', 'Times', 'serif'],
        mono: ['"Courier New"', 'Courier', 'monospace'],
      },
      borderRadius: {
        'pill': '999px',
        'card': '2px',
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
