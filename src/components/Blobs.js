import React from 'react';
import { View, StyleSheet } from 'react-native';

// Soft, oversized translucent circles peeking from behind content — the
// "color drifting through the card" effect from the reference screenshots,
// recreated with plain Views instead of an image asset so it stays crisp
// at any screen size and needs no network access.
export default function Blobs({ colors, style }) {
  return (
    <View style={[StyleSheet.absoluteFill, styles.clip, style]} pointerEvents="none">
      <View style={[styles.blob, styles.blobOne, { backgroundColor: colors[0] }]} />
      <View style={[styles.blob, styles.blobTwo, { backgroundColor: colors[1] }]} />
      {colors[2] ? <View style={[styles.blob, styles.blobThree, { backgroundColor: colors[2] }]} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  clip: {
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
    borderRadius: 999,
  },
  blobOne: {
    width: 180,
    height: 180,
    top: -70,
    right: -50,
  },
  blobTwo: {
    width: 140,
    height: 140,
    bottom: -60,
    left: -40,
  },
  blobThree: {
    width: 90,
    height: 90,
    top: 40,
    left: -30,
  },
});
