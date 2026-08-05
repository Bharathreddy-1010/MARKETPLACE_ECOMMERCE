/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          50: '#fbf9f4',  // Main background (warm cream)
          100: '#f7f4ee',
          200: '#efece4',
          300: '#e5e1d6', // Borders
          400: '#d5cfc1',
        },
        stone: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
          950: '#0c0a09',
        },
        navy: {
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        gold: {
          500: '#d97706',
          600: '#ca8a04',
          700: '#a16207',
          bg: '#eab30815',
        }
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['monospace'],
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.02)',
        'editorial': '0 4px 20px -2px rgba(28, 25, 23, 0.05)',
      },
    },
  },
  plugins: [],
}
