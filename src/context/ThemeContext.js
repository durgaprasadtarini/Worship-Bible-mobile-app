import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors } from '../theme/colors';

const THEME_STORAGE_KEY = '@worship_theme_preference';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  // Default is light mode, as requested.
  const [scheme, setScheme] = useState('light');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (saved === 'light' || saved === 'dark') {
          setScheme(saved);
        }
      } catch (e) {
        // Ignore read errors and fall back to the default light theme.
      } finally {
        setIsReady(true);
      }
    })();
  }, []);

  const toggleTheme = async () => {
    const next = scheme === 'light' ? 'dark' : 'light';
    setScheme(next);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, next);
    } catch (e) {
      // Ignore write errors — the UI still reflects the chosen theme this session.
    }
  };

  const setTheme = async (value) => {
    if (value !== 'light' && value !== 'dark') return;
    setScheme(value);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, value);
    } catch (e) {
      // ignore
    }
  };

  const value = useMemo(
    () => ({
      scheme,
      colors: scheme === 'dark' ? darkColors : lightColors,
      isDark: scheme === 'dark',
      isReady,
      toggleTheme,
      setTheme,
    }),
    [scheme, isReady]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
