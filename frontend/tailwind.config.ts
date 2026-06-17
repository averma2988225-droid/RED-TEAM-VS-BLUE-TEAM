import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'term-black': '#000000',
        'term-surface': '#0a0a0f',
        'term-border': '#1a1a2e',
        'term-green': '#00ff41',
        'term-green-dim': '#0a8a3e',
        'term-green-dark': '#052e14',
        'term-muted': '#333355',
        'term-red': '#ff0033',
        'term-cyan': '#00ccff',
        'term-yellow': '#ffaa00',
        'term-purple': '#8b5cf6',
      },
      fontFamily: {
        mono: ['var(--font-fira)', 'Fira Code', 'JetBrains Mono', 'Courier New', 'monospace'],
      },
      animation: {
        'pulse-neon': 'pulse-neon 2s ease-in-out infinite',
        'flicker': 'flicker 4s linear infinite',
        'blink': 'blink-cursor 1s step-end infinite',
        'glitch': 'glitch 0.3s ease-in-out',
        'scanline': 'scanline 8s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
