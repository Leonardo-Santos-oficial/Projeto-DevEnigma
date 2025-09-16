/************************************************************
 * Tailwind Config - Mantido minimalista no início para focar
 * em performance e clareza. Extensões futuras (cores da brand,
 * tokens tipográficos) serão adicionadas conforme necessário.
 ************************************************************/
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/ui/**/*.{ts,tsx}',
    './src/modules/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {}
  },
  plugins: []
};
