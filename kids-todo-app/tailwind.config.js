/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'kid-blue': '#3B82F6',
        'kid-orange': '#FB923C',
        'kid-yellow': '#FCD34D',
        'kid-green': '#10B981',
        'kid-purple': '#A855F7',
        'kid-pink': '#EC4899',
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(251, 146, 60, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(251, 146, 60, 0.8)' },
        },
      },
    },
  },
  plugins: [],
}
