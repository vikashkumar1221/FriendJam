/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        raw: {
          50: '#faf9f5',
          100: '#f5f3ec',
          200: '#ede8dc',
          300: '#ded6c3',
          400: '#c5b89d',
          900: '#111111',
          black: '#0a0a0a'
        },
        acid: {
          DEFAULT: '#d7ff3b',
          hover: '#c3eb2a',
          dark: '#9cb81c'
        },
        caution: {
          DEFAULT: '#ff5c00',
          light: '#ff8a3d'
        },
        analog: {
          blue: '#0055ff',
          teal: '#00d1b2',
          red: '#ff3344'
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Space Mono"', 'Menlo', 'Consolas', 'monospace'],
        sans: ['"Cabinet Grotesk"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        editorial: ['"Instrument Serif"', 'Georgia', 'serif']
      },
      boxShadow: {
        'brutal-sm': '2px 2px 0px #000000',
        'brutal': '4px 4px 0px #000000',
        'brutal-lg': '6px 6px 0px #000000',
        'brutal-acid': '4px 4px 0px #d7ff3b',
        'brutal-pressed': '1px 1px 0px #000000'
      }
    },
  },
  plugins: [],
}
