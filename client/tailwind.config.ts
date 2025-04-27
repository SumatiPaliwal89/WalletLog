import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				// Futuristic cyberpunk palette
				'cyber-dark': '#050B18',
				'cyber-deep': '#0F2451', 
				'neon-blue': '#00F0FF',
				'electric-pink': '#FF2E93', 
				'vibrant-purple': '#9B6DFF',
				'cyber-green': '#34D399',

				// Keep original shadcn colors as fallback
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' },
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' },
				},
				'glow': {
					'0%, 100%': { 
						boxShadow: '0 0 5px rgba(0, 240, 255, 0.5), 0 0 15px rgba(0, 240, 255, 0.3)', 
						borderColor: 'rgba(0, 240, 255, 0.7)'
					},
					'50%': { 
						boxShadow: '0 0 20px rgba(0, 240, 255, 0.8), 0 0 30px rgba(0, 240, 255, 0.5)', 
						borderColor: 'rgba(0, 240, 255, 1)'
					}
				},
				'pulse-ring': {
					'0%': { transform: 'scale(0.8)', opacity: '0.8' },
					'100%': { transform: 'scale(1.5)', opacity: '0' }
				},
				'slide-up': {
					'0%': { transform: 'translateY(20px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				'rotate-3d': {
					'0%': { transform: 'rotateY(0deg)' },
					'100%': { transform: 'rotateY(360deg)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'float': 'float 6s ease-in-out infinite',
				'glow': 'glow 2s ease-in-out infinite',
				'pulse-ring': 'pulse-ring 1.5s cubic-bezier(0.24, 0, 0.38, 1) infinite',
				'slide-up': 'slide-up 0.6s ease-out',
				'rotate-3d': 'rotate-3d 15s linear infinite',
			},
			fontFamily: {
				'space': ['Space Grotesk', 'sans-serif'],
				'inter': ['Inter', 'sans-serif'],
			},
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
