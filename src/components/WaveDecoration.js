import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

// Purely decorative chart-like wave for the home hero card — no real data
// behind it, just visual texture echoing a "trend line" look.
export default function WaveDecoration({ color = 'rgba(255,255,255,0.5)', dotColor = '#FFFFFF' }) {
  return (
    <View style={styles.wrap} pointerEvents="none">
      <Svg width="100%" height="100%" viewBox="0 0 300 80" preserveAspectRatio="none">
        <Path
          d="M0,55 C40,20 70,75 110,45 C150,15 180,65 220,35 C250,15 270,45 300,25"
          stroke={color}
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
        />
      </Svg>
      <Svg width="100%" height="100%" viewBox="0 0 300 80" style={StyleSheet.absoluteFill}>
        <Circle cx={220} cy={35} r={5} fill={dotColor} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 14,
    height: 60,
  },
});
