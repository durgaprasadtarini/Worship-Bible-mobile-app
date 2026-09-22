import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// There's no real cover art per song, so instead of one repeated image we
// cycle through 4 gradient "album art" variants (by list position) — gives
// visual variety in the song list without needing downloaded photos.
const PALETTES = [
  ['#2E4374', '#1C2B4A'],
  ['#B8892B', '#8A6420'],
  ['#3E7A54', '#255338'],
  ['#7A4B8A', '#4E2F5C'],
];

export default function AlbumArt({ index = 0, size = 56, radius = 14 }) {
  const [start, end] = PALETTES[index % PALETTES.length];
  return (
    <LinearGradient
      colors={[start, end]}
      style={[styles.wrap, { width: size, height: size, borderRadius: radius }]}
    >
      <Ionicons name="musical-note" size={size * 0.42} color="rgba(255,255,255,0.9)" />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
