import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

// Shared header for screens pushed on top of a tab (back arrow + title),
// so every inner screen looks consistent without repeating markup.
export default function ScreenHeader({ title, onBack, right }) {
  const { colors } = useTheme();
  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: colors.primary }}>
      <View style={styles.row}>
        <Pressable onPress={onBack} hitSlop={12} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textOnPrimary} />
        </Pressable>
        <Text numberOfLines={1} style={[styles.title, { color: colors.textOnPrimary }]}>
          {title}
        </Text>
        <View style={styles.rightSlot}>{right}</View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 52,
  },
  backBtn: {
    padding: 8,
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    marginLeft: 4,
  },
  rightSlot: {
    minWidth: 32,
    alignItems: 'flex-end',
  },
});
