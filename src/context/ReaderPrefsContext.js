import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Font-size preference for the reading screens (song lyrics, Bible verses)
// — separate from ThemeContext since it's a text-display preference, not a
// color scheme. Shared across both reading screens on purpose: bump it up
// while reading a song and it stays bumped when you open the Bible too.
const KEY = '@worship_font_scale';
const MIN_SCALE = 0.85;
const MAX_SCALE = 1.6;
const STEP = 0.1;
const DEFAULT_SCALE = 1;

const ReaderPrefsContext = createContext(null);

function clampAndRound(value) {
  return Math.round(Math.min(MAX_SCALE, Math.max(MIN_SCALE, value)) * 100) / 100;
}

export function ReaderPrefsProvider({ children }) {
  const [fontScale, setFontScale] = useState(DEFAULT_SCALE);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        const parsed = raw ? parseFloat(raw) : NaN;
        if (!Number.isNaN(parsed)) setFontScale(clampAndRound(parsed));
      })
      .catch(() => {});
  }, []);

  const persist = (value) => {
    const next = clampAndRound(value);
    setFontScale(next);
    AsyncStorage.setItem(KEY, String(next)).catch(() => {});
  };

  const increaseFontSize = () => persist(fontScale + STEP);
  const decreaseFontSize = () => persist(fontScale - STEP);

  return (
    <ReaderPrefsContext.Provider
      value={{
        fontScale,
        increaseFontSize,
        decreaseFontSize,
        canIncrease: fontScale < MAX_SCALE,
        canDecrease: fontScale > MIN_SCALE,
      }}
    >
      {children}
    </ReaderPrefsContext.Provider>
  );
}

export function useReaderPrefs() {
  const ctx = useContext(ReaderPrefsContext);
  if (!ctx) throw new Error('useReaderPrefs must be used within a ReaderPrefsProvider');
  return ctx;
}
