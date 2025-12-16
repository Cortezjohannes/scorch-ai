/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          900: '#111827',
          800: '#1F2937',
          700: '#374151',
          400: '#9CA3AF',
          300: '#D1D5DB',
        },
        blue: {
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
        },
        purple: {
          600: '#7C3AED',
        },
        red: {
          200: '#FECACA',
          500: '#EF4444',
          900: '#7F1D1D',
        },
        // Light Mode Colors - Softer off-white
        light: {
          bg: {
            primary: '#F2F3F5',
            secondary: '#EBEDF0',
          },
          text: {
            primary: '#1A1A1A',
            secondary: '#4A5568',
            tertiary: '#718096',
          },
          border: '#E2E8F0',
          gold: {
            primary: '#C9A961',
            secondary: '#B8944F',
            accent: '#F5E6D3',
            hover: '#A67C3D',
          },
        },
        // Dark Mode Colors - Pure black
        dark: {
          bg: {
            primary: '#121212',
            secondary: '#181818',
            tertiary: '#1F1F1F',
          },
          text: {
            primary: '#F1F5F9',
            secondary: '#CBD5E1',
            tertiary: '#94A3B8',
          },
          border: '#475569',
          green: {
            primary: '#34D399',
            secondary: '#10B981',
            accent: '#064E3B',
            hover: '#059669',
          },
          gold: {
            primary: '#E2C376',
            secondary: '#D4B05A',
            accent: '#2A2418',
            hover: '#C9A85A',
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
  darkMode: 'class',
} 