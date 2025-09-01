/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/Views/client/**/*.blade.php',
    './client/js/**/*.js', // quét class trong các file JS
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
