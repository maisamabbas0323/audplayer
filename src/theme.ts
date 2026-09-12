import { Platform } from 'react-native';

export const colors = {
  bg: '#0A0A0B',
  bgElevated: '#101012',
  surface: '#151517',
  surfaceRaised: '#1B1B1E',
  border: '#26262B',
  borderSoft: '#1E1E22',
  text: '#F4F4F5',
  textSecondary: '#A8A8B0',
  textMuted: '#6B6B74',
  accent: '#3D7BFF',
  accentSoft: '#3D7BFF22',
  accentPressed: '#2E63D6',
  onAccent: '#FFFFFF',
  danger: '#F0564A',
  dangerSoft: '#F0564A1A',
  success: '#3DD68C',
  star: '#F2C14E',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  pill: 999,
};

export const type = {
  title: 28,
  heading: 20,
  subtitle: 16,
  body: 15,
  label: 14,
  small: 12,
  micro: 11,
};

export const fontWeight = {
  bold: '700',
  semibold: '600',
  medium: '500',
  regular: '400',
} as const;

export const font = {
  ...(Platform.select({
    ios: { family: undefined as string | undefined, weight: undefined },
    android: { family: undefined, weight: undefined },
    web: { family: undefined, weight: undefined },
    default: { family: undefined, weight: undefined },
  }) ?? { family: undefined, weight: undefined }),
};

export const shadow = {
  sm: {
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  lg: {
    shadowColor: '#000',
    shadowOpacity: 0.6,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 10 },
    elevation: 16,
  },
};