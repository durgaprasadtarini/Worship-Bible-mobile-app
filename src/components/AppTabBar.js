import React, { useEffect, useRef } from 'react';
import { View, Pressable, Text, StyleSheet, Animated, Easing, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const ICONS = { Home: 'home', ContactUs: 'call', Me: 'person' };
const LABELS = { Home: 'Home', ContactUs: 'Contact Us', Me: 'Me' };
const ICON_SLOT = 48;
const PARTICLE_COUNT = 7;

// A floating, frosted (BlurView) tab bar. Each tab manages its own
// "water droplet" burst locally — a colored bubble fills in behind its
// icon while a ring ripples outward and a handful of small particles
// sprinkle out and fade, all anchored to that tab's own icon box so it's
// centered by construction rather than computed from bar measurements.
export default function AppTabBar({ state, navigation }) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.wrap}>
      <View style={[styles.bar, { borderTopColor: colors.border, paddingBottom: insets.bottom || 8 }]}>
        <BlurView
          intensity={Platform.OS === 'ios' ? 55 : 90}
          tint={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: isDark ? 'rgba(14,21,36,0.45)' : 'rgba(255,255,255,0.4)' },
          ]}
        />

        <View style={styles.row}>
          {state.routes.map((route, index) => {
            const focused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <TabBarItem
                key={route.key}
                routeName={route.name}
                focused={focused}
                onPress={onPress}
                colors={colors}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

function TabBarItem({ routeName, focused, onPress, colors }) {
  const progress = useRef(new Animated.Value(0)).current; // drives ripple + particles, 0 -> 1
  const bubbleScale = useRef(new Animated.Value(0.5)).current;

  // Fixed once per mount: each particle's own burst angle/distance/size, so
  // they read as a natural sprinkle instead of a uniform ring.
  const particles = useRef(
    Array.from({ length: PARTICLE_COUNT }, () => {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.6; // mostly upward, some spread
      const distance = 20 + Math.random() * 20;
      return {
        dx: Math.cos(angle) * distance,
        dy: Math.sin(angle) * distance,
        size: 3 + Math.random() * 5,
      };
    })
  ).current;

  useEffect(() => {
    if (focused) {
      progress.setValue(0);
      bubbleScale.setValue(0.5);
      Animated.timing(progress, {
        toValue: 1,
        duration: 650,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
      Animated.spring(bubbleScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 14,
        bounciness: 9,
      }).start();
    } else {
      Animated.timing(bubbleScale, { toValue: 0.5, duration: 150, useNativeDriver: true }).start();
    }
  }, [focused, progress, bubbleScale]);

  const rippleScale = progress.interpolate({ inputRange: [0, 1], outputRange: [0.5, 2.3] });
  const rippleOpacity = progress.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.55, 0.2, 0] });

  return (
    <Pressable onPress={onPress} style={styles.tab}>
      <View style={styles.iconSlot}>
        {focused && (
          <>
            <Animated.View
              pointerEvents="none"
              style={[
                styles.ripple,
                { borderColor: colors.accent, opacity: rippleOpacity, transform: [{ scale: rippleScale }] },
              ]}
            />

            {particles.map((p, idx) => {
              const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [0, p.dx] });
              const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [0, p.dy] });
              const opacity = progress.interpolate({ inputRange: [0, 0.12, 0.7, 1], outputRange: [0, 1, 1, 0] });
              const scale = progress.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] });
              return (
                <Animated.View
                  key={idx}
                  pointerEvents="none"
                  style={[
                    styles.particle,
                    {
                      width: p.size,
                      height: p.size,
                      borderRadius: p.size / 2,
                      backgroundColor: colors.accent,
                      opacity,
                      transform: [{ translateX }, { translateY }, { scale }],
                    },
                  ]}
                />
              );
            })}

            <Animated.View
              pointerEvents="none"
              style={[styles.bubbleShadow, { shadowColor: colors.accent, transform: [{ scale: bubbleScale }] }]}
            >
              <View style={styles.bubbleClip}>
                <LinearGradient
                  colors={[colors.accent, colors.primaryLight]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
              </View>
            </Animated.View>
          </>
        )}

        <Ionicons
          name={`${ICONS[routeName]}${focused ? '' : '-outline'}`}
          size={20}
          color={focused ? '#FFFFFF' : colors.tabBarInactive}
          style={styles.iconOnTop}
        />
      </View>
      <Text
        numberOfLines={1}
        style={[
          styles.label,
          { color: focused ? colors.textPrimary : colors.tabBarInactive },
          focused && styles.labelFocused,
        ]}
      >
        {LABELS[routeName]}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    // Deliberately normal flex flow (not position:'absolute' over the
    // screen) — React Navigation then reserves exactly this component's
    // real height for it, so no screen needs extra bottom padding to
    // avoid being hidden underneath. The frosted/floating look comes from
    // the blur + shadow + rounded top corners below, not from literally
    // overlapping content.
    //
    // Shadow lives here (not on `bar`) because `bar` needs
    // overflow:'hidden' to clip the blur/rounded corners, and a view
    // can't render its own shadow with overflow hidden on iOS.
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
  bar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    height: 60,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  iconSlot: {
    width: ICON_SLOT,
    height: ICON_SLOT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconOnTop: {
    zIndex: 2,
  },
  label: {
    fontSize: 10.5,
    fontWeight: '500',
  },
  labelFocused: {
    fontWeight: '700',
  },
  ripple: {
    position: 'absolute',
    width: ICON_SLOT,
    height: ICON_SLOT,
    borderRadius: ICON_SLOT / 2,
    borderWidth: 2,
  },
  particle: {
    position: 'absolute',
    top: ICON_SLOT / 2,
    left: ICON_SLOT / 2,
  },
  bubbleShadow: {
    position: 'absolute',
    width: ICON_SLOT,
    height: ICON_SLOT,
    borderRadius: ICON_SLOT / 2,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  bubbleClip: {
    flex: 1,
    borderRadius: ICON_SLOT / 2,
    overflow: 'hidden',
  },
});
