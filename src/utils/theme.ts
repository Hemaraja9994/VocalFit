/**
 * VocalFit Design System
 * Lime Green + White clinical fitness aesthetic
 */

export const colors = {
  // Primary palette
  primary: '#A4D65E',
  primaryDark: '#8BC34A',
  primaryDeep: '#689F38',
  primaryDarkest: '#33691E',

  // Backgrounds
  white: '#FFFFFF',
  offWhite: '#F9F9F9',
  lightGray: '#F3F4F6',

  // Text
  black: '#1A1A1A',
  darkSlate: '#374151',
  gray: '#6B7280',
  lightText: '#9CA3AF',
  placeholder: '#D1D5DB',

  // Semantic
  success: '#10B981',
  warning: '#FBBF24',
  danger: '#EF4444',
  info: '#3B82F6',

  // Gradients (start, end)
  gradientStart: '#A4D65E',
  gradientEnd: '#8BC34A',

  // Transparent
  overlay: 'rgba(0, 0, 0, 0.05)',
  cardShadow: 'rgba(0, 0, 0, 0.04)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

export const typography = {
  largeTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.black,
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 22,
    fontWeight: '600' as const,
    color: colors.black,
  },
  headline: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: colors.black,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    color: colors.darkSlate,
    lineHeight: 22,
  },
  caption: {
    fontSize: 13,
    fontWeight: '400' as const,
    color: colors.gray,
  },
  small: {
    fontSize: 11,
    fontWeight: '500' as const,
    color: colors.lightText,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  metric: {
    fontSize: 28,
    fontWeight: '600' as const,
    color: colors.black,
  },
  bigMetric: {
    fontSize: 52,
    fontWeight: '600' as const,
    color: colors.white,
  },
} as const;

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
} as const;
