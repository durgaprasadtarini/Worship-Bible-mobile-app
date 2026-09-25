import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function PrimaryButton({ title, onPress, loading, disabled, variant = 'solid', tone = 'primary', style }) {
  const { colors } = useTheme();
  const isOutline = variant === 'outline';
  const tint = tone === 'danger' ? colors.danger : colors.primary;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        isOutline
          ? { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: tint }
          : { backgroundColor: tint },
        (disabled || loading) && { opacity: 0.6 },
        pressed && !disabled && !loading && { opacity: 0.85 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isOutline ? tint : colors.textOnPrimary} />
      ) : (
        <Text style={[styles.text, { color: isOutline ? tint : colors.textOnPrimary }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
