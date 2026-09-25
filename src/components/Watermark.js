import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

// The app emblem (assets/watermark.png — a background-removed crop of
// assets/icon.png, see scripts history/PR notes) shown very faintly behind
// reading content. Sits behind the Bible reader, song lyrics, and Notes
// screens — anywhere text is read for a while.
//
// Opacity is theme-aware on purpose: the emblem's navy tones nearly
// disappear against a dark background at light-mode opacity, so dark mode
// uses a slightly higher value to keep it equally (subtly) visible in
// both themes rather than "properly" meaning "identical numbers".
const WATERMARK_ASPECT_RATIO = 646 / 418;

export default function Watermark({ width = '68%' }) {
  const { isDark } = useTheme();

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      <View style={styles.center}>
        <Image
          source={require('../../assets/watermark.png')}
          resizeMode="contain"
          style={[
            styles.image,
            { width, aspectRatio: WATERMARK_ASPECT_RATIO, opacity: isDark ? 0.1 : 0.06 },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {},
});
