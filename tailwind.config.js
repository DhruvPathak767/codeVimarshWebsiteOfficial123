/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./views/**/*.{html,ejs}"],
  theme: {
    extend: {
      colors: {
        primary: '#00F0FF', // Electric Cyan
        secondary: '#7000FF', // Electric Purple
        accent: '#FF003C', // Cyber Red
        'neon-blue': '#00F0FF',
        'neon-purple': '#7000FF',
        'dark-bg': '#030014', // Deep Space
        'surface': '#0F0529',
        'grid-line': 'rgba(0, 240, 255, 0.1)',
        'text-main': '#FFFFFF',
        'text-muted': '#A0A0C0',
      },
      fontFamily: {
        code: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
        display: ['"Outfit"', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'cyber-gradient': 'linear-gradient(to right, #00F0FF, #7000FF)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(0, 240, 255, 0.5)' },
          '50%': { opacity: '0.8', boxShadow: '0 0 30px rgba(112, 0, 255, 0.5)' },
        },
        gridFlow: {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '100% 100%' },
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.8s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s infinite',
        'grid-flow': 'gridFlow 20s linear infinite',
      },
    },
  },
  plugins: [],
}
