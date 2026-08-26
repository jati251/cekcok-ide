/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ide: {
          bg: '#1e1e1e',
          sidebar: '#252526',
          panel: '#1e1e1e',
          border: '#333333',
          text: '#cccccc',
          muted: '#888888',
          accent: '#007acc',
          accentHover: '#005f9e',
        }
      }
    },
  },
  plugins: [],
}
