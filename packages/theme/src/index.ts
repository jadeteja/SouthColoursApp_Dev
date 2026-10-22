export const colors = {
  primary: '#FF4081',
  primaryDeep: '#E91E63',
  primaryLight: '#FFE4EF',
  primarySoft: '#FFF0F5',
  adminNavy: '#17283D',
  background: '#FFFFFF',
  cardBackground: '#FFFFFF',
  primaryText: '#20242C',
  secondaryText: '#697386',
  mutedText: '#9AA0AC',
  border: '#F0E4EA',
  borderDark: '#E2D3DB',
  success: '#18A66A',
  successLight: '#E8F8F1',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#DC3545',
  errorLight: '#FDE8E8',
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
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

export const radii = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
} as const;

export const typography = {
  fontSizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    heading: 28,
  },
  fontWeights: {
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
  },
} as const;

export const theme = {
  colors,
  spacing,
  radii,
  typography,
};

export default theme;
