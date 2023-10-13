/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      fontFamily: {
        audiowide: ['Audiowide', 'sans-serif']
      },
      backgroundImage: {
        'background-grid': "url('/frontend/static/grid.svg')",
      }
    }
  },
  plugins: []
};