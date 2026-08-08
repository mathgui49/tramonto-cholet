import type { Config } from 'tailwindcss';

// Le site vient d'une feuille de style écrite à la main, portée telle quelle
// dans app/globals.css. Tailwind est présent pour les évolutions à venir, mais
// `preflight` reste DÉSACTIVÉ : sa remise à zéro changerait le rendu des
// éléments dont ce CSS s'appuie sur les valeurs par défaut du navigateur.
export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  corePlugins: { preflight: false },
  theme: {
    extend: {
      colors: {
        accent: 'var(--c-accent)',
        ink: 'var(--c-ink)',
        paper: 'var(--c-paper)',
        cream: 'var(--c-cream)',
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        display: ['var(--font-display)'],
        serif: ['var(--font-serif)'],
      },
    },
  },
  plugins: [],
} satisfies Config;
