import React, { useEffect, useRef } from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const AUTO_CLOSE_MS = 15000;

export default function DailyMessageOverlay({ visible, message, onClose }) {
  const { colors } = useTheme();
  const timerRef = useRef(null);

  useEffect(() => {
    if (visible) {
      timerRef.current = setTimeout(onClose, AUTO_CLOSE_MS);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!message) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <LinearGradient colors={[colors.primaryDark, colors.primary]} style={styles.card}>
          <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={10}>
            <Ionicons name="close" size={20} color="rgba(255,255,255,0.85)" />
          </Pressable>

          <View style={[styles.iconCircle, { backgroundColor: 'rgba(255,255,255,0.14)' }]}>
            <Ionicons name="sparkles" size={26} color={colors.accent} />
          </View>

          <Text style={styles.eyebrow}>నేటి వాక్యం · Today's Word</Text>
          <Text style={styles.messageText}>{message.text}</Text>
          <View style={styles.referenceRow}>
            <View style={styles.divider} />
            <Text style={styles.referenceText}>{message.reference}</Text>
            <View style={styles.divider} />
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  card: {
    width: '100%',
    borderRadius: 26,
    paddingTop: 44,
    paddingBottom: 30,
    paddingHorizontal: 26,
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    padding: 6,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  eyebrow: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  messageText: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: 18,
  },
  referenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  divider: {
    width: 24,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  referenceText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontWeight: '600',
  },
});
