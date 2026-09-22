import React from 'react';
import { View, Text, ScrollView, StyleSheet, Linking, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import Blobs from '../components/Blobs';
import { contactInfo } from '../data/contactInfo';

function ContactRow({ icon, label, value, onPress, colors }) {
  if (!value) return null;
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <View style={[styles.rowIcon, { backgroundColor: colors.accentSoft }]}>
        <Ionicons name={icon} size={18} color={colors.accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>{label}</Text>
        <Text style={[styles.rowValue, { color: colors.textPrimary }]}>{value}</Text>
      </View>
      {onPress ? <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} /> : null}
    </Pressable>
  );
}

export default function ContactUsScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.hero, { backgroundColor: colors.primary }]}>
          <Blobs colors={[colors.blobA, colors.blobB]} />
          <View style={[styles.avatar, { backgroundColor: colors.surface }]}>
            <Ionicons name="person" size={34} color={colors.primary} />
          </View>
          <Text style={[styles.name, { color: colors.textOnPrimary }]}>{contactInfo.name}</Text>
          <Text style={[styles.role, { color: colors.textOnPrimary }]}>{contactInfo.role}</Text>
        </View>

        <Text style={[styles.message, { color: colors.textSecondary }]}>{contactInfo.message}</Text>

        <ContactRow
          icon="mail-outline"
          label="Email"
          value={contactInfo.email}
          onPress={() => Linking.openURL(`mailto:${contactInfo.email}`)}
          colors={colors}
        />
        <ContactRow
          icon="call-outline"
          label="Phone"
          value={contactInfo.phone}
          onPress={contactInfo.phone ? () => Linking.openURL(`tel:${contactInfo.phone}`) : undefined}
          colors={colors}
        />
        <ContactRow icon="location-outline" label="Location" value={contactInfo.location} colors={colors} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  hero: {
    alignItems: 'center',
    borderRadius: 24,
    paddingVertical: 32,
    marginBottom: 22,
    overflow: 'hidden',
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  name: {
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 4,
  },
  role: {
    fontSize: 13,
    opacity: 0.9,
  },
  message: {
    fontSize: 13.5,
    lineHeight: 21,
    marginBottom: 22,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowLabel: {
    fontSize: 11.5,
    marginBottom: 2,
  },
  rowValue: {
    fontSize: 14.5,
    fontWeight: '600',
  },
});
