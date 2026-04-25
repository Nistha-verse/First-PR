/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0A0A0F',
        text: '#FFFFFF',
        muted: '#9CA3AF',
        accent: '#6D28D9',
        magic: '#8B5CF6',
        accentSoft: '#4C1D95',
        border: '#1F2937',
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
      },
    },
  },
  plugins: [],
}

