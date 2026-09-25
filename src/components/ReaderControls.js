import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useReaderPrefs } from '../context/ReaderPrefsContext';

// Sits in a screen header's top-right corner (on a colored primary
// background, hence the hardcoded white) — font size +/- and the same
// dark/light toggle as the Me tab, for the two long-reading screens
// (song lyrics, Bible verses).
export default function ReaderControls() {
  const { isDark, toggleTheme } = useTheme();
  const { increaseFontSize, decreaseFontSize, canIncrease, canDecrease } = useReaderPrefs();

  return (
    <View style={styles.row}>
      <View style={styles.fontGroup}>
        <Pressable onPress={decreaseFontSize} disabled={!canDecrease} hitSlop={8} style={styles.btn}>
          <Text style={[styles.aText, styles.aTextSmall, !canDecrease && styles.btnDisabled]}>A</Text>
        </Pressable>
        <View style={styles.divider} />
        <Pressable onPress={increaseFontSize} disabled={!canIncrease} hitSlop={8} style={styles.btn}>
          <Text style={[styles.aText, styles.aTextBig, !canIncrease && styles.btnDisabled]}>A</Text>
        </Pressable>
      </View>
      <Pressable onPress={toggleTheme} hitSlop={8} style={styles.btn}>
        <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={18} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  fontGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 999,
    paddingHorizontal: 10,
    height: 30,
    gap: 8,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    height: 14,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  btn: {
    padding: 2,
  },
  aText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  aTextSmall: {
    fontSize: 11,
  },
  aTextBig: {
    fontSize: 16,
  },
  btnDisabled: {
    opacity: 0.35,
  },
});
