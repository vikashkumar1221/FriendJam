/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: '#b0a698', // dusty clay taupe ambient backdrop
          dark: '#9a8f82',
          light: '#c4b9ab',
        },
        shell: '#fbfaf8', // clean porcelain warm off-white
        surface: {
          DEFAULT: '#ffffff',
          warm: '#f5f2ec',
          muted: '#ebe6de',
          border: '#e4dfd6',
        },
        sidebar: {
          DEFAULT: '#232528', // rich basalt dark charcoal
          hover: '#2d3034',
          active: '#393c41',
          text: '#9ba0a9',
          border: '#1c1e20'
        },
        copper: {
          DEFAULT: '#a84c26', // warm burnt sienna/terracotta
          glow: '#c25e2e',
          dark: '#6e2b13',
          amber: '#e5a83b', // golden amber highlight
        },
        amber: {
          DEFAULT: '#e5a83b',
          light: '#f5be57',
          dark: '#b37c22',
        },
        ink: {
          DEFAULT: '#1c1e21',
          muted: '#6f7480',
          subtle: '#9aa0aa',
        }
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Space Mono"', 'monospace'],
        editorial: ['"Instrument Serif"', 'Georgia', 'serif']
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(28, 30, 33, 0.06), 0 2px 6px -1px rgba(28, 30, 33, 0.04)',
        'soft-lg': '0 12px 32px -4px rgba(28, 30, 33, 0.12), 0 4px 12px -2px rgba(28, 30, 33, 0.06)',
        'player': '0 20px 40px -10px rgba(0, 0, 0, 0.35)',
        'copper': '0 8px 24px -4px rgba(168, 76, 38, 0.35)',
      }
    },
  },
  plugins: [],
}
