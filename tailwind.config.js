/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#7B5CF6',
          dark: '#6D28D9',
          light: '#8B5CF6',
        },
        accent: '#8B5CF6',
        sidebar: '#4a2d5c',
        sidebarLight: '#EDE9FE',
        canvas: '#EDE7F6',
        card: '#FFFFFF',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        card: '0 4px 20px rgba(123, 92, 246, 0.08)',
        sidebar: '4px 0 24px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
};
