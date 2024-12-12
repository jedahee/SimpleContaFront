/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}", // Asegúrate de incluir todos los archivos HTML y TypeScript en tu proyecto Angular
    "./node_modules/flowbite/**/*.js"
  ],
  theme: {
    extend: {}, // Aquí puedes personalizar el tema si lo necesitas
  },
  plugins: [
    require('flowbite/plugin')
  ],
}
