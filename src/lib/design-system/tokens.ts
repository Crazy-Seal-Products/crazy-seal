// RV Armor Design System
// Design Tokens - Single source of truth for all design values

export const colors = {
  // Primary Brand Color - RV Armor Navy
  primary: {
    50: '#E6EBF3',
    100: '#B3C2D9',
    200: '#6685B3',
    500: '#003365',   // Navy Blue
    600: '#002A54',
    700: '#002043',
  },

  // Secondary Brand Color - RV Armor Blue
  secondary: {
    50: '#E7EFF8',
    100: '#B5CDE6',
    200: '#6D9BCF',
    500: '#125F97',   // Medium Blue
    600: '#0E4D7C',
    700: '#0A3B61',
  },

  // Accent Color - RV Armor Green (CTAs, trust, guarantee)
  accent: {
    50: '#EFF6E7',
    100: '#CEE4B5',
    200: '#ADCF83',
    500: '#5BA411',   // Brand Green
    600: '#4A870E',
    700: '#3A6B0B',
  },

  // Highlight Color - RV Armor Yellow (energy, attention)
  highlight: {
    50: '#FEFCE8',
    100: '#FDF7B8',
    200: '#FCF288',
    500: '#F9EA1C',   // Brand Yellow
    600: '#E0D219',
    700: '#C7BA16',
  },

  // Neutral Colors
  neutral: {
    0: '#000000',
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
    white: '#FFFFFF',
    cardBg: '#FFFFFF',
    inputBg: '#F9FAFB',
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
  },

  // Semantic Colors
  semantic: {
    success: '#5BA411',
    info: '#125F97',
    warning: '#F9EA1C',
    error: '#DC2626',
    premium: '#003365',
  }
} as const

export const spacing = {
  px: '1px',
  0: '0',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  32: '8rem',
} as const

export const borderRadius = {
  none: '0',
  sm: '0.125rem',
  base: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px',
} as const

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  primary: '0 4px 12px rgba(0, 51, 101, 0.3)',
  secondary: '0 4px 12px rgba(18, 95, 151, 0.3)',
  accent: '0 4px 12px rgba(91, 164, 17, 0.3)',
  highlight: '0 4px 12px rgba(249, 234, 28, 0.3)',
  button: '0 4px 14px rgba(0, 0, 0, 0.15)',
  buttonHover: '0 6px 20px rgba(0, 51, 101, 0.3)',
} as const

export const typography = {
  fontFamily: {
    sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
    mono: ['Courier New', 'monospace'],
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem',
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
} as const

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

export const gradients = {
  primary: 'linear-gradient(135deg, #003365, #125F97)',
  secondary: 'linear-gradient(135deg, #125F97, #003365)',
  accent: 'linear-gradient(135deg, #5BA411, #6DC015)',
  highlight: 'linear-gradient(135deg, #F9EA1C, #FDF388)',
  brand: 'linear-gradient(135deg, #003365, #125F97)',
  hero: 'linear-gradient(135deg, #003365, #125F97, #1A7BC4)',
  heroGlow: 'linear-gradient(135deg, rgba(0, 51, 101, 0.2), rgba(18, 95, 151, 0.1), rgba(91, 164, 17, 0.2))',
} as const

export const durations = {
  75: '75ms',
  100: '100ms',
  150: '150ms',
  200: '200ms',
  300: '300ms',
  500: '500ms',
  700: '700ms',
  1000: '1000ms',
} as const

export const easings = {
  linear: 'linear',
  in: 'cubic-bezier(0.4, 0, 1, 1)',
  out: 'cubic-bezier(0, 0, 0.2, 1)',
  'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const

export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const

export const components = {
  button: {
    height: {
      sm: '2rem',
      md: '2.5rem',
      lg: '3rem',
      xl: '3.5rem',
    },
    padding: {
      sm: '0.5rem 1rem',
      smDesktop: '0.5rem 1.25rem',
      md: '0.625rem 1.25rem',
      mdDesktop: '0.75rem 1.75rem',
      lg: '0.75rem 1.5rem',
      lgDesktop: '1rem 2.5rem',
      xl: '0.875rem 2rem',
      xlDesktop: '1.25rem 3rem',
    },
  },
  input: {
    height: {
      sm: '2rem',
      md: '2.5rem',
      lg: '3rem',
    },
    padding: {
      sm: '0.5rem 0.75rem',
      md: '0.75rem 1rem',
      lg: '1rem 1.25rem',
    },
  },
  card: {
    padding: {
      mobile: '1.5rem',
      desktop: '2rem',
      horizontalMobile: '0.5rem',
      horizontalDesktop: '2rem',
    },
    borderRadius: '1rem',
    borderWidth: '1px',
    paddingClass: 'p-4 md:p-6 lg:p-8',
  },
} as const

export const containers = {
  sm: '48rem',
  md: '64rem',
  lg: '80rem',
  xl: '88rem',
  '2xl': '100rem',
  full: '100%',
} as const

export default {
  colors,
  spacing,
  borderRadius,
  shadows,
  typography,
  breakpoints,
  gradients,
  durations,
  easings,
  zIndex,
  components,
  containers,
}
