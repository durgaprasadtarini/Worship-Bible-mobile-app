import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function RoleBadge({ role, size = 'md' }) {
  const { colors } = useTheme();
  const isAdmin = role === 'admin';
  const small = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        small && styles.badgeSm,
        { backgroundColor: isAdmin ? colors.accentSoft : colors.surfaceAlt },
      ]}
    >
      <Ionicons
        name={isAdmin ? 'shield-checkmark' : 'person'}
        size={small ? 11 : 13}
        color={isAdmin ? colors.accent : colors.textSecondary}
      />
      <Text
        style={[
          styles.text,
          small && styles.textSm,
          { color: isAdmin ? colors.accent : colors.textSecondary },
        ]}
      >
        {isAdmin ? 'Admin' : 'Normal'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeSm: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  text: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  textSm: {
    fontSize: 10.5,
  },
});
