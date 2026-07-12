import React, { createContext, useContext, useState, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { Theme, lightTheme, darkTheme } from './index';

type Mode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: Theme;
  mode: Mode;
  setMode: (m: Mode) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: lightTheme,
  mode: 'system',
  setMode: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [mode, setMode] = useState<Mode>('system');

  const theme = useMemo(() => {
    const resolved = mode === 'system' ? system : mode;
    return resolved === 'dark' ? darkTheme : lightTheme;
  }, [mode, system]);

  return (
    <ThemeContext.Provider value={{ theme, mode, setMode }}>{children}</ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
