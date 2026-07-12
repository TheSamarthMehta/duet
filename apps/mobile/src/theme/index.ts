export const palette = {
  blush: '#F5D5D0',
  rose: '#E8A0A0',
  terracotta: '#C97B6B',
  cream: '#FBF7F4',
  sand: '#F2E9E4',
  ink: '#3A3238',
  slate: '#6B6169',
  mist: '#9C929A',
  white: '#FFFFFF',
  black: '#1C1720',
};

export interface Theme {
  mode: 'light' | 'dark';
  bg: string;
  card: string;
  cardAlt: string;
  text: string;
  textMuted: string;
  primary: string;
  primarySoft: string;
  onPrimary: string;
  border: string;
  bubbleMine: string;
  bubbleTheirs: string;
  bubbleMineText: string;
  bubbleTheirsText: string;
}

export const lightTheme: Theme = {
  mode: 'light',
  bg: palette.cream,
  card: palette.white,
  cardAlt: palette.sand,
  text: palette.ink,
  textMuted: palette.slate,
  primary: palette.terracotta,
  primarySoft: palette.blush,
  onPrimary: palette.white,
  border: '#EADFD8',
  bubbleMine: palette.terracotta,
  bubbleTheirs: palette.white,
  bubbleMineText: palette.white,
  bubbleTheirsText: palette.ink,
};

export const darkTheme: Theme = {
  mode: 'dark',
  bg: '#1A151C',
  card: '#241E28',
  cardAlt: '#2E2632',
  text: '#F2E9E4',
  textMuted: '#9C929A',
  primary: palette.rose,
  primarySoft: '#3A2A2E',
  onPrimary: '#1A151C',
  border: '#352C3A',
  bubbleMine: palette.rose,
  bubbleTheirs: '#2E2632',
  bubbleMineText: '#1A151C',
  bubbleTheirsText: '#F2E9E4',
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };
export const radius = { sm: 10, md: 16, lg: 24, xl: 32, pill: 999 };
export const font = {
  h1: 30,
  h2: 24,
  h3: 20,
  body: 16,
  small: 14,
  tiny: 12,
};
