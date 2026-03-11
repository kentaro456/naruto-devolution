/** @type {import('tailwindcss').Config} */
import plugin from 'tailwindcss/plugin';

export default {
  content: ['./index.html', './src/**/*.{js,jsx}', './js/**/*.js'],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', 'cursive'],
        ui: ['Outfit', 'sans-serif'],
      },
      colors: {
        neo: {
          bg: '#0A0A10',
          orange: '#f97316',
          pink: '#FF0055',
          gold: '#FFD700',
        }
      },
      animation: {
        drift: 'drift 120s linear infinite',
        pulseGlow: 'pulseGlow 2s infinite alternate',
      },
      keyframes: {
        drift: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '1000px 1000px' },
        },
        pulseGlow: {
          'from': { filter: 'drop-shadow(0 0 10px rgba(249,115,22,0.5))', transform: 'scale(1)' },
          'to': { filter: 'drop-shadow(0 0 30px rgba(249,115,22,0.8))', transform: 'scale(1.05)' },
        },
        uiReveal: {
          'to': { opacity: '1', transform: 'translateY(0) scale(1)' }
        }
      }
    },
  },
  plugins: [
    plugin(function ({ addComponents }) {
      addComponents({
        '.clip-skew': {
          clipPath: 'polygon(15% 0%, 100% 0%, 85% 100%, 0% 100%)',
        },
        '.ui-reveal': {
          opacity: '0',
          transform: 'translateY(15px) scale(0.98)'
        },
        '.ui-reveal.is-entering': {
          animation: 'uiReveal 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          animationDelay: 'calc(var(--enter-order, 0) * 40ms)'
        },
        '.selected-player': {
          borderColor: '#f97316',
          boxShadow: 'inset 0 0 20px rgba(249, 115, 22, 0.3), 0 0 15px rgba(249, 115, 22, 0.4)',
          outline: '2px solid rgba(249,115,22,0.5)',
          outlineOffset: '2px'
        },
        '.selected-cpu': {
          borderColor: '#FF0055',
          boxShadow: 'inset 0 0 20px rgba(255, 0, 85, 0.3), 0 0 15px rgba(255, 0, 85, 0.4)',
          outline: '2px solid rgba(255,0,85,0.5)',
          outlineOffset: '2px'
        },
        '.selected-stage': {
          borderColor: '#34D399',
          boxShadow: '0 0 20px rgba(52, 211, 153, 0.4)',
          outline: '2px solid rgba(52,211,153,0.5)',
          outlineOffset: '2px'
        }
      });
    })
  ],
};
