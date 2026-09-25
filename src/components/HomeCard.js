import React, { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

export default function HomeCard({ title, subtitle, icon, onPress, shimmerToken, iconBg, iconFg }) {
  const { colors } = useTheme();
  const [cardWidth, setCardWidth] = useState(160);
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  // A light sweep across the card — a small living-app touch — triggered
  // whenever HomeScreen includes this card in its rotating pick. Keyed off
  // shimmerToken (not a plain boolean) so the animation replays even if
  // this card is picked again on the very next cycle.
  useEffect(() => {
    if (shimmerToken != null) {
      shimmerAnim.setValue(0);
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 2200,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start();
    }
  }, [shimmerToken, shimmerAnim]);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-cardWidth * 1.3, cardWidth * 1.9],
  });

  return (
    <Pressable
      onPress={onPress}
      onLayout={(e) => setCardWidth(e.nativeEvent.layout.width)}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.surface, shadowColor: colors.cardShadow },
        pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
      ]}
    >
      <Animated.View
        pointerEvents="none"
        style={[styles.sweep, { transform: [{ translateX }, { rotate: '15deg' }] }]}
      >
        <LinearGradient
          colors={['transparent', 'rgba(184,137,43,0.28)', 'rgba(184,137,43,0.28)', 'transparent']}
          locations={[0, 0.35, 0.65, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      <View style={[styles.iconWrap, { backgroundColor: iconBg || colors.accentSoft }]}>
        <Ionicons name={icon} size={20} color={iconFg || colors.accent} />
      </View>
      <Text numberOfLines={1} style={[styles.title, { color: colors.textPrimary }]}>
        {title}
      </Text>
      <Text numberOfLines={1} style={[styles.subtitle, { color: colors.textSecondary }]}>
        {subtitle}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    overflow: 'hidden',
    minHeight: 112,
    justifyContent: 'flex-end',
    elevation: 3,
    shadowOpacity: 0.09,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  sweep: {
    position: 'absolute',
    top: -20,
    bottom: -20,
    width: 190,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 11,
  },
});
