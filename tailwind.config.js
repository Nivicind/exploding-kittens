/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        card: {
          bomb: '#18181b',      // Đen than viền đỏ
          defuse: '#16a34a',    // Xanh lá chuẩn gốc
          attack: '#ea580c',    // Cam chuẩn gốc
          skip: '#0284c7',      // Xanh da trời Cyan
          favor: '#27272a',     // Đen xám than chuẩn gốc (Favor)
          shuffle: '#65a30d',   // Xanh lá mạ chanh
          future: '#c026d3',    // Hồng Magenta 3X
          nope: '#dc2626',      // Đỏ tươi thẫm
          cat: '#d97706'        // Vàng hổ phách
        }
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-short': 'bounce 0.6s infinite',
        'shake': 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
        'orbit': 'spin 12s linear infinite',
        'orbit-reverse': 'spin-reverse 12s linear infinite',
        'edge-pulse': 'edgePulse 2s ease-in-out infinite',
        'shuffle-cards': 'shuffleCards 0.28s ease-in-out infinite'
      },
      keyframes: {
        shake: {
          '10%, 90%': { transform: 'translate3d(-2px, -1px, 0)' },
          '20%, 80%': { transform: 'translate3d(3px, 2px, 0)' },
          '30%, 50%, 70%': { transform: 'translate3d(-5px, -3px, 0)' },
          '40%, 60%': { transform: 'translate3d(5px, 3px, 0)' }
        },
        shuffleCards: {
          '0%, 100%': { transform: 'translateX(0) rotate(0deg)' },
          '25%': { transform: 'translateX(-10px) rotate(-3.5deg)' },
          '75%': { transform: 'translateX(10px) rotate(3.5deg)' }
        },
        'spin-reverse': {
          from: { transform: 'rotate(360deg)' },
          to: { transform: 'rotate(0deg)' }
        },
        edgePulse: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' }
        }
      }
    },
  },
  plugins: [],
}
