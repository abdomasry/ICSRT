/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      animation: {
        'fadeInUp': 'fadeInUp 0.3s ease-out forwards',
        'pulse': 'pulse 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      keyframes: {
        fadeInUp: {
          'from': {
            opacity: '0',
            transform: 'translateY(20px) scale(0.8)'
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0) scale(1)'
          }
        },
        pulse: {
          '0%, 100%': {
            transform: 'scale(1)',
            opacity: '0.2'
          },
          '50%': {
            transform: 'scale(1.3)',
            opacity: '0'
          }
        }
      }
    },
  },
  plugins: [],
}
