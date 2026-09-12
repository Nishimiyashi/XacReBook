/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--c-bg) / <alpha-value>)',
        surface: 'rgb(var(--c-surface) / <alpha-value>)',
        'surface-2': 'rgb(var(--c-surface-2) / <alpha-value>)',
        fg: 'rgb(var(--c-fg) / <alpha-value>)',
        muted: 'rgb(var(--c-muted) / <alpha-value>)',
        border: 'rgb(var(--c-border) / <alpha-value>)',
        accent: 'rgb(var(--c-accent) / <alpha-value>)',
        'accent-fg': 'rgb(var(--c-accent-fg) / <alpha-value>)',
        navy: {
          50: '#eef1f8',
          100: '#d3daed',
          200: '#a7b6dc',
          300: '#7b91ca',
          400: '#4f6cb8',
          500: '#2c477e', // hey, adjust below
          600: '#1f3364',
          700: '#16244a',
          800: '#0f1a38',
          900: '#0a1128',
          950: '#050a18',
        },
        orange: {
          50: '#fff4ec',
          100: '#ffe4cc',
          200: '#ffc899',
          300: '#ffa35c',
          400: '#ff8a33',
          500: '#ff7a1a',
          600: '#f26200',
          700: '#c94f00',
          800: '#9c3e00',
          900: '#7a3200',
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        logo: ['"Unbounded"', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 24px 0 rgba(255, 122, 26, 0.35)',
      },
      animation: {
        'twinkle': 'twinkle 3.5s ease-in-out infinite',
        'float-slow': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        twinkle: {
          '0%, 100%': { opacity: 0.2 },
          '50%': { opacity: 1 },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
