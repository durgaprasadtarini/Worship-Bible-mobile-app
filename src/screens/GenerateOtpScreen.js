import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import ScreenHeader from '../components/ScreenHeader';
import PrimaryButton from '../components/PrimaryButton';
import Blobs from '../components/Blobs';

// Keep in sync with the two places this is enforced server-side (see
// SUPABASE.md): the `verify_admin_otp` SQL function's interval, and the
// pg_cron job that auto-clears expired codes. Changing this constant alone
// only affects this screen's own countdown display.
const OTP_VALIDITY_MINUTES = 5;

function formatCountdown(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function GenerateOtpScreen({ navigation }) {
  const { colors } = useTheme();
  const { fetchOtpState, generateAdminOtp, killAdminOtp } = useAuth();

  const [otp, setOtp] = useState(null);
  const [expiresAt, setExpiresAt] = useState(null);
  const [remainingMs, setRemainingMs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const tickRef = useRef(null);

  const applyState = (otpValue, generatedAt) => {
    if (!otpValue || !generatedAt) {
      setOtp(null);
      setExpiresAt(null);
      return;
    }
    const expiry = new Date(generatedAt).getTime() + OTP_VALIDITY_MINUTES * 60 * 1000;
    if (expiry <= Date.now()) {
      setOtp(null);
      setExpiresAt(null);
      return;
    }
    setOtp(otpValue);
    setExpiresAt(expiry);
  };

  const load = useCallback(async () => {
    const result = await fetchOtpState();
    if (result.success) applyState(result.otp, result.generatedAt);
    return result;
  }, [fetchOtpState]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await load();
      setLoading(false);
    })();
  }, [load]);

  // Live countdown, purely client-side display — the actual expiry is
  // enforced server-side (both at signup verification time and by the
  // pg_cron cleanup job), so this just reflects reality with a ~1s lag.
  useEffect(() => {
    if (!expiresAt) {
      setRemainingMs(0);
      return;
    }
    const tick = () => {
      const left = expiresAt - Date.now();
      setRemainingMs(left);
      if (left <= 0) {
        setOtp(null);
        setExpiresAt(null);
        clearInterval(tickRef.current);
      }
    };
    tick();
    tickRef.current = setInterval(tick, 1000);
    return () => clearInterval(tickRef.current);
  }, [expiresAt]);

  const handleGenerate = async () => {
    setBusy(true);
    const result = await generateAdminOtp();
    setBusy(false);
    if (!result.success) {
      Alert.alert('Could not generate code', result.message);
      return;
    }
    applyState(result.otp, new Date().toISOString());
  };

  const handleKill = () => {
    Alert.alert('Kill this code?', 'The current signup code will stop working immediately for everyone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Kill Code',
        style: 'destructive',
        onPress: async () => {
          setBusy(true);
          const result = await killAdminOtp();
          setBusy(false);
          if (!result.success) {
            Alert.alert('Could not kill code', result.message);
            return;
          }
          setOtp(null);
          setExpiresAt(null);
        },
      },
    ]);
  };

  const handleCopy = async () => {
    if (!otp) return;
    await Clipboard.setStringAsync(otp);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const isActive = !!otp;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Signup Code" onBack={() => navigation.goBack()} />
      <SafeAreaView edges={['bottom']} style={{ flex: 1 }}>
        <View style={styles.content}>
          <View style={[styles.hero, { backgroundColor: colors.primary }]}>
            <Blobs colors={[colors.blobA, colors.blobB]} />
            <View style={[styles.heroIcon, { backgroundColor: colors.surface }]}>
              <Ionicons name="shield-checkmark" size={28} color={colors.primary} />
            </View>
            <Text style={[styles.heroTitle, { color: colors.textOnPrimary }]}>New Signup Code</Text>
            <Text style={[styles.heroSubtitle, { color: colors.textOnPrimary }]}>
              Share this code with someone you want to let sign up. It works for{' '}
              {OTP_VALIDITY_MINUTES} minutes and is the same for every admin.
            </Text>
          </View>

          {!loading && (
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {isActive ? (
                <>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>ACTIVE CODE</Text>
                  <Pressable onPress={handleCopy} style={styles.codeRow}>
                    {otp.split('').map((digit, idx) => (
                      <View key={idx} style={[styles.digitBox, { backgroundColor: colors.accentSoft }]}>
                        <Text style={[styles.digitText, { color: colors.accent }]}>{digit}</Text>
                      </View>
                    ))}
                    <Ionicons
                      name={copied ? 'checkmark-circle' : 'copy-outline'}
                      size={20}
                      color={copied ? colors.success : colors.textSecondary}
                      style={{ marginLeft: 10 }}
                    />
                  </Pressable>
                  <Text style={[styles.hint, { color: colors.textSecondary }]}>
                    {copied ? 'Copied to clipboard' : 'Tap the code to copy it'}
                  </Text>

                  <View style={[styles.countdownPill, { backgroundColor: colors.accentSoft }]}>
                    <Ionicons name="time-outline" size={14} color={colors.accent} />
                    <Text style={[styles.countdownText, { color: colors.accent }]}>
                      Expires in {formatCountdown(remainingMs)}
                    </Text>
                  </View>

                  <PrimaryButton
                    title="Regenerate Code"
                    onPress={handleGenerate}
                    loading={busy}
                    style={{ marginTop: 22, marginBottom: 12 }}
                  />
                  <PrimaryButton title="Kill Code" variant="outline" tone="danger" onPress={handleKill} />
                </>
              ) : (
                <>
                  <View style={[styles.iconCircle, { backgroundColor: colors.surfaceAlt }]}>
                    <Ionicons name="key-outline" size={30} color={colors.textSecondary} />
                  </View>
                  <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No active code</Text>
                  <Text style={[styles.hint, { color: colors.textSecondary, marginBottom: 20 }]}>
                    Generate one to let a new person sign up.
                  </Text>
                  <PrimaryButton title="Generate Code" onPress={handleGenerate} loading={busy} />
                </>
              )}
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  hero: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 12.5,
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 18,
  },
  card: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 24,
    borderWidth: 1,
    padding: 26,
    alignItems: 'center',
  },
  label: {
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 16,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  digitBox: {
    width: 40,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 3,
  },
  digitText: {
    fontSize: 22,
    fontWeight: '800',
  },
  hint: {
    fontSize: 12,
    marginTop: 10,
  },
  countdownPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    marginTop: 20,
  },
  countdownText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
});
