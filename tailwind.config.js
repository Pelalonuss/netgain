/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cyber: {
          yellow: '#F3E600',
          'yellow-dark': '#C4B800',
          'yellow-dim': '#7A7400',
          cyan: '#00D4FF',
          'cyan-dark': '#0099BB',
          magenta: '#FF0080',
          black: '#000000',
          'gray-900': '#0A0A0A',
          'gray-800': '#111111',
          'gray-700': '#1A1A1A',
          'gray-600': '#222222',
        }
      },
      fontFamily: {
        orbitron: ['Orbitron', 'monospace'],
        rajdhani: ['Rajdhani', 'sans-serif'],
      },
      boxShadow: {
        'cyber': '0 0 10px #F3E600, 0 0 20px rgba(243,230,0,0.3)',
        'cyber-lg': '0 0 20px #F3E600, 0 0 40px rgba(243,230,0,0.4), 0 0 60px rgba(243,230,0,0.1)',
        'cyber-cyan': '0 0 10px #00D4FF, 0 0 20px rgba(0,212,255,0.3)',
        'cyber-magenta': '0 0 10px #FF0080, 0 0 20px rgba(255,0,128,0.3)',
        'inner-cyber': 'inset 0 0 20px rgba(243,230,0,0.05)',
      },
      animation: {
        'glitch': 'glitch 0.3s ease-in-out',
        'pulse-cyber': 'pulseCyber 2s ease-in-out infinite',
        'flicker': 'flicker 3s ease-in-out infinite',
        'scan': 'scan 8s linear infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
        'level-up': 'levelUp 0.6s ease-out',
      },
      keyframes: {
        glitch: {
          '0%': { transform: 'translate(0)', clipPath: 'none' },
          '10%': { transform: 'translate(-3px, 2px)', clipPath: 'polygon(0 20%, 100% 20%, 100% 40%, 0 40%)' },
          '20%': { transform: 'translate(3px, -2px)', clipPath: 'polygon(0 60%, 100% 60%, 100% 80%, 0 80%)' },
          '30%': { transform: 'translate(-2px, 1px)', clipPath: 'none' },
          '40%': { transform: 'translate(2px, -1px)' },
          '50%': { transform: 'translate(0)' },
          '60%': { transform: 'translate(-1px, 2px)', clipPath: 'polygon(0 0, 100% 0, 100% 30%, 0 30%)' },
          '70%': { transform: 'translate(1px, -1px)', clipPath: 'none' },
          '100%': { transform: 'translate(0)', clipPath: 'none' },
        },
        pulseCyber: {
          '0%, 100%': { boxShadow: '0 0 10px #F3E600, 0 0 20px rgba(243,230,0,0.3)' },
          '50%': { boxShadow: '0 0 20px #F3E600, 0 0 40px rgba(243,230,0,0.6), 0 0 60px rgba(243,230,0,0.2)' },
        },
        flicker: {
          '0%, 95%, 100%': { opacity: '1' },
          '96%': { opacity: '0.7' },
          '97%': { opacity: '1' },
          '98%': { opacity: '0.6' },
          '99%': { opacity: '1' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        levelUp: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)', boxShadow: '0 0 30px #F3E600' },
          '100%': { transform: 'scale(1)' },
        }
      }
    },
  },
  plugins: [],
}
