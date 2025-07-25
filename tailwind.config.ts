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
			padding: {
				DEFAULT: 'clamp(0.5rem, 2vw, 2rem)',
				sm: 'clamp(0.75rem, 2.5vw, 3rem)',
				lg: 'clamp(1rem, 3vw, 4rem)',
				xl: 'clamp(1.5rem, 4vw, 6rem)',
				'2xl': 'clamp(2rem, 5vw, 8rem)'
			},
			screens: {
				sm: '640px',
				md: '768px',
				lg: '1024px',
				xl: '1280px',
				'2xl': '1400px'
			}
		},
		extend: {
			screens: {
				'xs': '475px',
				'zoom-90': { 'raw': '(min-resolution: 90dpi) and (max-resolution: 115dpi)' },
				'zoom-100': { 'raw': '(min-resolution: 115dpi)' }
			},
			spacing: {
				'responsive-xs': 'clamp(0.25rem, 0.5vw, 0.5rem)',
				'responsive-sm': 'clamp(0.5rem, 1vw, 1rem)',
				'responsive-md': 'clamp(0.75rem, 1.5vw, 1.5rem)',
				'responsive-lg': 'clamp(1rem, 2vw, 2rem)',
				'responsive-xl': 'clamp(1.5rem, 3vw, 3rem)',
			},
			fontSize: {
				'responsive-xs': ['clamp(0.65rem, 0.9vw, 0.75rem)', { lineHeight: '1.3' }],
				'responsive-sm': ['clamp(0.75rem, 1vw, 0.875rem)', { lineHeight: '1.4' }],
				'responsive-base': ['clamp(0.875rem, 1.1vw, 1rem)', { lineHeight: '1.5' }],
				'responsive-lg': ['clamp(1rem, 1.3vw, 1.125rem)', { lineHeight: '1.5' }],
				'responsive-xl': ['clamp(1.125rem, 1.5vw, 1.25rem)', { lineHeight: '1.4' }],
				'responsive-2xl': ['clamp(1.25rem, 1.8vw, 1.5rem)', { lineHeight: '1.3' }],
				'responsive-3xl': ['clamp(1.5rem, 2.2vw, 1.875rem)', { lineHeight: '1.2' }],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					glow: 'hsl(var(--primary-glow))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(var(--warning-foreground))'
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
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			backgroundImage: {
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-corporate': 'var(--gradient-corporate)',
				'gradient-subtle': 'var(--gradient-subtle)'
			},
			boxShadow: {
				'elegant': 'var(--shadow-elegant)',
				'card-hover': 'var(--shadow-hover)',
				'card-default': 'var(--shadow-card)',
				'responsive': 'clamp(0 1px 3px 0 hsl(220 13% 69% / 0.1), 0 4px 12px -2px hsl(var(--primary) / 0.15))'
			},
			transitionTimingFunction: {
				'smooth': 'var(--transition-smooth)',
				'fast': 'var(--transition-fast)'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				'responsive': 'clamp(0.25rem, 0.6vw, 0.5rem)',
				'responsive-lg': 'clamp(0.375rem, 0.8vw, 0.75rem)'
			},
			gap: {
				'responsive-xs': 'clamp(0.25rem, 0.6vw, 0.5rem)',
				'responsive-sm': 'clamp(0.5rem, 0.8vw, 0.75rem)',
				'responsive-md': 'clamp(0.75rem, 1.2vw, 1.5rem)',
				'responsive-lg': 'clamp(1rem, 1.8vw, 2rem)',
				'responsive-xl': 'clamp(1.5rem, 2.5vw, 3rem)',
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'fade-in-scale': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px) scale(0.95)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0) scale(1)'
					}
				},
				'slide-up': {
					'0%': {
						transform: 'translateY(100%)',
						opacity: '0'
					},
					'100%': {
						transform: 'translateY(0)',
						opacity: '1'
					}
				},
				'scale-in': {
					'0%': {
						transform: 'scale(0.95)',
						opacity: '0'
					},
					'100%': {
						transform: 'scale(1)',
						opacity: '1'
					}
				},
				'bounce-subtle': {
					'0%, 20%, 50%, 80%, 100%': {
						transform: 'translateY(0)'
					},
					'40%': {
						transform: 'translateY(-4px)'
					},
					'60%': {
						transform: 'translateY(-2px)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.4s ease-out',
				'fade-in-scale': 'fade-in-scale 0.5s ease-out',
				'slide-up': 'slide-up 0.4s ease-out',
				'scale-in': 'scale-in 0.3s ease-out',
				'bounce-subtle': 'bounce-subtle 1s ease-in-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
