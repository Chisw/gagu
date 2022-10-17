/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      height: {
        '50vh': '50vh',
        '100vh': '100vh',
      },
    },
  },
  plugins: [],
}
