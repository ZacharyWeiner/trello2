import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      minHeight: {
        'touch': '44px', // Minimum touch target size
        'screen-safe': 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
      },
      minWidth: {
        'touch': '44px',
      },
      maxWidth: {
        'mobile': '480px',
        'tablet': '768px',
      },
      screens: {
        'xs': '375px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        // Touch-specific breakpoints
        'touch': { 'raw': '(hover: none) and (pointer: coarse)' },
        'no-touch': { 'raw': '(hover: hover) and (pointer: fine)' },
        // Orientation breakpoints
        'portrait': { 'raw': '(orientation: portrait)' },
        'landscape': { 'raw': '(orientation: landscape)' },
        // PWA breakpoints
        'standalone': { 'raw': '(display-mode: standalone)' },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'dots-pattern': 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
        'grid-pattern': 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
        'diagonal-pattern': 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)',
        'ocean': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'sunset': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'forest': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'aurora': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        'cosmic': 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
        'midnight': 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
      },
      backgroundSize: {
        'dots': '20px 20px',
        'grid': '20px 20px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-left': 'slideLeft 0.3s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'shake': 'shake 0.5s ease-in-out',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-2px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(2px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      boxShadow: {
        'touch': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'touch-active': '0 1px 4px rgba(0, 0, 0, 0.2)',
        'card-hover': '0 8px 25px rgba(0, 0, 0, 0.15)',
        'fab': '0 6px 20px rgba(0, 0, 0, 0.3)',
      },
      borderRadius: {
        'touch': '12px',
      },
      fontSize: {
        'touch': ['16px', '24px'], // Minimum font size for touch
      },
      zIndex: {
        'fab': '60',
        'modal': '100',
        'toast': '110',
        'tooltip': '120',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [
    // Custom plugin for touch-friendly utilities
    function({ addUtilities, theme }: any) {
      const newUtilities = {
        // Touch-friendly button styles
        '.btn-touch': {
          minHeight: theme('minHeight.touch'),
          minWidth: theme('minWidth.touch'),
          padding: '12px 16px',
          borderRadius: theme('borderRadius.touch'),
          fontSize: theme('fontSize.touch')[0],
          lineHeight: theme('fontSize.touch')[1],
          touchAction: 'manipulation',
          userSelect: 'none',
          WebkitTapHighlightColor: 'transparent',
        },
        
        // Swipe container
        '.swipe-container': {
          touchAction: 'pan-y',
          userSelect: 'none',
          WebkitUserSelect: 'none',
        },
        
        // Drag item
        '.touch-drag-item': {
          touchAction: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          cursor: 'grab',
          '&:active': {
            cursor: 'grabbing',
          },
          '&.dragging': {
            zIndex: '1000',
            transform: 'rotate(2deg)',
          },
        },
        
        // Drop zone
        '.drop-zone': {
          transition: 'all 0.2s ease',
          '&.drop-zone-active': {
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderColor: 'rgb(59, 130, 246)',
            transform: 'scale(1.02)',
          },
        },
        
        // Safe area utilities
        '.safe-top': {
          paddingTop: 'env(safe-area-inset-top)',
        },
        '.safe-bottom': {
          paddingBottom: 'env(safe-area-inset-bottom)',
        },
        '.safe-left': {
          paddingLeft: 'env(safe-area-inset-left)',
        },
        '.safe-right': {
          paddingRight: 'env(safe-area-inset-right)',
        },
        
        // PWA utilities
        '.pwa-display-standalone': {
          '@media (display-mode: standalone)': {
            display: 'block',
          },
          '@media not (display-mode: standalone)': {
            display: 'none',
          },
        },
        
        // Board pattern utilities
        '.board-pattern-dots': {
          backgroundImage: theme('backgroundImage.dots-pattern'),
          backgroundSize: theme('backgroundSize.dots'),
        },
        '.board-pattern-grid': {
          backgroundImage: theme('backgroundImage.grid-pattern'),
          backgroundSize: theme('backgroundSize.grid'),
        },
        '.board-pattern-diagonal': {
          backgroundImage: theme('backgroundImage.diagonal-pattern'),
        },
        
        // Mobile-first scrollbar
        '.scrollbar-mobile': {
          '&::-webkit-scrollbar': {
            width: '4px',
            height: '4px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(156, 163, 175, 0.5)',
            borderRadius: '2px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'rgba(156, 163, 175, 0.7)',
          },
        },
      };
      
      addUtilities(newUtilities);
    },
  ],
};

export default config;
