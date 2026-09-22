import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import ScreenHeader from '../components/ScreenHeader';

export default function ComingSoonScreen({ navigation, route }) {
  const { colors } = useTheme();
  const title = route.params?.title ?? 'Coming Soon';

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title={title} onBack={() => navigation.goBack()} />
      <View style={styles.body}>
        <View style={[styles.iconCircle, { backgroundColor: colors.accentSoft }]}>
          <Ionicons name="construct-outline" size={36} color={colors.accent} />
        </View>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Working on it</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          పని జరుగుతోంది — ఈ ఫీచర్ త్వరలో అందుబాటులోకి వస్తుంది.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  iconCircle: {
    width: 84,
    height: 84,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 19,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13.5,
    textAlign: 'center',
    lineHeight: 20,
  },
});
