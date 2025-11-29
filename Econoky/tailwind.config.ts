import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#ecfffd',
          100: '#c9fff9',
          200: '#94f6ed',
          300: '#67e7df',
          400: '#46d6ca', // #46D6CA
          500: '#4db0f0', // #4DB0F0
          600: '#5c8de4',
          700: '#6a78d8',
          800: '#5a64c3',
          900: '#26235d', // #26235D
        },
        accent: {
          aqua: '#46D6CA',
          sky: '#4DB0F0',
          indigo: '#7A74D6',
        },
        secondary: {
          white: '#FFFFFF',
          light: '#EAEAEA',
          dark: '#26235D',
        },
      },
      boxShadow: {
        'glow-primary': '0 25px 55px rgba(77, 176, 240, 0.35)',
        'glow-violet': '0 25px 55px rgba(122, 116, 214, 0.4)',
      },
    },
  },
  plugins: [],
}
export default config

