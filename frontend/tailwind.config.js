/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'agent-bg': '#0a0a0a',
        'agent-panel': '#1a1a1a',
        'agent-border': '#2a2a2a',
        'agent-text': '#e0e0e0',
        'agent-accent': '#3b82f6',
      }
    },
  },
  plugins: [],
}
