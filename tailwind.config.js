/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                brand: {
                    50: '#eef2ff',
                    100: '#e0e7ff',
                    200: '#c7d2fe',
                    300: '#a5b4fc',
                    400: '#818cf8',
                    500: '#6366f1',
                    600: '#4f46e5',
                    700: '#4338ca',
                    800: '#3730a3',
                    900: '#312e81',
                    950: '#1e1b4b',
                },
                neon: {
                    blue: '#00d4ff',
                    purple: '#a855f7',
                    pink: '#ec4899',
                    green: '#22c55e',
                    orange: '#f97316',
                    cyan: '#06b6d4',
                },
                glass: {
                    light: 'rgba(255, 255, 255, 0.08)',
                    medium: 'rgba(255, 255, 255, 0.12)',
                    heavy: 'rgba(255, 255, 255, 0.18)',
                    border: 'rgba(255, 255, 255, 0.15)',
                    'border-hover': 'rgba(255, 255, 255, 0.25)',
                },
                surface: {
                    DEFAULT: '#0a0a0f',
                    raised: '#111118',
                    overlay: '#16161f',
                    modal: '#1a1a25',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
                mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-mesh':
                    'radial-gradient(at 40% 20%, rgba(99, 102, 241, 0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(168, 85, 247, 0.12) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(6, 182, 212, 0.08) 0px, transparent 50%)',
                'glow-conic':
                    'conic-gradient(from 180deg at 50% 50%, #6366f1 0deg, #a855f7 90deg, #ec4899 180deg, #06b6d4 270deg, #6366f1 360deg)',
            },
            boxShadow: {
                glass: '0 10px 40px rgba(0, 0, 0, 0.6)',
                'glass-sm': '0 4px 16px rgba(0, 0, 0, 0.4)',
                'glass-lg': '0 20px 60px rgba(0, 0, 0, 0.7)',
                neon: '0 0 20px rgba(99, 102, 241, 0.3)',
                'neon-lg': '0 0 40px rgba(99, 102, 241, 0.4)',
                'neon-cyan': '0 0 20px rgba(6, 182, 212, 0.3)',
                'neon-purple': '0 0 20px rgba(168, 85, 247, 0.3)',
            },
            backdropBlur: {
                glass: '20px',
                'glass-heavy': '40px',
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'slide-up': 'slideUp 0.5s ease-out',
                'slide-in-right': 'slideInRight 0.3s ease-out',
                'glow-pulse': 'glowPulse 2s ease-in-out infinite',
                'cursor-blink': 'cursorBlink 1s step-end infinite',
                float: 'float 6s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideInRight: {
                    '0%': { opacity: '0', transform: 'translateX(20px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
                glowPulse: {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)' },
                    '50%': { boxShadow: '0 0 40px rgba(99, 102, 241, 0.6)' },
                },
                cursorBlink: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
            },
        },
    },
    plugins: [],
};
